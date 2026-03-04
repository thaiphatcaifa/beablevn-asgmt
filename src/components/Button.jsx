export default function Button({ children, onClick, type = "button", variant = "primary", style }) {
  const baseStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    width: '100%',
    ...style
  };

  const variants = {
    primary: { backgroundColor: '#007bff', color: 'white' },
    success: { backgroundColor: '#28a745', color: 'white' },
    danger: { backgroundColor: '#dc3545', color: 'white' },
  };

  return (
    <button type={type} onClick={onClick} style={{ ...baseStyle, ...variants[variant] }}>
      {children}
    </button>
  );
}