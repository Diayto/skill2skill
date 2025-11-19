export default function Select({label, children, ...props}){
  return (
    <div style={{marginBottom:12}}>
      {label && <label style={{color:'var(--muted)', fontSize:14}}>{label}</label>}
      <select {...props}
        style={{
          width:'100%', background:'#2A3B4E', color:'var(--text)',
          border:'1px solid #31455B', borderRadius:12, padding:'12px 14px'
        }}>
        {children}
      </select>
    </div>
  );
}
