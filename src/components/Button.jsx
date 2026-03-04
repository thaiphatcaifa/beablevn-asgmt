export default function Button({ children, onClick, type = "button", variant = "primary", style }) {
  const variants = {
    primary: { backgroundColor: '#003366', color: 'white' }, // Navy Blue
    success: { backgroundColor: '#e67e22', color: 'white' }, // Cam nhấn
    danger: { backgroundColor: '#dc2626', color: 'white' },  // Đỏ
  };

  const baseStyle = {
    padding: '14px 24px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '16px',
    width: '100%',
    fontFamily: "'Josefin Sans', sans-serif",
    boxShadow: '0 10px 15px -3px rgba(0, 51, 102, 0.1)',
    transition: 'all 0.2s',
    ...style,
    ...variants[variant]
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      style={baseStyle}
      onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
    >
      {children}
    </button>
  );
}