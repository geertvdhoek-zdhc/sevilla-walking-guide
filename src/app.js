const $ = (s) => document.querySelector(s);
const mapEl = $('#map');
const offlineBadge = $('#offlineBadge');
const gpsButton = $('#gpsButton');
const recenterButton = $('#recenterButton');
const closeOnboarding = $('#closeOnboarding');
const onboarding = $('#onboarding');
const stopMeta = $('#stopMeta');
const stopTitle = $('#stopTitle');
const stopBlurb = $('#stopBlurb');
const distanceRow = $('#distanceRow');
const audio = $('#audio');
const playButton = $('#playButton');
const restartButton = $('#restartButton');
const seek = $('#seek');
const time = $('#time');
const transcript = $('#transcript');
const visitedButton = $('#visitedButton');
const prevButton = $('#prevButton');
const nextButton = $('#nextButton');

let stops = [];
let selected = Number(localStorage.getItem('selectedStop') || 0);
let visited = new Set(JSON.parse(localStorage.getItem('visitedStops') || '[]'));
let markerByIndex = new Map();
let userLatLng = null;
let userMarker = null;
let accuracyCircle = null;
let watchId = null;
let followMode = true;

const map = L.map(mapEl, { zoomControl: false, attributionControl: true, minZoom: 14, maxZoom: 19 });
L.control.zoom({ position: 'bottomleft' }).addTo(map);
map.attributionControl.setPrefix(false);
map.attributionControl.addAttribution('© OpenStreetMap contributors');

const roadLayer = L.geoJSON(null, {
  style: feature => {
    const p = feature.properties || {};
    if (p.kind === 'building') return { color:'#cfc3b8', weight:.7, fillColor:'#dfd5ca', fillOpacity:.52 };
    if (p.kind === 'green') return { color:'#b8c9ae', weight:.7, fillColor:'#d8e4d1', fillOpacity:.65 };
    if (p.kind === 'water') return { color:'#9abaca', weight:2.2, fillColor:'#c9e1eb', fillOpacity:.65 };
    const hw = p.highway || '';
    const widths = {primary:4.2,secondary:3.7,tertiary:3.2,residential:2.3,pedestrian:2.8,living_street:2.5,footway:1.7,path:1.5,service:1.2,steps:1.3};
    const weight = widths[hw] || 1.7;
    const color = ['footway','path','steps','pedestrian'].includes(hw) ? '#c2a98f' : '#b5aaa0';
    return { color, weight, opacity:.92, lineCap:'round', lineJoin:'round' };
  },
  onEachFeature: (feature, layer) => {
    const p = feature.properties || {};
    if (p.kind === 'road' && p.name && ['primary','secondary','tertiary','pedestrian'].includes(p.highway)) {
      layer.bindTooltip(p.name, {permanent:false,sticky:true,direction:'top',className:'street-label',opacity:.78});
    }
  }
}).addTo(map);

const routeMain = L.geoJSON(null, {style:{color:'#d96b32',weight:6,opacity:.95,lineCap:'round',lineJoin:'round'}}).addTo(map);
const routeOptional = L.geoJSON(null, {style:{color:'#7d6788',weight:5,opacity:.78,dashArray:'8 8',lineCap:'round'}}).addTo(map);

