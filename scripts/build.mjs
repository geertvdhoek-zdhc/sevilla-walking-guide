import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const dataDir = path.join(dist, 'data');
const audioDir = path.join(dist, 'audio');
const vendorDir = path.join(dist, 'vendor');

const bbox = { south: 37.3860, west: -6.0015, north: 37.4056, east: -5.9840 };

const stops = [
  {
    title:'Alameda de Hércules', lat:37.3997765, lng:-5.9931687, optional:false, audio:'./audio/01-alameda.mp3',
    blurb:'Begin tussen de Romeinse zuilen en het lokale stadsleven van de Alameda.',
    transcript:'Je staat op de Alameda de Hércules. Kijk eerst naar de ruimte zelf: lang, breed en opvallend open voor een middeleeuwse stad. Dat is geen toeval. In 1574 liet de Conde de Barajas dit natte, ongezonde gebied droogleggen en als publieke wandelplaats inrichten. Sevilla presenteert de Alameda daarom als een van de oudste openbare promenades van Europa. Aan de zuidkant staan twee Romeinse zuilen die afkomstig zijn van een tempel aan de huidige Calle Mármoles. Bovenop staan Hércules en Julius Caesar, de mythische stichters van Sevilla. Het aardige is dat deze plek nooit één identiteit heeft gehad. Van deftige promenade werd ze later een verloederd gebied, en na de herinrichting van 2008 juist weer een centrum voor terrassen, muziek en alternatief stadsleven. Vandaag lopen we vanaf hier niet richting de grote monumenten, maar de noordelijke woonstad in.'
  },
  {
    title:'Mercado de Feria · Calle Feria', lat:37.39951, lng:-5.99154, optional:false, audio:'./audio/02-feria.mp3',
    blurb:'Buurtmarkt, mudéjar-architectuur en alledaags Sevilla dicht op elkaar.',
    transcript:'Dit is Calle Feria en het Mercado de Feria. De markt heeft gedocumenteerde activiteit sinds 1719 en geldt als de oudste gemeentelijke markt van Sevilla die nog in gebruik is. Overdag is dit vooral een buurtmarkt: vis, vlees, groente, brood en kleine eetplekken. Kijk ook even om je heen in plaats van alleen naar de markthal. Direct ernaast staat de gotisch-mudéjar kerk Omnium Sanctorum, en aan de andere kant ligt het Palacio de los Marqueses de la Algaba. Dat vijftiende-eeuwse paleis heeft een opvallende gotisch-mudéjar façade en huisvest tegenwoordig het Centro de Arte Mudéjar. Dit kleine gebied laat goed zien waarom Feria interessanter is dan één losse bezienswaardigheid: markt, religie, aristocratische architectuur en gewone buurtfuncties liggen letterlijk tegen elkaar aan.'
  },
  {
    title:'San Luis de los Franceses', lat:37.39835, lng:-5.98827, optional:false, audio:'./audio/03-san-luis.mp3',
    blurb:'Een compact maar uitzonderlijk rijk barokinterieur van de jezuïeten.',
    transcript:'Voor je staat San Luis de los Franceses, een van de sterkste voorbeelden van de Sevilliaanse barok. De kerk werd tussen 1699 en 1731 gebouwd voor het noviciaat van de jezuïeten. Leonardo de Figueroa en andere architecten uit zijn kring maakten hier geen sobere kerk, maar bijna een ruimtelijk argument voor de jezuïtische leer. Let binnen vooral op de centrale koepel, de overvloed aan beweging in het stucwerk en de manier waarop schilderkunst, beeldhouwkunst en architectuur in elkaar grijpen. Het gebouw was bovendien geen gewone parochiekerk: het hoorde bij een opleiding voor toekomstige jezuïeten. Na de verdrijving van de orde uit Spanje in 1767 verloor het complex zijn oorspronkelijke functie en kende het verschillende andere gebruiken en periodes van verval. Na een grote restauratie is het opnieuw toegankelijk.'
  },
  {
    title:'Plaza del Pumarejo', lat:37.40087, lng:-5.98818, optional:false, audio:'./audio/04-pumarejo.mp3',
    blurb:'Een buurtplein waar paleis, woonstad en sociale geschiedenis samenkomen.',
    transcript:'Je bent nu bij Plaza del Pumarejo, op de as van Calle San Luis. Het paleis hier dateert uit de achttiende eeuw en werd in de jaren 1770 gebouwd als grote stadsresidentie. Maar de interessantste laag kwam later: het gebouw werd opgedeeld en kreeg een veel collectiever, volkser gebruik. Daardoor past het goed bij de wijk waarin je nu loopt. Macarena en San Luis zijn niet interessant omdat alles monumentaal is, maar omdat verschillende sociale lagen door elkaar heen blijven staan: paleizen, eenvoudige huizen, kerken, winkels en buurtpleinen. Kijk dus niet alleen naar het paleis. Kijk ook naar de schaal van de straten, de lage gevels en de manier waarop het plein als huiskamer van de buurt werkt. Vanaf hier is het nog maar een paar minuten naar de basiliek en de oude stadsmuur.'
  },
  {
    title:'Basílica de la Macarena', lat:37.4024828, lng:-5.9895229, optional:false, audio:'./audio/05-macarena.mp3',
    blurb:'De jonge basiliek rond een veel oudere en zeer geliefde Sevilliaanse devotie.',
    transcript:'Dit is de Basílica de la Macarena. Het gebouw oogt historisch, maar is verrassend jong: het werd in 1949 ingewijd. De echte historische en emotionele kern is de Virgen de la Esperanza Macarena binnen, een anoniem beeld uit de zeventiende eeuw. Tijdens de Madrugá, de nacht en vroege ochtend van Goede Vrijdag, trekt de Macarena in processie door Sevilla en verzamelen zich enorme menigten langs de route. Daardoor is dit niet alleen een kerk met kunst, maar een plek die sterk verbonden is met identiteit, ritueel en buurtgevoel. Binnen zie je ook waarom de basiliek ondanks haar jonge leeftijd zo traditioneel aanvoelt: architectuur en inrichting zijn bewust ontworpen om aan te sluiten bij de barokke beeldtaal van Sevilla. Als je maar kort naar binnen gaat, focus dan niet op hoeveel goud je ziet, maar op de positie van het Mariabeeld en hoe de hele ruimte er visueel naartoe trekt.'
  },
  {
    title:'Arco + Muralla de la Macarena', lat:37.40278, lng:-5.98924, optional:false, audio:'./audio/06-muralla.mp3',
    blurb:'Het langste aaneengesloten restant van de historische stadsmuur van Sevilla.',
    transcript:'Hier komen de twee verhalen van Macarena samen: de poort en de muur. De bewaard gebleven muur is grotendeels van islamitische oorsprong en werd in de Almohadische periode in de twaalfde en dertiende eeuw uitgebouwd. Van de ongeveer zeven kilometer stadsmuur die Sevilla ooit omsloot, bleef na de grote negentiende-eeuwse sloop maar weinig over. Het traject vanaf de Arco de la Macarena richting de Puerta de Córdoba is met ongeveer vijfhonderdzestig meter het langste aaneengesloten restant. De poort zelf veranderde door de eeuwen heen sterk van uiterlijk. Bij recente restauraties werd zelfs een oude wachtruimte teruggevonden die gebruikt werd voor het innen van portazgo: belasting op goederen en dieren die de stad binnenkwamen. Dat maakt dit meer dan een decoratieve poort. Dit was letterlijk een controlepunt tussen binnen en buiten, stad en weg, handel en belasting.'
  },
  {
    title:'Espacio Derivado', lat:37.39210, lng:-5.98980, optional:true, audio:'./audio/07-derivado.mp3',
    blurb:'Optionele avondstop: hedendaagse kunst in een historische woning bij Cristo de Burgos.',
    transcript:'Dit is Espacio Derivado, in een historische woning aan Plaza Cristo de Burgos die verbonden is met de Sevilliaanse architect José Espiau y Muñoz. Het is geen klassiek wit museumgebouw, maar een privaat huis dat deels als ruimte voor hedendaagse kunst wordt gebruikt. De tentoonstelling die nu loopt heet 170 minutos van Bea Corbalán. Het uitgangspunt is tijdarmoede: hoeveel vrije tijd blijft er werkelijk over nadat werk, huishouden, zorg, reizen en andere noodzakelijke verplichtingen zijn afgetrokken? In de tentoonstelling wordt honderdtzeventig minuten per dag als kritische grens gebruikt. De werken spelen met zoeken op je telefoon in de nacht, tikkende klokken, productiviteitsmethodes en de drang om elk overgebleven moment nuttig te maken. Dat maakt dit een goede afsluiter van de dag: na historisch Sevilla gaat het ineens over een heel hedendaags probleem, namelijk wie eigenlijk eigenaar is van je tijd.'
  }
];

