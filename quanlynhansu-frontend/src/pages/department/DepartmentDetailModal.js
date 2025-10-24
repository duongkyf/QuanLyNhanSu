// src/components/pages/department/DepartmentDetailModal.js
import React from 'react';
import { Modal, List, Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DepartmentDetailModal = ({ open, onClose, department }) => {
    if (!department) {
        return null;
    }

    return (
        <Modal
            open={open}
            title={`Chi tiết phòng ban: ${department.ten_phong_ban}`}
            onCancel={onClose}
            footer={null} // Chỉ xem, không cần nút
            width={600}
        >
            <List
                header={<Text strong>Danh sách nhân viên</Text>}
                itemLayout="horizontal"
                dataSource={department.employees || []} // Lấy danh sách nhân viên từ prop
                renderItem={(employee) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={employee.ho_ten}
                            description={`Chức vụ: ${employee.chuc_vu?.ten_chuc_vu || 'Chưa cập nhật'}`}
                        />
                    </List.Item>
                )}
                locale={{ emptyText: 'Chưa có nhân viên trong phòng ban này.' }}
            />
        </Modal>
    );
};

export default DepartmentDetailModal;