# Trong nhan_vien/permissions.py
from rest_framework import permissions
from .models import UserAccount 

class IsManagerOrReadOnly(permissions.BasePermission):
    """
    Permission tùy chỉnh:
    1. Cho phép mọi người (đã đăng nhập) xem (GET).
    2. Chỉ cho phép 'Manager', 'Admin', 'HR' thực hiện 
       các hành động ghi (POST, PUT, DELETE).
    """

    def has_permission(self, request, view):
        # Luôn cho phép các request đọc (an toàn)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Từ đây trở xuống là các method "không an toàn" (POST, PUT, etc.)
        # Kiểm tra vai trò của người dùng
        try:
            user_account = UserAccount.objects.get(user=request.user)
            return user_account.role in ['Manager', 'Admin', 'HR'] 
        except UserAccount.DoesNotExist:
            return False


class DonXinNghiPermission(permissions.BasePermission):
    """
    Quyền tùy chỉnh cho Đơn Xin Nghỉ:
    
    1. (has_permission - Cấp độ Danh sách):
       - Ai cũng (đã đăng nhập) được GET (xem) và POST (tạo mới).
       - Chỉ Manager/Admin/HR được PUT/DELETE (ở cấp độ danh sách - hiếm dùng).

    2. (has_object_permission - Cấp độ Chi tiết):
       - Manager/Admin/HR được làm mọi thứ (PUT, DELETE, approve, reject).
       - Employee chỉ được xem/sửa/xóa đơn CỦA MÌNH khi nó đang 'pending'.
    """

    def has_permission(self, request, view):
        # Yêu cầu đầu tiên: Phải đăng nhập (đã được IsAuthenticated xử lý)
        
        # 1. Cho phép GET (xem list) và POST (tạo mới) cho TẤT CẢ
        if request.method in ('GET', 'HEAD', 'OPTIONS', 'POST'):
            return True

        # 2. Đối với các method còn lại (PUT, PATCH, DELETE ở cấp độ list)
        # chỉ cho phép Manager/Admin/HR
        try:
            user_account = UserAccount.objects.get(user=request.user)
            return user_account.role in ('Manager', 'Admin', 'HR')
        except UserAccount.DoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        # (Hàm này được gọi cho /donxinnghi/{id}/)

        # Lấy vai trò user
        try:
            user_account = UserAccount.objects.get(user=request.user)
            role = user_account.role
        except UserAccount.DoesNotExist:
            role = 'Employee' # Mặc định

        # 1. Manager/Admin/HR có toàn quyền trên object
        if role in ('Manager', 'Admin', 'HR'):
            return True
        
        # 2. Nhân viên (Employee)
        
        # Kiểm tra xem có phải chủ đơn không
        try:
            is_owner = obj.nhan_vien.user == request.user
        except AttributeError:
            return False # Phòng trường hợp 'nhan_vien' hoặc 'user' là null

        # Nếu là chủ đơn, cho phép GET (xem chi tiết)
        if request.method in permissions.SAFE_METHODS: # (GET)
            return is_owner

        # Nếu là chủ đơn, cho phép Sửa/Xóa KHI 'pending'
        if request.method in ('PUT', 'PATCH', 'DELETE'):
            return is_owner and obj.trang_thai == 'pending'

        # Chặn tất cả các trường hợp khác của Employee
        # (Bao gồm cả 'approve'/'reject' vì chúng là 'POST' trên object)
        return False