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
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, default='Employee')

    # Thêm null=True và blank=True
    employee = models.OneToOneField(
        NhanVien, 
        on_delete=models.CASCADE, 
        null=True,  # <-- Cho phép database lưu giá trị rỗng
        blank=True  # <-- Cho phép admin form để trống
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"