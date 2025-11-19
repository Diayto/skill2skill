export default function Input({label, error, ...props}){
  return (
    <div style={{marginBottom:12}}>
      {label && <label style={{color:'var(--muted)', fontSize:14}}>{label}</label>}
      <input {...props}
        style={{
          width:'100%', background:'#2A3B4E', color:'var(--text)',
          border:'1px solid #31455B', borderRadius:12, padding:'12px 14px'
        }}/>
      {error && <div style={{color:'var(--error)', fontSize:12, marginTop:6}}>{error}</div>}
    </div>
  );
}
