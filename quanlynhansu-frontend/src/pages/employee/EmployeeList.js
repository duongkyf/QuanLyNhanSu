// File: EmployeeList.js
import React, { useState, useEffect, useCallback } from 'react';
// 1. Import thêm Input
import { Table, Button, Space, Typography, Popconfirm, message, Input } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { getEmployees, deleteEmployee } from '../../api';
import EmployeeForm from './EmployeeForm';
import EmployeeDetailModal from './EmployeeDetailModal';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [viewingEmployee, setViewingEmployee] = useState(null);

    // 2. Thêm state cho tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getEmployees();
            setEmployees(response.data);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu nhân viên.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // ... (Giữ nguyên các hàm handleShowFormModal, handleFormModalClose, handleShowDetailModal, handleDetailModalClose, handleDelete) ...
    const handleShowFormModal = (employee = null) => {
        setSelectedEmployee(employee);
        setIsFormModalVisible(true);
    };

    const handleFormModalClose = (shouldReload) => {
        setIsFormModalVisible(false);
        if (shouldReload) {
            fetchEmployees();
        }
    };
    
    const handleShowDetailModal = (employee) => {
        setViewingEmployee(employee);
        setIsDetailModalVisible(true);
    };

    const handleDetailModalClose = () => {
        setIsDetailModalVisible(false);
    };

    const handleDelete = async (employeeId) => {
        try {
            await deleteEmployee(employeeId);
            message.success('Xóa nhân viên thành công.');
            setEmployees(employees.filter(employee => employee.id !== employeeId));
        } catch (error) {
            message.error('Lỗi khi xóa nhân viên.');
            console.error(error);
        }
    };
    
    // 3. Hàm xử lý tìm kiếm
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // 4. Lọc dữ liệu (tìm theo Tên, Mã NV, Tài khoản)
    const filteredEmployees = employees.filter(emp => {
        const search = searchTerm.toLowerCase();
        return (
            (emp.ho_ten && emp.ho_ten.toLowerCase().includes(search)) ||
            (emp.ma_nhan_vien && emp.ma_nhan_vien.toLowerCase().includes(search)) ||
            (emp.username && emp.username.toLowerCase().includes(search))
        );
    });

    // Định nghĩa các cột cho bảng Ant Design
    const columns = [
        // ... (Giữ nguyên định nghĩa columns) ...
        { title: 'Mã NV', dataIndex: 'ma_nhan_vien', key: 'ma_nhan_vien' },
        { title: 'Họ và Tên', dataIndex: 'ho_ten', key: 'ho_ten' },
        { title: 'Tài khoản', dataIndex: 'username', key: 'username' },
        { 
            title: 'Chi tiết',
            key: 'details',
            align: 'center',
            render: (_, record) => (
                <Button 
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={() => handleShowDetailModal(record)} 
                />
            )
        },
        { 
            title: 'Hành động', 
            key: 'action', 
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => handleShowFormModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ) 
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>Quản lý Nhân viên</Typography.Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => handleShowFormModal()}
                >
                    Thêm Nhân viên
                </Button>
            </div>
            
            {/* 5. Thêm ô tìm kiếm */}
            <Input.Search
                placeholder="Tìm theo Mã NV, Tên, Tài khoản..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ marginBottom: 16, width: '40%' }}
                allowClear
            />
            
            {/* 6. Dùng dữ liệu đã lọc */}
            <Table 
                columns={columns} 
                dataSource={filteredEmployees} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
            />
            
            {/* ... (Giữ nguyên các Modal) ... */}
            {isFormModalVisible && (
                <EmployeeForm
                    open={isFormModalVisible}
                    onClose={handleFormModalClose}
                    employee={selectedEmployee}
                />
            )}
            {isDetailModalVisible && (
                <EmployeeDetailModal
                    open={isDetailModalVisible}
                    onClose={handleDetailModalClose}
                    employee={viewingEmployee}
                />
            )}
        </div>
    );
};

export default EmployeeList;