const audioSources = [
  ['01-alameda.mp3', 'https://storage.googleapis.com/xi-backend/database/workspace/aacae53833344845a933a4c900ebd8d5/content_generation/wB1QCLj5DZioWSYQaeVg/4DDHYvabum5vo5wCQM5I/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F20261014%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20261014T083944Z&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature=279144e9c4713b5450e08a1e36998fcd515ca5430d9057b75d9838301aa44311ee4222ce20c86b96ffbc614f359db3deff18812f2231359d2c0446129744df5371aa49f081fb2263b93e0e4a287c7d41e975265744a54e23c0f7a0eef99f49de9c3502434a7ef643a01667c704790927ad8a0e0e645a0714b0c50f075e8807d72a95a19fbdbc2e1654d475cfae599a608c55ebd8694f3c27e5d13d81fe11805ee71ea3921347ddb0989973fcf2fd83646e48deb8bdb2741026b291b1539157a7658eaf74d324e56c6a2317179e94ba77557eb44fdaa4df1604f57bc9144a344628ca1ffc4a76276a7c19e383cd05e25499189b14919c807dd0dd151a18dd75c9'],
  ['02-feria.mp3', 'https://storage.googleapis.com/xi-backend/database/workspace/aacae53833344845a933a4c900ebd8d5/content_generation/6QZpXgny7xCoCRfVaMhn/7lXsV8DPYRDE5hNBI0AF/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F20261014%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20261014T083944Z&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature=a3d7bf5473aee68aa2e612212c0f05baee73b61703eeee2d9d43d93c8340718bd7742256b2a9e1b5cebd37b20a571a39cb81fb7d3e28110c41fa086fc1fc71a25ff61d3865748fa25f456995a25d4f3eacc680e33277c11a00a58dd5f093b8c09b49311c52d2f53935aabd0eb8e53f59ec387310c29494652059a6fb14a2e5ef199c38df924d0c069935d7a9fb3b0de7d410634737376ef499633606c64b6f8bd87ae44987542e1348ee25f8d7fe1a96972d54665391bd8f91b048e5c27d9f7aad57898e7eadb99e1164c255e2804a10ccd8089e1209e5dca0a6c1b21dc68e9c2fa6c9009df6f8c2a6473893fd3d0526b329520ddda0429f3d65b535837d804b'],
  ['03-san-luis.mp3', 'https://storage.googleapis.com/xi-backend/database/workspace/aacae53833344845a933a4c900ebd8d5/content_generation/wYt2CS6cG0KfhcvTiUwo/5DSxUkswHGy1yI4AQcDL/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F20261014%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20261014T083944Z&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature=b2a210f08e5bda7496fd25b5035903c510c967f5c98fdb6f581df88aeb85763df8f20bfff8f58e164768036707859ad06b7372e2873b5d30292e3546f9ed26cd1550af5e8270774ca525f03e8716e85c5f4d725daa87564e827a4fb1c7bcc98efc7d756ef76e5b31f7de44f667a01efb2596b86a2847d5744c96f5a58e53d6ccd56cfd0ff4d1d5df68ed6bea25d20ff5d2562c6b71df450f5d7f05a09f1d590952021c3fcd0701a08530912dae01501091d21bc91a3e9cce5013b3a7413628d35e258047ff13e485cf96fe896fa5d0a0faba9b539ff008c531d93fa2d03ee672c02c391e0a16fc53f524d928ac6ede79a54fdc71cdc8540eda497da6b4aa610f'],
  ['04-pumarejo.mp3', 'https://storage.googleapis.com/xi-backend/database/workspace/aacae53833344845a933a4c900ebd8d5/content_generation/CCmOxlu4bYy5ObP8moDy/FIwUOESjTO4fW9yN339k/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F20261014%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20261014T083944Z&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature=b54c4df29ed0a44820624bcf6e029daa699ed4a27ecc15f1d963b91fcceb65f77fa14b9bf20c665b561fee158b6171d3644f6495395b9b487ca4366db264b4ee9f971ffe61fb2f203baaf0e7c78045f0007825db9465c0cc4e2602c58c62134cb22ead01a030e3f29cec5d4d63a6911dfc4b654c6297a93c83f989d09d6602badb2dec3999ed8f2ebb2c5c3a61855f4d47f0cec9a16f8b1c497f83128bdc0cf3aba4193da2eb2f73e3ab2c76af46f8f06accad060958311eb5f641d97191ccefa694e688533d477023e5cbddb652c385a422dc36278129658fb5028e926dbf9bd8d5da9a0ac62dacfa824283848cb7ced3a80ae429bb2e7b4589be86c0e16043'],
  ['05-macarena.mp3', 'https://storage.googleapis.com/xi-backend/database/workspace/aacae53833344845a933a4c900ebd8d5/content_generation/AbjckerBKCyxvfkBVZC4/ofd5ztjUA32TYi6y4Fw2/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F20261014%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20261014T083944Z&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature=34a405fdf98e11bc6d049fd24938c0597a4c2e45df59b559ae905fac3f4f7170bef6b684b2b1afe812c9b4dceca6fcb4dcae27c7046317612306589284ce65971cad13d98313a92b3c99f4bc46589aa2d56e78872c0014cc6bdd42ba53dbd7b0b773365e7f03ccd164f72eeea247148f631031519fae489a43cf75d9206c0864c9d13c7108819521f231066598b0b62ec8ebae7c4ad581131ddd73fb40ec356695672557091013bdc2eeab9eadaa10b9f61fb72b942a973fd300b2949b17d1a7cf9af50a83bd998cfe85249ee6a1df3b7aea74062b79f9783c66c17e024d5c8ad3cfb73bd1e97d046749d405465a83ec23753c94f4be41f8d96b8e952cf81285'],
  ['06-muralla.mp3', 'https://storage.googleapis.com/xi-backend/database/workspace/aacae53833344845a933a4c900ebd8d5/content_generation/KcagZq17zPi0BudgCumv/kPx4smcKJxtU52bC2i2u/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F20261014%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20261014T083944Z&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature=892add87d7ad841a401f0ce4324ddbab30ee7ad300e1b511a1ad686a49bc5ae7dfe794a68f4780aad6598110b67934e4cb3481a0da2d3be7f303d80c2919c039d830d0e42e1c9284fce461f600e13981d4b1fab5231e410cd59d4066fe4dd3f678360b52bd5b943c982418ba2bd10f586576ad11295bef7d894ddc5d24799773c1e7f45e56615286928834eae98fa7ed5be365ac40cb3f6c2cb66ad82a6db5559816d2cce90989940d61bffd4ee82afe07e03b8816394af217acdad09943e528801e72bb344c5f7e9e9e691afb95826fad37a7e30fea177442e67c2b99e05f9354350849d9a43e21841719343852c7c08b90276ebca54abf2d52a5b40f161308'],
  ['07-derivado.mp3', 'https://storage.googleapis.com/xi-backend/database/workspace/aacae53833344845a933a4c900ebd8d5/content_generation/u4wLslSDLIhgUvqOCjY4/Kjl2e7AbuceFBFsy2whh/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F20261014%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20261014T083944Z&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature=577330e9d173aa0f8494e61d6ad5fd0416ddba3a36257c99790de77dfd67627f699a53f88d32dfbeec38e91622185788fc6fe4467088783b2fbd4e322636472d53f2aaba6f80f26a93991e5975517c2f49ab2533922dba412a515d5875e3816c72d36381624b37143825ce2e028ab4ff7b4662a4427e6aba41866e0e3e3385acaaea0b7cd05529631a0f8f73969c0dc7ca6a56a87bbb75b27d7123b5014ec8a3da6aaff894f441706b8ecfcd82775ce35c89765f9f7ed50cd53899f84f52bf87a1f2cbd10d96f28efc5b6ef9ed2cec85413623df4e0634c75eca6252411cb5e15ca4af0444e7bd473d71206b12e804092d0f2d7976acf6a7b9853a442ff02efc']
];

