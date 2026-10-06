import { useId } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { formatTime, type MetricPoint, type Range, rangeLabels } from './data';
export function RangeSelect({value,onChange}:{value:Range;onChange:(r:Range)=>void}) {
  return <select aria-label="Time range" value={value} onChange={e=>onChange(e.target.value as Range)}>{Object.entries(rangeLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>;
}
export function MetricChart({points,performance=false,names,unit}:{points:MetricPoint[];performance?:boolean;names:[string,string];unit:string}) {
  const id=useId().replace(/:/g,'');
  const a=performance?'latency':'primary',b=performance?'error':'secondary';
  return <div className="metric-chart" role="img" aria-label={`${names[0]} and ${names[1]} over the selected period. ${points.length} data points. Latest ${names[0]}: ${points.at(-1)?.[a]} ${unit}; ${names[1]}: ${points.at(-1)?.[b]} ${performance?'percent':unit}.`}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <AreaChart data={points} margin={{top:9,right:performance?3:9,bottom:0,left:-15}}>
        <defs><linearGradient id={`${id}-a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d8ff" stopOpacity={.5}/><stop offset="100%" stopColor="#009dff" stopOpacity={.02}/></linearGradient><linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#087bff" stopOpacity={.4}/><stop offset="100%" stopColor="#087bff" stopOpacity={.03}/></linearGradient></defs>
        <CartesianGrid stroke="#16405c" strokeOpacity={.55} vertical/>
        <XAxis dataKey="at" type="number" domain={['dataMin','dataMax']} tickFormatter={v=>points.length>50?new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',weekday:'short'}).format(v):formatTime(v)} tick={{fill:'#a2c1d9',fontSize:12}} tickLine={false} axisLine={{stroke:'#38647d'}} minTickGap={25} tickCount={5}/>
        <YAxis yAxisId="left" tick={{fill:'#a2c1d9',fontSize:12}} tickFormatter={v=>v>=1000?`${v/1000}K`:`${v}`} tickLine={false} axisLine={false} width={48} tickCount={5}/>
        {performance&&<YAxis yAxisId="right" orientation="right" tick={{fill:'#a2c1d9',fontSize:12}} tickFormatter={v=>`${v}%`} tickLine={false} axisLine={false} width={34} tickCount={5}/>}
        <Tooltip labelFormatter={v=>new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(Number(v))} contentStyle={{background:'#061c2f',border:'1px solid #00d8ff',color:'#e7f3ff',fontFamily:'Barlow',fontSize:13}} formatter={(value,name)=>[`${Number(value).toLocaleString('en-US')} ${name===names[1]&&performance?'%':unit}`,name]}/>
        <Area yAxisId="left" type="monotone" dataKey={a} name={names[0]} stroke="#00d8ff" strokeWidth={2} fill={`url(#${id}-a)`} isAnimationActive={false}/>
        <Area yAxisId={performance?'right':'left'} type="monotone" dataKey={b} name={names[1]} stroke={performance?'#388bff':'#087bff'} strokeWidth={1.7} strokeDasharray={performance?'4 2':undefined} fill={`url(#${id}-b)`} isAnimationActive={false}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}
