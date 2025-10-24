# hr_app/urls.py

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    PhongBanViewSet, 
    ChucVuViewSet, 
    NhanVienViewSet, 
    ChamCongViewSet, 
    DonXinNghiViewSet
)

router = DefaultRouter()

router.register(r'phongban', PhongBanViewSet)
router.register(r'chucvu', ChucVuViewSet)
router.register(r'nhanvien', NhanVienViewSet, basename='nhanvien')
router.register(r'chamcong', ChamCongViewSet)
router.register('donxinnghi', DonXinNghiViewSet, basename='donxinnghi')


urlpatterns = router.urls