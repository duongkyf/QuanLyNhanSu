from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from nhan_vien.models import NhanVien, ChamCong, Payslip, Position # Thêm Position
from datetime import date, timedelta
from decimal import Decimal
import calendar # Thư viện để lấy số ngày trong tháng

class Command(BaseCommand):
    help = 'Tính và tạo bảng lương cho tháng trước dựa trên dữ liệu chấm công.'

    def handle(self, *args, **options):
        current_date = date.today()
        # Tính lương cho tháng TRƯỚC
        first_day_of_current_month = current_date.replace(day=1)
        last_day_of_previous_month = first_day_of_current_month - timedelta(days=1)
        target_month = last_day_of_previous_month.month
        target_year = last_day_of_previous_month.year

        # Xác định số ngày làm việc chuẩn trong tháng (ví dụ: trừ Chủ Nhật)
        num_days_in_month = calendar.monthrange(target_year, target_month)[1]
        standard_working_days = 0
        for day in range(1, num_days_in_month + 1):
            try:
                current_day = date(target_year, target_month, day)
                # weekday() trả về 0=Thứ 2, ..., 6=Chủ Nhật
                if current_day.weekday() != 6: # Bỏ qua Chủ Nhật
                    standard_working_days += 1
            except ValueError:
                pass # Ngày không hợp lệ (hiếm khi xảy ra)
        
        if standard_working_days == 0:
             self.stderr.write(self.style.ERROR(f'Không thể xác định ngày công chuẩn cho tháng {target_month}/{target_year}.'))
             return


        self.stdout.write(self.style.SUCCESS(f'Bắt đầu tính lương tháng {target_month}/{target_year} (Công chuẩn: {standard_working_days} ngày)...'))

        employees = NhanVien.objects.filter(status='Hoạt động') # Chỉ tính cho nhân viên còn hoạt động

        for employee in employees:
            # Lấy lương cơ bản từ Chức Vụ của nhân viên
            try:
                position = employee.chuc_vu
                if not position:
                     self.stderr.write(self.style.WARNING(f'  - Bỏ qua {employee.ho_ten}: Chưa có chức vụ.'))
                     continue
                luong_co_ban_thang = position.base_salary
            except Position.DoesNotExist:
                 self.stderr.write(self.style.WARNING(f'  - Bỏ qua {employee.ho_ten}: Chưa có chức vụ.'))
                 continue
            except AttributeError:
                 self.stderr.write(self.style.WARNING(f'  - Bỏ qua {employee.ho_ten}: Model ChucVu chưa có trường base_salary.'))
                 continue


            # --- TÍNH TOÁN DỰA TRÊN CHẤM CÔNG ---
            attendances = ChamCong.objects.filter(
                nhan_vien=employee,
                ngay__year=target_year,
                ngay__month=target_month
            )
            actual_working_days = attendances.count() # Số ngày có chấm công

            # Tính lương thực tế dựa trên tỉ lệ ngày công
            if standard_working_days > 0:
                salary_based_on_attendance = (luong_co_ban_thang / Decimal(standard_working_days)) * Decimal(actual_working_days)
            else:
                salary_based_on_attendance = Decimal(0)

            # (Các phần tính thưởng, phụ cấp, OT, thuế cần thêm logic ở đây)
            phu_cap = Decimal('1000000') # Ví dụ
            khau_tru = Decimal('1050000') # Ví dụ BHXH
            bonus = Decimal('0') # Ví dụ
            ot_amount = Decimal('0') # Cần tính từ bảng Overtime nếu có
            tax = Decimal('0') # Cần tính thuế TNCN

            luong_thuc_nhan_tinh_toan = salary_based_on_attendance + bonus + phu_cap + ot_amount - khau_tru - tax

            # Làm tròn đến 2 chữ số thập phân (hoặc theo quy định công ty)
            luong_thuc_nhan_tinh_toan = luong_thuc_nhan_tinh_toan.quantize(Decimal("0.01"))

            # --- LƯU BẢNG LƯƠNG ---
            try:
                with transaction.atomic():
                    payslip, created = Payslip.objects.update_or_create(
                        nhan_vien=employee,
                        thang=target_month,
                        nam=target_year,
                        defaults={
                            'luong_co_ban': luong_co_ban_thang, # Lương cơ bản theo chức vụ
                            'phu_cap': phu_cap,
                            'khau_tru': khau_tru,
                            'luong_thuc_nhan': luong_thuc_nhan_tinh_toan
                            # Cập nhật các trường khác
                        }
                    )
                    status_msg = "Đã tạo" if created else "Đã cập nhật"
                    self.stdout.write(f'  - {status_msg} bảng lương cho: {employee.ho_ten} ({actual_working_days}/{standard_working_days} ngày công)')

            except Exception as e:
                self.stderr.write(self.style.ERROR(f'  - Lỗi khi lưu lương cho {employee.ho_ten}: {e}'))

        self.stdout.write(self.style.SUCCESS('Hoàn thành!'))