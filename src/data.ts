export type Industry = 'Telecom' | 'Banking' | 'Government';
export type Health = 'Healthy' | 'Degraded' | 'Critical' | 'Maintenance';
export type Severity = 'Critical' | 'High';
export type Workflow = 'Investigating' | 'Mitigating' | 'Resolved';
export type Range = '6h' | '24h' | '7d';
export interface Region { id: string; name: string; coordinates: [number, number]; group: string }
export interface Service { id: string; name: string; health: Health; icon: string }
export interface Incident { id: string; industry: Industry; summary: string; description: string; severity: Severity; serviceId: string; regionId: string; openedAt: number; status: Workflow; relatedServiceIds: string[]; events: {at: number; text: string}[] }
export interface ImpactRecord { personId: string; serviceId: string; regionId: string; incidentId: string; startedAt: number; endedAt?: number }
export interface TimelineEvent { id: string; incidentId: string; regionId: string; at: number; text: string; severity: Severity }
export interface MetricPoint { at: number; primary: number; secondary: number; latency: number; error: number }
export interface SectorData { industry: Industry; availability: number; people: string; trend: string; performance: string; series: [string,string]; unit: string; services: Service[]; incidents: Incident[]; impacts: ImpactRecord[]; events: TimelineEvent[]; locationTypes: string[]; updatedAt: number }
export const regions: Region[] = [
  {id:'istanbul',name:'Istanbul',coordinates:[28.9784,41.0082],group:'istanbul'},
  {id:'ankara',name:'Ankara',coordinates:[32.8597,39.9334],group:'ankara'},
  {id:'izmir',name:'Izmir',coordinates:[27.1428,38.4237],group:'izmir'},
  {id:'bursa',name:'Bursa',coordinates:[29.061,40.195],group:'bursa'},
  {id:'antalya',name:'Antalya',coordinates:[30.7133,36.8969],group:'other'},
  {id:'adana',name:'Adana',coordinates:[35.3213,37.0],group:'other'},
  {id:'diyarbakir',name:'Diyarbakir',coordinates:[40.2306,37.9144],group:'other'},
];
export const colors = { Healthy:'#16d6a2', Degraded:'#ffc43d', Critical:'#ff4058', Maintenance:'#83aecd', High:'#ff993d' };
export const rangeLabels: Record<Range,string> = {'6h':'Last 6 Hours','24h':'Last 24 Hours','7d':'Last 7 Days'};
export const rangeMs: Record<Range,number> = {'6h':21600000,'24h':86400000,'7d':604800000};
export const formatNumber = (n: number) => n.toLocaleString('en-US');
export const serviceFamily = (name: string) => name.replace(/\s\d+$/, '');
export const formatTime = (at: number) => new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit'}).format(at);
export function countUniquePeople(records: readonly ImpactRecord[]) { return new Set(records.map(r=>r.personId)).size; }
export function aggregateByRegion(records: readonly ImpactRecord[]) {
  return ['istanbul','ankara','izmir','bursa','other'].map(id => ({id,name:id==='other'?'Other':regions.find(r=>r.id===id)!.name,value:countUniquePeople(records.filter(r=>(regions.find(g=>g.id===r.regionId)?.group??r.regionId)===id))}));
}
export function overlapFixture(): ImpactRecord[] {
  return ['A','B'].flatMap((serviceId,s)=>Array.from({length:120},(_,i)=>({personId:`person-${i+s*60}`,serviceId,regionId:i+s*60<90?'istanbul':'ankara',incidentId:`incident-${serviceId}`,startedAt:0})));
}
const configs = {
  Telecom:{availability:99.92,people:'Subscribers',trend:'Traffic Trend',performance:'Service Performance',series:['Mobile Data','Voice'],unit:'Gbps',counts:[82,10,6],incidentCount:12,regional:[12480,4320,3860,2110,1410],names:['Mobile Network','Identity Service','Messaging','API Gateway','Core Network'],icons:['radio','database','mail','settings','network'],summaries:['Mobile network degradation','Identity authentication disruption','Messaging delivery failures','API response errors','Mobile network outage'],types:['Network sites','Regional nodes','Data centers']},
  Banking:{availability:99.98,people:'Customers',trend:'Transaction Trend',performance:'Payment Performance',series:['Successful transactions','Failed transactions'],unit:'transactions / interval',counts:[9,2,1],incidentCount:8,regional:[8420,4210,2980,1860,950],names:['Payment Gateway','Card Authorization','Mobile Banking','Identity Service','Core Banking','ATM Network'],icons:['credit','shield','phone','fingerprint','database','bank'],summaries:['Payment processing timeouts','Card authorization failures','Mobile banking disruption','Identity authentication delays','Payment routing degradation'],types:['Bank branches','ATMs','Data centers','Partner integrations']},
  Government:{availability:99.95,people:'Citizens',trend:'Citizen Request Trend',performance:'Service Performance',series:['Completed requests','Failed requests'],unit:'requests / interval',counts:[20,3,1],incidentCount:6,regional:[18240,6400,3100,2000,3100],names:['Identity Service','Citizen Portal','Tax Services','Municipality API','Health Portal','Education Portal'],icons:['fingerprint','monitor','file','bank','heart','graduation'],summaries:['Identity authentication disruption','Citizen portal errors','Tax submission delays','Municipality API degradation','Regional authentication delays'],types:['Citizen service locations','Identity services','Municipal services','Data centers']},
} as const;
export interface DataProvider { load(industry: Industry): Promise<SectorData>; metrics(industry: Industry, range: Range, anchor: number, region?: string): MetricPoint[] }
export class DemoDataProvider implements DataProvider {
  private cache = new Map<Industry,SectorData>();
  async load(industry: Industry): Promise<SectorData> {
    if(this.cache.has(industry)) return this.cache.get(industry)!;
    const c=configs[industry]; const now=Math.floor(Date.now()/60000)*60000;
    const total=c.counts.reduce((a,b)=>a+b,0);
    const services: Service[]=Array.from({length:total},(_,i)=>({id:`${industry.toLowerCase()}-service-${i}`,name:i<c.names.length?c.names[i]:`${c.names[i%c.names.length]} ${String(Math.floor(i/c.names.length)+1).padStart(2,'0')}`,icon:c.icons[i%c.icons.length],health:i<c.counts[2]?'Critical':i<c.counts[2]+c.counts[1]?'Degraded':'Healthy'}));
    // Keep key services representative while retaining the exact catalog totals.
    if(industry==='Telecom') {services.forEach((s,i)=>s.health=[0,5,17,18,19,20].includes(i)?'Critical':[1,2,3,6,7,8,9,10,11,12].includes(i)?'Degraded':'Healthy');}
    if(industry==='Government') {services[4].health='Healthy'; services[5].health='Healthy';}
    const sequence=['istanbul','ankara','izmir','bursa','diyarbakir','antalya','adana'];
    const incidents: Incident[]=Array.from({length:c.incidentCount},(_,i)=>{
      const indexes=industry==='Telecom'?[0,1,2,3,5,6,7,8,17,18,19,20]:industry==='Banking'?[0,1,2,1,0,1,2,0]:[0,1,2,3,0,1];
      const service=services[indexes[i]];
      const openedAt=now-(30+i*22)*60000;
      const severity:Severity=service.health==='Critical'?'Critical':'High';
      const family=serviceFamily(service.name);const familyIndex=c.names.findIndex(name=>name===family);
      const summary=industry==='Telecom'&&family==='Core Network'?'Core network routing degradation':industry==='Telecom'&&i===4?'Mobile network outage':c.summaries[Math.min(familyIndex,c.summaries.length-1)];
      return {id:`${industry.slice(0,3).toUpperCase()}-${3482-i}`,industry,summary,description:`Elevated errors detected in ${service.name} at the ${regions.find(r=>r.id===sequence[i%7])!.name} demo service location. The response team is investigating downstream dependencies and routing affected requests through alternate capacity.`,severity,serviceId:service.id,regionId:sequence[i%7],openedAt,status:'Investigating',relatedServiceIds:[services[(familyIndex+1)%c.names.length].id],events:[{at:openedAt,text:'Automated threshold exceeded; incident opened.'},{at:openedAt+10*60000,text:'Response team acknowledged the incident.'},{at:Math.min(now,openedAt+20*60000),text:'Alternate routing enabled; investigation continues.'}]};
    });
    // The sixth government incident covers both remaining demo locations; Adana is healthy.
    const impacts: ImpactRecord[]=[];
    const groupedRegions=[['istanbul'],['ankara'],['izmir'],['bursa'],['diyarbakir','antalya','adana']];
    c.regional.forEach((amount,g)=>{
      for(let i=0;i<amount;i++){
        const regionId=groupedRegions[g][i%groupedRegions[g].length];
        const candidates=incidents.filter(n=>n.regionId===regionId);
        if(!candidates.length) { // People in Adana share the Antalya regional service incident.
          const incident=incidents.find(n=>n.regionId==='antalya')??incidents[4];
          impacts.push({personId:`${industry}-${g}-${i}`,regionId,serviceId:incident.serviceId,incidentId:incident.id,startedAt:incident.openedAt});
          continue;
        }
        const incident=candidates[i%candidates.length];
        const record={personId:`${industry}-${g}-${i}`,regionId,serviceId:incident.serviceId,incidentId:incident.id,startedAt:incident.openedAt};
        impacts.push(record);
        if(i%4===0) {const other=candidates.find(n=>n.serviceId!==incident.serviceId); if(other) impacts.push({...record,serviceId:other.serviceId,incidentId:other.id,startedAt:other.openedAt});}
      }
    });
    // Guaranteed overlapping audiences in every sector, assigned to a real related service.
    for(let i=0;i<Math.min(600,impacts.length);i+=3){const r=impacts[i];const incident=incidents.find(n=>n.id===r.incidentId)!;const serviceId=incident.relatedServiceIds[0];if(serviceId!==r.serviceId&&!impacts.some(p=>p.personId===r.personId&&p.serviceId===serviceId)) impacts.push({...r,serviceId});}
    const events=incidents.slice(0,6).reverse().map(n=>({id:`event-${n.id}`,incidentId:n.id,regionId:n.regionId,at:n.openedAt+10*60000,text:n.summary,severity:n.severity}));
    const data:SectorData={industry,availability:c.availability,people:c.people,trend:c.trend,performance:c.performance,series:[...c.series],unit:c.unit,services,incidents,impacts,events,locationTypes:[...c.types],updatedAt:now};
    this.cache.set(industry,data);return data;
  }
  metrics(industry: Industry, range: Range, anchor: number, region?: string): MetricPoint[] {
    const count=range==='7d'?84:48;const sector=industry==='Telecom'?0:industry==='Banking'?1:2;
    const factor=region?({istanbul:.52,ankara:.18,izmir:.16,bursa:.09}[region]??.05):1;
    return Array.from({length:count},(_,i)=>{
      const t=i/(count-1),wave=Math.sin(t*Math.PI*2-2),noise=Math.sin(i*2.6)*3+Math.cos(i*1.7)*2;
      const bump=Math.exp(-Math.pow((t-.69)/.045,2));
      const interpolate=(values:number[])=>{const position=t*(values.length-1),index=Math.min(values.length-2,Math.floor(position)),fraction=position-index;return values[index]*(1-fraction)+values[index+1]*fraction;};
      let primary=sector===0?interpolate([72,48,76,110,118,150,159,142])+noise*(1-t):sector===1?12000+(wave+1)*12000+noise*350:50000+(wave+1)*67000+noise*1900;
      let secondary=sector===0?interpolate([40,24,34,59,48,74,79,68])+noise/2*(1-t):primary*(sector===1?.015:.12)+Math.max(0,noise)*120;
      const latency=sector===0?38+9*t+noise+115*bump:sector===1?700+350*t+noise*8+720*bump:240+100*t+noise*8+500*bump;
      const error=(sector===0?.2:sector===1?.8:.6)+(sector===0?1.6:sector===1?8:5.5)*bump+Math.abs(noise)*.03+t*.12;
      return {at:anchor-rangeMs[range]+i*rangeMs[range]/(count-1),primary:Math.round(primary*factor),secondary:Math.round(secondary*factor),latency:Math.round(latency),error:Math.round(error*100)/100};
    });
  }
}
export const provider = new DemoDataProvider();