function haversine(a,b){
  const R=6371000, rad=Math.PI/180;
  const dLat=(b.lat-a.lat)*rad, dLon=(b.lng-a.lng)*rad;
  const la1=a.lat*rad, la2=b.lat*rad;
  const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function fmtDistance(m){ return m<1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`; }
function fmtTime(sec){ if(!Number.isFinite(sec)) return '0:00'; const m=Math.floor(sec/60),s=Math.floor(sec%60); return `${m}:${String(s).padStart(2,'0')}`; }

function markerHtml(i){
  const classes=['tour-marker'];
  if(i===selected) classes.push('selected');
  if(visited.has(i)) classes.push('done');
  if(stops[i]?.optional) classes.push('optional');
  return `<div class="${classes.join(' ')}">${i+1}</div>`;
}
function refreshMarkers(){
  for(const [i,m] of markerByIndex){ m.setIcon(L.divIcon({className:'',html:markerHtml(i),iconSize:[30,30],iconAnchor:[15,15]})); }
}
function selectStop(i, pan=true){
  if(!stops.length) return;
  selected=Math.max(0,Math.min(stops.length-1,i));
  localStorage.setItem('selectedStop',selected);
  const s=stops[selected];
  stopMeta.textContent = s.optional ? `OPTIONEEL · STOP ${selected+1}` : `STOP ${selected+1} VAN 6`;
  stopTitle.textContent=s.title;
  stopBlurb.textContent=s.blurb;
  transcript.textContent=s.transcript;
  if(audio.src !== new URL(s.audio, location.href).href){ audio.pause(); audio.src=s.audio; playButton.textContent='▶'; seek.value=0; }
  visitedButton.textContent=visited.has(selected)?'Bezocht ✓':'Markeer bezocht';
  visitedButton.classList.toggle('done',visited.has(selected));
  prevButton.disabled=selected===0;
  nextButton.disabled=selected===stops.length-1;
  if(pan) map.panTo([s.lat,s.lng],{animate:true});
  refreshMarkers();
  updateDistance();
}
function updateDistance(){
  if(!userLatLng || !stops[selected]){ distanceRow.textContent=''; return; }
  const s=stops[selected], d=haversine(userLatLng,{lat:s.lat,lng:s.lng});
  distanceRow.textContent = d <= 60 ? `Je bent bij deze stop · ${fmtDistance(d)}` : `${fmtDistance(d)} hemelsbreed vanaf je positie`;
  markerByIndex.forEach((m,i)=>{
    const st=stops[i], near=haversine(userLatLng,{lat:st.lat,lng:st.lng})<=60;
    const el=m.getElement()?.firstElementChild;
    if(el) el.style.boxShadow=near?'0 0 0 6px rgba(217,107,50,.24),0 2px 8px rgba(40,30,20,.25)':'';
  });
}

async function init(){
  const [stopRes,mapRes,routeRes]=await Promise.all([
    fetch('./data/stops.json'),fetch('./data/map.geojson'),fetch('./data/route.geojson')
  ]);
  if(!stopRes.ok||!mapRes.ok||!routeRes.ok) throw new Error('Lokale gidsdata kon niet worden geladen.');
  stops=await stopRes.json();
  const mapData=await mapRes.json(), routeData=await routeRes.json();
  roadLayer.addData(mapData);
  routeMain.addData({type:'FeatureCollection',features:routeData.features.filter(f=>f.properties.segment==='main')});
  routeOptional.addData({type:'FeatureCollection',features:routeData.features.filter(f=>f.properties.segment==='optional')});
  stops.forEach((s,i)=>{
    const m=L.marker([s.lat,s.lng],{icon:L.divIcon({className:'',html:markerHtml(i),iconSize:[30,30],iconAnchor:[15,15]}),keyboard:true,title:s.title}).addTo(map);
    m.on('click',()=>selectStop(i,false));
    markerByIndex.set(i,m);
  });
  const bounds=routeMain.getBounds().extend(routeOptional.getBounds());
  if(bounds.isValid()) map.fitBounds(bounds.pad(.20),{paddingTopLeft:[20,90],paddingBottomRight:[20,250]});
  selectStop(selected,false);
}

visitedButton.addEventListener('click',()=>{
  if(visited.has(selected)) visited.delete(selected); else visited.add(selected);
  localStorage.setItem('visitedStops',JSON.stringify([...visited]));
  selectStop(selected,false);
});
prevButton.addEventListener('click',()=>selectStop(selected-1));
nextButton.addEventListener('click',()=>selectStop(selected+1));
playButton.addEventListener('click',async()=>{ if(audio.paused){ await audio.play(); } else audio.pause(); });
audio.addEventListener('play',()=>playButton.textContent='❚❚');
audio.addEventListener('pause',()=>playButton.textContent='▶');
audio.addEventListener('timeupdate',()=>{ if(audio.duration){ seek.value=Math.round(audio.currentTime/audio.duration*1000); time.textContent=`${fmtTime(audio.currentTime)} / ${fmtTime(audio.duration)}`; }});
audio.addEventListener('loadedmetadata',()=>time.textContent=`0:00 / ${fmtTime(audio.duration)}`);
seek.addEventListener('input',()=>{if(audio.duration) audio.currentTime=(Number(seek.value)/1000)*audio.duration;});
restartButton.addEventListener('click',()=>{audio.currentTime=0; if(audio.paused) audio.play();});
closeOnboarding.addEventListener('click',()=>{onboarding.hidden=true;localStorage.setItem('onboardingDone','1');});
if(localStorage.getItem('onboardingDone')) onboarding.hidden=true;

function locationSuccess(pos){
  const {latitude:lat,longitude:lng,accuracy}=pos.coords;
  userLatLng={lat,lng};
  if(!userMarker){
    userMarker=L.marker([lat,lng],{zIndexOffset:1000,icon:L.divIcon({className:'',html:'<div class="gps-dot"></div>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);
    accuracyCircle=L.circle([lat,lng],{radius:accuracy,color:'#2463eb',weight:1,fillColor:'#2463eb',fillOpacity:.08}).addTo(map);
  } else { userMarker.setLatLng([lat,lng]); accuracyCircle.setLatLng([lat,lng]).setRadius(accuracy); }
  gpsButton.textContent='●'; gpsButton.title=`GPS nauwkeurigheid ±${Math.round(accuracy)} m`;
  recenterButton.hidden=false;
  if(followMode) map.panTo([lat,lng]);
  updateDistance();
}
function locationError(err){
  gpsButton.textContent='!';
  const msg=err.code===1?'Locatietoegang geweigerd. Geef deze site locatie-toegang in Chrome.':'GPS-positie kon niet worden bepaald.';
  distanceRow.textContent=msg;
}
gpsButton.addEventListener('click',()=>{
  if(!('geolocation' in navigator)){locationError({code:2});return;}
  if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null;gpsButton.textContent='◎';return;}
  followMode=true;
  watchId=navigator.geolocation.watchPosition(locationSuccess,locationError,{enableHighAccuracy:true,maximumAge:3000,timeout:15000});
});
recenterButton.addEventListener('click',()=>{followMode=true;if(userLatLng)map.setView(userLatLng,Math.max(map.getZoom(),17));});
map.on('dragstart',()=>{followMode=false;});

if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      await navigator.serviceWorker.register('./sw.js');
      await navigator.serviceWorker.ready;
      offlineBadge.textContent='Offline gereed'; offlineBadge.className='status ready';
    }catch(e){ offlineBadge.textContent='Offline cache fout'; offlineBadge.className='status error'; }
  });
}else{offlineBadge.textContent='Geen offline support';offlineBadge.className='status error';}

init().catch(err=>{console.error(err);offlineBadge.textContent='Gidsdata fout';offlineBadge.className='status error';mapEl.insertAdjacentHTML('beforeend',`<div style="position:absolute;z-index:900;inset:120px 20px auto;padding:18px;background:white;border-radius:16px">${err.message}</div>`);});