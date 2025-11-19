export default function Button({children, ...props}){
  return (
    <button {...props}
      style={{
        background:'var(--teal)', color:'var(--white)', border:0,
        padding:'12px 16px', borderRadius:12, cursor:'pointer', fontWeight:600
      }}>
      {children}
    </button>
  );
}
