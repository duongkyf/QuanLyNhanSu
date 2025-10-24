import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

// ✨ SỬA LỖI TẠI ĐÂY: Sửa lại toàn bộ đường dẫn import theo đúng cấu trúc file

// 1. Import Login
import Login from '../components/login'; 

// 2. Import Layout
import MainLayout from '../components/layout/AppLayout'; 

// 3. Import các trang (Pages)
import EmployeeList from '../pages/employee/EmployeeList'; 
import DepartmentList from '../pages/department/DepartmentList';
import PositionList from '../pages/position/PositionList';
import ChamCongList from '../pages/attendance/AttendanceList'; // Tên file của bạn là AttendanceList
import DonXinNghiList from '../pages/leave/LeaveList'; // Tên file của bạn là LeaveList

// Component bảo vệ Route
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Component điều hướng khi đã đăng nhập
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const AppRouter = () => {
    const { isAuthenticated } = useAuth();
    const { fetchData } = useData();
    const navigate = useNavigate();

    // Tải dữ liệu ban đầu khi đã xác thực
    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        } else {
            // Nếu không xác thực, chuyển về trang login
            navigate('/login');
        }
    }, [isAuthenticated, fetchData, navigate]);

    return (
        <Routes>
            {/* Route công khai cho trang Login */}
            <Route 
                path="/login" 
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } 
            />

            {/* Các Route riêng tư được bảo vệ, lồng trong Layout chính */}
            <Route 
                path="/" 
                element={
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                }
            >
                {/* Trang mặc định (ví dụ: dashboard hoặc nhân viên) */}
                <Route index element={<Navigate to="/nhanvien" replace />} />
                
                {/* Lồng các trang con vào đây */}
                <Route path="nhanvien" element={<EmployeeList />} />
                <Route path="phongban" element={<DepartmentList />} />
                <Route path="chucvu" element={<PositionList />} />
                <Route path="chamcong" element={<ChamCongList />} />
                <Route path="donxinnghi" element={<DonXinNghiList />} />
                
            </Route>

            {/* Bất kỳ route nào không khớp sẽ chuyển về trang chủ */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;