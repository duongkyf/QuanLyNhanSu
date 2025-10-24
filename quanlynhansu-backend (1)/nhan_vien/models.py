from django.db import models
from django.contrib.auth.models import User
from django.conf import settings # Import settings

# Model cho Phòng Ban
class PhongBan(models.Model):
    ten_phong_ban = models.CharField(max_length=100, unique=True, verbose_name="Tên phòng ban")

    class Meta:
        verbose_name = "Phòng Ban"
        verbose_name_plural = "Phòng Ban"

    def __str__(self):
        return self.ten_phong_ban

# Model cho Chức Vụ
class ChucVu(models.Model):
    ten_chuc_vu = models.CharField(max_length=100, unique=True, verbose_name="Tên chức vụ")

    class Meta:
        verbose_name = "Chức Vụ"
        verbose_name_plural = "Chức Vụ"

    def __str__(self):
        return self.ten_chuc_vu

# Model NhanVien
class NhanVien(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Tài khoản")
    ma_nhan_vien = models.CharField(max_length=10, unique=True, verbose_name="Mã nhân viên")
    ho_ten = models.CharField(max_length=100, verbose_name="Họ và tên")
    ngay_sinh = models.DateField(verbose_name="Ngày sinh")
    phong_ban = models.ForeignKey(PhongBan, on_delete=models.SET_NULL, null=True, verbose_name="Phòng ban")
    chuc_vu = models.ForeignKey(ChucVu, on_delete=models.SET_NULL, null=True, verbose_name="Chức vụ")
    ngay_vao_lam = models.DateField(verbose_name="Ngày vào làm")

    def __str__(self):
        return f"{self.ma_nhan_vien} - {self.ho_ten}"

    class Meta:
        verbose_name = "Nhân Viên"
        verbose_name_plural = "Danh sách Nhân Viên"

# Model cho việc Chấm Công
class ChamCong(models.Model):
    nhan_vien = models.ForeignKey(NhanVien, on_delete=models.CASCADE, verbose_name="Nhân viên")
    ngay = models.DateField(verbose_name="Ngày chấm công")
    gio_vao = models.TimeField(verbose_name="Giờ vào")
    gio_ra = models.TimeField(blank=True, null=True, verbose_name="Giờ ra")

    class Meta:
        verbose_name = "Chấm Công"
        verbose_name_plural = "Chấm Công"

    def __str__(self):
        return f"{self.nhan_vien.ho_ten} - {self.ngay}"

# Model cho Đơn Xin Nghỉ
class DonXinNghi(models.Model):
    TRANG_THAI_CHOICES = [
        ('pending', 'Chờ duyệt'),
        ('approved', 'Đã duyệt'),
        ('rejected', 'Từ chối'),
    ]
    nhan_vien = models.ForeignKey(NhanVien, on_delete=models.CASCADE, verbose_name="Nhân viên")
    ngay_bat_dau = models.DateField(verbose_name="Ngày bắt đầu nghỉ")
    ngay_ket_thuc = models.DateField(verbose_name="Ngày kết thúc")
    ly_do = models.TextField(verbose_name="Lý do")
    trang_thai = models.CharField(max_length=10, choices=TRANG_THAI_CHOICES, default='pending', verbose_name="Trạng thái")

    class Meta:
        verbose_name = "Đơn Xin Nghỉ"
        verbose_name_plural = "Đơn Xin Nghỉ"

    def __str__(self):
        return f"Đơn của {self.nhan_vien.ho_ten} từ {self.ngay_bat_dau}"

# === Model UserAccount phải được định nghĩa ở đây ===
class UserAccount(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    employee = models.OneToOneField(
        NhanVien, 
        on_delete=models.SET_NULL,  
        null=True,                  
        blank=True                  
    ) 
    role = models.CharField(max_length=20, choices=[('Admin', 'Admin'), ('HR', 'HR'), ('Manager', 'Manager'), ('Employee', 'Employee')], default='Employee', verbose_name="Vai trò")

    def __str__(self):
        return f"{self.user.username} - {self.role}"

# ... (các model khác giữ nguyên) ...

# === Model Bảng Lương ===
class Payslip(models.Model):
    nhan_vien = models.ForeignKey(NhanVien, on_delete=models.CASCADE, verbose_name="Nhân viên")
    thang = models.PositiveIntegerField(verbose_name="Tháng")
    nam = models.PositiveIntegerField(verbose_name="Năm")
    luong_co_ban = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Lương cơ bản")
    phu_cap = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Phụ cấp")
    khau_tru = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Khấu trừ")
    # Bạn có thể thêm các trường khác như: thuong, tien_ot, thue_tncn...
    luong_thuc_nhan = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Lương thực nhận")

    class Meta:
        verbose_name = "Bảng Lương"
        verbose_name_plural = "Bảng Lương"
        # Đảm bảo mỗi nhân viên chỉ có 1 bảng lương/tháng
        unique_together = ('nhan_vien', 'thang', 'nam')

    def __str__(self):
        return f"Bảng lương {self.thang}/{self.nam} - {self.nhan_vien.ho_ten}"

# ... (các model khác giữ nguyên) ...

# === Model Bảng Lương ===
class Payslip(models.Model):
    # ... (các trường của bạn như nhan_vien, thang, nam, luong_co_ban, phu_cap, khau_tru) ...
    # Ví dụ:
    nhan_vien = models.ForeignKey(NhanVien, on_delete=models.CASCADE)
    thang = models.IntegerField()
    nam = models.IntegerField()
    luong_co_ban = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    phu_cap = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    khau_tru = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Trường này sẽ được tự động tính:
    luong_thuc_nhan = models.DecimalField(max_digits=10, decimal_places=2, blank=True) # Thêm blank=True

    # ⭐️ THÊM PHƯƠNG THỨC NÀY VÀO:
    def save(self, *args, **kwargs):
        # Tự động tính toán lương thực nhận
        self.luong_thuc_nhan = self.luong_co_ban + self.phu_cap - self.khau_tru
        
        # Gọi phương thức save() gốc để lưu vào database
        super(Payslip, self).save(*args, **kwargs) 

    def __str__(self):
        return f"Phiếu lương {self.nhan_vien.ho_ten} - {self.thang}/{self.nam}"