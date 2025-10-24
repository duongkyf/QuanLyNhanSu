// File: EmployeeDetailModal.js
import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';

const EmployeeDetailModal = ({ open, onClose, employee }) => {
    // Để tránh lỗi khi employee chưa có dữ liệu
    if (!employee) {
        return null;
    }

    // Giả định thêm một số trường dữ liệu để hiển thị
    const { 
        ma_nhan_vien, 
        ho_ten, 
        ngay_sinh, 
        phong_ban, 
        chuc_vu, 
        ngay_vao_lam, 
        username 
    } = employee;

    return (
        <Modal
            open={open}
            title={`Chi tiết nhân viên: ${ho_ten}`}
            onCancel={onClose}
            footer={null} // Bỏ các nút OK/Cancel vì đây là modal chỉ xem
            width={600}
        >
            <Descriptions bordered column={1} labelStyle={{ fontWeight: 'bold' }}>
                <Descriptions.Item label="Mã nhân viên">{ma_nhan_vien}</Descriptions.Item>
                <Descriptions.Item label="Họ và Tên">{ho_ten}</Descriptions.Item>
                <Descriptions.Item label="Tài khoản">{username}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{ngay_sinh || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label="Phòng ban">{phong_ban?.ten_phong_ban || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label="Chức vụ">{chuc_vu?.ten_chuc_vu || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label="Ngày vào làm">{ngay_vao_lam || 'Chưa cập nhật'}</Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default EmployeeDetailModal;