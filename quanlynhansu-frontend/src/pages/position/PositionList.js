import React, { useState, useEffect } from 'react';
// 1. Import thêm Popconfirm, DeleteOutlined, EditOutlined
import { 
    Table, Button, Space, Typography, Modal, Form, 
    Input, message, Popconfirm 
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

// 2. Import useData và các hàm API cần thiết
import { useData } from '../../context/DataContext';
import { createPosition, updatePosition, deletePosition } from '../../api';

const { Title } = Typography;

const PositionList = () => {
    const [form] = Form.useForm();
    
    // 3. Lấy dữ liệu từ Context (thay vì state cục bộ)
    const { positions, employees, loading, fetchData } = useData();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPosition, setEditingPosition] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // 4. Không cần fetchPositions riêng nữa, vì useData đã xử lý
        // Chỉ cần đảm bảo dữ liệu được tải (mặc dù AppRouter đã gọi)
        // fetchData(); // Có thể bỏ dòng này nếu AppRouter đã gọi
    }, []); // Bỏ [fetchData] nếu bạn bỏ luôn hàm

    const handleShowModal = (position = null) => {
        setEditingPosition(position);
        form.setFieldsValue(position ? { ten_chuc_vu: position.ten_chuc_vu } : { ten_chuc_vu: '' });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingPosition(null);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingPosition) {
                await updatePosition(editingPosition.id, values);
                message.success('Cập nhật chức vụ thành công!');
            } else {
                await createPosition(values);
                message.success('Thêm chức vụ thành công!');
            }
            // 5. Gọi fetchData() của context để làm mới dữ liệu
            fetchData();
            handleCancel();
        } catch (error) {
            message.error('Đã xảy ra lỗi!');
        }
    };

    // 6. Thêm hàm Xóa (giống DepartmentList)
    const handleDelete = async (positionId) => {
        try {
            await deletePosition(positionId);
            message.success('Xóa chức vụ thành công!');
            fetchData(); // Làm mới dữ liệu
        } catch (error) {
            message.error('Lỗi khi xóa chức vụ!');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredPositions = positions.filter(pos =>
        pos.ten_chuc_vu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: '10%' },
        { title: 'Tên Chức Vụ', dataIndex: 'ten_chuc_vu', key: 'ten_chuc_vu' },
        
        // 7. ✨ THÊM CỘT SỐ LƯỢNG NHÂN VIÊN ✨
        {
            title: 'Số nhân viên',
            key: 'employee_count',
            align: 'center',
            width: '20%',
            render: (_, record) => {
                // Logic đếm tương tự Phòng ban, nhưng so sánh với 'chuc_vu'
                return employees.filter(emp => emp.chuc_vu?.id === record.id).length;
            }
        },
        
        {
            title: 'Hành động',
            key: 'action',
            width: '25%',
            align: 'center',
            render: (_, record) => (
                // 8. Cập nhật nút Sửa/Xóa cho đẹp hơn
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleShowModal(record)}>Sửa</Button>
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
                <Title level={3} style={{ margin: 0 }}>Quản lý Chức Vụ</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleShowModal()}>
                    Thêm Chức Vụ
                </Button>
            </div>
            
            <Input.Search
                placeholder="Tìm kiếm chức vụ..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ marginBottom: 16, width: '40%' }}
                allowClear
            />
            
            {/* 9. Dùng `filteredPositions` và `loading` từ context */}
            <Table columns={columns} dataSource={filteredPositions} rowKey="id" loading={loading} bordered />
            
            <Modal
                title={editingPosition ? 'Chỉnh sửa Chức Vụ' : 'Thêm Chức Vụ mới'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose // Thêm để reset form khi đóng
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="ten_chuc_vu" label="Tên Chức Vụ" rules={[{ required: true, message: 'Vui lòng nhập tên chức vụ!' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PositionList;