function hav(a,b){const R=6371000,r=Math.PI/180,dLat=(b.lat-a.lat)*r,dLon=(b.lng-a.lng)*r;const h=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h));}

async function fetchWithRetry(url, options={}, tries=3){
  let err;
  for(let i=0;i<tries;i++){
    try{
      const res=await fetch(url,{...options,signal:AbortSignal.timeout(60000)});
      if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res;
    }catch(e){err=e; await new Promise(r=>setTimeout(r,1200*(i+1)));}
  }
  throw err;
}

async function downloadAudio(){
  console.log('Downloading 7 ElevenLabs MP3 files…');
  for(const [name,url] of audioSources){
    const res=await fetchWithRetry(url,{},2);
    const buf=Buffer.from(await res.arrayBuffer());
    if(buf.length<10000 || buf.subarray(0,3).toString()!=='ID3'){
      // Some valid MP3s start with an MPEG frame rather than ID3, so only reject obviously textual payloads.
      const head=buf.subarray(0,80).toString('utf8');
      if(/<html|error|expired|accessdenied/i.test(head)) throw new Error(`Invalid audio payload for ${name}`);
    }
    await fs.writeFile(path.join(audioDir,name),buf);
    console.log(`  ${name}: ${(buf.length/1024).toFixed(0)} KiB`);
  }
}

