(() => {
'use strict';
const $ = id => document.getElementById(id);
const DAYS = {
'17': {label:'Zaterdag 17 oktober · Historisch centrum',intro:'Een compacte kennismaking met de oude binnenstad: van handelsstraten en markten naar de koninklijke monumenten. Reken op ongeveer 2–3 uur inclusief verhalen en pauzes.'},
'18': {label:'Zondag 18 oktober · Alhambra en Realejo',intro:'De helling op via de oude poorten, langs de vesting en de paleizen, daarna terug door Realejo. Steil en met veel hoogteverschil. Voor de Nasridische paleizen, Alcazaba en Generalife gelden afzonderlijke ticketvoorwaarden; plan rond je geboekte toegangstijd.'},
'19': {label:'Maandag 19 oktober · Albaicín en Sacromonte',intro:'Langs de Darro naar de oude wijken op de heuvel. Steile, soms ongelijke straten; stevige schoenen. Sacromonte is een optionele omweg. Het uitzichtpunt San Nicolás ligt niet aan een vlakke wandelroute.'},
'20': {label:'Dinsdag 20 oktober · Extra korte wandeling',intro:'Twee optionele monumenten als je voor vertrek nog tijd over hebt. Check zelf de openingstijden. Je kunt deze wandeling volledig overslaan.'}
};
let stops=[], day='17', active=0, markers=[], line=null, gpsWatch=null, gpsMarker=null, visited=new Set();
try { visited=new Set(JSON.parse(localStorage.getItem('granada-visited')||'[]')); } catch (_) {}
const map=L.map('map',{zoomControl:false,attributionControl:true}).setView([37.1780,-3.5947],14);
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:19}).addTo(map);
function group(){return stops.filter(x=>x.day===day);}
function indexOfId(id){return group().findIndex(s=>s.id===id);}
function saveVisited(){try{localStorage.setItem('granada-visited',JSON.stringify([...visited]));}catch(_){}}
function makeMarker(n,selected,done){
  const classes='stop-marker'+(selected?' selected':'')+(done?' done':'');
  return L.divIcon({className:'',html:'<span class="'+classes+'">'+(n+1)+'</span>',iconSize:[32,32],iconAnchor:[16,16]});
}
function expand(){ $('sheet').classList.remove('collapsed');$('collapse').setAttribute('aria-expanded','true');$('chevron').textContent='⌄'; }
function setDay(d,focus=true){
  if(!DAYS[d])d='17';day=d;$('route').value=d;active=0;
  markers.forEach(m=>map.removeLayer(m));markers=[];
  if(line){map.removeLayer(line);line=null;}
  const a=group();
  a.forEach((s,i)=>{
    const m=L.marker([s.lat,s.lng],{icon:makeMarker(i,false,visited.has(s.id)),title:(i+1)+'. '+s.name}).addTo(map);
    m.on('click',()=>{show(i);expand()});markers.push(m);
  });
  if(a.length>1)line=L.polyline(a.map(s=>[s.lat,s.lng]),{color:'#ba6549',weight:3,dashArray:'5 9',opacity:.8,interactive:false}).addTo(map);
  $('routeLabel').textContent=DAYS[d].label;
  $('routeMeta').textContent=DAYS[d].label;
  $('routeIntro').textContent=DAYS[d].intro;
  drawList();
  show(0,false);
  if(focus)fit();
}
function fit(){
  const a=group();if(!a.length)return;
  const bounds=L.latLngBounds(a.map(s=>[s.lat,s.lng]));
  if(a.length===1)map.setView(bounds.getCenter(),16);
  else map.fitBounds(bounds.pad(.19),{paddingTopLeft:[20,100],paddingBottomRight:[20,130],maxZoom:16,animate:true});
}
function drawList(){
  const host=$('stopList');host.replaceChildren();
  group().forEach((s,i)=>{
    const b=document.createElement('button');b.type='button';b.className=i===active?'current':'';
    const n=document.createElement('span');n.className='num'+(visited.has(s.id)?' done':'');n.textContent=i+1;
    const name=document.createElement('span');name.textContent=s.name+(s.optional?' · optioneel':'');
    b.append(n,name);b.addEventListener('click',()=>{show(i);$('listDetails').open=false;expand()});
    host.appendChild(b);
  });
}
function detailNote(s){
  const byName={
    'Alcazaba':'Binnenkomst vereist een passend Alhambra-ticket. Zonder ticket kun je het verhaal lezen en de omgeving bekijken waar toegankelijk.',
    'Palacios Nazaríes':'Voor de Nasridische paleizen is een ticket met gereserveerd tijdslot nodig. Deze stop kan ook als historische uitleg buiten worden gebruikt.',
    'Generalife':'De tuinen van Generalife behoren tot het ticketgebied. Ga alleen naar binnen als je toegang hebt.',
    'Carmen de los Mártires':'Optioneel; controleer vóór vertrek openingstijden en toegankelijke ingangen.',
    'Sacromonte':'Optionele, langere wandeling met flinke hoogteverschillen. Keer bij Casa del Chapiz terug als je de extra klim wilt overslaan.',
    'Basílica de San Juan de Dios':'Optioneel voor vertrek. Toegang kan betaald zijn en openingstijden kunnen afwijken.',
    'Monasterio de San Jerónimo':'Optioneel voor vertrek. Controleer openingstijden.'
  };
  return byName[s.name]||'';
}
function show(i,pan=true){
  const a=group();if(!a.length)return;
  active=(i+a.length)%a.length;
  const s=a[active];
  $('stopName').textContent=s.name;
  $('peekName').textContent=(active+1)+'. '+s.name;
  $('kicker').textContent=s.title;
  $('story').textContent=s.story;
  $('stopCount').textContent='Halte '+(active+1)+' van '+a.length+(s.optional?' · optioneel':'');
  $('visited').textContent=visited.has(s.id)?'✓ Bezocht':'Markeer bezocht';
  $('visited').classList.toggle('visited',visited.has(s.id));
  $('directions').href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(s.lat+','+s.lng)+'&travelmode=walking';
  const note=detailNote(s);$('tip').hidden=!note;$('tip').textContent=note;
  markers.forEach((m,k)=>m.setIcon(makeMarker(k,k===active,visited.has(a[k].id))));
  drawList();
  try{history.replaceState(null,'','#'+day+'-'+s.id)}catch(_){}
  if(pan)map.panTo([s.lat,s.lng],{animate:true});
  $('content').scrollTop=0;
}
$('route').addEventListener('change',e=>{setDay(e.target.value);expand()});
$('prev').addEventListener('click',()=>{show(active-1);expand()});
$('next').addEventListener('click',()=>{show(active+1);expand()});
$('fit').addEventListener('click',fit);
$('visited').addEventListener('click',()=>{
  const s=group()[active];
  if(!s)return;
  if(visited.has(s.id))visited.delete(s.id);else visited.add(s.id);
  saveVisited();show(active,false);
});
$('collapse').addEventListener('click',()=>{
  const collapsed=$('sheet').classList.toggle('collapsed');
  $('collapse').setAttribute('aria-expanded',String(!collapsed));
  $('chevron').textContent=collapsed?'⌃':'⌄';
  setTimeout(()=>map.invalidateSize(),250);
});
$('locate').addEventListener('click',()=>{
  const status=$('locStatus');status.style.display='block';
  if(gpsWatch!==null){navigator.geolocation.clearWatch(gpsWatch);gpsWatch=null;$('locate').textContent='◎ Mijn locatie';status.textContent='GPS gestopt';return;}
  if(!navigator.geolocation){status.textContent='GPS is niet beschikbaar in deze browser.';return;}
  status.textContent='Locatie zoeken…';
  gpsWatch=navigator.geolocation.watchPosition(p=>{
    const ll=[p.coords.latitude,p.coords.longitude];
    if(!gpsMarker){gpsMarker=L.marker(ll,{icon:L.divIcon({className:'',html:'<div class="user-dot"></div>',iconSize:[17,17],iconAnchor:[8,8]})}).addTo(map);}
    else gpsMarker.setLatLng(ll);
    $('locate').textContent='● GPS actief';status.textContent='GPS actief · nauwkeurigheid circa '+Math.round(p.coords.accuracy)+' m';
  },e=>{status.textContent='GPS niet beschikbaar: '+e.message;},{enableHighAccuracy:true,maximumAge:7000,timeout:18000});
});
fetch('./stops.json',{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('Verhalen niet gevonden ('+r.status+')');return r.json();})
  .then(data=>{
    if(!Array.isArray(data)||!data.length)throw Error('Geen haltes in de gids');
    stops=data;const hash=location.hash.match(/^#(17|18|19|20)-(\d+)$/);
    const route=hash?hash[1]:'17';setDay(route);
    if(hash){const i=indexOfId(hash[2]);if(i>=0)show(i,true);}
  })
  .catch(err=>{
    $('peekName').textContent='Gids kan niet worden geladen';
    $('stopName').textContent='De verhalen zijn tijdelijk niet bereikbaar';
    $('story').textContent='Herlaad de pagina met internetverbinding. Fout: '+err.message;
    $('routeIntro').textContent='';$('stopCount').textContent='';
  });
})();
