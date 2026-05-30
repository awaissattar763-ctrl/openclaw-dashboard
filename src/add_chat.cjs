const fs = require('fs');
let code = fs.readFileSync('App.jsx', 'utf8');

// 1. message-user and message-ai
code = code.replace(/className="fu" \nstyle=\{\{display:"flex",flexDirection:"column",gap:4,alignItems:isU\?"flex-end":"flex-start"\}\}/g, 'className={`fu ${isU?"message-user":"message-ai"}`} \nstyle={{display:"flex",flexDirection:"column",gap:4,alignItems:isU?"flex-end":"flex-start"}}');

// 2. typing-dot for typing indicator
// From: {[0,1,2].map(i=><div key={i} className="td" style={{width:6,height:6,borderRadius:"50%",background:GN,animationDelay:`${i*0.15}s`,opacity:0.7}}/>)}
// To: {[0,1,2].map(i=><div key={i} className="typing-dot" />)}
code = code.replace(/\{\[0,1,2\]\.map\(i=><div key=\{i\} className="td" style=\{\{width:6,height:6,borderRadius:"50%",background:GN,animationDelay:`\$\{i\*0\.15\}s`,opacity:0\.7\}\}\/>\)\}/g, '{[0,1,2].map(i=><div key={i} className="typing-dot" />)}');

// 3. quick-cmd for Quick Commands
// From: <div key={i} onClick={()=>send(q)} className="bd" style={{padding:"8px 12px",border:`1px solid ${BR}`,borderRadius:8,fontSize:12,color:MT,display:"flex",alignItems:"center",gap:8}}>
// To: <div key={i} onClick={()=>send(q)} className="bd quick-cmd btn-press" style={{padding:"8px 12px",border:`1px solid ${BR}`,borderRadius:8,fontSize:12,color:MT,display:"flex",alignItems:"center",gap:8}}>
code = code.replace(/className="bd" style=\{\{padding:"8px 12px",border:`1px solid \$\{BR\}`/g, 'className="bd quick-cmd btn-press" style={{padding:"8px 12px",border:`1px solid ${BR}`');

// 4. btn-press for Send button
// From: <button disabled={busy||!input.trim()} onClick={()=>send()} className="bg" style={{position:"absolute",right:8,bottom:8,background:`linear-gradient(135deg,${GN},${BL})`,border:"none",borderRadius:7,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",opacity:(busy||!input.trim())?0.5:1}}>
// To: add btn-press
code = code.replace(/className="bg" style=\{\{position:"absolute",right:8,bottom:8,background/g, 'className="bg btn-press" style={{position:"absolute",right:8,bottom:8,background');

fs.writeFileSync('App.jsx', code);
console.log('Chat updates applied');
