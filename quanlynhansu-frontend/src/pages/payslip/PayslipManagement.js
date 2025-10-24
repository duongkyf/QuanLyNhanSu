import React, { useState, useEffect } from 'react';
import api from '../../api'; // Đảm bảo dùng 'api', không phải 'axios'

// Thêm một chút CSS nội tuyến để bảng biểu dễ nhìn hơn
const styles = `
  .payslip-container {
    font-family: Arial, sans-serif;
    margin: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .payslip-form {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    border: 1px solid #eee;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
  .payslip-form div {
    margin-bottom: 10px;
  }
  .payslip-form label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 0.9em;
    color: #333;
  }
  .payslip-form input,
  .payslip-form select {
    width: 100%;
    padding: 10px;
    box-sizing: border-box; /* Đảm bảo padding không làm vỡ layout */
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .payslip-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  .payslip-table th,
  .payslip-table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  .payslip-table th {
    background-color: #f4f6f8;
    font-weight: 600;
  }
  .payslip-table tr:nth-child(even) {
    background-color: #fcfcfc;
  }
  .payslip-table button {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
  }
  .payslip-table button:hover {
    background: #c0392b;
  }
  .form-submit-btn {
    background: #3498db;
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
    grid-column: 1 / -1; /* Nút submit chiếm toàn bộ chiều rộng grid */
  }
  .form-submit-btn:hover {
    background: #2980b9;
  }
  .error-message {
    color: red;
    background: #ffe0e0;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 20px;
  }
`;

// Hàm format tiền tệ
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

