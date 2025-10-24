import axios from 'axios';

// 1. Tạo instance
const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor (Request)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Interceptor (Response) - ĐÃ THÊM DEBUG LOGS
axiosInstance.interceptors.response.use(
    (response) => {
        // Log khi thành công
        console.log(`[Interceptor] Yêu cầu OK: ${response.config.url}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Log khi có lỗi
        console.log(`[Interceptor] Yêu cầu LỖI: ${originalRequest.url}`, error.response);

        // Kiểm tra nếu lỗi là 401 hoặc 403
        if ((error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            
            console.log(`[Interceptor] Nhận thấy lỗi ${error.response.status}. Đang thử refresh token...`);
            
            originalRequest._retry = true; 
            
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                console.log("[Interceptor] Đã tìm thấy refresh_token.");
                try {
                    console.log("[Interceptor] Đang gọi /api/token/refresh/...");
                    // Dùng axios gốc để tránh lặp vô hạn
                    const rs = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                        refresh: refreshToken
                    });
                    console.log("[Interceptor] Refresh token THÀNH CÔNG.");

                    const { access } = rs.data;
                    localStorage.setItem('access_token', access);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;

                    // Thử lại request gốc
                    return axiosInstance(originalRequest);

                } catch (_error) {
                    // Lỗi khi refresh (refresh token hỏng)
                    console.error("[Interceptor] REFRESH TOKEN BỊ LỖI.", _error);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    // Chuyển về trang login
                    window.location.href = '/login'; 
                }
            } else {
                 // Không tìm thấy refresh token
                 console.warn("[Interceptor] Không tìm thấy refresh token. Đang đăng xuất.");
                 window.location.href = '/login';
            }
        }

        // Trả về các lỗi khác (không phải 401/403)
        console.warn("[Interceptor] Lỗi không phải 401/403 hoặc đã thử lại rồi.");
        return Promise.reject(error);
    }
);


// ===============================================
// API Exports (Giữ nguyên)
// ===============================================

export const getEmployees = () => axiosInstance.get('/nhanvien/');
export const createNhanVien = (data) => axiosInstance.post('/nhanvien/', data);
export const updateNhanVien = (id, data) => axiosInstance.put(`/nhanvien/${id}/`, data);
export const deleteEmployee = (id) => axiosInstance.delete(`/nhanvien/${id}/`);

export const getDepartments = () => axiosInstance.get('/phongban/');
export const createDepartment = (data) => axiosInstance.post('/phongban/', data);
export const updateDepartment = (id, data) => axiosInstance.put(`/phongban/${id}/`, data);
export const deleteDepartment = (id) => axiosInstance.delete(`/phongban/${id}/`);

export const getPositions = () => axiosInstance.get('/chucvu/');
export const createPosition = (data) => axiosInstance.post('/chucvu/', data);
export const updatePosition = (id, data) => axiosInstance.put(`/chucvu/${id}/`, data);
export const deletePosition = (id) => axiosInstance.delete(`/chucvu/${id}/`);

export const getChamCong = () => axiosInstance.get('/chamcong/');
export const createChamCong = (data) => axiosInstance.post('/chamcong/', data);
export const updateChamCong = (id, data) => axiosInstance.put(`/chamcong/${id}/`, data);
export const deleteChamCong = (id) => axiosInstance.delete(`/chamcong/${id}/`);

export const getDonXinNghi = () => axiosInstance.get('/donxinnghi/');
export const createDonXinNghi = (data) => axiosInstance.post('/donxinnghi/', data);
export const updateDonXinNghi = (id, data) => axiosInstance.put(`/donxinnghi/${id}/`, data);
export const deleteDonXinNghi = (id) => axiosInstance.delete(`/donxinnghi/${id}/`);

export const approveLeaveRequest = (id) => axiosInstance.post(`/donxinnghi/${id}/approve/`);
export const rejectLeaveRequest = (id) => axiosInstance.post(`/donxinnghi/${id}/reject/`);

export default axiosInstance;