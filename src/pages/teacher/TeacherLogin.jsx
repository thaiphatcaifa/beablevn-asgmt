import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'helpdesk@beablevn.com' && password === 'BAVNbavn$67896789#') {
      navigate('/teacher');
    } else {
      alert("Tài khoản hoặc mật khẩu không chính xác!");
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '16px' }}>
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '448px', border: '1px solid #f1f5f9' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', border: '1px solid #f8fafc' }}>
            <img src="/BA LOGO.png" alt="Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#003366', margin: 0 }}>BE ABLE VN</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px', fontWeight: '500' }}>Giáo viên Đăng nhập</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#003366', textTransform: 'uppercase', marginBottom: '6px' }}>Email hoặc ID</label>
            <input type="text" placeholder="helpdesk@beablevn.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', backgroundColor: 'white', fontSize: '1rem', fontWeight: '500' }}
              onFocus={(e) => e.target.style.borderColor = '#003366'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#003366', textTransform: 'uppercase', marginBottom: '6px' }}>Mật khẩu</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', backgroundColor: 'white', fontSize: '1rem', fontWeight: '500' }}
              onFocus={(e) => e.target.style.borderColor = '#003366'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <button type="submit" style={{ width: '100%', backgroundColor: '#003366', color: 'white', fontWeight: '700', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(0, 51, 102, 0.1)' }}>
            ĐĂNG NHẬP
          </button>
        </form>
      </div>
    </div>
  );
}