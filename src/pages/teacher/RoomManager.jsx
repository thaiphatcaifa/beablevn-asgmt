import Button from '../../components/Button';

export default function RoomManager() {
  return (
    <div>
      <h2>Quản lý Phòng / Lớp học</h2>
      <p>Tại đây giáo viên có thể tạo phòng mới và cấp mã cho học viên.</p>
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Phòng đang hoạt động: <span style={{color: 'green'}}>MATH101</span></h3>
        <p>Số lượng học viên: 0</p>
        <Button variant="danger" style={{ width: 'auto' }}>Đóng phòng</Button>
      </div>
    </div>
  );
}