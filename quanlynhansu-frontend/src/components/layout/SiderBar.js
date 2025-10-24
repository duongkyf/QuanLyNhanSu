import React from 'react';
import { Menu } from 'antd';
import { UserOutlined, AppstoreOutlined, ProfileOutlined, ClockCircleOutlined, FileDoneOutlined } from '@ant-design/icons';
// 1. Import Link và useLocation
import { Link, useLocation } from 'react-router-dom';

const SiderBar = () => {
    // 2. Dùng useLocation để biết bạn đang ở trang nào
    const location = useLocation();

    // 3. Xác định 'key' được chọn dựa trên URL
    const selectedKey = location.pathname.split('/')[1] || 'nhanvien';

    return (
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
            {/* 4. Bọc Menu.Item trong <Link> và dùng 'to' */}
            <Menu.Item key="nhanvien" icon={<UserOutlined />}>
                <Link to="/nhanvien">Nhân viên</Link>
            </Menu.Item>
            
            <Menu.Item key="phongban" icon={<AppstoreOutlined />}>
                <Link to="/phongban">Phòng Ban</Link>
            </Menu.Item>
            
            <Menu.Item key="chucvu" icon={<ProfileOutlined />}>
                <Link to="/chucvu">Chức Vụ</Link>
            </Menu.Item>
            
            <Menu.Item key="chamcong" icon={<ClockCircleOutlined />}>
                <Link to="/chamcong">Chấm công</Link>
            </Menu.Item>
            
            <Menu.Item key="donxinnghi" icon={<FileDoneOutlined />}>
                <Link to="/donxinnghi">Đơn xin nghỉ</Link>
            </Menu.Item>
        </Menu>
    );
};

export default SiderBar;