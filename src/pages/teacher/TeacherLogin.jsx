import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Kiểm tra thông tin đăng nhập cứng (Hardcoded credentials)
    if (email === 'helpdesk@beablevn.com' && password === 'BAVNbavn$67896789#') {
      alert("Đăng nhập thành công!");
      navigate('/teacher'); // Chuyển hướng vào trang quản lý
    } else {
      alert("Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại!");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#007bff' }}>Giáo viên Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <Input 
          label="Email hoặc ID" 
          type="text"
          placeholder="helpdesk@beablevn.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <Input 
          label="Mật khẩu" 
          type="password"
          placeholder="Nhập mật khẩu..." 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <Button type="submit" variant="primary" style={{ marginTop: '10px' }}>
          Đăng nhập
        </Button>
      </form>
    </div>
  );
}