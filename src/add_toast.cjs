const fs = require('fs');
let code = fs.readFileSync('App.jsx', 'utf8');

const newToast = `function ToastItem({t, rm}) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 3500);
    return () => clearTimeout(timer);
  }, []);
  const isErr = t.type==="error";
  const isSuc = t.type==="success";
  const c = isErr?RD:isSuc?GN:BL;
  const ic = isErr?"!":isSuc?"✓":"ℹ";
  return (
    <div onClick={()=>{setExiting(true); setTimeout(()=>rm(t.id), 300);}} className={\`toast-msg \${exiting?"exiting":""}\`} style={{background:"rgba(10,20,40,0.95)",border:\`1px solid \${c}45\`,borderLeft:\`4px solid \${c}\`,padding:"12px 18px",borderRadius:8,color:TX,fontSize:13,boxShadow:\`0 8px 32px \${c}15\`,backdropFilter:"blur(10px)",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:20,height:20,borderRadius:"50%",background:\`\${c}20\`,display:"flex",alignItems:"center",justifyContent:"center",color:c,fontWeight:700,fontSize:11,flexShrink:0}}>{ic}</div>
      <div style={{flex:1,lineHeight:1.4}}>{t.msg}</div>
      <div className="toast-progress" style={{color:c}}/>
    </div>
  );
}

function Toast({toasts,rm}){
  return(
    <div style={{position:"fixed",bottom:20,right:20,display:"flex",flexDirection:"column",gap:10,zIndex:9999}}>
      {toasts.map(t=><ToastItem key={t.id} t={t} rm={rm}/>)}
    </div>
  );
}`;

code = code.replace(/function Toast\(\{toasts,rm\}\)\{[\s\S]*?\n  \};\n\}/m, newToast);
// Wait, the previous replacement left it as:
// function Toast({toasts,rm}){
//   return( ... );
// }

code = code.replace(/function Toast\(\{toasts,rm\}\)\{[\s\S]*?\n\}/m, newToast);

fs.writeFileSync('App.jsx', code);
console.log('Toast updates applied');
