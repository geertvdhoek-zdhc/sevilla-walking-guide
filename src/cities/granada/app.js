(()=>{
'use strict';
const routes=window.GRANADA_ROUTES||[];
const $=id=>document.getElementById(id);
if(!routes.length||!window.L){$('peekName').textContent='Kaart niet beschikbaar';return}
const map=L.map('map',{zoomControl:false,preferCanvas:true}).setView([37.178,-3.593],14);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
 maxZoom:19,attribution:'© OpenStreetMap-bijdragers'
}).addTo(map);
L.control.zoom({position:'topright'}).addTo(map);
let route=routes[0],active=0,markers=[],routeLine=null,watch=null,positionMarker=null;
const storageKey='granada-guide-visited-v1';
let visited=[];
try{visited=JSON.parse(localStorage.getItem(storageKey)||'[]');if(!Array.isArray(visited))visited=[]}catch{visited=[]}
const visitedSet=new Set(visited);
const selectedKey=idx=>route.id+':'+idx;
function persist(){try{localStorage.setItem(storageKey,JSON.stringify([...visitedSet]))}catch{}}
function iconFor(idx){
 const done=visitedSet.has(selectedKey(idx));
 const classes=['stop-marker',idx===active?'selected':'',done?'done':''].filter(Boolean).join(' ');
 return L.divIcon({className:'',html:'<div class="'+classes+'">'+(idx+1)+'</div>',iconSize:[32,32],iconAnchor:[16,16]});
}
function openSheet(open){
 $('sheet').classList.toggle('collapsed',!open);
 $('collapse').setAttribute('aria-expanded',String(open));
 $('chevron').textContent=open?'⌄':'⌃';
 requestAnimationFrame(()=>map.invalidateSize({pan:false}));
}
function repaintMarkers(){markers.forEach((m,i)=>m.setIcon(iconFor(i)))}
function renderList(){
 const container=$('stopList');container.replaceChildren();
 route.stops.forEach((s,idx)=>{
   const b=document.createElement('button');b.type='button';b.className=idx===active?'current':'';
   const n=document.createElement('span');n.className='num'+(visitedSet.has(selectedKey(idx))?' done':'');n.textContent=String(idx+1);
   const name=document.createElement('span');name.textContent=s.name;
   b.append(n,name);b.addEventListener('click',()=>{renderStop(idx,{expand:true,pan:true});$('listDetails').open=false});
   container.append(b);
 });
}
function renderStop(i,{expand=false,pan=false}={}){
 const count=route.stops.length;active=((i%count)+count)%count;const s=route.stops[active];
 $('routeLabel').textContent=route.label;
 $('peekName').textContent=(active+1)+'. '+s.name;
 $('stopCount').textContent='Halte '+(active+1)+' van '+count;
 $('stopName').textContent=s.name;
 $('kicker').textContent=s.kicker;
 $('story').textContent=s.story;
 $('tip').textContent=s.tip;
 $('tip').hidden=!s.tip;
 const done=visitedSet.has(selectedKey(active));
 $('visited').textContent=done?'✓ Bezocht':'Markeer bezocht';
 $('visited').classList.toggle('visited',done);
 $('directions').href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(s.lat.toFixed(6)+','+s.lng.toFixed(6))+'&travelmode=walking';
 repaintMarkers();renderList();
 if(expand)openSheet(true);
 if(pan){
   const shift=window.innerWidth<800&&expand?0.0016:0;
   map.setView([s.lat-shift,s.lng],Math.max(map.getZoom(),16),{animate:true});
 }
 $('content').scrollTop=0;
}
function fitRoute(){
 const coords=route.stops.map(s=>[s.lat,s.lng]);
 map.fitBounds(L.latLngBounds(coords).pad(.18),{animate:true,maxZoom:15,paddingTopLeft:[45,95],paddingBottomRight:[35,120]});
}
function setRoute(id){
 route=routes.find(r=>r.id===id)||routes[0];active=0;
 $('route').value=route.id;
 $('routeMeta').textContent=route.duration+' · '+route.stops.length+' haltes';
 $('routeIntro').textContent=route.intro;
 markers.forEach(m=>map.removeLayer(m));markers=[];
 if(routeLine){map.removeLayer(routeLine);routeLine=null}
 const coords=route.stops.map(s=>[s.lat,s.lng]);
 routeLine=L.polyline(coords,{color:'#396b73',weight:3,opacity:.72,dashArray:'5,9',interactive:false}).addTo(map);
 route.stops.forEach((s,idx)=>{
   const m=L.marker([s.lat,s.lng],{icon:iconFor(idx),keyboard:true,title:(idx+1)+'. '+s.name}).addTo(map);
   m.on('click',()=>renderStop(idx,{expand:true,pan:true}));markers.push(m);
 });
 $('listDetails').open=false;renderStop(0);openSheet(false);
 setTimeout(fitRoute,80);
}
$('route').addEventListener('change',e=>setRoute(e.target.value));
$('collapse').addEventListener('click',()=>openSheet($('sheet').classList.contains('collapsed')));
$('prev').addEventListener('click',()=>renderStop(active-1,{expand:true,pan:true}));
$('next').addEventListener('click',()=>renderStop(active+1,{expand:true,pan:true}));
$('fit').addEventListener('click',()=>{openSheet(false);fitRoute()});
$('visited').addEventListener('click',()=>{
 const k=selectedKey(active);if(visitedSet.has(k))visitedSet.delete(k);else visitedSet.add(k);
 persist();renderStop(active);
});
function status(message){const el=$('locStatus');el.textContent=message;el.style.display=message?'block':'none'}
function locationUpdate(pos){
 const latlng=[pos.coords.latitude,pos.coords.longitude];
 if(!positionMarker){
   positionMarker=L.circleMarker(latlng,{radius:9,color:'#fff',weight:3,fillColor:'#347bc7',fillOpacity:1}).addTo(map);
 }else positionMarker.setLatLng(latlng);
 $('locate').textContent='◎ GPS actief';status('Locatie bepaald. Blauwe stip = jij.');
}
$('locate').addEventListener('click',()=>{
 if(!navigator.geolocation){status('GPS is niet beschikbaar in deze browser.');return}
 if(watch!==null){
   navigator.geolocation.clearWatch(watch);watch=null;
   if(positionMarker){map.removeLayer(positionMarker);positionMarker=null}
   $('locate').textContent='◎ Mijn locatie';status('GPS uitgeschakeld.');return;
 }
 status('GPS-locatie ophalen…');
 watch=navigator.geolocation.watchPosition(locationUpdate,error=>{
   status('Locatie niet beschikbaar: '+error.message);
   if(error.code===1){navigator.geolocation.clearWatch(watch);watch=null;$('locate').textContent='◎ Mijn locatie'}
 },{enableHighAccuracy:true,maximumAge:10000,timeout:20000});
});
window.addEventListener('resize',()=>map.invalidateSize({pan:false}));
setRoute($('route').value);
})();