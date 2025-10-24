// src/pages/employee/EmployeeForm.js

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message, Row, Col } from 'antd';
import moment from 'moment';
import { createNhanVien, updateNhanVien, getDepartments, getPositions } from '../../api';
import { useData } from '../../context/DataContext';

const { Option } = Select;

const EmployeeForm = ({ open, onClose, employee }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const { fetchData } = useData();

    const isEditing = !!employee;

    // Tải danh sách phòng ban và chức vụ cho các dropdown khi modal được mở
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [deptRes, posRes] = await Promise.all([getDepartments(), getPositions()]);
                setDepartments(deptRes.data);
                setPositions(posRes.data);
            } catch {
                message.error('Lỗi khi tải danh sách phòng ban/chức vụ!');
            }
        };
        if (open) {
            loadInitialData();
        }
    }, [open]);
    
    // Set giá trị cho form khi ở chế độ sửa, hoặc reset form khi thêm mới
    useEffect(() => {
        if (isEditing && employee) {
            form.setFieldsValue({
                ...employee,
                ngay_sinh: employee.ngay_sinh ? moment(employee.ngay_sinh, 'YYYY-MM-DD') : null,
                ngay_vao_lam: employee.ngay_vao_lam ? moment(employee.ngay_vao_lam, 'YYYY-MM-DD') : null,
                phong_ban: employee.phong_ban?.id,
                chuc_vu: employee.chuc_vu?.id,
            });
        } else {
            form.resetFields();
        }
    }, [employee, form, isEditing, open]);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            // 1. Chuẩn bị payload cơ bản
            const payload = {
                ...values,
                ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format('YYYY-MM-DD') : null,
                ngay_vao_lam: values.ngay_vao_lam ? values.ngay_vao_lam.format('YYYY-MM-DD') : null,
            };

            // 2. ✨ SỬA LỖI CHÍNH: Chuyển đổi ID phòng ban và chức vụ
            // Logic này cần được áp dụng cho cả 'thêm mới' và 'chỉnh sửa'
            payload.phong_ban_id = values.phong_ban;
            payload.chuc_vu_id = values.chuc_vu;
            delete payload.phong_ban; // Xóa key cũ để không gửi thừa dữ liệu
            delete payload.chuc_vu;   // Xóa key cũ

            if (isEditing) {
                // Nếu là chỉnh sửa, không gửi lại mã nhân viên (vì không thể thay đổi)
                delete payload.ma_nhan_vien;
                
                await updateNhanVien(employee.id, payload);
                message.success('Cập nhật nhân viên thành công!');
            } else {
                // Nếu là thêm mới:
                // ✨ SỬA LỖI 2: Đổi tên 'username' thành 'new_username' để khớp với Serializer
                payload.new_username = payload.username;
                delete payload.username;

                await createNhanVien(payload);
                message.success('Thêm nhân viên thành công!');
            }

            fetchData(); // Tải lại dữ liệu mới cho bảng
            onClose(true); // Đóng modal và báo hiệu thành công

        } catch (error) {
            const errorData = error.response?.data;
            let errorMsg = 'Thao tác thất bại. Vui lòng thử lại!';

            if (errorData) {
                // Lấy lỗi đầu tiên từ backend để hiển thị
                const firstErrorField = Object.keys(errorData)[0];
                if (firstErrorField && Array.isArray(errorData[firstErrorField])) {
                    errorMsg = `${firstErrorField}: ${errorData[firstErrorField][0]}`;
                }
            }
            
            message.error(errorMsg);
            console.error("API Call Failed:", error.response);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title={isEditing ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên mới'}
            onCancel={() => onClose(false)}
            width={720}
            destroyOnClose
            footer={[
                <Button key="back" onClick={() => onClose(false)}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                    {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{}}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="ho_ten" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="ma_nhan_vien" label="Mã Nhân viên" rules={[{ required: true, message: 'Vui lòng nhập mã!' }]}>
                            <Input disabled={isEditing} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="ngay_sinh" label="Ngày sinh">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="ngay_vao_lam" label="Ngày vào làm">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="phong_ban" label="Phòng ban" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
                            <Select placeholder="Chọn phòng ban">
                                {departments.map(dept => <Option key={dept.id} value={dept.id}>{dept.ten_phong_ban}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="chuc_vu" label="Chức vụ" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
                            <Select placeholder="Chọn chức vụ">
                                {positions.map(pos => <Option key={pos.id} value={pos.id}>{pos.ten_chuc_vu}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                {!isEditing && (
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập!' }]}>
                                <Input.Password />
                            </Form.Item>
                        </Col>
                    </Row>
                )}
            </Form>
        </Modal>
    );
};

export default EmployeeForm;