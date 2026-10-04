import { getChatGPTUser } from '../../chatgpt-auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in to get the forecast.'},{status:401});
 const city=new URL(request.url).searchParams.get('city')?.trim()||'';
 if(city.length<2||city.length>100)return Response.json({error:'Enter a city or town name.'},{status:400});
 try{
  const geoURL=new URL('https://geocoding-api.open-meteo.com/v1/search');geoURL.search=new URLSearchParams({name:city,count:'1',language:'en',format:'json'}).toString();
  const geo=await fetch(geoURL,{signal:AbortSignal.timeout(10000)});if(!geo.ok)throw new Error('Geocoding unavailable');const result=await geo.json() as {results?:{name:string;admin1?:string;country:string;latitude:number;longitude:number;timezone:string}[]};const place=result.results?.[0];if(!place)return Response.json({error:'No location found. Try the city name without a street address.'},{status:404});
  const url=new URL('https://api.open-meteo.com/v1/forecast');url.search=new URLSearchParams({latitude:String(place.latitude),longitude:String(place.longitude),hourly:'temperature_2m,weather_code',forecast_days:'16',timezone:'auto'}).toString();const response=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error('Forecast unavailable');const forecast=await response.json() as {timezone:string;hourly:{time:string[];temperature_2m:number[];weather_code:number[]}};
  if(!Array.isArray(forecast.hourly?.time))throw new Error('Invalid forecast');
  return Response.json({location:[place.name,place.admin1,place.country].filter(Boolean).join(', '),timezone:forecast.timezone,fetchedAt:new Date().toISOString(),hourly:forecast.hourly},{headers:{'Cache-Control':'private, max-age=600'}});
 }catch{return Response.json({error:'The forecast is unavailable right now. You can still plan using manual weather.'},{status:503});}
}
