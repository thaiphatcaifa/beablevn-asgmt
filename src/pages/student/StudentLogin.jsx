// src/pages/student/StudentLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; // Cần import Firestore
import { db } from '../../firebase'; // Import db

export default function StudentLogin() {
  const [roomCode, setRoomCode] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim() || !studentId.trim()) return;

    setIsLoading(true);
    try {
      const roomCodeUpper = roomCode.toUpperCase();
      const studentIdUpper = studentId.toUpperCase(); // Chuẩn hóa ID in hoa
      
      // Gọi lên Firebase kiểm tra mã phòng
      const roomRef = doc(db, "rooms", roomCodeUpper);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        
        // Tìm xem học sinh có trong danh sách phòng hay không
        const isStudentExist = roomData.students.some(s => s.studentId === studentIdUpper);
        
        if (isStudentExist) {
          // Lưu ID học sinh vào localStorage để các màn hình sau có thể dùng
          localStorage.setItem('currentStudentId', studentIdUpper);
          alert("Tham gia lớp học thành công!");
          navigate(`/student/room/${roomCodeUpper}`);
        } else {
          alert(`Lỗi: Không tìm thấy học viên có ID "${studentIdUpper}" trong phòng ${roomCodeUpper}!`);
        }
      } else {
        alert("Mã phòng không tồn tại. Vui lòng kiểm tra lại!");
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối đến máy chủ. Hãy thử lại!");
    }
    setIsLoading(false);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '16px' }}>
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '448px', border: '1px solid #f1f5f9' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', border: '1px solid #f8fafc' }}>
            <img src="/BA LOGO.png" alt="Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#003366', margin: 0 }}>BE ABLE VN</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px', fontWeight: '500' }}>Cổng Tham Gia Bài Tập</p>
        </div>

        <form onSubmit={handleJoinRoom}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#003366', textTransform: 'uppercase', marginBottom: '6px' }}>Mã Lớp Học (Room Code)</label>
            <input 
              type="text" placeholder="Ví dụ: IE0301" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} required 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', backgroundColor: 'white', color: '#334155', fontWeight: '700', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px' }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#003366', textTransform: 'uppercase', marginBottom: '6px' }}>Mã số / Tên Học Viên</label>
            <input 
              type="text" placeholder="Ví dụ: BAK010188" value={studentId} onChange={(e) => setStudentId(e.target.value)} required 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', backgroundColor: 'white', color: '#334155', fontWeight: '600', fontSize: '1rem', textAlign: 'center' }}
            />
          </div>
          <button type="submit" disabled={isLoading} style={{ width: '100%', backgroundColor: '#003366', color: 'white', fontWeight: '700', padding: '14px', borderRadius: '12px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'ĐANG KẾT NỐI...' : 'THAM GIA NGAY'}
          </button>
        </form>
      </div>
    </div>
  );
}