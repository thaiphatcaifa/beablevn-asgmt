import Button from '../../components/Button';

export default function ExerciseLibrary() {
  return (
    <div>
      <h2>Thư viện Bài tập</h2>
      <p>Quản lý các bài trắc nghiệm, tự luận.</p>
      <Button variant="primary" style={{ width: 'auto', marginBottom: '20px' }}>+ Tạo bài tập mới</Button>
      
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li style={{ padding: '15px', border: '1px solid #ccc', marginBottom: '10px', borderRadius: '5px' }}>
          <strong>Bài kiểm tra ReactJS cơ bản</strong> - 10 câu hỏi
        </li>
        <li style={{ padding: '15px', border: '1px solid #ccc', marginBottom: '10px', borderRadius: '5px' }}>
          <strong>Kiểm tra giữa kỳ Toán</strong> - 25 câu hỏi
        </li>
      </ul>
    </div>
  );
}