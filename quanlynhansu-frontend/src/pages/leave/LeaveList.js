// src/pages/leave/LeaveList.js

import React, { useState, useEffect } from 'react';
import {
    Table, Button, Space, Typography, Modal, Form,
    Input, message, Popconfirm, Select, DatePicker, Tag
} from 'antd'; // Input đã có sẵn
import { 
    PlusOutlined, DeleteOutlined, EditOutlined, 
    CheckCircleOutlined, CloseCircleOutlined 
} from '@ant-design/icons';
import moment from 'moment';

import { useData } from '../../context/DataContext';
import { 
    createDonXinNghi, updateDonXinNghi, deleteDonXinNghi,
    approveLeaveRequest, rejectLeaveRequest 
} from '../../api'; // Bỏ getDonXinNghi vì đã dùng useData

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const LeaveList = () => {
    const { donXinNghi, employees, loading, fetchData } = useData();
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // 1. Thêm state cho tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // fetchData đã có sẵn, không cần fetch riêng
    }, [fetchData]);

    // ... (Giữ nguyên các hàm handleShowModal, handleCancel, handleOk, handleDelete, handleApprove, handleReject) ...
    const handleShowModal = (record = null) => {
        setEditingRecord(record);
        if (record) {
            form.setFieldsValue({
                ...record,
                ngay_nghi: [moment(record.ngay_bat_dau), moment(record.ngay_ket_thuc)],
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
                ly_do: values.ly_do,
                ngay_bat_dau: values.ngay_nghi[0].format('YYYY-MM-DD'),
                ngay_ket_thuc: values.ngay_nghi[1].format('YYYY-MM-DD'),
            };

            if (editingRecord) {
                await updateDonXinNghi(editingRecord.id, payload);
                message.success('Cập nhật đơn thành công!');
            } else {
                await createDonXinNghi(payload);
                message.success('Gửi đơn thành công!');
            }
            fetchData();
            handleCancel();
        } catch (error) {
            message.error('Thao tác thất bại!');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDonXinNghi(id);
            message.success('Xóa đơn thành công!');
            fetchData();
        } catch (error) {
            message.error('Lỗi khi xóa đơn!');
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveLeaveRequest(id);
            message.success('Đã phê duyệt đơn!');
            fetchData();
        } catch (error) {
            message.error('Lỗi khi phê duyệt!');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectLeaveRequest(id);
            message.success('Đã từ chối đơn!');
            fetchData();
        } catch (error) {
            message.error('Lỗi khi từ chối!');
        }
    };

    // 2. Hàm xử lý tìm kiếm
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // 3. Lọc dữ liệu (tìm theo Tên, Lý do, Trạng thái)
    const filteredDonXinNghi = donXinNghi.filter(record => {
        const employee = employees.find(emp => emp.id === record.nhan_vien);
        const employeeName = employee ? employee.ho_ten : '';
        const search = searchTerm.toLowerCase();
        
        return (
            employeeName.toLowerCase().includes(search) ||
            (record.ly_do && record.ly_do.toLowerCase().includes(search)) ||
            (record.trang_thai && record.trang_thai.toLowerCase().includes(search))
        );
    });
    
    const columns = [
        // ... (Giữ nguyên định nghĩa columns) ...
        {
            title: 'Nhân viên',
            dataIndex: 'nhan_vien',
            key: 'nhan_vien',
            render: (id) => employees.find(emp => emp.id === id)?.ho_ten || 'Không rõ',
        },
        { title: 'Từ ngày', dataIndex: 'ngay_bat_dau', key: 'ngay_bat_dau' },
        { title: 'Đến ngày', dataIndex: 'ngay_ket_thuc', key: 'ngay_ket_thuc' },
        { title: 'Lý do', dataIndex: 'ly_do', key: 'ly_do' },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            render: (status) => {
                let color;
                let text = status;
                switch(status) {
                    case 'Chờ phê duyệt':
                    case 'pending':
                        color = 'gold';
                        text = 'Chờ duyệt';
                        break;
                    case 'Đã phê duyệt':
                        color = 'green';
                        text = 'Đã duyệt';
                        break;
                    case 'Bị từ chối':
                        color = 'red';
                        break;
                    default:
                        color = 'default';
                }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    {(record.trang_thai === 'Chờ phê duyệt' || record.trang_thai === 'pending') && (
                        <>
                            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove(record.id)}>Duyệt</Button>
                            <Button danger icon={<CloseCircleOutlined />} onClick={() => handleReject(record.id)}>Từ chối</Button>
                        </>     
                    )}
                    <Button icon={<EditOutlined />} onClick={() => handleShowModal(record)} />
                    <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Đơn Xin Nghỉ</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleShowModal()}>
                    Tạo Đơn Mới
                </Button>
            </div>

            {/* 4. Thêm ô tìm kiếm */}
            <Input.Search
                placeholder="Tìm theo tên nhân viên, lý do, trạng thái..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ marginBottom: 16, width: '40%' }}
                allowClear
            />

            {/* 5. Dùng dữ liệu đã lọc */}
            <Table
                columns={columns}
                dataSource={filteredDonXinNghi}
                rowKey="id"
                loading={loading}
                bordered
            />

            {/* ... (Giữ nguyên Modal) ... */}
            <Modal
                title={editingRecord ? 'Chỉnh sửa Đơn' : 'Tạo Đơn Xin Nghỉ Mới'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                destroyOnClose
            >
                <Form form={form} layout="vertical" name="leave_form">
                    <Form.Item name="nhan_vien" label="Nhân viên" rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}>
                        <Select placeholder="Chọn nhân viên">
                            {employees.map(emp => (
                                <Option key={emp.id} value={emp.id}>{emp.ho_ten}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="ngay_nghi" label="Thời gian nghỉ" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                        <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="ly_do" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LeaveList;