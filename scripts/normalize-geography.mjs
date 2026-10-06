import { readFile, writeFile } from 'node:fs/promises';
for(const file of ['turkey-provinces.geojson','surrounding-countries.geojson']){
  const filename=`public/map/${file}`;const data=JSON.parse(await readFile(filename,'utf8'));
  function polygon(rings){rings.forEach((ring,index)=>{let area=0;for(let i=0;i<ring.length-1;i++)area+=ring[i][0]*ring[i+1][1]-ring[i+1][0]*ring[i][1];if((index===0&&area>0)||(index>0&&area<0))ring.reverse();});}
  for(const f of data.features){if(f.geometry.type==='Polygon')polygon(f.geometry.coordinates);else if(f.geometry.type==='MultiPolygon')f.geometry.coordinates.forEach(polygon);}
  await writeFile(filename,JSON.stringify(data));
}
console.log('Normalized polygon winding for D3 spherical geometry.');
