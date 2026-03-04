import { useState } from 'react';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showNames, setShowNames] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);
  const [showResults, setShowResults] = useState(true);

  const reportsList = [
    { id: 1, name: 'Bài kiểm tra ReactJS cơ bản', date: '25/10/2023', room: 'MATH101', type: 'Quiz' },
    { id: 2, name: 'Kiểm tra giữa kỳ Toán', date: '20/10/2023', room: 'MATH101', type: 'Space Race' },
  ];

  const mockResults = {
    questions: [1, 2, 3, 4],
    students: [
      { id: 'SV01', name: 'Nguyễn Văn A', score: 100, answers: [{ q: 1, text: 'Facebook', correct: true }, { q: 2, text: 'useState', correct: true }, { q: 3, text: 'Virtual DOM', correct: true }, { q: 4, text: 'NPM', correct: true }] },
      { id: 'SV02', name: 'Trần Thị B', score: 50, answers: [{ q: 1, text: 'Google', correct: false }, { q: 2, text: 'useState', correct: true }, { q: 3, text: 'Real DOM', correct: false }, { q: 4, text: 'NPM', correct: true }] },
      { id: 'SV03', name: 'Lê Văn C', score: 75, answers: [{ q: 1, text: 'Facebook', correct: true }, { q: 2, text: 'useEffect', correct: false }, { q: 3, text: 'Virtual DOM', correct: true }, { q: 4, text: 'NPM', correct: true }] }
    ]
  };

  if (!selectedReport) {
    return (
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ color: '#003366', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', fontWeight: '800' }}>Reports (Báo cáo)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
              <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Name (Tên bài)</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Date (Ngày)</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Room (Phòng)</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Type (Loại)</th>
            </tr>
          </thead>
          <tbody>
            {reportsList.map(report => (
              <tr key={report.id} onClick={() => setSelectedReport(report)} style={{ cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                <td style={{ padding: '15px', color: '#003366', fontWeight: '700' }}>{report.name}</td>
                <td style={{ padding: '15px' }}>{report.date}</td>
                <td style={{ padding: '15px' }}>{report.room}</td>
                <td style={{ padding: '15px' }}>{report.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const toggleStyle = (active) => ({
    padding: '8px 16px', borderRadius: '20px',
    border: active ? 'none' : '1px solid #cbd5e1',
    backgroundColor: active ? '#003366' : 'white',
    color: active ? 'white' : '#64748b',
    cursor: 'pointer', fontWeight: '700', fontSize: '14px', outline: 'none',
    fontFamily: "'Josefin Sans', sans-serif"
  });

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflowX: 'auto', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: '#003366', margin: 0, fontWeight: '800' }}>{selectedReport.name}</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '700' }}>Show Names</span>
            <button onClick={() => setShowNames(!showNames)} style={toggleStyle(showNames)}>{showNames ? 'ON' : 'OFF'}</button>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '700' }}>Show Answers</span>
            <button onClick={() => setShowAnswers(!showAnswers)} style={toggleStyle(showAnswers)}>{showAnswers ? 'ON' : 'OFF'}</button>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '700' }}>Show Results</span>
            <button onClick={() => setShowResults(!showResults)} style={toggleStyle(showResults)}>{showResults ? 'ON' : 'OFF'}</button>
          </label>
          <button onClick={() => setSelectedReport(null)} style={{ padding: '10px 20px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginLeft: '20px', fontFamily: "'Josefin Sans', sans-serif" }}>
            Finish
          </button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '800px' }}>
        <thead>
          <tr>
            <th style={{ padding: '15px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', width: '20%', textAlign: 'left', color: '#334155' }}>Name</th>
            <th style={{ padding: '15px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', width: '10%', color: '#334155' }}>Score (%)</th>
            {mockResults.questions.map(q => (
              <th key={q} style={{ padding: '15px', border: '1px solid #003366', backgroundColor: '#003366', color: 'white', width: `${70 / mockResults.questions.length}%` }}>{q}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockResults.students.map((student, index) => (
            <tr key={index}>
              <td style={{ padding: '15px', border: '1px solid #e2e8f0', textAlign: 'left', fontWeight: '700', color: '#003366' }}>
                {showNames ? student.name : '••••••••'}
              </td>
              <td style={{ padding: '15px', border: '1px solid #e2e8f0', fontWeight: '700', color: '#334155' }}>{student.score}%</td>
              {student.answers.map((ans, i) => {
                let bgColor = 'white'; let textColor = '#334155';
                if (showResults) { bgColor = ans.correct ? '#16a34a' : '#dc2626'; textColor = 'white'; }
                return (
                  <td key={i} style={{ padding: '15px', border: '1px solid #e2e8f0', backgroundColor: bgColor, color: textColor, transition: 'background-color 0.3s', fontWeight: '600' }}>
                    {showAnswers ? ans.text : (ans.correct ? '✔' : '✘')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}