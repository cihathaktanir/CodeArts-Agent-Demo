import sharp from 'sharp';
import {geoMercator} from 'd3-geo';
const source='.asset-source/terrain-source/NE2_50M_SR_W/NE2_50M_SR_W.tif';
const projection=geoMercator().center([35.5,39]).scale(2700).translate([500,280]);
const [west,north]=projection.invert([0,0]); const [east,south]=projection.invert([1000,560]);
const {width,height}=await sharp(source).metadata();
const left=Math.floor((west+180)/360*width),top=Math.floor((90-north)/180*height);
const w=Math.ceil((east-west)/360*width),h=Math.ceil((north-south)/180*height);
const {data,info}=await sharp(source).extract({left,top,width:w,height:h}).resize(1000,700).removeAlpha().raw().toBuffer({resolveWithObject:true});
const output=Buffer.alloc(1000*560*3);
for(let y=0;y<560;y++){
  const lat=projection.invert([500,y])[1];const row=Math.min(699,Math.max(0,Math.round((north-lat)/(north-south)*699)));
  for(let x=0;x<1000;x++){
    const index=(row*1000+x)*info.channels, dest=(y*1000+x)*3;
    const r=data[index],g=data[index+1],b=data[index+2];
    const water=b>r*1.05&&b>g*.98;
    const l=(r*.25+g*.55+b*.2)/255;
    const v=Math.pow(Math.max(0,(l-.18)/.82),1.8);
    output[dest]=water?2:Math.round(2+v*13);
    output[dest+1]=water?16:Math.round(17+v*60);
    output[dest+2]=water?29:Math.round(29+v*86);
  }
}
await sharp(output,{raw:{width:1000,height:560,channels:3}}).jpeg({quality:92}).toFile('public/map/terrain.jpg');
console.log('Prepared projected, locally stored Natural Earth shaded relief.');
