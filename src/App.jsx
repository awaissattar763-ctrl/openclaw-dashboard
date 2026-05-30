import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getGroqApiKey, isUsingDemoKey, hasAnyKey } from "./lib/api-key";
import { parseMarkdown } from "./lib/markdown.js";

/* ══════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════ */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{min-height:100vh;width:100%;overflow-x:hidden;overflow-y:auto;position:relative;margin:0;padding:0}
body{font-family:'Rajdhani',sans-serif;background:#050c1a;color:#e2e8f0}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(0,255,136,0.25);border-radius:3px}
.grid-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,255,136,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.025) 1px,transparent 1px);background-size:44px 44px;animation:gridMove 25s linear infinite}
.grid-bg::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 10%,rgba(0,255,136,0.06) 0%,transparent 55%),radial-gradient(ellipse 60% 50% at 80% 90%,rgba(56,217,245,0.05) 0%,transparent 55%)}
@keyframes gridMove{0%{background-position:0 0}100%{background-position:44px 44px}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.15}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(0,255,136,0.2)}50%{box-shadow:0 0 22px rgba(0,255,136,0.55)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0}to{opacity:1}}
@keyframes toastIn{from{transform:translateX(110px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
@keyframes tdot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
.fu{animation:fadeUp 0.3s ease both}
.nl{transition:all 0.15s;cursor:pointer;border-radius:5px}.nl:hover{background:rgba(0,255,136,0.08)!important}
.rh{transition:background 0.12s}.rh:hover{background:rgba(255,255,255,0.03)!important}
.bg{transition:all 0.18s;cursor:pointer}.bg:hover{transform:translateY(-1px);filter:brightness(1.12)}
.bd{transition:all 0.15s;cursor:pointer}.bd:hover{background:rgba(0,255,136,0.08)!important;border-color:rgba(0,255,136,0.3)!important}
.ch{transition:all 0.2s}.ch:hover{border-color:rgba(0,255,136,0.25)!important;transform:translateY(-1px)}
.sp{animation:spin 0.9s linear infinite}
.td{animation:tdot 1.2s ease infinite}
input:focus,select:focus,textarea:focus{outline:none;border-color:rgba(0,255,136,0.4)!important;box-shadow:0 0 0 3px rgba(0,255,136,0.06)!important}
select option{background:#0a1628;color:#e2e8f0}
@media (max-width: 768px) {
  .mobile-hide { display: none !important; }
  .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; transform: translateX(-100%); transition: transform 0.3s ease; width: 240px !important; }
  .sidebar.open { transform: translateX(0); }
  .mobile-ham { display: block !important; }
  .mobile-close { display: block !important; position: absolute; right: 14px; top: 16px; font-size: 18px; cursor: pointer; color: #5a6a82; }
  .grid-bg { display: none; }
  .chat-layout { flex-direction: column !important; padding: 8px !important; gap: 8px !important; }
  .chat-sidebar { width: 100% !important; order: -1; }
  .grid-5, .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr !important; }
  .chart-row { grid-template-columns: 1fr !important; }
  
  /* tables to cards */
  .resp-table, .resp-table thead, .resp-table tbody, .resp-table tr, .resp-table th, .resp-table td { display: block; }
  .resp-table thead { display: none; }
  .resp-table tr { border: 1px solid rgba(0,255,136,0.11); border-radius: 8px; margin-bottom: 12px; padding: 8px; background: rgba(8,20,44,0.78); }
  .resp-table td { border: none !important; padding: 6px 8px !important; display: flex; justify-content: space-between; align-items: center; font-size: 11px !important; }
  .resp-table td::before { content: attr(data-label); font-weight: 700; color: #5a6a82; text-transform: uppercase; font-size: 9px; }
  .resp-table td > div { text-align: right; justify-content: flex-end; }
}
@media (min-width: 769px) {
  .mobile-ham, .mobile-close { display: none !important; }
  .sidebar { transform: translateX(0) !important; position: relative !important; }
}

@keyframes slideIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
.md-cb { background: rgba(0,0,0,0.3); border: 1px solid rgba(0,255,136,0.15); border-radius: 6px; margin: 10px 0; overflow: hidden; }
.md-ch { background: rgba(0,255,136,0.08); padding: 4px 10px; font-size: 11px; color: #00ff88; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; border-bottom: 1px solid rgba(0,255,136,0.15); }
.md-cb pre { padding: 10px; margin: 0; overflow-x: auto; }
.md-cb code { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #e2e8f0; line-height: 1.5; }
.md-ic { background: rgba(255,255,255,0.08); padding: 2px 5px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; color: #00ff88; }
.md-content ul { margin: 10px 0; padding-left: 20px; }
.md-content li { margin-bottom: 4px; }
.md-content a { color: #38d9f5; text-decoration: none; }
.md-content a:hover { text-decoration: underline; }
`;

/* ══════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════ */
const GN="#00ff88",BL="#38d9f5",PU="#a78bfa",OR="#fb923c",RD="#f87171",YL="#fbbf24";
const BG="#020814",BC="rgba(8,20,44,0.78)",BR="rgba(0,255,136,0.11)",TX="#f1f5f9",MT="#5a6a82",ML="#7a8fa8";
const card=(e={})=>({background:BC,border:`1px solid ${BR}`,borderRadius:12,backdropFilter:"blur(22px)",...e});
const inp=(w="100%")=>({width:w,background:"rgba(255,255,255,0.05)",border:`1px solid ${BR}`,borderRadius:7,padding:"8px 11px",color:TX,fontSize:13,fontFamily:"'Space Grotesk',sans-serif"});

/* ══════════════════════════════════════════
   STORAGE HELPERS (localStorage)
══════════════════════════════════════════ */
const storage = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); return true; } catch { return false; } },
  del: (key) => { try { localStorage.removeItem(key); return true; } catch { return false; } },
};

/* ══════════════════════════════════════════
   ATOMS
══════════════════════════════════════════ */
const Dot=({c=GN,p=false,s=7})=><span style={{display:"inline-block",width:s,height:s,borderRadius:"50%",background:c,flexShrink:0,animation:p?"blink 2s infinite":"none"}}/>;
const Bdg=({l,c=GN,sm=false})=><span style={{fontSize:sm?10:11,fontWeight:600,color:c,background:`${c}18`,border:`1px solid ${c}28`,borderRadius:4,padding:sm?"1px 6px":"2px 8px",whiteSpace:"nowrap",fontFamily:"'JetBrains Mono',monospace"}}>{l}</span>;
const Prg=({v,c=GN,h=5})=><div style={{background:"rgba(255,255,255,0.07)",borderRadius:h,height:h,overflow:"hidden",flex:1}}><div style={{width:`${Math.min(100,Math.max(0,v))}%`,height:"100%",background:`linear-gradient(90deg,${c}99,${c})`,borderRadius:h,transition:"width 0.5s"}}/></div>;
const TT=({active,payload,label})=>active&&payload?.length?<div style={{background:"rgba(4,10,24,0.97)",border:`1px solid ${BR}`,borderRadius:7,padding:"7px 12px",fontFamily:"'Space Grotesk',sans-serif"}}><p style={{color:MT,fontSize:11,marginBottom:2}}>{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color||GN,fontSize:14,fontWeight:600}}>{p.name}: {Number(p.value).toLocaleString()}</p>)}</div>:null;
const Tog=({on,onChange})=>(
  <div onClick={onChange} style={{position:"relative",width:38,height:20,borderRadius:99,cursor:"pointer",background:on?`linear-gradient(135deg,${GN},${BL})`:"rgba(255,255,255,0.1)",transition:"all 0.25s",flexShrink:0,boxShadow:on?`0 0 12px ${GN}40`:"none"}}>
    <span style={{position:"absolute",top:2,left:on?20:2,width:16,height:16,borderRadius:"50%",background:on?"#020814":"rgba(255,255,255,0.4)",transition:"all 0.25s",display:"block"}}/>
  </div>
);
const SH=({t,s})=><div style={{marginBottom:14,flexShrink:0}}><h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:TX,letterSpacing:"0.06em"}}>{t}</h1>{s&&<p style={{fontSize:12,color:MT,marginTop:3}}>{s}</p>}</div>;

/* ══════════════════════════════════════════
   NAV
══════════════════════════════════════════ */
const NAV=[
  {sec:"CHAT",items:[{id:"chat",l:"Chat"}]},
  {sec:"CONTROL",items:[{id:"overview",l:"Overview"},{id:"channels",l:"Channels"},{id:"instances",l:"Instances"},{id:"sessions",l:"Sessions"},{id:"utags",l:"Utags"}]},
  {sec:"AGENT",items:[{id:"agents",l:"Agents"},{id:"skills",l:"Skills"},{id:"nodes",l:"Nodes"}]},
  {sec:"SETTINGS",items:[{id:"config",l:"Config"},{id:"communications",l:"Communications"},{id:"infrastructure",l:"Infrastructure"},{id:"data",l:"Data"}]},
];
const PL={chat:"Chat",overview:"Overview",channels:"Channels",instances:"Instances",sessions:"Sessions",utags:"Utags",agents:"Agents",skills:"Skills",nodes:"Nodes",config:"Config",communications:"Communications",infrastructure:"Infrastructure",data:"Data"};

/* ══════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════ */
function Sidebar({active,setActive,notif,menuOpen,setMenuOpen}){
  return(
    <>
      {menuOpen && <div className="mobile-overlay" onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:99,backdropFilter:"blur(2px)"}}/>}
      <div className={`sidebar ${menuOpen?"open":""}`} style={{width:182,minHeight:"100vh",background:"rgba(3,7,18,0.97)",borderRight:`1px solid ${BR}`,display:"flex",flexDirection:"column",flexShrink:0,zIndex:100}}>
        <div style={{padding:"14px 13px 12px",borderBottom:`1px solid ${BR}`,display:"flex",alignItems:"center",gap:9,flexShrink:0,position:"relative"}}>
          <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${GN}35,${BL}25)`,border:`1px solid ${GN}45`,display:"flex",alignItems:"center",justifyContent:"center",animation:"glow 3s infinite"}}><span style={{color:GN,fontSize:16}}>◈</span></div>
          <div><div style={{fontSize:14,fontWeight:700,color:TX,letterSpacing:"0.01em"}}>OpenClaw</div><div style={{fontSize:9,color:MT,marginTop:1}}>AI AGENT PLATFORM</div></div>
          <span className="mobile-close" onClick={()=>setMenuOpen(false)}>✕</span>
        </div>
      <nav style={{flex:"1 1 0",padding:"8px 7px",overflowY:"auto",minHeight:0}}>
        {NAV.map(({sec,items})=>(
          <div key={sec} style={{marginBottom:5}}>
            <div style={{fontSize:9,fontWeight:700,color:MT,letterSpacing:"0.12em",padding:"3px 8px",textTransform:"uppercase"}}>{sec}</div>
            {items.map(({id,l})=>{
              const a=active===id;
              return(
                <div key={id} className="nl" onClick={()=>setActive(id)} style={{padding:"5px 9px",fontSize:13,fontWeight:a?600:400,color:a?GN:ML,background:a?"rgba(0,255,136,0.08)":"transparent",marginBottom:1,display:"flex",alignItems:"center",gap:7,position:"relative"}}>
                  {a&&<div style={{position:"absolute",left:0,top:"22%",bottom:"22%",width:2.5,background:GN,borderRadius:"0 2px 2px 0",boxShadow:`0 0 6px ${GN}`}}/>}
                  <span style={{marginLeft:a?4:0}}>{l}</span>
                  {id==="chat"&&notif>0&&<span style={{fontSize:9,background:GN,color:"#050c1a",borderRadius:"50%",width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginLeft:"auto"}}>{notif}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px 13px",borderTop:`1px solid ${BR}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7}}><Dot c={GN} p s={6}/><span style={{fontSize:10,color:GN,fontFamily:"'JetBrains Mono',monospace"}}>ONLINE</span></div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:25,height:25,borderRadius:"50%",background:`${GN}25`,border:`1px solid ${BR}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:700,color:GN}}>JT</span></div>
          <div><div style={{fontSize:11,fontWeight:600,color:TX}}>Jack Taylor</div><div style={{fontSize:9,color:MT}}>Administrator</div></div>
        </div>
      </div>
    </div>
    </>
  );
}

/* ══════════════════════════════════════════
   TOPBAR
══════════════════════════════════════════ */
function TopBar({active,notif,setActive,sq,setSq,setMenuOpen}){
  return(
    <div style={{height:42,background:"rgba(3,7,18,0.9)",borderBottom:`1px solid ${BR}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 18px",flexShrink:0,backdropFilter:"blur(20px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:5,fontSize:13}}>
        <span className="mobile-ham" onClick={()=>setMenuOpen(true)} style={{fontSize:18,cursor:"pointer",marginRight:6,color:TX}}>☰</span>
        <span className="mobile-hide" style={{fontWeight:600,color:TX}}>OpenClaw</span><span className="mobile-hide" style={{color:MT}}> › </span><span style={{color:GN,fontWeight:600}}>{PL[active]||active}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",border:`1px solid ${BR}`,borderRadius:7,padding:"4px 9px"}}>
          <span style={{color:MT}}>⌕</span>
          <input placeholder="Search pages…" value={sq} onChange={e=>setSq(e.target.value)} style={{background:"transparent",border:"none",outline:"none",fontSize:12,color:TX,width:120,fontFamily:"'Space Grotesk',sans-serif"}}/>
          {sq&&<span onClick={()=>setSq("")} style={{cursor:"pointer",color:MT}}>✕</span>}
        </div>
        <div style={{position:"relative",cursor:"pointer"}} onClick={()=>setActive("chat")}>
          <span style={{fontSize:17,color:(notif>0 && !hasAnyKey())?GN:MT}}>🔔</span>
          {(notif>0 && !hasAnyKey())&&<span style={{position:"absolute",top:-4,right:-4,fontSize:9,background:GN,color:"#050c1a",borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{notif}</span>}
        </div>
        <div style={{width:27,height:27,borderRadius:"50%",background:`${GN}25`,border:`1px solid ${BR}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:700,color:GN}}>JT</span></div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function Toast({toasts,rm}){
  return(
    <div style={{position:"fixed",bottom:20,right:20,display:"flex",flexDirection:"column",gap:10,zIndex:9999}}>
      {toasts.map(t=>{
        const isErr = t.type==="error";
        const isSuc = t.type==="success";
        const c = isErr?RD:isSuc?GN:BL;
        const ic = isErr?"!":isSuc?"✓":"ℹ";
        return(
        <div key={t.id} onClick={()=>rm(t.id)} style={{background:"rgba(10,20,40,0.95)",border:`1px solid ${c}45`,borderLeft:`4px solid ${c}`,padding:"12px 18px",borderRadius:8,color:TX,fontSize:13,boxShadow:`0 8px 32px ${c}15`,backdropFilter:"blur(10px)",cursor:"pointer",display:"flex",alignItems:"center",gap:10,animation:"slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:`${c}20`,display:"flex",alignItems:"center",justifyContent:"center",color:c,fontWeight:700,fontSize:11,flexShrink:0}}>{ic}</div>
          <div style={{flex:1,lineHeight:1.4}}>{t.msg}</div>
        </div>
      )})}
    </div>
  );
}

/* ══════════════════════════════════════════
   CHAT PAGE
══════════════════════════════════════════ */
const SYS=`You are OpenClaw, an enterprise AI agent for Jack Taylor at The Snayden Group. You have tools: gmail-voice-email, ScheduleMeetingVoice, sign-ops, tpassword, web_search, code_executor, docker_manager. When using a tool write: [TOOL: name | output: result]. Be concise and professional.`;

function parseParts(text){
  const re=/\\[TOOL:\\s*([^\\|]+)\\s*\\|\\s*output:\\s*([^\\]]+)\\]/g;
  const parts=[];let last=0,m;
  while((m=re.exec(text))!==null){
    if(m.index>last)parts.push({type:"text",text:text.slice(last,m.index).trim()});
    parts.push({type:"tool",name:m[1].trim(),out:m[2].trim()});
    last=m.index+m[0].length;
  }
  if(last<text.length)parts.push({type:"text",text:text.slice(last).trim()});
  return parts;
}

function ChatPage({addToast,setNotif,apiKey,apiModel,setApiModel}){
  const [msgs,setMsgs]=useState([{role:"assistant",content:"Hello Jack! I'm OpenClaw powered by Groq (llama-3.3-70b — FREE & FAST). I have access to your email, calendar, document signing, and infrastructure tools. What can I handle today?",time:new Date().toLocaleTimeString()}]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const endRef=useRef();
  const qs=["Book meeting with Sarah tomorrow 3pm","Draft email to CFO about Q4","Check Wynyard lease signature status","Get database credentials from vault","Write a Python script to parse CSV"];
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,busy]);

  const send=useCallback(async(overrideText)=>{
    const t=(typeof overrideText==="string"?overrideText:input).trim();
    if(!t||busy)return;
    const effectiveKey = getGroqApiKey();
    if(!effectiveKey){addToast("Add Groq API key in Config page","error");return;}
    const time=new Date().toLocaleTimeString();
    setMsgs(p=>[...p,{role:"user",content:t,time}]);
    setInput("");setBusy(true);setNotif(0);
    try{
      const apiMsgs=msgs.map(m=>({role:m.role,content:m.content}));
      apiMsgs.push({role:"user",content:t});
      // Call via Vercel serverless proxy
      // Try Vercel serverless proxy first, fallback to direct Groq call
      const isVercel = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      let reply = "";
      if(isVercel){
        // On Vercel — use serverless proxy (key stays secure)
        const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:apiMsgs,system:SYS,apiKey:effectiveKey,model:apiModel})});
        const d=await res.json();
        if(d.error)throw new Error(d.error);
        reply=typeof d.content==="string"?d.content:d.content?.map(b=>b.text||"").join("")||"No response.";
      } else {
        // Local dev — call Groq directly (CORS works in real browsers)
        const groqMsgs=[{role:"system",content:SYS},...apiMsgs];
        const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":`Bearer ${effectiveKey}`},
          body:JSON.stringify({model:apiModel,messages:groqMsgs,max_tokens:1024,temperature:0.7})
        });
        const d=await res.json();
        if(d.error)throw new Error(d.error.message||JSON.stringify(d.error));
        reply=d.choices?.[0]?.message?.content||"No response.";
      }
      setMsgs(p=>[...p,{role:"assistant",content:reply,time:new Date().toLocaleTimeString()}]);
      addToast(`Groq responded! (${apiModel})`,"success");
    }catch(e){
      setMsgs(p=>[...p,{role:"assistant",content:`Error: ${e.message}`,time:new Date().toLocaleTimeString()}]);
      addToast(e.message,"error");
    }
    setBusy(false);
  },[input,busy,msgs,apiKey,apiModel,addToast,setNotif]);

  return(
    <div className="fu" style={{display:"flex",gap:11,minHeight:"100vh",padding:14}}>
      <div style={{...card({padding:0}),flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"9px 14px",borderBottom:`1px solid ${BR}`,display:"flex",alignItems:"center",gap:9,background:"rgba(0,0,0,0.15)"}}>
          <div style={{width:30,height:30,borderRadius:8,background:`${GN}25`,border:`1px solid ${GN}40`,display:"flex",alignItems:"center",justifyContent:"center",animation:"glow 3s infinite"}}><span style={{color:GN,fontSize:15}}>◈</span></div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:TX}}>OPENCLAW · CLAUDE</div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}><Dot c={busy?YL:hasAnyKey()?GN:RD} p={hasAnyKey()} s={5}/><span style={{fontSize:10,color:busy?YL:hasAnyKey()?GN:RD}}>{busy?"Thinking…":hasAnyKey()?`Ready · ${apiModel}`:"⚠ Add Groq key in Config"}</span></div>
          </div>
          <select value={apiModel} onChange={e=>setApiModel(e.target.value)} style={{fontSize:10,background:"rgba(255,255,255,0.06)",border:`1px solid ${BR}`,borderRadius:5,padding:"3px 7px",color:TX,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer"}}>
            <option value="llama-3.3-70b-versatile">llama-3.3-70b</option>
            <option value="llama-3.1-8b-instant">llama-3.1-8b ⚡</option>
            <option value="mixtral-8x7b-32768">mixtral-8x7b</option>
            <option value="gemma2-9b-it">gemma2-9b</option>
          </select>
          <Bdg l={`${msgs.length} msgs`} c={BL} sm/>
          <button className="bd" onClick={()=>setMsgs([msgs[0]])} style={{padding:"3px 9px",background:"rgba(255,255,255,0.04)",border:`1px solid ${BR}`,borderRadius:5,color:MT,fontSize:11,cursor:"pointer"}}>Clear</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:12}}>
          {msgs.map((m,i)=>{
            const isU=m.role==="user";
            const parts=isU?[{type:"text",text:m.content}]:parseParts(m.content);
            return(
              <div key={i} className="fu" style={{display:"flex",flexDirection:"column",gap:4,alignItems:isU?"flex-end":"flex-start"}}>
                {parts.filter(p=>p.text||p.out).map((p,j)=>
                  p.type==="tool"?(
                    <div key={j} style={{maxWidth:"82%",padding:"8px 12px",background:`${GN}08`,border:`1px solid ${GN}28`,borderRadius:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{color:GN}}>⬡</span><Bdg l={`tool_call: ${p.name}`} c={GN} sm/><span style={{color:GN,fontSize:11}}>✓</span></div>
                      <div style={{fontSize:11,color:ML,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.55}}>{p.out}</div>
                    </div>
                  ):(
                    <div key={j} className="md-content" style={{maxWidth:"78%",padding:"8px 12px",borderRadius:isU?"12px 12px 4px 12px":"12px 12px 12px 4px",background:isU?`linear-gradient(135deg,${GN}22,${BL}15)`:"rgba(255,255,255,0.05)",border:`1px solid ${isU?GN+"30":"rgba(255,255,255,0.08)"}`,fontSize:13,color:TX,lineHeight:1.55}} dangerouslySetInnerHTML={{__html: parseMarkdown(p.text)}} />
                  )
                )}
                <span style={{fontSize:10,color:MT,fontFamily:"'JetBrains Mono',monospace"}}>{m.time}</span>
              </div>
            );
          })}
          {busy&&<div className="fu"><div style={{display:"flex",alignItems:"center",gap:5,padding:"9px 13px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px 12px 12px 4px",width:"fit-content"}}>{[0,1,2].map(i=><div key={i} className="td" style={{width:6,height:6,borderRadius:"50%",background:GN,animationDelay:`${i*0.15}s`,opacity:0.7}}/>)}</div></div>}
          <div ref={endRef}/>
        </div>
        {isUsingDemoKey() && (
          <div style={{background:"rgba(0,255,136,0.05)", border:`1px solid ${GN}40`, padding:"6px 12px", borderRadius:"6px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, margin:"0 13px"}}>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <Dot c={GN} p s={6}/><span style={{fontSize:11, color:GN}}>Demo mode · Free Groq llama-3.3-70b</span>
            </div>
            <span style={{fontSize:10, color:MT}}>Rate-limited to 20 messages/session</span>
          </div>
        )}
        <div style={{padding:"9px 13px",borderTop:`1px solid ${BR}`,display:"flex",gap:8,background:"rgba(0,0,0,0.12)"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Message OpenClaw… (Enter=send, Shift+Enter=newline)" rows={1} style={{flex:1,...inp(),resize:"none",padding:"7px 11px",lineHeight:1.5,maxHeight:80}}/>
          <button className="bg" onClick={()=>send()} disabled={busy||!input.trim()} style={{padding:"7px 16px",background:busy||!input.trim()?`${GN}35`:`linear-gradient(135deg,${GN}dd,${BL}bb)`,border:"none",borderRadius:8,color:"#050c1a",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.05em",display:"flex",alignItems:"center",gap:5,cursor:busy?"not-allowed":"pointer"}}>
            {busy?<span className="sp" style={{fontSize:14}}>↻</span>:"▶"} {busy?"":"SEND"}
          </button>
        </div>
      </div>
      <div style={{width:185,display:"flex",flexDirection:"column",gap:9}}>
        <div style={{...card({padding:"11px 13px"})}}>
          <div style={{fontSize:10,fontWeight:700,color:MT,letterSpacing:"0.08em",marginBottom:8}}>QUICK COMMANDS</div>
          {qs.map((q,i)=><button key={i} className="bd" onClick={()=>{setInput(q); send(q);}} style={{display:"block",width:"100%",textAlign:"left",padding:"6px 8px",background:"rgba(255,255,255,0.03)",border:`1px solid ${BR}`,borderRadius:6,color:ML,fontSize:11,marginBottom:4,cursor:"pointer",lineHeight:1.4}}>{q}</button>)}
        </div>
        <div style={{...card({padding:"11px 13px"})}}>
          <div style={{fontSize:10,fontWeight:700,color:MT,letterSpacing:"0.08em",marginBottom:8}}>SESSION</div>
          {[["Messages",msgs.length],["Model","Sonnet 4.6"],["Status",hasAnyKey()?"Active":"No Key"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <span style={{fontSize:11,color:MT}}>{k}</span>
              <span style={{fontSize:11,color:TX,fontFamily:"'JetBrains Mono',monospace"}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   OVERVIEW
══════════════════════════════════════════ */
const CD=Array.from({length:14},(_,i)=>({t:`${String(i+1).padStart(2,"0")}:00`,v:Math.floor(800+Math.random()*600),v2:Math.floor(400+Math.random()*300)}));
const LOGS=[
  {time:"14:32:01",tool:"gmail-voice-email",st:"ok",msg:"Draft sent to sarah@acme.com"},
  {time:"14:31:44",tool:"ScheduleMeetingVoice",st:"ok",msg:"Meeting booked 3pm Friday"},
  {time:"14:30:12",tool:"sign-ops",st:"warn",msg:"Signature pending — James Harlow"},
  {time:"14:28:58",tool:"tpassword",st:"ok",msg:"DB credentials retrieved"},
  {time:"14:27:11",tool:"web_search",st:"ok",msg:"Query: Sydney lease regulations"},
  {time:"14:25:33",tool:"code_executor",st:"error",msg:"Timeout after 30s"},
];
function OverviewPage({stats}){
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="OVERVIEW" s="Real-time agent performance & infrastructure telemetry"/>
      <div className="grid-5" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9,marginBottom:13}}>
        {[{l:"Requests",v:stats.requests.toLocaleString(),c:GN},{l:"Uptime",v:"99.9%",c:BL},{l:"Agents",v:"7",c:PU},{l:"CPU",v:Math.round(stats.cpu)+"%",c:stats.cpu>80?RD:GN},{l:"Memory",v:Math.round(stats.memory)+"%",c:OR}].map((s,i)=>(
          <div key={i} className="ch" style={{...card({padding:"12px 14px"})}}>
            <div style={{fontSize:10,color:MT,marginBottom:7,textTransform:"uppercase"}}>{s.l}</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="chart-row" style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:11,marginBottom:11}}>
        <div style={{...card({padding:"14px 16px"})}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:600,color:TX}}>REQUEST VOLUME</div><div style={{fontSize:10,color:MT,marginTop:2}}>Last 14 hours</div></div>
            <Bdg l="LIVE" c={GN}/>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={CD} margin={{top:5,right:5,left:-24,bottom:0}}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GN} stopOpacity={0.28}/><stop offset="95%" stopColor={GN} stopOpacity={0}/></linearGradient>
                <linearGradient id="b1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BL} stopOpacity={0.18}/><stop offset="95%" stopColor={BL} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="t" tick={{fill:MT,fontSize:9}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fill:MT,fontSize:9}} tickLine={false} axisLine={false}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="v" name="Requests" stroke={GN} strokeWidth={2} fill="url(#g1)" dot={false}/>
              <Area type="monotone" dataKey="v2" name="Cached" stroke={BL} strokeWidth={1.5} fill="url(#b1)" dot={false} strokeDasharray="4 4"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{...card({padding:"14px 16px"})}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:600,color:TX,marginBottom:3}}>TOKEN USAGE</div>
          <div style={{fontSize:10,color:MT,marginBottom:12}}>By model</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart layout="vertical" data={[{m:"sonnet",v:4200},{m:"haiku",v:8900},{m:"opus",v:1200},{m:"other",v:2400}]} margin={{top:0,right:5,left:-8,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
              <XAxis type="number" tick={{fill:MT,fontSize:8}} tickLine={false} axisLine={false}/>
              <YAxis type="category" dataKey="m" tick={{fill:MT,fontSize:9}} tickLine={false} axisLine={false} width={42}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="v" name="Tokens" fill={BL} radius={[0,4,4,0]} fillOpacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{...card({padding:"14px 16px"})}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:600,color:TX,marginBottom:12}}>TOOL ACTIVITY LOG</div>
        {LOGS.map((l,i)=>(
          <div key={i} className="rh" style={{display:"flex",alignItems:"center",gap:9,padding:"7px 9px",borderRadius:6,marginBottom:3}}>
            <Dot c={l.st==="ok"?GN:l.st==="warn"?YL:RD} s={6}/>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:MT,minWidth:58}}>{l.time}</span>
            <Bdg l={l.tool} c={l.st==="ok"?GN:l.st==="warn"?YL:RD} sm/>
            <span style={{fontSize:12,color:TX,flex:1}}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CHANNELS
══════════════════════════════════════════ */
const CH_INIT=[
  {name:"Telegram",icon:"📱",status:"connected",detail:"Polling · last msg just now",color:GN},
  {name:"WhatsApp",icon:"💬",status:"pending",detail:"API key required",color:YL},
  {name:"Slack",icon:"⚡",status:"disconnected",detail:"Webhook not configured",color:MT},
  {name:"Email (Gmail)",icon:"📧",status:"connected",detail:"jack@snaydengroup.com",color:GN},
  {name:"Discord",icon:"🎮",status:"disconnected",detail:"Bot token missing",color:MT},
  {name:"SMS (Twilio)",icon:"📱",status:"pending",detail:"Trial account active",color:YL},
];
function ChannelsPage({addToast}){
  const [chs,setChs]=useState(CH_INIT);const [sel,setSel]=useState(0);
  const toggle=i=>{setChs(p=>p.map((c,j)=>j===i?{...c,status:c.status==="connected"?"disconnected":"connected",color:c.status==="connected"?MT:GN}:c));addToast(`${chs[i].name} ${chs[i].status==="connected"?"disconnected":"connected"}`,"success");};
  const ch=chs[sel];
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="CHANNELS" s="External integrations and communication channels"/>
      <div className="grid-2" style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:12}}>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {chs.map((c,i)=>(
            <div key={i} className="nl" onClick={()=>setSel(i)} style={{...card({padding:"10px 12px"}),border:`1px solid ${i===sel?GN+"45":BR}`,background:i===sel?"rgba(0,255,136,0.06)":BC}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{c.icon}</span>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:i===sel?GN:TX}}>{c.name}</div><div style={{fontSize:10,color:MT}}>{c.detail}</div></div>
                <Dot c={c.color} p={c.status==="connected"} s={7}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{...card({padding:"16px 18px"})}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>{ch.icon}</span><div><div style={{fontSize:16,fontWeight:700,color:TX}}>{ch.name}</div><Bdg l={ch.status.toUpperCase()} c={ch.color} sm/></div></div>
            <button className="bg" onClick={()=>toggle(sel)} style={{padding:"7px 16px",background:ch.status==="connected"?`${RD}22`:`${GN}22`,border:`1px solid ${ch.status==="connected"?RD+"45":GN+"45"}`,borderRadius:7,color:ch.status==="connected"?RD:GN,fontSize:12,fontWeight:700,cursor:"pointer"}}>{ch.status==="connected"?"Disconnect":"Connect"}</button>
          </div>
          {[["Bot Token / API Key","••••••••••••••••••"],["Webhook URL","https://openclaw.io/webhook/"+ch.name.toLowerCase()],["Pull Mode","Polling"],["Timeout (s)","30"]].map(([k,v])=>(
            <div key={k} style={{marginBottom:10}}><label style={{fontSize:10,color:MT,display:"block",marginBottom:4}}>{k.toUpperCase()}</label><input defaultValue={v} style={inp()}/></div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button className="bg" onClick={()=>addToast(`${ch.name} config saved`,"success")} style={{flex:1,padding:"9px",background:`linear-gradient(135deg,${GN}cc,${BL}aa)`,border:"none",borderRadius:8,color:"#050c1a",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>SAVE CONFIG</button>
            <button className="bd" onClick={()=>addToast("Test sent","info")} style={{padding:"9px 16px",background:"rgba(255,255,255,0.04)",border:`1px solid ${BR}`,borderRadius:8,color:ML,fontSize:12,cursor:"pointer"}}>Test</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   INSTANCES
══════════════════════════════════════════ */
const INST_INIT=[
  {name:"agent-core-01",type:"Primary",image:"openclaw/core:v4.1",status:"running",cpu:18,mem:340,up:"14d 3h",region:"us-east-1"},
  {name:"agent-worker-01",type:"Worker",image:"openclaw/worker:latest",status:"running",cpu:9,mem:210,up:"12d 7h",region:"us-east-1"},
  {name:"agent-worker-02",type:"Worker",image:"openclaw/worker:latest",status:"running",cpu:24,mem:280,up:"12d 7h",region:"ap-southeast-2"},
  {name:"agent-worker-03",type:"Worker",image:"openclaw/worker:latest",status:"stopped",cpu:0,mem:0,up:"—",region:"eu-west-1"},
  {name:"skill-sandbox-01",type:"Sandbox",image:"openclaw/sandbox:v2",status:"error",cpu:0,mem:0,up:"—",region:"us-east-1"},
];
function InstancesPage({addToast}){
  const [insts,setInsts]=useState(INST_INIT);const [ld,setLd]=useState({});
  const act=async(i,action)=>{setLd(p=>({...p,[i]:action}));await new Promise(r=>setTimeout(r,800));setInsts(p=>p.map((inst,j)=>{if(j!==i)return inst;if(action==="start")return{...inst,status:"running",cpu:Math.floor(8+Math.random()*20),mem:Math.floor(100+Math.random()*250),up:"0m"};if(action==="stop")return{...inst,status:"stopped",cpu:0,mem:0,up:"—"};return{...inst,status:"running",up:"0m"};}));setLd(p=>{const n={...p};delete n[i];return n;});addToast(`${insts[i].name} ${action}ed`,"success");};
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="INSTANCES" s="Connected agent instances and compute nodes"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:13}}>
        {[{l:"Total",v:insts.length,c:BL},{l:"Running",v:insts.filter(i=>i.status==="running").length,c:GN},{l:"Stopped",v:insts.filter(i=>i.status==="stopped").length,c:MT},{l:"Errors",v:insts.filter(i=>i.status==="error").length,c:RD}].map((s,i)=>(
          <div key={i} className="ch" style={{...card({padding:"12px 14px"})}}><div style={{fontSize:10,color:MT,marginBottom:6,textTransform:"uppercase"}}>{s.l}</div><div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      <div style={{...card({padding:0,overflow:"hidden"})}}>
        <table className="resp-table" style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:`1px solid ${BR}`,background:"rgba(0,0,0,0.2)"}}>
            {["Instance","Type","Region","Status","CPU","Mem","Uptime","Actions"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:9,color:MT,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.07em",textTransform:"uppercase",fontWeight:600}}>{h}</th>)}
          </tr></thead>
          <tbody>{insts.map((inst,i)=>(
            <tr key={i} className="rh" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <td data-label="Instance" style={{padding:"9px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:TX}}>{inst.name}</td>
              <td data-label="Type" style={{padding:"9px 12px"}}><Bdg l={inst.type} c={inst.type==="Primary"?GN:inst.type==="Worker"?BL:PU} sm/></td>
              <td data-label="Region" style={{padding:"9px 12px",fontSize:11,color:ML}}>{inst.region}</td>
              <td data-label="Status" style={{padding:"9px 12px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><Dot c={inst.status==="running"?GN:inst.status==="error"?RD:MT} p={inst.status==="running"} s={6}/><span style={{fontSize:11,color:inst.status==="running"?GN:inst.status==="error"?RD:MT,fontWeight:600}}>{inst.status}</span></div></td>
              <td data-label="CPU" style={{padding:"9px 12px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><Prg v={inst.cpu} c={inst.cpu>80?RD:GN} h={4}/><span style={{fontSize:10,color:MT,minWidth:26}}>{inst.cpu}%</span></div></td>
              <td data-label="Mem" style={{padding:"9px 12px",fontSize:10,color:TX,fontFamily:"'JetBrains Mono',monospace"}}>{inst.mem>0?`${inst.mem}MB`:"—"}</td>
              <td data-label="Uptime" style={{padding:"9px 12px",fontSize:10,color:MT,fontFamily:"'JetBrains Mono',monospace"}}>{inst.up}</td>
              <td data-label="Actions" style={{padding:"9px 12px"}}><div style={{display:"flex",gap:4}}>{[["start","▶",GN],["stop","■",RD],["restart","↻",BL]].map(([action,ic,col])=>(
                <button key={action} className="bd" onClick={()=>act(i,action)} style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",background:`${col}12`,border:`1px solid ${col}25`,borderRadius:5,cursor:"pointer",fontSize:10,color:col}}>
                  {ld[i]===action?<span className="sp">↻</span>:ic}
                </button>
              ))}</div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SESSIONS
══════════════════════════════════════════ */
const SESS=Array.from({length:10},(_,i)=>({id:`sess_${Math.random().toString(36).slice(2,9)}`,channel:["Telegram","Chat","Email","WhatsApp"][i%4],msgs:Math.floor(3+Math.random()*20),tokens:Math.floor(500+Math.random()*4000),model:["sonnet-4-6","haiku-4-5","opus-4-6"][i%3],status:i<7?"closed":"active",start:new Date(Date.now()-Math.random()*86400000*7).toLocaleString(),cost:`$${(Math.random()*0.05).toFixed(4)}`}));
function SessionsPage(){
  const [filter,setFilter]=useState("All");
  const filtered=SESS.filter(s=>filter==="All"||(filter==="Active"&&s.status==="active")||(filter==="Closed"&&s.status==="closed"));
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="SESSIONS" s="Agent conversation session history and analytics"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:13}}>
        {[{l:"Total",v:SESS.length,c:BL},{l:"Active",v:SESS.filter(s=>s.status==="active").length,c:GN},{l:"Total Msgs",v:SESS.reduce((a,s)=>a+s.msgs,0),c:PU},{l:"Total Tokens",v:(SESS.reduce((a,s)=>a+s.tokens,0)/1000).toFixed(1)+"K",c:OR}].map((s,i)=>(
          <div key={i} className="ch" style={{...card({padding:"12px 14px"})}}><div style={{fontSize:10,color:MT,marginBottom:6,textTransform:"uppercase"}}>{s.l}</div><div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:11}}>{["All","Active","Closed"].map(f=><button key={f} className="bd" onClick={()=>setFilter(f)} style={{padding:"5px 13px",background:filter===f?`${GN}20`:"rgba(255,255,255,0.04)",border:`1px solid ${filter===f?GN+"45":BR}`,borderRadius:6,color:filter===f?GN:MT,fontSize:11,cursor:"pointer"}}>{f}</button>)}</div>
      <div style={{...card({padding:0,overflow:"hidden"})}}><table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{borderBottom:`1px solid ${BR}`,background:"rgba(0,0,0,0.2)"}}>{["Session ID","Channel","Model","Msgs","Tokens","Status","Cost","Started"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:9,color:MT,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.07em",textTransform:"uppercase",fontWeight:600}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map((s,i)=>(
          <tr key={i} className="rh" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <td data-label="Session ID" style={{padding:"8px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:BL}}>{s.id}</td>
            <td data-label="Channel" style={{padding:"8px 12px"}}><Bdg l={s.channel} c={BL} sm/></td>
            <td data-label="Model" style={{padding:"8px 12px",fontSize:10,color:ML,fontFamily:"'JetBrains Mono',monospace"}}>{s.model}</td>
            <td data-label="Msgs" style={{padding:"8px 12px",fontSize:12,color:TX,textAlign:"center"}}>{s.msgs}</td>
            <td data-label="Tokens" style={{padding:"8px 12px",fontSize:10,color:ML,fontFamily:"'JetBrains Mono',monospace"}}>{s.tokens.toLocaleString()}</td>
            <td data-label="Status" style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><Dot c={s.status==="active"?GN:MT} p={s.status==="active"} s={6}/><span style={{fontSize:11,color:s.status==="active"?GN:MT}}>{s.status}</span></div></td>
            <td data-label="Cost" style={{padding:"8px 12px",fontSize:10,color:GN,fontFamily:"'JetBrains Mono',monospace"}}>{s.cost}</td>
            <td data-label="Started" style={{padding:"8px 12px",fontSize:10,color:MT}}>{s.start}</td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

/* ══════════════════════════════════════════
   UTAGS
══════════════════════════════════════════ */
const UTAG_INIT=[
  {tag:"#vip",color:GN,users:12,desc:"VIP clients — priority routing",active:true},
  {tag:"#support",color:BL,users:45,desc:"Support ticket escalations",active:true},
  {tag:"#lead",color:YL,users:28,desc:"Sales leads from campaigns",active:true},
  {tag:"#blocked",color:RD,users:3,desc:"Blocked / banned users",active:false},
  {tag:"#developer",color:PU,users:8,desc:"Internal developer access",active:true},
  {tag:"#beta",color:OR,users:21,desc:"Beta testers group",active:true},
];
function UtagsPage({addToast}){
  const [tags,setTags]=useState(UTAG_INIT);const [newTag,setNewTag]=useState("");const [newDesc,setNewDesc]=useState("");
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="UTAGS" s="User tagging system for routing and segmentation"/>
      <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:12}}>
        <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          {tags.map((t,i)=>(
            <div key={i} className="ch" style={{...card({padding:"12px 14px",border:`1px solid ${t.active?t.color+"30":BR}`})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:t.color}}>{t.tag}</span><Tog on={t.active} onChange={()=>{setTags(p=>p.map((tg,j)=>j===i?{...tg,active:!tg.active}:tg));addToast(`${t.tag} ${t.active?"off":"on"}`,"info");}}/></div>
              <div style={{fontSize:11,color:MT,marginBottom:8}}>{t.desc}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Bdg l={`${t.users} users`} c={t.color} sm/><button className="bd" onClick={()=>{setTags(p=>p.filter((_,j)=>j!==i));addToast(`${t.tag} deleted`,"info");}} style={{fontSize:10,color:RD,background:`${RD}12`,border:`1px solid ${RD}25`,borderRadius:4,padding:"2px 7px",cursor:"pointer"}}>Delete</button></div>
            </div>
          ))}
        </div>
        <div style={{...card({padding:"14px 16px"}),alignSelf:"start"}}>
          <div style={{fontSize:12,fontWeight:700,color:TX,marginBottom:12}}>CREATE TAG</div>
          <div style={{marginBottom:9}}><label style={{fontSize:10,color:MT,display:"block",marginBottom:4}}>TAG NAME</label><input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="#tagname" style={inp()}/></div>
          <div style={{marginBottom:9}}><label style={{fontSize:10,color:MT,display:"block",marginBottom:4}}>DESCRIPTION</label><input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Tag description…" style={inp()}/></div>
          <div style={{marginBottom:12}}><label style={{fontSize:10,color:MT,display:"block",marginBottom:4}}>ROUTING RULE</label><select style={inp()}><option>Priority queue</option><option>Round robin</option><option>Least busy</option><option>Block all</option></select></div>
          <button className="bg" onClick={()=>{if(!newTag.trim())return;setTags(p=>[...p,{tag:newTag.startsWith("#")?newTag:"#"+newTag,color:GN,users:0,desc:newDesc||"New tag",active:true}]);setNewTag("");setNewDesc("");addToast("Tag created","success");}} style={{width:"100%",padding:"9px",background:`linear-gradient(135deg,${GN}cc,${BL}aa)`,border:"none",borderRadius:8,color:"#050c1a",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>+ CREATE TAG</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   AGENTS
══════════════════════════════════════════ */
const AGENTS_INIT=[
  {name:"CoreAgent-v4",role:"Primary",model:"sonnet-4-6",status:"active",tasks:247,success:98.4,mem:340,skills:8},
  {name:"WorkerAgent-01",role:"Worker",model:"haiku-4-5",status:"active",tasks:89,success:97.1,mem:210,skills:5},
  {name:"WorkerAgent-02",role:"Worker",model:"sonnet-4-6",status:"active",tasks:134,success:99.0,mem:280,skills:5},
  {name:"ResearchAgent",role:"Specialist",model:"opus-4-6",status:"idle",tasks:23,success:95.6,mem:180,skills:3},
  {name:"SigningAgent",role:"Specialist",model:"haiku-4-5",status:"idle",tasks:12,success:100,mem:120,skills:2},
  {name:"SandboxAgent",role:"Sandbox",model:"haiku-4-5",status:"error",tasks:0,success:0,mem:0,skills:1},
];
function AgentsPage({addToast}){
  const [agents,setAgents]=useState(AGENTS_INIT);
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="AGENTS" s="AI agent fleet management and performance monitoring"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:13}}>
        {[{l:"Total",v:agents.length,c:BL},{l:"Active",v:agents.filter(a=>a.status==="active").length,c:GN},{l:"Avg Success",v:Math.round(agents.filter(a=>a.success>0).reduce((s,a)=>s+a.success,0)/agents.filter(a=>a.success>0).length)+"%",c:PU}].map((s,i)=>(
          <div key={i} className="ch" style={{...card({padding:"12px 14px"})}}><div style={{fontSize:10,color:MT,marginBottom:6,textTransform:"uppercase"}}>{s.l}</div><div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
        {agents.map((a,i)=>(
          <div key={i} className="ch" style={{...card({padding:"14px 16px",border:`1px solid ${a.status==="active"?GN+"28":a.status==="error"?RD+"28":BR}`})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:TX,marginBottom:4}}>{a.name}</div><div style={{display:"flex",gap:6}}><Bdg l={a.role} c={a.role==="Primary"?GN:a.role==="Worker"?BL:PU} sm/><Bdg l={a.model} c={ML} sm/></div></div>
              <div style={{display:"flex",alignItems:"center",gap:5}}><Dot c={a.status==="active"?GN:a.status==="error"?RD:MT} p={a.status==="active"} s={7}/><span style={{fontSize:11,color:a.status==="active"?GN:a.status==="error"?RD:MT}}>{a.status}</span></div>
            </div>
            <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {[["Tasks",a.tasks,BL],["Success",a.success+"%",GN],["Memory",a.mem>0?a.mem+"MB":"—",PU],["Skills",a.skills,OR]].map(([k,v,c])=>(
                <div key={k} style={{background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"7px 9px"}}><div style={{fontSize:9,color:MT,marginBottom:3,textTransform:"uppercase"}}>{k}</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:c}}>{v}</div></div>
              ))}
            </div>
            {a.mem>0&&<><div style={{fontSize:9,color:MT,marginBottom:4}}>MEMORY</div><Prg v={(a.mem/512)*100} c={a.mem>400?RD:GN} h={5}/></>}
            <div style={{display:"flex",gap:7,marginTop:10}}>
              <button className="bd" onClick={()=>addToast(`${a.name} logs opened`,"info")} style={{flex:1,padding:"6px",background:"rgba(255,255,255,0.04)",border:`1px solid ${BR}`,borderRadius:6,color:ML,fontSize:11,cursor:"pointer"}}>Logs</button>
              <button className="bd" onClick={()=>{setAgents(p=>p.map((ag,j)=>j===i?{...ag,status:ag.status==="active"?"idle":"active"}:ag));addToast(`${a.name} toggled`,"success");}} style={{flex:1,padding:"6px",background:`${GN}12`,border:`1px solid ${GN}28`,borderRadius:6,color:GN,fontSize:11,cursor:"pointer",fontWeight:600}}>{a.status==="active"?"Pause":"Activate"}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SKILLS
══════════════════════════════════════════ */
const SKILL_INIT=[
  {name:"gmail-voice-email",cat:"Communication",on:true,calls:142,desc:"Hands-free voice-email for Jack Taylor while driving."},
  {name:"ScheduleMeetingVoice",cat:"Productivity",on:true,calls:87,desc:"Voice Google Calendar scheduling with conflict detection."},
  {name:"sign-ops",cat:"Legal",on:true,calls:23,desc:"E-signature workflow tracker for The Snayden Group."},
  {name:"tpassword",cat:"Security",on:true,calls:56,desc:"1Password CUI with session-bound credential delivery."},
  {name:"code_executor",cat:"Developer",on:false,calls:0,desc:"Python/Node.js sandboxed execution with output capture."},
  {name:"web_search",cat:"Research",on:true,calls:291,desc:"Real-time web search with multi-result synthesis."},
  {name:"docker_manager",cat:"DevOps",on:true,calls:18,desc:"Natural-language Docker container control."},
  {name:"slack_notifier",cat:"Communication",on:false,calls:0,desc:"Push agent results to Slack channels via webhook."},
];
const CC={Communication:BL,Productivity:GN,Legal:YL,Security:RD,Developer:PU,Research:OR,DevOps:BL};
function SkillsPage({addToast}){
  const [skills,setSkills]=useState(SKILL_INIT);const [sq,setSq]=useState("");const [filt,setFilt]=useState("All");
  const filtered=skills.filter(s=>(s.name.toLowerCase().includes(sq.toLowerCase())||s.desc.toLowerCase().includes(sq.toLowerCase()))&&(filt==="All"||(filt==="Active"&&s.on)||(filt==="Disabled"&&!s.on)));
  const toggle=useCallback(name=>{setSkills(p=>p.map(s=>s.name===name?{...s,on:!s.on}:s));const sk=skills.find(s=>s.name===name);addToast(`${name} ${sk?.on?"disabled":"enabled"}`,sk?.on?"info":"success");},[skills,addToast]);
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
        <SH t="AGENT SKILLS" s={`${skills.filter(s=>s.on).length} active · ${skills.filter(s=>!s.on).length} disabled`}/>
        <button className="bg" onClick={()=>addToast("ClavHub registry opened","info")} style={{padding:"6px 14px",background:`linear-gradient(135deg,${GN}cc,${BL}aa)`,border:"none",borderRadius:7,color:"#050c1a",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer",marginTop:-10}}>+ ADD SKILL</button>
      </div>
      <div style={{...card({padding:"10px 13px",marginBottom:11}),display:"flex",gap:9,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${BR}`,borderRadius:7,padding:"5px 9px"}}>
          <span style={{color:MT}}>⌕</span>
          <input value={sq} onChange={e=>setSq(e.target.value)} placeholder="Search skills…" style={{background:"transparent",border:"none",outline:"none",fontSize:12,color:TX,flex:1,fontFamily:"'Space Grotesk',sans-serif"}}/>
          {sq&&<span onClick={()=>setSq("")} style={{cursor:"pointer",color:MT}}>✕</span>}
        </div>
        {["All","Active","Disabled"].map(f=><button key={f} className="bd" onClick={()=>setFilt(f)} style={{padding:"4px 11px",background:filt===f?`${GN}20`:"rgba(255,255,255,0.04)",border:`1px solid ${filt===f?GN+"45":BR}`,borderRadius:6,color:filt===f?GN:MT,fontSize:11,cursor:"pointer"}}>{f}</button>)}
      </div>
      <div style={{...card({padding:0,overflow:"hidden"})}}>
        {filtered.length===0&&<div style={{padding:36,textAlign:"center",color:MT,fontSize:13}}>No skills found.</div>}
        {filtered.map((sk,i)=>(
          <div key={sk.name} className="rh" style={{display:"flex",alignItems:"center",gap:11,padding:"11px 14px",borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.05)`:"none",opacity:sk.on?1:0.55,transition:"opacity 0.2s"}}>
            <div style={{width:30,height:30,borderRadius:8,background:`${CC[sk.cat]||GN}18`,border:`1px solid ${CC[sk.cat]||GN}28`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:14,color:CC[sk.cat]||GN}}>✦</span></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:600,color:TX}}>{sk.name}</span><Bdg l={sk.cat} c={CC[sk.cat]||GN} sm/></div>
              <div style={{fontSize:11,color:MT,lineHeight:1.4}}>{sk.desc}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
              <Tog on={sk.on} onChange={()=>toggle(sk.name)}/>
              <span style={{fontSize:9,color:MT,fontFamily:"'JetBrains Mono',monospace"}}>{sk.calls} calls</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   NODES
══════════════════════════════════════════ */
const NODES=[
  {name:"node-us-east-01",region:"US East",ip:"52.14.123.45",cpu:34,mem:61,disk:42,status:"healthy",tasks:89,latency:12},
  {name:"node-us-east-02",region:"US East",ip:"52.14.123.46",cpu:78,mem:82,disk:55,status:"warning",tasks:134,latency:15},
  {name:"node-ap-sydney-01",region:"AP Sydney",ip:"13.237.89.12",cpu:22,mem:45,disk:38,status:"healthy",tasks:45,latency:142},
  {name:"node-eu-london-01",region:"EU London",ip:"18.185.34.67",cpu:12,mem:33,disk:29,status:"healthy",tasks:23,latency:89},
  {name:"node-us-west-01",region:"US West",ip:"54.67.234.89",cpu:5,mem:20,disk:18,status:"idle",tasks:0,latency:48},
];
function NodesPage(){
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="NODES" s="Distributed compute nodes and infrastructure health"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:13}}>
        {[{l:"Total",v:NODES.length,c:BL},{l:"Healthy",v:NODES.filter(n=>n.status==="healthy").length,c:GN},{l:"Warning",v:NODES.filter(n=>n.status==="warning").length,c:YL},{l:"Avg Latency",v:Math.round(NODES.reduce((a,n)=>a+n.latency,0)/NODES.length)+"ms",c:PU}].map((s,i)=>(
          <div key={i} className="ch" style={{...card({padding:"12px 14px"})}}><div style={{fontSize:10,color:MT,marginBottom:6,textTransform:"uppercase"}}>{s.l}</div><div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {NODES.map((n,i)=>(
          <div key={i} className="ch" style={{...card({padding:"14px 16px",border:`1px solid ${n.status==="healthy"?GN+"28":n.status==="warning"?YL+"28":BR}`})}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><Dot c={n.status==="healthy"?GN:n.status==="warning"?YL:MT} p={n.status==="healthy"} s={8}/><div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:TX}}>{n.name}</div><div style={{fontSize:10,color:MT}}>{n.region} · {n.ip}</div></div></div>
              <div style={{display:"flex",gap:8}}><Bdg l={`${n.latency}ms`} c={n.latency>100?YL:GN} sm/><Bdg l={n.status} c={n.status==="healthy"?GN:n.status==="warning"?YL:MT} sm/><Bdg l={`${n.tasks} tasks`} c={BL} sm/></div>
            </div>
            <div className="grid-3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[["CPU",n.cpu,GN],["Memory",n.mem,BL],["Disk",n.disk,PU]].map(([k,v,c])=>(
                <div key={k}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:MT}}>{k}</span><span style={{fontSize:10,color:c,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{v}%</span></div><Prg v={v} c={v>80?RD:v>60?YL:c} h={6}/></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   COMMUNICATIONS
══════════════════════════════════════════ */
function CommunicationsPage({addToast}){
  const [on1,setOn1]=useState(true);const [on2,setOn2]=useState(false);const [on3,setOn3]=useState(true);const [on4,setOn4]=useState(true);
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="COMMUNICATIONS" s="Notification routing and messaging configuration"/>
      <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          <div style={{...card({padding:"14px 16px"})}}>
            <div style={{fontSize:12,fontWeight:700,color:TX,marginBottom:12}}>EMAIL SETTINGS</div>
            {[["SMTP Host","smtp.gmail.com"],["SMTP Port","587"],["From Address","openclaw@snaydengroup.com"],["Reply-To","jack@snaydengroup.com"]].map(([k,v])=>(
              <div key={k} style={{marginBottom:9}}><label style={{fontSize:10,color:MT,display:"block",marginBottom:4}}>{k}</label><input defaultValue={v} style={inp()}/></div>
            ))}
            <button className="bg" onClick={()=>addToast("Email config saved","success")} style={{width:"100%",padding:"9px",background:`linear-gradient(135deg,${GN}cc,${BL}aa)`,border:"none",borderRadius:8,color:"#050c1a",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>SAVE EMAIL CONFIG</button>
          </div>
          <div style={{...card({padding:"14px 16px"})}}>
            <div style={{fontSize:12,fontWeight:700,color:TX,marginBottom:12}}>SLACK WEBHOOK</div>
            {[["Webhook URL","https://hooks.slack.com/services/T00/B00/xxx"],["Channel","#openclaw-bot"],["Bot Name","OpenClaw Agent"]].map(([k,v])=>(
              <div key={k} style={{marginBottom:9}}><label style={{fontSize:10,color:MT,display:"block",marginBottom:4}}>{k.toUpperCase()}</label><input defaultValue={v} style={inp()}/></div>
            ))}
            <button className="bg" onClick={()=>addToast("Slack config saved","success")} style={{width:"100%",padding:"9px",background:`linear-gradient(135deg,${PU}cc,${BL}aa)`,border:"none",borderRadius:8,color:"#050c1a",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>SAVE SLACK CONFIG</button>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          <div style={{...card({padding:"14px 16px"})}}>
            <div style={{fontSize:12,fontWeight:700,color:TX,marginBottom:12}}>NOTIFICATION RULES</div>
            {[[on1,setOn1,"Email on Task Complete","Send summary after each agent task"],[on2,setOn2,"Slack on Tool Error","Post to Slack when a tool fails"],[on3,setOn3,"Daily Digest","Morning summary of activity"],[on4,setOn4,"Critical Alerts","Instant notification on system issues"]].map(([on,setOn,l,s],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.05)":"none"}}>
                <div><div style={{fontSize:13,color:TX,fontWeight:500}}>{l}</div><div style={{fontSize:11,color:MT}}>{s}</div></div>
                <Tog on={on} onChange={()=>{setOn(p=>!p);addToast(`${l} ${on?"disabled":"enabled"}`,"info");}}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   INFRASTRUCTURE (DOCKER)
══════════════════════════════════════════ */
const CONT_INIT=[
  {name:"openclaw-core",image:"openclaw/core:v4.1",status:"running",cpu:12,mem:340,up:"14d 3h"},
  {name:"agent-worker-01",image:"openclaw/worker:latest",status:"running",cpu:21,mem:280,up:"12d 7h"},
  {name:"agent-worker-02",image:"openclaw/worker:latest",status:"running",cpu:8,mem:190,up:"12d 7h"},
  {name:"redis-cache",image:"redis:7.2-alpine",status:"running",cpu:2,mem:64,up:"14d 3h"},
  {name:"postgres-main",image:"postgres:16",status:"running",cpu:6,mem:512,up:"14d 3h"},
  {name:"nginx-proxy",image:"nginx:1.25",status:"running",cpu:1,mem:32,up:"14d 3h"},
  {name:"skill-sandbox",image:"openclaw/sandbox:v2",status:"error",cpu:0,mem:0,up:"—"},
  {name:"log-aggregator",image:"fluent/fluent-bit:3",status:"stopped",cpu:0,mem:0,up:"—"},
];
function InfraPage({addToast}){
  const [conts,setConts]=useState(CONT_INIT);const [ld,setLd]=useState({});
  const act=async(i,action)=>{setLd(p=>({...p,[i]:action}));await new Promise(r=>setTimeout(r,800));setConts(p=>p.map((c,j)=>{if(j!==i)return c;if(action==="play")return{...c,status:"running",cpu:Math.floor(5+Math.random()*20),mem:Math.floor(100+Math.random()*200),up:"0m"};if(action==="stop")return{...c,status:"stopped",cpu:0,mem:0,up:"—"};return{...c,status:"running",up:"0m"};}));setLd(p=>{const n={...p};delete n[i];return n;});addToast(`${conts[i].name} ${action==="play"?"started":action==="stop"?"stopped":"restarted"}`,action==="stop"?"info":"success");};
  const run=conts.filter(c=>c.status==="running").length;
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="DOCKER MANAGER" s={`${run} running · ${conts.length-run} inactive`}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:13}}>
        {[{l:"Total",v:conts.length,c:BL},{l:"Running",v:run,c:GN},{l:"Errors",v:conts.filter(c=>c.status==="error").length,c:RD},{l:"Total Mem",v:conts.reduce((a,c)=>a+c.mem,0)+"MB",c:PU}].map((s,i)=>(
          <div key={i} className="ch" style={{...card({padding:"12px 14px"})}}><div style={{fontSize:10,color:MT,marginBottom:6,textTransform:"uppercase"}}>{s.l}</div><div style={{fontFamily:"'Orbitron',monospace",fontSize:19,fontWeight:700,color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      <div style={{...card({padding:0,overflow:"hidden"})}}><table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{borderBottom:`1px solid ${BR}`,background:"rgba(0,0,0,0.2)"}}>{["Container","Image","Status","CPU","Memory","Uptime","Actions"].map(h=><th key={h} style={{padding:"8px 13px",textAlign:"left",fontSize:9,color:MT,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.07em",textTransform:"uppercase",fontWeight:600}}>{h}</th>)}</tr></thead>
        <tbody>{conts.map((c,i)=>(
          <tr key={i} className="rh" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <td style={{padding:"9px 13px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:TX}}>{c.name}</td>
            <td style={{padding:"9px 13px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:MT}}>{c.image}</td>
            <td style={{padding:"9px 13px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><Dot c={c.status==="running"?GN:c.status==="error"?RD:MT} p={c.status==="running"} s={6}/><span style={{fontSize:11,color:c.status==="running"?GN:c.status==="error"?RD:MT,fontWeight:600}}>{c.status}</span></div></td>
            <td style={{padding:"9px 13px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><Prg v={c.cpu} c={c.cpu>80?RD:GN} h={4}/><span style={{fontSize:10,color:MT,minWidth:26}}>{c.cpu}%</span></div></td>
            <td style={{padding:"9px 13px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:TX}}>{c.mem>0?`${c.mem}MB`:"—"}</td>
            <td style={{padding:"9px 13px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:MT}}>{c.up}</td>
            <td style={{padding:"9px 13px"}}><div style={{display:"flex",gap:4}}>{[["play","▶",GN],["stop","■",RD],["restart","↻",BL]].map(([action,ic,col])=>(
              <button key={action} className="bd" onClick={()=>act(i,action)} style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",background:`${col}12`,border:`1px solid ${col}25`,borderRadius:5,cursor:"pointer",fontSize:10,color:col}}>{ld[i]===action?<span className="sp">↻</span>:ic}</button>
            ))}</div></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DATA (TERMINAL)
══════════════════════════════════════════ */
const BOOT=[["#5a6a82","Welcome to Ubuntu 24.04 LTS (OpenClaw Server Edition)"],[BL,"System information as of Sat May 9 06:30:44 2026 UTC"],["#7a8fa8","  System load: 0.19  |  Memory: 39%  |  IP: 247.227.227.234"],[GN,"All systems operational. OpenClaw v888.611 running."],[YL,"*** Welcome to your OpenClaw server ***"]];
const CMDS={ls:"bin  boot  dev  etc  home  lib  opt  proc  root  run  srv  sys  tmp  usr  var",pwd:"/opt/openclaw",whoami:"root",uptime:" 06:30:44 up 14 days, 3:21, 1 user, load average: 0.19",  "df -h":"Filesystem  Size  Used  Avail  Use%\n/dev/sda1    23G   3.2G   19G   15%","free -h":"       total  used  free\nMem:    128G   50G   74G","docker ps":"CONTAINER     IMAGE              STATUS\nopenclaw-core openclaw/core:v4.1 Up 14d\nredis-cache   redis:7.2-alpine   Up 14d\npostgres      postgres:16        Up 14d",date:new Date().toString(),hostname:"openclaw-prod-01.snaydengroup.com",help:"Commands: ls, pwd, whoami, uptime, df -h, free -h, docker ps, date, hostname, clear, echo <text>"};
function DataPage(){
  const [hist,setHist]=useState([]);const [cmd,setCmd]=useState("");const [ch,setCh]=useState([]);const [hi,setHi]=useState(-1);
  const endRef=useRef();const inpRef=useRef();
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[hist]);
  const run=()=>{const c=cmd.trim();if(!c)return;setCh(p=>[c,...p]);setHi(-1);if(c==="clear"){setHist([]);setCmd("");return;}const out=CMDS[c]!==undefined?CMDS[c]:c.startsWith("echo ")?c.slice(5):`bash: ${c}: command not found`;setHist(p=>[...p,{cmd:c,out}]);setCmd("");};
  return(
    <div className="fu" style={{padding:"16px 20px",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <SH t="SERVER ACCESS" s="root@openclaw-prod-01 · type help for commands · ↑↓ for history"/>
      <div style={{flex:1,background:"#00040c",borderRadius:10,border:`1px solid ${GN}22`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"7px 11px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:7,background:"rgba(0,255,136,0.03)"}}>
          <div style={{display:"flex",gap:5}}>{[RD,YL,GN].map((c,i)=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:c,opacity:0.75}}/>)}</div>
          <span style={{flex:1,textAlign:"center",fontSize:11,color:MT,fontFamily:"'JetBrains Mono',monospace"}}>root@openclaw-prod-01 — bash</span>
          <button className="bd" onClick={()=>{setHist([]);setCmd("");}} style={{padding:"2px 8px",background:"transparent",border:`1px solid ${BR}`,borderRadius:3,color:MT,fontSize:10,cursor:"pointer"}}>clear</button>
        </div>
        <div style={{flex:1,padding:"11px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,overflowY:"auto",lineHeight:1.75,cursor:"text"}} onClick={()=>inpRef.current?.focus()}>
          {BOOT.map(([c,t],i)=><div key={i} style={{color:c}}>{t}</div>)}
          <div style={{marginTop:5}}/>
          {hist.map((h,i)=><div key={i}><div><span style={{color:GN}}>root@openclaw-prod</span><span style={{color:BL}}>:/opt/openclaw</span><span style={{color:MT}}># </span><span style={{color:TX}}>{h.cmd}</span></div><div style={{color:ML,whiteSpace:"pre-wrap",marginBottom:3}}>{h.out}</div></div>)}
          <div style={{display:"flex",alignItems:"center"}}><span style={{color:GN}}>root@openclaw-prod</span><span style={{color:BL}}>:/opt/openclaw</span><span style={{color:MT}}># </span><span style={{color:TX}}>{cmd}</span><span style={{color:GN,animation:"cur 1s infinite"}}>█</span></div>
          <div ref={endRef}/>
        </div>
        <div style={{padding:"6px 11px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:7,background:"rgba(0,0,0,0.45)"}}>
          <input ref={inpRef} value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")run();else if(e.key==="ArrowUp"){const ni=Math.min(hi+1,ch.length-1);setHi(ni);setCmd(ch[ni]||"");}else if(e.key==="ArrowDown"){const ni=Math.max(hi-1,-1);setHi(ni);setCmd(ni===-1?"":ch[ni]);}}} placeholder="Enter command…" style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:12,color:TX,fontFamily:"'JetBrains Mono',monospace"}}/>
          <button className="bd" onClick={run} style={{padding:"3px 11px",background:`${GN}18`,border:`1px solid ${GN}35`,borderRadius:4,color:GN,fontSize:11,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer"}}>RUN</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CONFIG
══════════════════════════════════════════ */
function ConfigPage({addToast,apiKey,setApiKey,apiModel,setApiModel}){
  const [showK,setShowK]=useState(false);
  const [on1,setOn1]=useState(true);const [on2,setOn2]=useState(false);const [on3,setOn3]=useState(true);
  const saveKey=()=>{
    if(!apiKey.trim()){addToast("Key cannot be empty","error");return;}
    storage.set("openclaw:apiKey",apiKey.trim());
    addToast("API key saved permanently!","success");
  };
  const deleteKey=()=>{storage.del("openclaw:apiKey");setApiKey("");addToast("API key deleted","info");};
  return(
    <div className="fu" style={{padding:"16px 20px"}}>
      <SH t="CONFIGURATION" s="API keys, model selection, and agent behaviour"/>
      {/* API KEY */}
      <div style={{...card({padding:"14px 16px",marginBottom:12,border:`1px solid ${GN}35`,background:`${GN}05`})}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:16}}>⚡</span><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:GN}}>GROQ API KEY (FREE)</div></div>
        <p style={{fontSize:12,color:MT,marginBottom:10}}>Free key at <span style={{color:BL}}>console.groq.com</span> — no credit card needed</p>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input type={showK?"text":"password"} value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder={isUsingDemoKey()?"Paste your own Groq key for unlimited use (optional)":"gsk_••••••••••••••••••••••••••••••••"} style={{...inp(),flex:1,borderColor:apiKey?`${GN}45`:BR}}/>
          <button className="bd" onClick={()=>setShowK(s=>!s)} style={{padding:"7px 10px",background:"rgba(255,255,255,0.04)",border:`1px solid ${BR}`,borderRadius:7,cursor:"pointer",color:MT}}>{showK?"Hide":"Show"}</button>
          <button className="bg" onClick={saveKey} style={{padding:"7px 16px",background:`linear-gradient(135deg,${GN}cc,${BL}aa)`,border:"none",borderRadius:7,color:"#050c1a",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>SAVE KEY</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {isUsingDemoKey() ? (
            <><Dot c={GN} p={false} s={6}/><span style={{fontSize:11,color:GN}}>Demo key active · llama-3.3-70b</span></>
          ) : apiKey ? (
            <><Dot c={GN} p s={6}/><span style={{fontSize:11,color:GN}}>Custom key active · gsk_•••••••••{apiKey.slice(-4)}</span></>
          ) : (
            <><Dot c={RD} s={6}/><span style={{fontSize:11,color:MT}}>No key set</span></>
          )}
          {apiKey && !isUsingDemoKey() && <button className="bd" onClick={deleteKey} style={{marginLeft:"auto",padding:"3px 9px",background:`${RD}12`,border:`1px solid ${RD}25`,borderRadius:5,color:RD,fontSize:10,cursor:"pointer"}}>Remove key</button>}
        </div>
      </div>
      <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{...card({padding:"14px 16px"})}}>
          <div style={{fontSize:12,fontWeight:700,color:TX,marginBottom:12}}>AGENT PARAMETERS</div>
          <div style={{marginBottom:9}}>
            <label style={{fontSize:10,color:MT,display:"block",marginBottom:4}}>GROQ MODEL</label>
            <select value={apiModel} onChange={e=>{setApiModel(e.target.value);storage.set("openclaw:apiModel",e.target.value);addToast("Model updated","success");}} style={{...inp()}}>
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Best)</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (Smart)</option>
              <option value="gemma2-9b-it">gemma2-9b-it (Light)</option>
            </select>
          </div>
          {[["Max Tokens","1024"],["Temperature","0.7"],["Tool Timeout (s)","30"]].map(([k,v])=>(
            <div key={k} style={{marginBottom:9}}><label style={{fontSize:10,color:MT,display:"block",marginBottom:4}}>{k.toUpperCase()}</label><input defaultValue={v} style={inp()}/></div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          <div style={{...card({padding:"14px 16px"})}}>
            <div style={{fontSize:12,fontWeight:700,color:TX,marginBottom:12}}>NOTIFICATIONS</div>
            {[[on1,setOn1,"Email Alerts","Daily digest + critical errors"],[on2,setOn2,"Slack Integration","Push to #openclaw-bot"],[on3,setOn3,"Skill Callbacks","Notify on tool completion"]].map(([on,setOn,l,s],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.05)":"none"}}>
                <div><div style={{fontSize:13,color:TX,fontWeight:500}}>{l}</div><div style={{fontSize:11,color:MT}}>{s}</div></div>
                <Tog on={on} onChange={()=>{setOn(p=>!p);addToast(`${l} ${on?"disabled":"enabled"}`,"info");}}/>
              </div>
            ))}
          </div>
          <div style={{...card({padding:"14px 16px",border:`1px solid ${RD}25`,background:`${RD}05`})}}>
            <div style={{fontSize:12,fontWeight:700,color:RD,marginBottom:11}}>DANGER ZONE</div>
            {[["CLEAR MEMORY","Wipe agent memory",YL],["RESET SKILLS","Remove skill configs",OR],["DELETE AGENT","Destroy agent instance",RD]].map(([l,s,col])=>(
              <button key={l} className="bd" onClick={()=>addToast(`${l} — demo mode`,"error")} style={{width:"100%",padding:"8px 11px",marginBottom:6,background:`${col}10`,border:`1px solid ${col}28`,borderRadius:7,color:col,fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>{l}<span style={{fontSize:10,color:MT,fontFamily:"'Space Grotesk',sans-serif",textTransform:"none",letterSpacing:0,fontWeight:400}}>{s}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════ */
export default function App(){
  const [active,setActive]=useState("chat");
  const [stats,setStats]=useState({cpu:45,memory:62,requests:1247});
  const [toasts,setToasts]=useState([]);
  const [notif,setNotif]=useState(3);
  const [sq,setSq]=useState("");
  const [apiKey,setApiKey]=useState(()=>storage.get("openclaw:apiKey")||"")
  const [apiModel,setApiModel]=useState(()=>storage.get("openclaw:apiModel")||"llama-3.3-70b-versatile");
  const [menuOpen,setMenuOpen]=useState(false);

  // Persist apiKey and model when changed
  useEffect(()=>{if(apiKey)storage.set("openclaw:apiKey",apiKey);},[apiKey]);
  useEffect(()=>{storage.set("openclaw:apiModel",apiModel);},[apiModel]);

  // Live stats update
  useEffect(()=>{
    const iv=setInterval(()=>setStats(p=>({
      cpu:Math.max(10,Math.min(95,p.cpu+(Math.random()-0.48)*7)),
      memory:Math.max(25,Math.min(90,p.memory+(Math.random()-0.5)*3)),
      requests:p.requests+Math.floor(Math.random()*5),
    })),2200);
    return()=>clearInterval(iv);
  },[]);

  const mainRef=useRef(null);
  useEffect(()=>{
    if(mainRef.current){
      mainRef.current.scrollTop=0;
      // Double-check after render completes
      requestAnimationFrame(()=>{if(mainRef.current)mainRef.current.scrollTop=0;});
    }
  },[active,sq]);

  const addToast=useCallback((msg,type="info")=>{const id=Date.now();setToasts(p=>[...p.slice(-4),{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3800);},[]);
  const rmToast=useCallback(id=>setToasts(p=>p.filter(t=>t.id!==id)),[]);

  const renderPage=()=>{
    const p={addToast,stats,setNotif,apiKey,setApiKey,apiModel,setApiModel};
    if(sq){
      const matches=Object.keys(PL).filter(k=>PL[k].toLowerCase().includes(sq.toLowerCase()));
      return(
        <div className="fu" style={{padding:"16px 20px"}}>
          <div style={{fontSize:13,color:MT,marginBottom:11}}>Search: <span style={{color:GN}}>"{sq}"</span></div>
          {matches.length===0&&<div style={{fontSize:13,color:MT}}>No pages found.</div>}
          {matches.map(k=>(
            <div key={k} className="rh" onClick={()=>{setActive(k);setSq("");}} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",background:"rgba(255,255,255,0.03)",border:`1px solid ${BR}`,borderRadius:7,marginBottom:6,cursor:"pointer"}}>
              <span style={{color:GN}}>→</span><span style={{fontSize:13,color:TX,fontWeight:500}}>{PL[k]}</span><span style={{fontSize:11,color:MT,marginLeft:"auto"}}>Navigate</span>
            </div>
          ))}
        </div>
      );
    }
    switch(active){
      case "chat":           return <ChatPage {...p}/>;
      case "overview":       return <OverviewPage {...p}/>;
      case "channels":       return <ChannelsPage {...p}/>;
      case "instances":      return <InstancesPage {...p}/>;
      case "sessions":       return <SessionsPage {...p}/>;
      case "utags":          return <UtagsPage {...p}/>;
      case "agents":         return <AgentsPage {...p}/>;
      case "skills":         return <SkillsPage {...p}/>;
      case "nodes":          return <NodesPage {...p}/>;
      case "communications": return <CommunicationsPage {...p}/>;
      case "infrastructure": return <InfraPage {...p}/>;
      case "data":           return <DataPage/>;
      case "config":         return <ConfigPage {...p}/>;
      default:               return <div style={{padding:40,textAlign:"center",color:MT}}>Coming soon.</div>;
    }
  };

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#020814",color:TX,position:"relative"}}>
      <style>{G}</style>
      <div className="grid-bg"/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:`${GN}06`,filter:"blur(80px)",top:-200,left:-100,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:`${BL}05`,filter:"blur(80px)",bottom:-150,right:-100,pointerEvents:"none",zIndex:0}}/>
      <Sidebar active={active} setActive={id=>{setActive(id);setMenuOpen(false);}} notif={notif} menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>
      <div style={{flex:"1 1 0",display:"flex",flexDirection:"column",position:"relative",zIndex:1,minWidth:0,minHeight:"100vh"}}>
        <TopBar active={active} notif={notif} setActive={setActive} sq={sq} setSq={setSq} setMenuOpen={setMenuOpen}/>
        <main ref={mainRef} style={{flex:"1 1 0",overflowY:"auto",overflowX:"hidden",paddingTop:12,minHeight:0,position:"relative"}}>{renderPage()}</main>
      </div>
      <Toast toasts={toasts} rm={rmToast}/>
    </div>
  );
}
