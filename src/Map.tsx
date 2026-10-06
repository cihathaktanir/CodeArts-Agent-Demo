import { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath, geoContains } from 'd3-geo';
import { Crosshair, Minus, Plus, RotateCcw } from 'lucide-react';
import { countUniquePeople, colors, formatNumber, regions, type Incident, type SectorData, type ImpactRecord } from './data';
export const projection=geoMercator().center([35.5,39]).scale(2700).translate([500,280]);
const path=geoPath(projection);
type GeometryCollection=Parameters<typeof path>[0] & {features: {properties:{shapeName?:string;ADMIN?:string};geometry:Parameters<typeof geoContains>[0]}[]};
export default function TurkeyOperationsMap({data,incidents,impacts,selected,onSelect,paused}:{data:SectorData;incidents:Incident[];impacts:ImpactRecord[];selected:string;onSelect:(id:string)=>void;paused:boolean}) {
  const [geography,setGeography]=useState<{provinces:GeometryCollection;neighbors:GeometryCollection}|null>(null);
  const [error,setError]=useState(false);const [attempt,setAttempt]=useState(0);
  const [zoom,setZoom]=useState(1);const [pan,setPan]=useState({x:0,y:0});
  const [hover,setHover]=useState('');const [drag,setDrag]=useState<{x:number;y:number;px:number;py:number}|null>(null);
  useEffect(()=>{let active=true;setError(false);Promise.all(['/map/turkey-provinces.geojson','/map/surrounding-countries.geojson'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error('Map data unavailable');return r.json();})).then(([provinces,neighbors])=>{if(active)setGeography({provinces,neighbors});}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[attempt]);
  useEffect(()=>{setZoom(1);setPan({x:0,y:0});setHover('');},[data.industry]);
  const nodes=regions.map(r=>{const records=impacts.filter(i=>i.regionId===r.id);const ids=new Set(records.map(i=>i.incidentId));const local=incidents.filter(n=>n.regionId===r.id||ids.has(n.id));const severity:'Critical'|'High'|'Healthy'=local.some(n=>n.severity==='Critical')?'Critical':local.length?'High':'Healthy';return {...r,local,severity,point:projection(r.coordinates)!,affected:countUniquePeople(records)};});
  const smallNodes=useMemo(()=>geography?.provinces.features.map(f=>path.centroid(f as never)).filter(p=>Number.isFinite(p[0]))??[],[geography]);
  const selectedName=selected==='other'?'Other regions':regions.find(r=>r.id===selected)?.name;
  const hovered=nodes.find(n=>n.id===hover);
  const reset=()=>{setZoom(1);setPan({x:0,y:0});};
  return <section className={`operations-map tech-frame ${paused?'paused':''}`} aria-label="Interactive Turkey operations map">
    <div className="map-top"><span className="map-caption"><Crosshair size={13}/> NATIONAL SERVICE TOPOLOGY <span className="map-live">DEMO</span></span><div className="map-tools"><button aria-label="Zoom out" disabled={zoom===1} onClick={()=>setZoom(z=>Math.max(1,z-.3))}><Minus size={15}/></button><button aria-label="Zoom in" disabled={zoom>=2.5} onClick={()=>setZoom(z=>Math.min(2.5,z+.3))}><Plus size={15}/></button><button aria-label="Reset map view" onClick={reset}><RotateCcw size={14}/></button></div></div>
    {selected&&<button className="region-chip" onClick={()=>onSelect('')}>{selectedName} selected <span>× Clear</span></button>}
    {error?<div className="map-state" role="alert">Map data could not be loaded.<button onClick={()=>setAttempt(a=>a+1)}>Retry map</button></div>:!geography?<div className="map-state" role="status">Loading local geography…</div>:<svg className="map-svg" viewBox="0 0 1000 560" role="group" aria-label="Turkey, with 81 province boundaries and seven interactive service locations" onPointerDown={e=>{if((e.target as Element).closest('[data-marker]'))return;e.currentTarget.setPointerCapture(e.pointerId);setDrag({x:e.clientX,y:e.clientY,px:pan.x,py:pan.y});}} onPointerMove={e=>{if(drag&&zoom>1){const box=e.currentTarget.getBoundingClientRect();setPan({x:drag.px+(e.clientX-drag.x)*1000/box.width,y:drag.py+(e.clientY-drag.y)*560/box.height});}}} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}>
      <defs>
        <pattern id="map-grid" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M45 0H0V45" fill="none" stroke="#0870a3" strokeWidth=".5" opacity=".36"/></pattern>
        <filter id="cyan-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="node-glow" x="-250%" y="-250%" width="600%" height="600%"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="map-vignette"><stop offset="55%" stopColor="#020e19" stopOpacity="0"/><stop offset="100%" stopColor="#020e19" stopOpacity=".65"/></radialGradient>
        <clipPath id="turkey-clip">{geography.provinces.features.map((f,i)=><path key={i} d={path(f as never)??''}/>)}</clipPath>
      </defs>
      <g transform={`translate(${pan.x} ${pan.y}) translate(500 280) scale(${zoom}) translate(-500 -280)`}>
        <image href="/map/terrain.jpg" width="1000" height="560" opacity=".83"/>
        {geography.neighbors.features.map((f,i)=><path className={`neighbor ${f.properties.ADMIN==='Turkey'?'turkey-coast':''}`} key={i} d={path(f as never)??''}/>) }
        <rect width="1000" height="560" fill="url(#map-grid)"/>
        <g clipPath="url(#turkey-clip)"><rect width="1000" height="560" fill="#006ab5" opacity=".14"/><image href="/map/terrain.jpg" width="1000" height="560" opacity=".45"/></g>
        {geography.provinces.features.map((f,i)=><path key={i} className="province" d={path(f as never)??''}/>) }
        <g className="country-labels"><text x="52" y="73">BULGARIA</text><text x="879" y="99">GEORGIA</text><text x="905" y="173">ARMENIA</text><text x="957" y="345">IRAN</text><text x="862" y="499">IRAQ</text><text x="653" y="523">SYRIA</text></g>
        <g className="sea-labels"><text x="475" y="80">B L A C K  S E A</text><text x="40" y="433">AEGEAN</text><text x="58" y="457">SEA</text><text x="213" y="523">M E D I T E R R A N E A N  S E A</text></g>
        <g className="traffic-arcs">{smallNodes.filter((_,i)=>i%3===0).map((p,i)=>{const source=nodes[i%3].point;return <path key={i} d={`M${source[0]},${source[1]} Q${(source[0]+p[0])/2},${Math.min(source[1],p[1])-60-i%4*14} ${p[0]},${p[1]}`} fill="none" stroke="#2aa9ff" strokeWidth=".7" opacity=".45"/>;})}{nodes.slice(1).map((n,i)=>{const p=nodes[0].point;const d=`M${p[0]},${p[1]} Q${(p[0]+n.point[0])/2},${Math.min(p[1],n.point[1])-80} ${n.point[0]},${n.point[1]}`;return <g key={n.id}><path d={d} fill="none" stroke={n.severity==='Critical'?'#ff4058':n.severity==='High'?'#ffb642':'#00d8ff'} strokeWidth="1" opacity=".7"/><path className="moving-arc" d={d} fill="none" stroke="#b2f4ff" strokeWidth="1.5" strokeDasharray="2 130" style={{animationDelay:`-${i*1.3}s`}}/></g>;})}</g>
        <g filter="url(#cyan-glow)">{smallNodes.map((p,i)=><g key={i}><circle cx={p[0]} cy={p[1]} r={i%5===0?3:2} fill="#24dfff"/><circle cx={p[0]} cy={p[1]} r="7" fill="#00caff" opacity=".09"/></g>)}</g>
        <rect width="1000" height="560" fill="url(#map-vignette)" pointerEvents="none"/>
        {nodes.map(n=>{const color=n.severity==='Healthy'?'#00d8ff':colors[n.severity];const active=selected===n.id||(selected==='other'&&n.group==='other');return <g key={n.id} data-marker="true" role="button" tabIndex={0} aria-label={`${n.name}: ${n.severity==='Healthy'?'Normal':n.severity+' impact'}, ${n.local.length} active incidents, ${n.affected} affected ${data.people.toLowerCase()}`} aria-pressed={active} className="map-marker" onPointerEnter={()=>setHover(n.id)} onPointerLeave={()=>setHover('')} onFocus={()=>setHover(n.id)} onBlur={()=>setHover('')} onClick={()=>onSelect(selected===n.id?'':n.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(selected===n.id?'':n.id);}}} transform={`translate(${n.point[0]} ${n.point[1]})`}>
          <circle r="18" fill="transparent"/>{n.severity!=='Healthy'&&<><circle className="pulse-ring" r="21" fill="none" stroke={color} strokeWidth="1" opacity=".55"/><circle r="13" fill={color} opacity=".17"/></>}{active&&<circle r="25" stroke="#fff" strokeWidth="1.3" fill="none" strokeDasharray="4 3"/>}<circle r={n.severity==='Healthy'?5:8} fill={color} filter="url(#node-glow)"/><circle r={n.severity==='Healthy'?2:4} fill="#efffff"/><text x="15" y={n.id==='bursa'?17:-14} className="city-label">{n.name}</text>
        </g>;})}
      </g>
      <g className="geographic-scale" aria-label={`Map scale: approximately ${Math.round(250/zoom)} kilometers at 39 degrees north`}><path d="M820 530v7m0-3.5h136m-68-3.5v7m68-7v7" stroke="#80b3d4" strokeWidth="1" fill="none"/><text x="820" y="550">0</text><text x="888" y="550" textAnchor="middle">{Math.round(125/zoom)}</text><text x="956" y="550" textAnchor="end">{Math.round(250/zoom)} km</text></g>
    </svg>}
    {hovered&&<div className="map-tooltip" role="tooltip"><strong>{hovered.name}</strong><span>{hovered.local.length?data.services.find(s=>s.id===hovered.local[0].serviceId)?.name:'Regional service node'}</span><span style={{color:hovered.severity==='Healthy'?'#00d8ff':colors[hovered.severity]}}>{hovered.severity==='Healthy'?'Normal':hovered.severity+' impact'} · {hovered.local.length} active incidents</span><span>{formatNumber(hovered.affected)} affected {data.people.toLowerCase()}</span><small>Click to filter this region</small></div>}
    <div className="map-legend"><span><i style={{background:colors.Critical}}/>Critical impact</span><span><i style={{background:colors.High}}/>High impact</span><span><i style={{background:colors.Degraded}}/>Degraded</span><span><i style={{background:'#00d8ff'}}/>Normal</span></div>
    {data.industry!=='Telecom'&&<div className="location-legend"><strong>{data.industry==='Banking'?'FINANCIAL':'PUBLIC'} SERVICE LOCATIONS</strong>{data.locationTypes.map((t,i)=><span key={t}><b>{['●','▲','■','◆'][i]}</b>{t}</span>)}</div>}
    <div className="map-scale"><span>N</span><b>↑</b></div>
  </section>;
}
