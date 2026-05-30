const fs = require('fs');
let code = fs.readFileSync('App.jsx', 'utf8');

// 1. Overview Cards
// Apply `useCountUp` to Overview KPI values.
// The Overview component is currently hardcoded or using simple values. Let's find it.
// function Overview(){
//   return(
//     <div className="fu">
//       <SH t="SYSTEM OVERVIEW" s="High-level platform telemetry"/>
//       <div className="chart-row" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14}}>
//         {[{l:"Requests",v:"1,377",c:BL},{l:"Uptime",v:"99.9%",c:GN},{l:"Agents",v:"7",c:PU},{l:"CPU",v:"24%",c:OR}].map((s,i)=>(
//           <div key={i} style={card({padding:"16px 20px"})} className="bd">

// Update Overview component to use useCountUp:
const overviewReplacement = `
function Overview(){
  const reqCount = useCountUp(1377, 1200);
  const upCount = useCountUp(99, 1200);
  const upDec = useCountUp(9, 1200);
  const agCount = useCountUp(7, 1200);
  const cpuCount = useCountUp(24, 1200);
  
  return(
    <div className="fu page-content">
      <SH t="SYSTEM OVERVIEW" s="High-level platform telemetry"/>
      <div className="chart-row stagger" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14}}>
        {[{l:"Requests",v:reqCount.toLocaleString(),c:BL},{l:"Uptime",v:upCount+"."+upDec+"%",c:GN},{l:"Agents",v:agCount,c:PU},{l:"CPU",v:cpuCount+"%",c:OR}].map((s,i)=>(
          <div key={i} style={card({padding:"16px 20px"})} className="fade-in-up card-hover btn-press">
            <div style={{fontSize:11,color:MT,marginBottom:4,fontWeight:600}}>{s.l}</div>
            <div style={{fontSize:24,fontWeight:700,color:TX}}>{s.v}</div>
            <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}><Dot c={s.c}/><span style={{fontSize:10,color:s.c}}>Live</span></div>
          </div>
        ))}
      </div>
      <div className="chart-row stagger" style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
        <div style={card({padding:"18px 22px"})} className="fade-in-up">
          <div style={{fontSize:12,color:MT,marginBottom:14,fontWeight:600}}>REQUEST VOLUME (24H)</div>
          <div style={{height:180}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={Array.from({length:24},(_,i)=>({time:i+":00",req:Math.floor(Math.random()*400)+100}))}><defs><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GN} stopOpacity={0.3}/><stop offset="95%" stopColor={GN} stopOpacity={0}/></linearGradient></defs><XAxis dataKey="time" hide/><YAxis hide/><Tooltip content={<TT/>}/><Area type="monotone" dataKey="req" stroke={GN} fillOpacity={1} fill="url(#gR)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
        </div>
        <div style={card({padding:"18px 22px"})} className="fade-in-up">
          <div style={{fontSize:12,color:MT,marginBottom:14,fontWeight:600}}>TOKEN USAGE</div>
          <div style={{height:180}}><ResponsiveContainer width="100%" height="100%"><BarChart data={Array.from({length:7},(_,i)=>({day:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],tok:Math.floor(Math.random()*50000)+10000}))}><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:MT,fontSize:10}}/><Tooltip content={<TT/>}/><Bar dataKey="tok" fill={BL} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
}
`;
code = code.replace(/function Overview\(\)\{[\s\S]*?\}\n\n/m, overviewReplacement.trim() + '\n\n');

// 2. Data Views Cards (Sessions, Instances, Agents)
// Replace `.bd` or `rh` with `.card-hover` where they act like cards
// Sessions:
// <div key={i} className="rh" style={{padding:"12px 14px",borderBottom:`1px solid ${BR}`,display:"flex",alignItems:"center",gap:12}}>
code = code.replace(/className="rh" style=\{\{padding:"12px 14px",borderBottom/g, 'className="rh card-hover" style={{padding:"12px 14px",borderBottom');

// Instances:
// <tr key={i} className="rh">
code = code.replace(/<tr key=\{i\} className="rh">/g, '<tr key={i} className="rh card-hover">');

// Agents:
// <div key={i} className="bd" style={card({padding:"16px"})}>
code = code.replace(/<div key=\{i\} className="bd" style=\{card\(\{padding:"16px"\}\)\}>/g, '<div key={i} className="card-hover stagger" style={card({padding:"16px"})}>');

fs.writeFileSync('App.jsx', code);
console.log('Data views updates applied');