function PayslipManagement() {
  const [payslips, setPayslips] = useState([]);
  const [nhanVienList, setNhanVienList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ⭐️ SỬA 1: Đổi 'nhan_vien' thành 'nhan_vien_id'
  const [formData, setFormData] = useState({
    nhan_vien_id: '', // Sẽ lưu ID của nhân viên
    thang: new Date().getMonth() + 1, // Mặc định tháng hiện tại
    nam: new Date().getFullYear(), // Mặc định năm hiện tại
    luong_co_ban: '',
    phu_cap: 0,
    khau_tru: 0,
  });

  // 1. Tải dữ liệu khi component được mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nhanVienRes, payslipsRes] = await Promise.all([
        api.get('nhanvien/'), 
        api.get('payslips/'),
      ]);
      
      setNhanVienList(nhanVienRes.data);
      setPayslips(payslipsRes.data);
      
      // Nếu có danh sách nhân viên, chọn nhân viên đầu tiên làm mặc định
      if (nhanVienRes.data.length > 0) {
        setFormData(prevData => ({
          ...prevData,
          // ⭐️ SỬA 2: Cập nhật 'nhan_vien_id'
          nhan_vien_id: nhanVienRes.data[0].id 
        }));
      }

    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý thay đổi input trên form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 3. Xử lý khi submit form tạo mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ⭐️ SỬA 3: Validate 'nhan_vien_id'
    if (!formData.nhan_vien_id || !formData.thang || !formData.nam || formData.luong_co_ban === '') {
      setError('Vui lòng điền đầy đủ các trường: Nhân viên, Tháng, Năm, Lương cơ bản.');
      return;
    }

    try {
      // Gửi dữ liệu lên server (formData đã đúng)
      const response = await api.post('payslips/', formData);
      
      setPayslips([...payslips, response.data].sort((a, b) => {
        if (a.nam !== b.nam) return b.nam - a.nam;
        return b.thang - a.thang;
      }));
      
      // ⭐️ SỬA 4: Reset form
      setFormData({
        ...formData,
        nhan_vien_id: nhanVienList.length > 0 ? nhanVienList[0].id : '',
        luong_co_ban: '',
        phu_cap: 0,
        khau_tru: 0,
      });
      alert('Tạo bảng lương thành công!');

    } catch (err) {
      console.error(err.response);
      if (err.response && err.response.data && err.response.data.unique_together) {
         setError('Lỗi: Nhân viên này đã có bảng lương cho tháng/năm này.');
      } else {
         setError('Đã xảy ra lỗi khi tạo bảng lương.');
      }
    }
  };

  // 4. Xử lý xóa bảng lương
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bảng lương này?')) {
      try {
        await api.delete(`payslips/${id}/`);
        setPayslips(payslips.filter(p => p.id !== id));
      } catch (err) {
        setError('Đã xảy ra lỗi khi xóa bảng lương.');
        console.error(err);
      }
    }
  };
  
  // ----- RENDER ----- //
  
  if (loading) {
    return <div className="payslip-container">Đang tải dữ liệu...</div>;
  }

  return (
    <>
      <style>{styles}</style>

      <div className="payslip-container">
        <h1>Quản lý Bảng Lương</h1>

        {error && <div className="error-message">{error}</div>}

        {/* === FORM TẠO MỚI === */}
        <form onSubmit={handleSubmit} className="payslip-form">
          <h2>Tạo Bảng Lương Mới</h2>
          <div className="form-grid">
            <div>
              {/* ⭐️ SỬA 5: Cập nhật JSX cho <select> */}
              <label htmlFor="nhan_vien_id">Nhân viên</label>
              <select
                id="nhan_vien_id"
                name="nhan_vien_id"
                value={formData.nhan_vien_id}
                onChange={handleInputChange}
              >
                {nhanVienList.map(nv => (
                  <option key={nv.id} value={nv.id}>
                    {nv.ma_nhan_vien} - {nv.ho_ten}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="thang">Tháng</label>
              <input
                type="number"
                id="thang"
                name="thang"
                value={formData.thang}
                onChange={handleInputChange}
                min="1"
                max="12"
                required
              />
            </div>
            <div>
              <label htmlFor="nam">Năm</label>
              <input
                type="number"
                id="nam"
                name="nam"
                value={formData.nam}
                onChange={handleInputChange}
                min="2000"
                max="2100"
                required
              />
            </div>
            <div>
              <label htmlFor="luong_co_ban">Lương cơ bản</label>
              <input
                type="number"
                id="luong_co_ban"
                name="luong_co_ban"
                value={formData.luong_co_ban}
                onChange={handleInputChange}
                step="1000"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="phu_cap">Phụ cấp</label>
              <input
                type="number"
                id="phu_cap"
                name="phu_cap"
                value={formData.phu_cap}
                onChange={handleInputChange}
                step="1000"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="khau_tru">Khấu trừ</label>
              <input
                type="number"
                id="khau_tru"
                name="khau_tru"
                value={formData.khau_tru}
                onChange={handleInputChange}
                step="1000"
                min="0"
              />
            </div>
          </div>
          <button type="submit" className="form-submit-btn">Tạo Bảng Lương</button>
        </form>

        {/* === BẢNG DANH SÁCH === */}
        <h2>Danh Sách Bảng Lương</h2>
        <table className="payslip-table">
          <thead>
            <tr>
              <th>Tháng/Năm</th>
              <th>Nhân viên</th>
              <th>Lương Cơ Bản</th>
              <th>Phụ Cấp</th>
              <th>Khấu Trừ</th>
              <th>Lương Thực Nhận</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {payslips.length > 0 ? (
              payslips.map(p => (
                <tr key={p.id}>
                  <td>{p.thang}/{p.nam}</td>
                  <td>{p.nhan_vien}</td> 
                  <td>{formatCurrency(p.luong_co_ban)}</td>
                  <td>{formatCurrency(p.phu_cap)}</td>
                  <td>{formatCurrency(p.khau_tru)}</td>
                  <td><strong>{formatCurrency(p.luong_thuc_nhan)}</strong></td>
                  <td>
                    <button onClick={() => handleDelete(p.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>Chưa có bảng lương nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default PayslipManagement;