import { z } from 'zod';
export const occasions={casual:'Casual / brunch',work:'Office / meeting',celebration:'Celebration',wedding:'Wedding',blacktie:'Black tie',active:'Workout',home:'At home',sleep:'Bedtime'};
export const categories={top:'Top',bottom:'Bottom',onepiece:'One-piece',set:'Matching set',layer:'Layer'};
export const sections={everyday:'Everyday',home:'Homewear',sleep:'Nightwear'};
export const colourHex={Ivory:'#e5decb',White:'#f2f1ed',Navy:'#354158',Black:'#292d2c',Beige:'#baa58b',Olive:'#758166',Blue:'#819db8',Pink:'#bf8e97',Green:'#548269',Grey:'#919692',Rust:'#aa7556',Purple:'#8e78a1',Red:'#b6564f',Yellow:'#d5b760',Multi:'#a3a3a3'};
export const fabrics=['Cotton','Linen','Denim','Wool','Fleece','Silk / delicate','Synthetic','Blend'] as const;
export type Occasion=keyof typeof occasions;
export type Category=keyof typeof categories;
export type Section=keyof typeof sections;
export const dayString=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const addDays=(s:string,n:number)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return dayString(d);};
export const niceDate=(s:string)=>new Date(s+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
export const dateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&dayString(new Date(v+'T12:00:00'))===v,'Choose a valid date');
export const planSchema=z.object({occasion:z.enum(['casual','work','celebration','wedding','blacktie','active','home','sleep']),date:dateSchema,time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),days:z.coerce.number().int().min(1).max(30),location:z.string().trim().min(2).max(100),setting:z.enum(['city','coast','hills','indoor']),weather:z.enum(['sunny','cloudy','rain','snow']),temp:z.coerce.number().min(-20).max(50),preference:z.enum(['any','pair','onepiece']),reuse:z.boolean().default(true)});
export type Plan=z.infer<typeof planSchema>;
export const newPlan=():Plan=>({occasion:'casual',date:dayString(),time:'12:30',days:1,location:'',setting:'city',weather:'sunny',temp:26,preference:'any',reuse:true});
export const garmentSchema=z.object({id:z.string().min(1).max(100),name:z.string().trim().min(1).max(70),section:z.enum(['everyday','home','sleep']),category:z.enum(['top','bottom','onepiece','set','layer']),type:z.string().trim().min(1).max(40),colour:z.enum(Object.keys(colourHex) as [keyof typeof colourHex,...(keyof typeof colourHex)[]]),size:z.string().trim().min(1).max(25),brand:z.string().trim().max(40),condition:z.enum(['new','worn']),fabric:z.enum(fabrics),occasions:z.array(z.enum(['casual','work','celebration','wedding','blacktie','active','home','sleep'])).min(1),minTemp:z.coerce.number().min(-20).max(50),maxTemp:z.coerce.number().min(-20).max(50),favorite:z.boolean(),available:z.boolean(),createdAt:z.string()}).refine(g=>g.minTemp<=g.maxTemp,{message:'The minimum temperature must not exceed the maximum.',path:['minTemp']});
export type Garment=z.infer<typeof garmentSchema>&{photo:Blob|null};
export type Measurement={id:string;date:string;chest:number;waist:number;hips:number;height:number|null;inseam:number|null;note:string};
export const measurementSchema=z.object({id:z.string(),date:dateSchema,chest:z.coerce.number().min(20).max(250),waist:z.coerce.number().min(20).max(250),hips:z.coerce.number().min(20).max(250),height:z.number().min(50).max(250).nullable(),inseam:z.number().min(10).max(150).nullable(),note:z.string().max(150)});
export type Idea={name:string;category:Category;colour:keyof typeof colourHex;reason:string};
export type SavedLook={id:string;date:string;plan:Plan;garmentIds:string[];ideas:Idea[];createdAt:string};
export type Profile={id:string;name:string;garments:Garment[];measurements:Measurement[];saved:SavedLook[]};
export type AccountData={version:1;profiles:Profile[];activeProfileId:string;revision:number};
export type Forecast={location:string;timezone:string;fetchedAt:string;hourly:{time:string[];temperature_2m:number[];weather_code:number[]}};
export type DayLook={date:string;pieces:Garment[];ideas:Idea[];temp:number;weather:Plan['weather'];source:'forecast'|'manual';rewear:string[];reasons:string[]};
export const createProfile=(name:string):Profile=>({id:crypto.randomUUID(),name,garments:[],measurements:[],saved:[]});
export function conditions(plan:Plan,forecast:Forecast|null,date:string){
 const hour=plan.time.slice(0,2)+':00';const index=forecast?.hourly.time.indexOf(date+'T'+hour)??-1;
 if(forecast&&index>=0&&Number.isFinite(forecast.hourly.temperature_2m[index])&&Number.isFinite(forecast.hourly.weather_code[index])){const code=forecast.hourly.weather_code[index];return {temp:Math.round(forecast.hourly.temperature_2m[index]),weather:(code>=71&&code<=77||code===85||code===86?'snow':code>=51?'rain':code>1?'cloudy':'sunny') as Plan['weather'],source:'forecast' as const};}
 return {temp:plan.temp,weather:plan.weather,source:'manual' as const};
}
export function outfitIdeas(p:Plan):Idea[]{
 const chilly=p.temp<18;const fabric=p.temp>=26||p.setting==='coast'?'Breathable cotton or linen':'Choose a fabric comfortable at '+p.temp+'°C';
 if(p.occasion==='home'||p.occasion==='sleep')return [{name:chilly?'Warm matching lounge set':'Soft cotton pyjama or lounge set',category:'set',colour:'Grey',reason:chilly?'An insulating fabric for cooler temperatures.':'A relaxed fit for comfort at home.'}];
 let looks:Idea[];
 if(p.preference==='onepiece')looks=[{name:p.occasion==='blacktie'?'Formal evening dress':p.occasion==='wedding'?'Occasion dress or traditional one-piece':p.occasion==='work'?'Tailored day dress':'Comfortable day dress',category:'onepiece',colour:p.occasion==='blacktie'?'Black':'Navy',reason:fabric}];
 else looks=[{name:p.occasion==='blacktie'?'Formal dress shirt':p.occasion==='active'?'Moisture-wicking training top':['wedding','celebration'].includes(p.occasion)?'Occasion kurta or dressy top':p.occasion==='work'?'Smart cotton shirt':'Relaxed linen or cotton top',category:'top',colour:'Ivory',reason:fabric},{name:p.occasion==='blacktie'?'Matching formal trousers':p.occasion==='active'?'Comfortable training bottoms':['wedding','celebration'].includes(p.occasion)?'Coordinating occasion trousers':'Tailored trousers or easy chinos',category:'bottom',colour:p.occasion==='blacktie'?'Black':'Navy',reason:'A neutral colour to pair with the top.'}];
 if(p.occasion==='blacktie'&&p.preference!=='onepiece')looks.push({name:'Matching dinner jacket',category:'layer',colour:'Black',reason:'Complete with the accessories required by the dress code.'});
 else if(chilly)looks.push({name:'Warm outer layer',category:'layer',colour:'Grey',reason:'Add insulation for the cooler conditions.'});
 if(p.weather==='rain'||p.weather==='snow')looks.push({name:p.weather==='snow'?'Insulated weatherproof coat':'Light rain shell',category:'layer',colour:'Navy',reason:'Choose outerwear suited to the weather.'});
 return looks;
}
function candidates(garments:Garment[],p:Plan,date:string):Garment[][]{
 const section:Section=p.occasion==='home'?'home':p.occasion==='sleep'?'sleep':'everyday';
 const suitable=garments.filter(g=>g.available&&g.section===section&&g.occasions.includes(p.occasion)&&g.maxTemp>=p.temp&&!(p.weather==='rain'&&g.fabric==='Silk / delicate'));
 const layers=suitable.filter(g=>g.category==='layer'&&g.minTemp<=p.temp);
 const weekend=[0,6].includes(new Date(date+'T12:00:00').getDay());const evening=Number(p.time.slice(0,2))>=17;
 const score=(gs:Garment[])=>gs.reduce((s,g)=>s+(g.favorite?3:0)+(['Cotton','Linen'].includes(g.fabric)&&(p.setting==='coast'||p.temp>=26)?3:0)+(evening?['Black','Navy','Rust','Olive'].includes(g.colour)?2:0:['White','Ivory','Beige','Blue'].includes(g.colour)?2:0)+(weekend&&p.occasion==='casual'&&/tee|t-shirt|jeans|dress/i.test(g.type)?1:0),0)+(gs.length>1&&gs[0].colour!==gs[1].colour?2:0);
 const list:Garment[][]=[];
 function add(gs:Garment[]){if(gs.some(g=>g.minTemp>p.temp)){if(!layers.length||p.temp<gs[0].minTemp-15)return;gs=[...gs,layers[0]];}else if(p.setting==='hills'&&p.temp<20&&layers.length)gs=[...gs,layers[0]];list.push(gs);}
 if(p.preference!=='pair')suitable.filter(g=>['onepiece','set'].includes(g.category)).forEach(g=>add([g]));
 if(p.preference!=='onepiece')for(const top of suitable.filter(g=>g.category==='top'))for(const bottom of suitable.filter(g=>g.category==='bottom'&&g.minTemp<=p.temp))add([top,bottom]);
 return list.sort((a,b)=>score(b)-score(a));
}
export function buildTrip(garments:Garment[],p:Plan,forecast:Forecast|null,rotation=0):DayLook[]{
 const counts=new Map<string,number>();const days:DayLook[]=[];
 for(let i=0;i<p.days;i++){
  const date=addDays(p.date,i),weather=conditions(p,forecast,date),context={...p,...weather};let list=candidates(garments,context,date);
  if(!p.reuse)list=list.filter(gs=>gs.every(g=>g.category==='layer'||!counts.has(g.id)));
  if(list.length){const r=rotation%list.length;list=[...list.slice(r),...list.slice(0,r)];list.sort((a,b)=>a.reduce((n,g)=>n+(g.category==='layer'?0:counts.get(g.id)||0),0)-b.reduce((n,g)=>n+(g.category==='layer'?0:counts.get(g.id)||0),0));}
  const pieces=list[0]||[];const rewear=pieces.filter(g=>counts.has(g.id)).map(g=>g.name);pieces.forEach(g=>counts.set(g.id,(counts.get(g.id)||0)+1));
  const weekend=[0,6].includes(new Date(date+'T12:00:00').getDay());const evening=Number(p.time.slice(0,2))>=17;
  const reasons=pieces.length?[`${occasions[p.occasion]} tags match on every piece.`,`${weather.temp}°C, ${weather.weather} · ${pieces.some(g=>g.category==='layer')?'a layer completes the outfit':'within the chosen comfort ranges'}.`,`${weekend?'Weekend':'Weekday'} ${evening?'evening: deeper colours get priority.':'daytime: lighter colours get priority.'}`,p.setting==='coast'?'Breathable fabrics get priority for the coast.':p.setting==='hills'?'Layering gets priority for cooler hills.':p.setting==='indoor'?'Use your expected indoor temperature.':'Pairing suited to your city plans.']:['No complete outfit matches all your choices.',!p.reuse?'New pieces may be needed because rewear is switched off.':'Add suitable pieces or adjust the occasion and conditions.'];
  days.push({date,pieces,ideas:pieces.length?[]:outfitIdeas(context),...weather,rewear,reasons});
 }
 return days;
}
