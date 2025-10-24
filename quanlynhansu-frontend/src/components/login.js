import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd'; // ⭐️ Đảm bảo đã import message
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import file CSS

// Định nghĩa đường dẫn đúng
const LOGO_URL = process.env.PUBLIC_URL + '/logo.png'; // ⚠️ Cập nhật tên file logo của bạn
const BACKGROUND_URL = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7';

const Login = () => {
    // ⭐️ LỖI 1: BẠN ĐÃ THIẾU DÒNG NÀY
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    // ⭐️ LỖI 2: BẠN ĐÃ THIẾU TOÀN BỘ HÀM NÀY
    const onFinish = async (values) => {
        setLoading(true);
        try {
            await login(values.username, values.password);
            message.success('Đăng nhập thành công!');
            navigate('/');
        } catch (error) {
            message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            
            {/* CỘT BÊN TRÁI (FORM) */}
            <div className="login-form-side">
                <div className="login-form-container">
                    
                    <div className="login-logo-container">
                        <img src={LOGO_URL} alt="JOJO Logo" className="login-logo" /> 
                        <h2>Hệ thống Quản lý Nhân sự</h2>
                        <p>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
                    </div>

                    {/* Phần Form sử dụng onFinish và loading.
                      Giờ chúng đã được định nghĩa ở trên nên sẽ không báo lỗi.
                    */}
                    <Form
                        name="login_form"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: 'Vui lòng nhập Tài khoản!' }]}
                        >
                            <Input 
                                prefix={<UserOutlined />} 
                                placeholder="Tài khoản" 
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined />} 
                                placeholder="Mật khẩu" 
                                size="large"
                            />
                        </Form.Item>

                       <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading} 
                                block 
                                size="large"
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>

            {/* CỘT BÊN PHẢI (ẢNH) */}
            <div 
                className="login-image-side"
                style={{ backgroundImage: `url(${BACKGROUND_URL})` }}
            >
                {/* Ảnh nền được chèn bằng style */}
            </div>
        </div>
    );
};

export default Login;