async function fetchOverpass(){
  const b=`${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  const q=`[out:json][timeout:25];(way[\"highway\"](${b});way[\"leisure\"~\"park|garden\"](${b});way[\"natural\"=\"water\"](${b});way[\"waterway\"](${b}););out body geom;`;
  const endpoints=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
  let last;
  for(const endpoint of endpoints){
    try{
      console.log(`Fetching OSM data from ${endpoint}…`);
      const res=await fetchWithRetry(endpoint,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded','user-agent':'SevillaWalkingGuide/1.0'},body:new URLSearchParams({data:q}).toString()},2);
      return await res.json();
    }catch(e){last=e;console.warn(`Overpass failed: ${e.message}`);}
  }
  throw last;
}

function convertOsm(osm){
  const features=[];
  const nodeCoords=new Map();
  const graph=new Map();
  const addEdge=(a,b,w)=>{if(!graph.has(a))graph.set(a,[]);graph.get(a).push([b,w]);};
  const badHighways=new Set(['motorway','motorway_link','trunk','trunk_link','construction','proposed','raceway']);

  for(const el of osm.elements||[]){
    if(el.type!=='way'||!Array.isArray(el.geometry)||el.geometry.length<2) continue;
    const tags=el.tags||{};
    const coords=el.geometry.map(g=>[g.lon,g.lat]);
    if(Array.isArray(el.nodes) && el.nodes.length===el.geometry.length){
      el.nodes.forEach((id,i)=>nodeCoords.set(id,{lat:el.geometry[i].lat,lng:el.geometry[i].lon}));
    }
    let kind='road', geomType='LineString', geometry=coords;
    if(tags.building){kind='building'; if(coords.length>3 && coords[0][0]===coords.at(-1)[0] && coords[0][1]===coords.at(-1)[1]){geomType='Polygon';geometry=[coords];}}
    else if(tags.leisure||tags.landuse||['wood','scrub'].includes(tags.natural)){kind='green'; if(coords.length>3&&coords[0][0]===coords.at(-1)[0]&&coords[0][1]===coords.at(-1)[1]){geomType='Polygon';geometry=[coords];}}
    else if(tags.waterway||tags.natural==='water'){kind='water'; if(tags.natural==='water'&&coords.length>3&&coords[0][0]===coords.at(-1)[0]&&coords[0][1]===coords.at(-1)[1]){geomType='Polygon';geometry=[coords];}}
    features.push({type:'Feature',properties:{kind,name:tags.name||null,highway:tags.highway||null,building:tags.building||null},geometry:{type:geomType,coordinates:geometry}});

    if(tags.highway && !badHighways.has(tags.highway) && tags.access!=='private' && tags.access!=='no' && tags.foot!=='no' && Array.isArray(el.nodes) && el.nodes.length===el.geometry.length){
      for(let i=1;i<el.nodes.length;i++){
        const a=el.nodes[i-1],b=el.nodes[i],ca=nodeCoords.get(a),cb=nodeCoords.get(b);
        if(!ca||!cb) continue;
        const w=hav(ca,cb);
        addEdge(a,b,w); addEdge(b,a,w);
      }
    }
  }
  return { map:{type:'FeatureCollection',features}, nodeCoords, graph };
}

class Heap{
  constructor(){this.a=[];}
  push(item){
    const a=this.a; a.push(item); let i=a.length-1;
    while(i>0){const p=(i-1)>>1;if(a[p][0]<=a[i][0])break;[a[p],a[i]]=[a[i],a[p]];i=p;}
  }
  pop(){
    const a=this.a;if(!a.length)return null;const top=a[0],last=a.pop();
    if(a.length){a[0]=last;let i=0;while(true){const l=i*2+1,r=l+1;let c=i;if(l<a.length&&a[l][0]<a[c][0])c=l;if(r<a.length&&a[r][0]<a[c][0])c=r;if(c===i)break;[a[i],a[c]]=[a[c],a[i]];i=c;}}
    return top;
  }
}

function nearestNode(stop,nodeCoords,graph){
  let best=null,bestD=Infinity;
  for(const [id,c] of nodeCoords){if(!graph.has(id))continue;const d=hav(stop,c);if(d<bestD){bestD=d;best=id;}}
  if(best===null||bestD>180) throw new Error(`No walkable OSM node near ${stop.title} (${Math.round(bestD)}m)`);
  return best;
}
function shortest(start,end,graph){
  const dist=new Map([[start,0]]),prev=new Map(),heap=new Heap();heap.push([0,start]);
  while(true){const cur=heap.pop();if(!cur)break;const [d,u]=cur;if(d!==dist.get(u))continue;if(u===end)break;for(const [v,w] of graph.get(u)||[]){const nd=d+w;if(nd<(dist.get(v)??Infinity)){dist.set(v,nd);prev.set(v,u);heap.push([nd,v]);}}}
  if(!dist.has(end)) throw new Error('No pedestrian path between tour stops');
  const out=[];let u=end;while(u!==undefined){out.push(u);if(u===start)break;u=prev.get(u);}return out.reverse();
}
function buildRoute(nodeCoords,graph){
  const snapped=stops.map(s=>nearestNode(s,nodeCoords,graph));
  const features=[];
  const make=(from,to,segment)=>{
    const ids=shortest(snapped[from],snapped[to],graph);
    const coords=ids.map(id=>{const c=nodeCoords.get(id);return[c.lng,c.lat];});
    features.push({type:'Feature',properties:{segment,from,to},geometry:{type:'LineString',coordinates:coords}});
  };
  for(let i=0;i<5;i++)make(i,i+1,'main');
  make(5,6,'optional');
  return {type:'FeatureCollection',features};
}

async function copyBase(){
  // Keep assets downloaded by the workflow.
  await fs.mkdir(dataDir,{recursive:true});await fs.mkdir(audioDir,{recursive:true});await fs.mkdir(vendorDir,{recursive:true});
  for(const f of ['index.html','app.css','app.js','manifest.webmanifest','icon.svg']) await fs.copyFile(path.join(src,f),path.join(dist,f));
  await fs.cp(path.join(src,'cities'),path.join(dist,'cities'),{recursive:true});
  await fs.copyFile(path.join(root,'node_modules/leaflet/dist/leaflet.js'),path.join(vendorDir,'leaflet.js'));
  await fs.copyFile(path.join(root,'node_modules/leaflet/dist/leaflet.css'),path.join(vendorDir,'leaflet.css'));
}
async function walk(dir,prefix=''){
  const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const rel=path.posix.join(prefix,e.name);if(e.isDirectory())out.push(...await walk(path.join(dir,e.name),rel));else out.push('./'+rel);}return out;
}
async function writeServiceWorker(){
  const assets=(await walk(dist)).filter(x=>x!=='/sw.js').sort();
  const sw=`const CACHE='sevilla-guide-v5';\nconst ASSETS=${JSON.stringify(assets)};\nself.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(async c=>{for(const u of ASSETS){const r=await fetch(u,{cache:'reload'});if(!r.ok)throw new Error('cache '+u);await c.put(u,r);}}).then(()=>self.skipWaiting())));\nself.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));\nself.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==location.origin)return;const range=e.request.headers.get('range');if(range&&url.pathname.endsWith('.mp3')){e.respondWith((async()=>{const c=await caches.open(CACHE);const full=await c.match(url.href,{ignoreVary:true});if(!full)return fetch(e.request);const b=await full.arrayBuffer();const m=/bytes=(\\d+)-(\\d*)/.exec(range);if(!m)return full;const start=Number(m[1]),end=m[2]?Number(m[2]):b.byteLength-1;const chunk=b.slice(start,end+1);return new Response(chunk,{status:206,headers:{'Content-Type':'audio/mpeg','Content-Length':String(chunk.byteLength),'Content-Range':'bytes '+start+'-'+end+'/'+b.byteLength,'Accept-Ranges':'bytes'}});})());return;}e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});`;
  await fs.writeFile(path.join(dist,'sw.js'),sw);
  console.log(`Service worker precaches ${assets.length} assets.`);
}

await copyBase();
await fs.writeFile(path.join(dataDir,'stops.json'),JSON.stringify(stops));
if (!(await fs.readdir(audioDir)).includes('01-alameda.mp3')) await downloadAudio();
const hasMap = (await fs.readdir(dataDir)).includes('map.geojson');
if (!hasMap) {
const osm=await fetchOverpass();
const converted=convertOsm(osm);
console.log(`OSM features: ${converted.map.features.length}; walk graph nodes: ${converted.graph.size}`);
await fs.writeFile(path.join(dataDir,'map.geojson'),JSON.stringify(converted.map));
const route=buildRoute(converted.nodeCoords,converted.graph);
await fs.writeFile(path.join(dataDir,'route.geojson'),JSON.stringify(route));
}
await writeServiceWorker();
const files=await walk(dist);console.log(`Build complete: ${files.length} files.`);