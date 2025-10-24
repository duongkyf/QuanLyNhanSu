import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import hook từ Bước 3

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth(); // Lấy hàm login từ AuthContext

    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn form tải lại trang
        if (!username || !password) {
            alert("Vui lòng nhập cả tên tài khoản và mật khẩu.");
            return;
        }
        // Gọi hàm login đã được định nghĩa trong AuthContext
        await login(username, password);
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '100px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Đăng nhập hệ thống</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Tài khoản:
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Mật khẩu:
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 15px' }}>
                    Đăng nhập
                </button>
            </form>
        </div>
    );
};

export default Login;