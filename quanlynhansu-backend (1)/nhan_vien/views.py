# Trong nhan_vien/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from .models import Payslip # Thêm Payslip
from .serializers import PayslipSerializer # Thêm PayslipSerializer
# Import các permission, model và serializer
from .permissions import IsManagerOrReadOnly, DonXinNghiPermission
from .models import (
    NhanVien, PhongBan, ChucVu, ChamCong, DonXinNghi, UserAccount
)
from .serializers import (
    NhanVienSerializer, PhongBanSerializer, ChucVuSerializer, 
    ChamCongSerializer, DonXinNghiSerializer
)


class PhongBanViewSet(viewsets.ModelViewSet):
    """API endpoint cho phép quản lý các phòng ban."""
    queryset = PhongBan.objects.all()
    serializer_class = PhongBanSerializer
    # Bảo mật: Chỉ Manager/HR mới được Sửa/Xóa
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]


class ChucVuViewSet(viewsets.ModelViewSet):
    """API endpoint cho phép quản lý các chức vụ."""
    queryset = ChucVu.objects.all()
    serializer_class = ChucVuSerializer
    # Bảo mật: Chỉ Manager/HR mới được Sửa/Xóa
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]


class NhanVienViewSet(viewsets.ModelViewSet):
    """API endpoint cho phép quản lý hồ sơ Nhân Viên."""
    queryset = NhanVien.objects.all().select_related('user', 'phong_ban', 'chuc_vu')
    serializer_class = NhanVienSerializer
    # Bảo mật: Chỉ Manager/HR mới được Sửa/Xóa hồ sơ nhân viên khác
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly] 
    # (Bạn có thể tạo permission phức tạp hơn để nhân viên tự sửa hồ sơ của mình)


class ChamCongViewSet(viewsets.ModelViewSet):
    """API endpoint cho phép quản lý việc Chấm Công."""
    queryset = ChamCong.objects.all().select_related('nhan_vien').order_by('-ngay')
    serializer_class = ChamCongSerializer
    # Bảo mật: Chỉ Manager/HR mới được Sửa/Xóa
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]


class DonXinNghiViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho phép quản lý Đơn Xin Nghỉ.
    - Nhân viên: Chỉ xem/tạo/sửa/xóa đơn của mình (khi pending).
    - Manager/HR: Xem/sửa/xóa/duyệt tất cả đơn.
    """
    serializer_class = DonXinNghiSerializer
    # Áp dụng permission mới
    permission_classes = [IsAuthenticated, DonXinNghiPermission]

    def get_queryset(self):
        """
        Tùy chỉnh queryset:
        - Manager/Admin/HR thấy tất cả đơn.
        - Nhân viên thường (Employee) chỉ thấy đơn của chính họ.
        """
        user = self.request.user

        # 1. Kiểm tra vai trò của user
        try:
            user_account = UserAccount.objects.get(user=user)
            role = user_account.role
        except UserAccount.DoesNotExist:
            role = 'Employee' # Mặc định là Employee nếu không có vai trò

        # 2. Nếu là Manager/Admin/HR, cho xem tất cả
        if role in ['Manager', 'Admin', 'HR']:
            return DonXinNghi.objects.all().select_related('nhan_vien').order_by('-ngay_bat_dau')

        # 3. Nếu là nhân viên thường, lọc theo 'nhan_vien' của user đó
        try:
            # Tìm hồ sơ NhanVien của user đang đăng nhập
            nhan_vien_cua_user = NhanVien.objects.get(user=user)
            return DonXinNghi.objects.filter(nhan_vien=nhan_vien_cua_user).select_related('nhan_vien').order_by('-ngay_bat_dau')
        except NhanVien.DoesNotExist:
            # Nếu user này không có hồ sơ NhanVien, không cho xem đơn nào
            return DonXinNghi.objects.none()

    def perform_create(self, serializer):
        """
        Tùy chỉnh khi tạo mới (POST):
        Tự động gán nhân viên tạo đơn là user đang đăng nhập.
        """
        try:
            nhan_vien = NhanVien.objects.get(user=self.request.user)
            # Lưu đơn nghỉ và gán 'nhan_vien'
            serializer.save(nhan_vien=nhan_vien, trang_thai='pending')
        except NhanVien.DoesNotExist:
            # Xử lý lỗi nếu user không có hồ sơ nhân viên
            raise ValidationError("Người dùng này không có hồ sơ nhân viên. Không thể tạo đơn.")

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """
        Hành động để phê duyệt một đơn xin nghỉ.
        (Permission sẽ tự động chặn Employee gọi action này)
        """
        don_xin_nghi = self.get_object() 
        
        if don_xin_nghi.trang_thai != 'pending':
            return Response(
                {'error': 'Đơn này đã được xử lý.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        don_xin_nghi.trang_thai = 'approved' # Sửa thành 'approved'
        # don_xin_nghi.nguoi_duyet = request.user 
        don_xin_nghi.save()
        
        serializer = self.get_serializer(don_xin_nghi)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """
        Hành động để từ chối một đơn xin nghỉ.
        (Permission sẽ tự động chặn Employee gọi action này)
        """
        don_xin_nghi = self.get_object()
        
        if don_xin_nghi.trang_thai != 'pending':
            return Response(
                {'error': 'Đơn này đã được xử lý.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        don_xin_nghi.trang_thai = 'rejected' # Sửa thành 'rejected'
        # don_xin_nghi.ly_do_tu_choi = request.data.get('ly_do', '')
        don_xin_nghi.save()

        serializer = self.get_serializer(don_xin_nghi)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PayslipViewSet(viewsets.ModelViewSet): # SỬA 1: Đổi từ ReadOnlyModelViewSet sang ModelViewSet
    """
    API endpoint cho phép quản lý Bảng Lương (GET, POST, PUT, DELETE).
    """
    queryset = Payslip.objects.all().select_related('nhan_vien').order_by('-nam', '-thang')
    serializer_class = PayslipSerializer
    
    # SỬA 2: Thay AllowAny bằng permission bảo mật.
    # Chỉ Manager/HR mới được phép tạo, sửa, xóa bảng lương.
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]