from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import NhanVien, PhongBan, ChucVu, ChamCong, DonXinNghi,UserAccount,Payslip

class NhanVienInline(admin.StackedInline):
    model = NhanVien
    can_delete = False
    verbose_name_plural = 'Hồ sơ nhân viên'
class PayslipAdmin(admin.ModelAdmin):
   
    readonly_fields = ('luong_thuc_nhan',)
    
   
    list_display = ('nhan_vien', 'thang', 'nam', 'luong_co_ban', 'phu_cap', 'khau_tru', 'luong_thuc_nhan')

class UserAdmin(BaseUserAdmin):
    
    inlines = [NhanVienInline]

admin.site.unregister(User)

admin.site.register(User, UserAdmin)

admin.site.register(PhongBan)
admin.site.register(ChucVu)
admin.site.register(ChamCong)
admin.site.register(DonXinNghi)
admin.site.register(UserAccount)
admin.site.register(Payslip, PayslipAdmin)