// src/components/layout/AppLayout.js

import React from 'react';
import { Layout, Button, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import SiderBar from './SiderBar'; 

const { Header, Content, Sider } = Layout;

const AppLayout = () => {
    const { logout } = useAuth();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Thanh menu bên trái */}
            <Sider width={200} theme="dark">
                
                {/* ✨ SỬA LOGO TẠI ĐÂY ✨ */}
                {/* Thay thế div cũ bằng thẻ img này */}
                <div 
                    className="logo" 
                    style={{ 
                        height: '64px', 
                        padding: '10px', 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    {/* Trình duyệt sẽ tự động tìm file /logo.png 
                      trong thư mục 'public' 
                    */}
                    <img 
                        src="/logo.png" 
                        alt="Logo" 
                        style={{ maxHeight: '100%', maxWidth: '100%' }} 
                    />
                </div>
                
                {/* Menu (Nhân viên, Phòng ban...) nằm bên dưới logo */}
                <SiderBar />

            </Sider>
            
            {/* Phần bên phải (Header và Nội dung) */}
            <Layout>
                <Header 
                    style={{ 
                        padding: '0 16px', 
                        background: '#fff', 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        alignItems: 'center' 
                    }}
                >
                    <Avatar style={{ backgroundColor: '#87d068', marginRight: '16px' }} icon={<UserOutlined />} />
                    
                    <Button 
                        type="primary" 
                        danger 
                        icon={<LogoutOutlined />} 
                        onClick={logout}
                    >
                        Đăng xuất
                    </Button>
                </Header>
                
                {/* Phần nội dung chính */}
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                    <Outlet /> 
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;