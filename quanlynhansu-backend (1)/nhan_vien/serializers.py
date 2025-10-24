from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import NhanVien, PhongBan, ChucVu, ChamCong, DonXinNghi
from .models import Payslip
# ===============================================
# Serializer cho các Model đơn giản
# ===============================================

class PhongBanSerializer(serializers.ModelSerializer):
    """Serializer cho model Phòng Ban."""
    class Meta:
        model = PhongBan
        fields = '__all__'

class ChucVuSerializer(serializers.ModelSerializer):
    """Serializer cho model Chức Vụ."""
    class Meta:
        model = ChucVu
        fields = '__all__'

# ===============================================
# Serializer chính cho Nhân Viên
# ===============================================

class NhanVienSerializer(serializers.ModelSerializer):
    """
    Serializer hoàn chỉnh cho Nhân Viên.
    - Xử lý quan hệ lồng nhau để hiển thị chi tiết.
    - Nhận ID để tạo/cập nhật quan hệ.
    - Tạo User liên quan một cách an toàn.
    - Xử lý `ma_nhan_vien` (chỉ ghi khi tạo mới, chỉ đọc khi cập nhật).
    """
    # --- Trường chỉ đọc (read-only) để hiển thị dữ liệu lồng nhau ---
    phong_ban = PhongBanSerializer(read_only=True)
    chuc_vu = ChucVuSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    # --- Trường chỉ ghi (write-only) để nhận ID khi tạo/cập nhật ---
    phong_ban_id = serializers.PrimaryKeyRelatedField(
        queryset=PhongBan.objects.all(), source='phong_ban', write_only=True,
        label="Phòng ban ID"
    )
    chuc_vu_id = serializers.PrimaryKeyRelatedField(
        queryset=ChucVu.objects.all(), source='chuc_vu', write_only=True,
        label="Chức vụ ID"
    )

    # --- Trường chỉ ghi để tạo User mới liên quan ---
    new_username = serializers.CharField(
        write_only=True, required=False, max_length=150, label="Tên tài khoản mới"
    )
    password = serializers.CharField(
        write_only=True, required=False, label="Mật khẩu"
    )
    
    class Meta:
        model = NhanVien
        fields = [
            'id', 'ma_nhan_vien', 'ho_ten', 'ngay_sinh', 'ngay_vao_lam',
            'phong_ban', 'chuc_vu', 'username', # Các trường hiển thị (read)
            'phong_ban_id', 'chuc_vu_id',       # Các trường nhận dữ liệu (write)
            'new_username', 'password'         # Các trường tạo user (write)
        ]
        read_only_fields = ['username']

    def __init__(self, *args, **kwargs):
        """
        Ghi đè phương thức khởi tạo để xử lý logic động.
        Nếu là cập nhật (instance tồn tại), đặt `ma_nhan_vien` thành chỉ đọc.
        """
        super().__init__(*args, **kwargs)
        if self.instance:
            self.fields['ma_nhan_vien'].read_only = True
            
    def create(self, validated_data):
        """
        Ghi đè phương thức tạo mới để xử lý việc tạo User.
        Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu.
        """
        new_username = validated_data.pop('new_username', None)
        password = validated_data.pop('password', None)
        
        if not new_username or not password:
            raise serializers.ValidationError({"error": "Vui lòng cung cấp Tên Tài Khoản và Mật Khẩu."})
        
        if User.objects.filter(username=new_username).exists():
            raise serializers.ValidationError({"new_username": ["Tên tài khoản này đã được sử dụng."]})
        
        # Bọc trong transaction để đảm bảo an toàn
        with transaction.atomic():
            user = User.objects.create_user(username=new_username, password=password)
            validated_data['user'] = user
            nhanvien = NhanVien.objects.create(**validated_data)
        
        return nhanvien

    def update(self, instance, validated_data):
        """
        Ghi đè phương thức cập nhật để kiểm soát các trường được thay đổi.
        """
        # Loại bỏ các trường liên quan đến User, không cho phép cập nhật ở đây
        validated_data.pop('new_username', None) 
        validated_data.pop('password', None)
        
        # Cập nhật các trường thông thường một cách tường minh
        instance.ho_ten = validated_data.get('ho_ten', instance.ho_ten)
        instance.ngay_sinh = validated_data.get('ngay_sinh', instance.ngay_sinh)
        instance.ngay_vao_lam = validated_data.get('ngay_vao_lam', instance.ngay_vao_lam)
        
        # Cập nhật các trường quan hệ
        instance.phong_ban = validated_data.get('phong_ban', instance.phong_ban)
        instance.chuc_vu = validated_data.get('chuc_vu', instance.chuc_vu)
        
        instance.save()
        return instance

# ===============================================
# Serializer cho các Model còn lại
# ===============================================

class ChamCongSerializer(serializers.ModelSerializer):
    """Serializer cho model Chấm Công."""
    class Meta:
        model = ChamCong
        fields = '__all__'

class DonXinNghiSerializer(serializers.ModelSerializer):
    """Serializer cho model Đơn Xin Nghỉ."""
    class Meta:
        model = DonXinNghi
        fields = '__all__'

# ⭐️⭐️⭐️ PHẦN SỬA LỖI 500 NẰM Ở ĐÂY ⭐️⭐️⭐️

class PayslipSerializer(serializers.ModelSerializer):
    """Serializer cho model Bảng Lương."""
    
    # 1. Dùng để HIỂN THỊ tên nhân viên (GET)
    nhan_vien = serializers.StringRelatedField(read_only=True) 
    
    # 2. Dùng để NHẬN ID khi TẠO MỚI (POST)
    nhan_vien_id = serializers.PrimaryKeyRelatedField(
        queryset=NhanVien.objects.all(), 
        source='nhan_vien', # Sẽ ghi vào trường 'nhan_vien' của model
        write_only=True,
        label="Nhân viên ID"
    )

    class Meta:
        model = Payslip
        # 3. Cập nhật 'fields' để bao gồm cả hai
        fields = [
            'id', 'thang', 'nam', 'luong_co_ban', 'phu_cap', 'khau_tru', 
            'luong_thuc_nhan', 
            'nhan_vien',    # Trường đọc
            'nhan_vien_id'  # Trường ghi
        ]
        # 4. Đặt luong_thuc_nhan là read_only, vì nó được tự động tính
        read_only_fields = ['luong_thuc_nhan']