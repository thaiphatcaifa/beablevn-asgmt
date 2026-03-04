import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#333' }}>Chào mừng đến với BeableVN Assignment</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>Vui lòng chọn vai trò của bạn để tiếp tục</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {/* Đã sửa đường dẫn thành /teacher/login */}
        <Link to="/teacher/login" style={{ textDecoration: 'none' }}>
          <Button variant="primary" style={{ width: '200px', height: '50px' }}>👨‍🏫 Tôi là Giáo viên</Button>
        </Link>
        <Link to="/student/login" style={{ textDecoration: 'none' }}>
          <Button variant="success" style={{ width: '200px', height: '50px' }}>👨‍🎓 Tôi là Học viên</Button>
        </Link>
      </div>
    </div>
  );
}