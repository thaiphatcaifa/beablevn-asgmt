import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{ backgroundColor: 'white', padding: '15px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
         <img src="/BA LOGO.png" alt="BeAble Logo" style={{ height: '50px', objectFit: 'contain' }} />
      </header>

      <div style={{ textAlign: 'center', marginTop: '80px', padding: '20px' }}>
        <h1 style={{ color: '#003366', fontWeight: '800', marginBottom: '10px', fontSize: '2rem' }}>BE ABLE VN</h1>
        <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '1.1rem', fontWeight: '500' }}>Hệ thống Quản lý Bài tập & Đánh giá</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/teacher/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '220px', height: '60px', fontSize: '18px' }}>👨‍🏫 Giáo viên</Button>
          </Link>
          <Link to="/student/login" style={{ textDecoration: 'none' }}>
            <Button variant="success" style={{ width: '220px', height: '60px', fontSize: '18px' }}>👨‍🎓 Học viên</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}