export default function Input({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
      {label && <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>}
      <input 
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ 
          width: '100%', padding: '10px', 
          border: '1px solid #ccc', borderRadius: '4px',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}