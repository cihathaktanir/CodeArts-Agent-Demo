import { describe, it, expect } from 'vitest';
import { countUniquePeople, overlapFixture, aggregateByRegion, DemoDataProvider, regions } from './data';
describe('Unique-person impact aggregation',()=>{
  it('deduplicates 60 shared people across two 120-person audiences',()=>{
    const fixture=overlapFixture();expect(fixture).toHaveLength(240);expect(countUniquePeople(fixture)).toBe(180);
    expect(countUniquePeople(fixture.filter(r=>r.serviceId==='A'))).toBe(120);expect(countUniquePeople(fixture.filter(r=>r.serviceId==='B'))).toBe(120);
    expect(aggregateByRegion(fixture).reduce((sum,r)=>sum+r.value,0)).toBe(180);
  });
  it('handles empty and repeated records',()=>{expect(countUniquePeople([])).toBe(0);const r=overlapFixture()[0];expect(countUniquePeople([r,r,r])).toBe(1);});
});
describe('Sector consistency',()=>{
  for(const [industry,total,counts,people] of [['Telecom',12,[82,10,6],24180],['Banking',8,[9,2,1],18420],['Government',6,[20,3,1],32840]] as const){
    it(`${industry} reconciles services, incidents, people and regions`,async()=>{
      const d=await new DemoDataProvider().load(industry);expect(d.incidents).toHaveLength(total);
      ['Healthy','Degraded','Critical'].forEach((h,i)=>expect(d.services.filter(s=>s.health===h)).toHaveLength(counts[i]));
      expect(countUniquePeople(d.impacts)).toBe(people);expect(d.impacts.length).toBeGreaterThan(people);
      expect(aggregateByRegion(d.impacts).reduce((a,r)=>a+r.value,0)).toBe(people);
      for(const r of d.impacts){expect(d.incidents.some(n=>n.id===r.incidentId)).toBe(true);expect(d.services.some(s=>s.id===r.serviceId)).toBe(true);expect(regions.some(g=>g.id===r.regionId)).toBe(true);}
      expect(d.events.every(e=>d.incidents.some(n=>n.id===e.incidentId&&n.regionId===e.regionId))).toBe(true);
    });
  }
  it('produces deterministic metrics and range endpoints',()=>{
    const p=new DemoDataProvider();const a=p.metrics('Telecom','6h',100000000);expect(a).toEqual(p.metrics('Telecom','6h',100000000));expect(a.at(-1)!.primary).toBe(142);expect(a.at(-1)!.at-a[0].at).toBe(21600000);
  });
});
