// src/context/AuthContext.js

import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// Giả sử bạn import axiosInstance (từ api.js) để dùng cho hàm login
import axiosInstance from '../api'; 

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
    // Kiểm tra token trong localStorage để giữ trạng thái đăng nhập
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
    const navigate = useNavigate();

    // 3. Hàm Login (Giữ nguyên hàm login của bạn)
    const login = async (username, password) => {
        try {
            // Gọi đến endpoint /api/token/ của Django
            const response = await axiosInstance.post('/token/',{
                username: username,
                password: password
            });

            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setIsAuthenticated(true);
            
            // Cập nhật header cho các yêu cầu sau này
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            
            navigate('/'); // Chuyển hướng về trang chủ

        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            alert("Tên đăng nhập hoặc mật khẩu không đúng!");
        }
    };

    // 4. ✨ HÀM LOGOUT ĐƠN GIẢN (KHÔNG CẦN BACKEND) ✨
    // Thay thế hàm logout cũ của bạn bằng hàm này
    const logout = () => {
        // Xóa token khỏi localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Cập nhật trạng thái
        setIsAuthenticated(false);
        
        // Xóa header Authorization khỏi axios
        delete axiosInstance.defaults.headers.common['Authorization'];

        // Chuyển hướng về trang login.
        // Dùng window.location.href để đảm bảo refresh trang, xóa sạch state
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 5. Tạo custom hook để dễ dàng sử dụng context
export const useAuth = () => {
    return useContext(AuthContext);
};