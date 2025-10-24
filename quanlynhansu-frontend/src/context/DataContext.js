// src/context/DataContext.js

import React, { createContext, useState, useContext, useCallback } from 'react';
import { message } from 'antd';

// 1. Import tất cả các hàm API cần thiết
import { 
    getEmployees, 
    getDepartments, 
    getPositions, 
    getChamCong, 
    getDonXinNghi 
} from '../api';

// Tạo Context
const DataContext = createContext();

// Tạo Provider
export const DataProvider = ({ children }) => {
    // 2. State (giữ nguyên)
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [chamCong, setChamCong] = useState([]);
    const [donXinNghi, setDonXinNghi] = useState([]);
    const [loading, setLoading] = useState(false);

    // *** SỬA LẠI HOÀN TOÀN HÀM fetchData ***
    const fetchData = useCallback(async () => {
        setLoading(true);
        
        // Chúng ta sẽ không dùng Promise.all nữa
        // Thay vào đó, gọi riêng lẻ để 1 cái lỗi không ảnh hưởng 
        // đến những cái khác.
        
        try {
            const departmentsRes = await getDepartments();
            setDepartments(departmentsRes.data);
        } catch (error) {
            console.error("Lỗi khi tải Phòng Ban:", error);
            // Có thể báo lỗi, hoặc im lặng
            // message.error('Lỗi tải phòng ban!'); 
        }

        try {
            const employeesRes = await getEmployees();
            setEmployees(employeesRes.data);
        } catch (error) {
            console.error("Lỗi khi tải Nhân Viên:", error);
        }

        try {
            const positionsRes = await getPositions();
            setPositions(positionsRes.data);
        } catch (error) {
            console.error("Lỗi khi tải Chức Vụ:", error);
        }
        
        try {
            const chamCongRes = await getChamCong();
            setChamCong(chamCongRes.data);
        } catch (error) {
            console.error("Lỗi khi tải Chấm Công:", error);
        }

        try {
            const donXinNghiRes = await getDonXinNghi();
            setDonXinNghi(donXinNghiRes.data);
        } catch (error) {
            console.error("Lỗi khi tải Đơn Xin Nghỉ:", error);
            // Đây có thể là API gây lỗi (ví dụ: 401, 403)
            // Chúng ta chỉ log lỗi thay vì báo động,
            // để các trang khác vẫn chạy.
        }

        setLoading(false); // Đặt ở cuối cùng, sau khi tất cả đã xong
    }, []);

    // 5. Cung cấp dữ liệu (giữ nguyên)
    const value = {
        employees,
        departments,
        positions,
        chamCong,
        donXinNghi,
        loading,
        fetchData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

// Custom hook (giữ nguyên)
export const useData = () => {
    return useContext(DataContext);
};