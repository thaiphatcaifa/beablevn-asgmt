import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function StudentLogin() {
  const [roomCode, setRoomCode] = useState('');
  const [studentId, setStudentId] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim() && studentId.trim()) {
      navigate(`/student/room/${roomCode}`);
    } else {
      alert("Vui lòng nhập đầy đủ thông tin!");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Học viên Đăng nhập</h2>
      <form onSubmit={handleJoinRoom}>
        <Input 
          label="Mã Lớp (Room Code)" 
          placeholder="Ví dụ: MATH101" 
          value={roomCode} 
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())} 
          required 
        />
        <Input 
          label="Mã số Học viên (Student ID)" 
          placeholder="Ví dụ: SV001" 
          value={studentId} 
          onChange={(e) => setStudentId(e.target.value)} 
          required 
        />
        <Button type="submit" variant="primary">Tham gia Phòng học</Button>
      </form>
    </div>
  );
}