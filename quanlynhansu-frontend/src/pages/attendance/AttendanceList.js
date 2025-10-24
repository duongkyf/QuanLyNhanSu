// src/pages/attendance/AttendanceList.js

import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Space, Typography, Modal, Form, 
    Input, message, Popconfirm, Select, DatePicker, Tag 
} from 'antd'; // Input đã có sẵn
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';

import { useData } from '../../context/DataContext';
import { createChamCong, updateChamCong, deleteChamCong } from '../../api';

const { Title } = Typography;
const { Option } = Select;

const AttendanceList = () => {
    const { chamCong, employees, loading, fetchData } = useData(); 
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // 1. Thêm state cho tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // fetchData đã có sẵn, không cần fetch riêng
    }, [fetchData]);

    // ... (Giữ nguyên các hàm handleShowModal, handleCancel, handleOk, handleDelete) ...
    const handleShowModal = (record = null) => {
        setEditingRecord(record);
        if (record) {
            form.setFieldsValue({
                ...record,
                ngay: record.ngay ? moment(record.ngay, 'YYYY-MM-DD') : null,
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRecord(null);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                nhan_vien: values.nhan_vien,
                trang_thai: values.trang_thai,
                gio_vao: values.gio_vao,
                gio_ra: values.gio_ra,
                ngay: values.ngay.format('YYYY-MM-DD'),
            };

            if (editingRecord) {
                await updateChamCong(editingRecord.id, payload);
                message.success('Cập nhật chấm công thành công!');
            } else {
                await createChamCong(payload);
                message.success('Thêm chấm công thành công!');
            }
            fetchData();
            handleCancel();
        } catch (error) {
            console.error("Lỗi khi lưu chấm công:", error.response?.data || error.message);
            const errorMsg = error.response?.data?.ngay?.[0] || 'Thao tác thất bại!';
            message.error(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteChamCong(id);
            message.success('Xóa chấm công thành công!');
            fetchData();
        } catch (error) {
            message.error('Lỗi khi xóa chấm công!');
        }
    };

    // 2. Hàm xử lý tìm kiếm
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // 3. Lọc dữ liệu (tìm theo Tên, Ngày, Trạng thái)
    const filteredChamCong = chamCong.filter(record => {
        const employee = employees.find(emp => emp.id === record.nhan_vien);
        const employeeName = employee ? employee.ho_ten : '';
        const search = searchTerm.toLowerCase();

        return (
            employeeName.toLowerCase().includes(search) ||
            (record.ngay && record.ngay.toLowerCase().includes(search)) ||
            (record.trang_thai && record.trang_thai.toLowerCase().includes(search))
        );
    });

    const columns = [
        // ... (Giữ nguyên định nghĩa columns) ...
        {
            title: 'Nhân viên',
            dataIndex: 'nhan_vien',
            key: 'nhan_vien',
            render: (nhanVienId) => {
                const employee = employees.find(emp => emp.id === nhanVienId);
                return employee ? employee.ho_ten : `Không rõ (ID: ${nhanVienId})`;
            },
        },
        {
            title: 'Ngày',
            dataIndex: 'ngay',
            key: 'ngay',
            sorter: (a, b) => moment(a.ngay).unix() - moment(b.ngay).unix(),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            render: (status) => {
                if (!status) {
                    return <Tag color="grey">Không xác định</Tag>;
                }
                let color;
                switch (status) {
                    case 'Có mặt': color = 'green'; break;
                    case 'Vắng': color = 'red'; break;
                    case 'Đi trễ': color = 'orange'; break;
                    case 'Nghỉ phép': color = 'blue'; break;
                    default: color = 'grey';
                }
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            }
        },
        { title: 'Giờ vào', dataIndex: 'gio_vao', key: 'gio_vao' },
        { title: 'Giờ ra', dataIndex: 'gio_ra', key: 'gio_ra' },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleShowModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa bản ghi này?"
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
                <Title level={3} style={{ margin: 0 }}>Quản lý Chấm Công</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleShowModal()}>
                    Thêm Chấm Công
                </Button>
            </div>
            
            {/* 4. Thêm ô tìm kiếm */}
            <Input.Search
                placeholder="Tìm theo tên nhân viên, ngày, trạng thái..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ marginBottom: 16, width: '40%' }}
                allowClear
            />
            
            {/* 5. Dùng dữ liệu đã lọc */}
            <Table columns={columns} dataSource={filteredChamCong} rowKey="id" loading={loading} bordered />
            
            <Modal
                title={editingRecord ? 'Chỉnh sửa Chấm Công' : 'Thêm Chấm Công mới'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                destroyOnClose >
                {/* ... (Giữ nguyên nội dung Form trong Modal) ... */}
                <Form form={form} layout="vertical" name="cham_cong_form">
                    <Form.Item name="nhan_vien" label="Nhân viên" rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}>
                        <Select placeholder="Chọn nhân viên" showSearch filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }>
                            {employees.map(emp => (
                                <Option key={emp.id} value={emp.id}>{`${emp.ho_ten} (${emp.ma_nhan_vien})`}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="ngay" label="Ngày chấm công" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="trang_thai" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                        <Select placeholder="Chọn trạng thái">
                            <Option value="Có mặt">Có mặt</Option>
                            <Option value="Vắng">Vắng</Option>
                            <Option value="Đi trễ">Đi trễ</Option>
                            <Option value="Nghỉ phép">Nghỉ phép</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="gio_vao" label="Giờ vào (ví dụ: 08:00)">
                        <Input />
                    </Form.Item>
                     <Form.Item name="gio_ra" label="Giờ ra (ví dụ: 17:00)">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AttendanceList;