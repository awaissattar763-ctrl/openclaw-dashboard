const fs = require('fs');
let code = fs.readFileSync('App.jsx', 'utf8');

// 1. Sidebar items: "nl" to \`nl nav-item \${a?'active':''}\`
code = code.replace(/className="nl" onClick=\{\(\)=>setActive\(id\)\}/g, 'className={`nl nav-item ${a?"active":""}`} onClick={()=>setActive(id)}');

// 2. TopBar Search Close btn-press
code = code.replace(/\{sq&&<span onClick=\{\(\)=>setSq\(""\)\} style=\{\{cursor:"pointer",color:MT\}\}>✕<\/span>\}/g, '{sq&&<span className="btn-press" onClick={()=>setSq("")} style={{cursor:"pointer",color:MT}}>✕</span>}');

// 3. TopBar Bell btn-press
code = code.replace(/<div style=\{\{position:"relative",cursor:"pointer"\}\} onClick=\{\(\)=>setActive\("chat"\)\}>/g, '<div className="btn-press" style={{position:"relative",cursor:"pointer"}} onClick={()=>setActive("chat")}>');

// 4. TopBar Bell pulsing dot status-active
code = code.replace(/fontWeight:700\}\}>\{notif\}<\/span>\}/g, 'fontWeight:700}} className="status-active">{notif}</span>}');

// 5. Page transition wrapper
// Find: <div style={{flex:1,overflowY:"auto",padding:"14px 20px",position:"relative"}}>
// Replace with: <div key={active} className="page-content" style={{flex:1,overflowY:"auto",padding:"14px 20px",position:"relative"}}>
code = code.replace(/<div style=\{\{flex:1,overflowY:"auto",padding:"14px 20px",position:"relative"\}\}>/g, '<div key={active} className="page-content" style={{flex:1,overflowY:"auto",padding:"14px 20px",position:"relative"}}>');

// Update grid-bg to dashboard-bg
code = code.replace(/<div className="grid-bg"\/>/g, '<div className="dashboard-bg grid-bg"/>');
code = code.replace(/<div className="ambient-glow"\/>/g, ''); // just in case
code = code.replace(/<div className="dashboard-bg grid-bg"\/>/g, '<div className="dashboard-bg grid-bg"/><div className="ambient-glow"/>');


fs.writeFileSync('App.jsx', code);
console.log('Layout updates applied');
