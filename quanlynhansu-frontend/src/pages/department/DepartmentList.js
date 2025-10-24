import React, { useState, useEffect } from 'react';
// 1. Input đã được import sẵn
import { Table, Button, Space, Typography, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';

import { useData } from '../../context/DataContext';
import { createDepartment, updateDepartment, deleteDepartment } from '../../api';
import DepartmentDetailModal from './DepartmentDetailModal';

const { Title } = Typography;

const DepartmentList = () => {
    const { departments, employees, loading, fetchData } = useData(); 
    const [form] = Form.useForm();
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [viewingDepartment, setViewingDepartment] = useState(null);
    console.log("DỮ LIỆU PHÒNG BAN TỪ CONTEXT:", departments);

    // 2. Thêm state cho tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // fetchData đã có sẵn, không cần fetch riêng
    }, [fetchData]);

    // ... (Giữ nguyên các hàm handleShowFormModal, handleFormCancel, handleFormOk, handleDelete, handleShowDetailModal, handleDetailCancel) ...
    const handleShowFormModal = (department = null) => {
        setEditingDepartment(department);
        form.setFieldsValue(department ? { ten_phong_ban: department.ten_phong_ban } : { ten_phong_ban: '' });
        setIsFormModalVisible(true);
    };

    const handleFormCancel = () => {
        setIsFormModalVisible(false);
        setEditingDepartment(null);
    };

    const handleFormOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingDepartment) {
                await updateDepartment(editingDepartment.id, values);
                message.success('Cập nhật phòng ban thành công!');
            } else {
                await createDepartment(values);
                message.success('Thêm phòng ban thành công!');
            }
            fetchData();
            handleFormCancel();
        } catch (error) {
            message.error('Đã xảy ra lỗi!');
        }
    };

    const handleDelete = async (departmentId) => {
        try {
            await deleteDepartment(departmentId);
            message.success('Xóa phòng ban thành công!');
            fetchData();
        } catch (error) {
            message.error('Lỗi khi xóa phòng ban!');
        }
    };
    
    const handleShowDetailModal = (department) => {
        const employeesInDept = employees.filter(emp => emp.phong_ban?.id === department.id);
        setViewingDepartment({ ...department, employees: employeesInDept });
        setIsDetailModalVisible(true);
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
    };

    // 3. Hàm xử lý tìm kiếm
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // 4. Lọc dữ liệu
    const filteredDepartments = departments.filter(dept =>
        dept.ten_phong_ban.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        // ... (Giữ nguyên định nghĩa columns) ...
        { title: 'ID', dataIndex: 'id', key: 'id', width: '10%' },
        { title: 'Tên Phòng Ban', dataIndex: 'ten_phong_ban', key: 'ten_phong_ban' },
        {
            title: 'Số nhân viên',
            key: 'employee_count',
            align: 'center',
            width: '15%',
            render: (_, record) => {
                return employees.filter(emp => emp.phong_ban?.id === record.id).length;
            }
        },
        {
            title: 'Chi tiết',
            key: 'details',
            align: 'center',
            width: '10%',
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
            width: '20%',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleShowFormModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Phòng Ban</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleShowFormModal()}>
                    Thêm Phòng Ban
                </Button>
            </div>
            
            {/* 5. Thêm ô tìm kiếm */}
            <Input.Search
                placeholder="Tìm kiếm phòng ban..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ marginBottom: 16, width: '40%' }}
                allowClear
            />
            
            {/* 6. Dùng dữ liệu đã lọc */}
            <Table columns={columns} dataSource={filteredDepartments} rowKey="id" loading={loading} bordered />
            
            {/* ... (Giữ nguyên các Modal) ... */}
            <Modal
                title={editingDepartment ? 'Chỉnh sửa Phòng Ban' : 'Thêm Phòng Ban mới'}
                open={isFormModalVisible}
                onOk={handleFormOk}
                onCancel={handleFormCancel}
                destroyOnClose>
                <Form form={form} layout="vertical" name="department_form">
                    <Form.Item name="ten_phong_ban" label="Tên Phòng Ban" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            <DepartmentDetailModal 
                open={isDetailModalVisible}
                onClose={handleDetailCancel}
                department={viewingDepartment}
            />
        </div>
    );
};

export default DepartmentList;