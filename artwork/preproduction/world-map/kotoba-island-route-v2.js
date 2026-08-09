(function () {
  'use strict';

  const endpoints = [
    [1,11.982,142.062,.08,12.040,142.025,.22,'bnd-meadow-forest-a'],[2,12.040,142.025,.22,12.078,141.992,.72,'bnd-forest-mountain-a'],[3,12.078,141.992,.72,12.018,141.948,.03,'bnd-mountain-inlet-a'],[4,12.018,141.948,.03,12.006,141.982,.12,'bnd-inlet-root-a'],[5,12.006,141.982,.12,12.024,142.000,1.76,'bnd-root-sky-a'],[6,12.024,142.000,1.76,11.986,142.058,.10,'bnd-sky-meadow-a'],
    [7,11.986,142.058,.10,12.043,142.029,.24,'bnd-meadow-forest-b'],[8,12.043,142.029,.24,12.081,141.996,.76,'bnd-forest-mountain-b'],[9,12.081,141.996,.76,12.021,141.951,.04,'bnd-mountain-inlet-b'],[10,12.021,141.951,.04,12.009,141.985,.14,'bnd-inlet-root-b'],[11,12.009,141.985,.14,12.027,142.003,1.82,'bnd-root-sky-b'],[12,12.027,142.003,1.82,12.029,141.998,1.91,'bnd-sky-star-route'],
    [13,12.029,141.998,1.91,12.046,142.022,.26,'bnd-meadow-forest-c'],[14,12.046,142.022,.26,12.084,141.989,.80,'bnd-forest-mountain-c'],[15,12.084,141.989,.80,12.024,141.944,.04,'bnd-mountain-inlet-c'],[16,12.024,141.944,.04,12.012,141.978,.15,'bnd-inlet-root-c'],[17,12.012,141.978,.15,12.030,141.996,1.88,'bnd-root-sky-c'],[18,12.030,141.996,1.88,11.978,142.054,.08,'bnd-sky-meadow-c'],
    [19,11.978,142.054,.08,12.037,142.019,.21,'bnd-meadow-forest-d'],[20,12.037,142.019,.21,12.075,141.986,.69,'bnd-forest-mountain-d'],[21,12.075,141.986,.69,12.015,141.941,.03,'bnd-mountain-inlet-d'],[22,12.015,141.941,.03,12.003,141.975,.11,'bnd-inlet-root-d'],[23,12.003,141.975,.11,12.021,141.993,1.72,'bnd-root-sky-d'],[24,12.021,141.993,1.72,11.975,142.051,.07,'bnd-sky-meadow-d'],
    [25,11.975,142.051,.07,12.034,142.016,.20,'bnd-meadow-forest-e'],[26,12.034,142.016,.20,12.072,141.983,.66,'bnd-forest-mountain-e'],[27,12.072,141.983,.66,12.012,141.938,.03,'bnd-mountain-inlet-e'],[28,12.012,141.938,.03,12.000,141.972,.10,'bnd-inlet-root-e'],[29,12.000,141.972,.10,12.018,141.990,1.69,'bnd-root-sky-e'],[30,12.018,141.990,1.69,11.972,142.048,.07,'bnd-sky-meadow-e'],
    [31,11.972,142.048,.07,12.031,142.013,.19,'bnd-meadow-forest-f'],[32,12.031,142.013,.19,12.069,141.980,.63,'bnd-forest-mountain-f'],[33,12.069,141.980,.63,12.009,141.935,.03,'bnd-mountain-inlet-f'],[34,12.009,141.935,.03,11.997,141.969,.10,'bnd-inlet-root-f'],[35,11.997,141.969,.10,12.015,141.987,1.66,'bnd-root-sky-f'],[36,12.015,141.987,1.66,12.025,142.001,1.96,'evt-sky-crown']
  ];

  const typeBySlot = ['meadow-forest','forest-mountain','mountain-inlet','inlet-root','root-sky','sky-meadow'];
  const landforms = {
    'meadow-forest':['溶岩原の緩丘','浅い涸れ沢','河岸段丘','季節湿地','防風林縁','小川氾濫原'],
    'forest-mountain':['小川氾濫原','支流合流','段丘崖','倒木ギャップ','雲霧林の肩','カルデラ鞍部'],
    'mountain-inlet':['カルデラ鞍部','風衝支尾根','谷頭','崩積斜面','河岸段丘','河口湿地'],
    'inlet-root':['河口湿地','自然堤防','砂泥干潟・藻場','ポケット浜・波食棚','海食洞','溶岩洞崩落窓'],
    'root-sky':['溶岩洞崩落窓','根際湿地','宙水泉','古土壌段','上昇根螺旋','雲霧集水庭'],
    'sky-meadow':['雲霧集水庭','風衝露台','霧氷石段','石造鞍部','下降支尾根','溶岩原の緩丘'],
    'sky-internal':['大風車基壇','風衝露台','雲霧集水溝','石造鞍部','夜航路回廊','夜航路展望台'],
    'sky-descent-forest':['夜航路展望台','霧氷石段','下降支尾根','溶岩原の緩丘','防風林縁','雲霧林の肩'],
    'sky-crown':['上昇根螺旋','霧氷石段','共同花壇','記録回廊','王冠室前庭','島望連絡台']
  };
  const regions = {
    'meadow-forest':['meadow','meadow','meadow','meadow-wetland','forest-edge','forest'],
    'forest-mountain':['forest','forest','forest','forest','cloud-forest','mountain'],
    'mountain-inlet':['mountain','mountain','mountain','valley','river-terrace','inlet-wetland'],
    'inlet-root':['inlet-wetland','inlet-wetland','inlet-seagrass','inlet-reef','root-cave','ancient-forest'],
    'root-sky':['ancient-forest','ancient-forest','ancient-forest','root-ascent','root-ascent','sky-ruins'],
    'sky-meadow':['sky-ruins','sky-ruins','sky-ruins','sky-descent','sky-descent','meadow'],
    'sky-internal':['sky-ruins','sky-ruins','sky-ruins','sky-ruins','sky-ruins','sky-ruins'],
    'sky-descent-forest':['sky-ruins','sky-descent','sky-descent','meadow','forest-edge','forest'],
    'sky-crown':['root-ascent','sky-ruins','sky-ruins','sky-ruins','sky-ruins','sky-ruins']
  };
  const watershedFor = region => region.startsWith('mountain') || region==='cloud-forest' ? 'kotoba-headwaters' : region.startsWith('forest') ? 'forest-tributary' : region==='valley' || region==='river-terrace' ? 'kotoba-mainstem' : region.startsWith('inlet') ? 'southwest-bay' : region.startsWith('ancient') || region.startsWith('root') ? 'root-spring' : region.startsWith('sky') ? 'cloud-catchment' : 'southeast-meadow';
  const boundaryStart = ['evt-meadow-landing', ...endpoints.slice(0,-1).map(e=>e[7])];
  const lane = n => 'abcdef'[Math.floor((n-1)/6)];
  const round = n => Number(n.toFixed(6));
  const specialType = n => n===12 ? 'sky-internal' : n===13 ? 'sky-descent-forest' : n===36 ? 'sky-crown' : typeBySlot[(n-1)%6];

  function altitudeAt(type, h0, h1, t) {
    if (type==='root-sky' || type==='sky-crown') { const s=t*t*(3-2*t); return h0+(h1-h0)*s; }
    if (type==='sky-meadow' || type==='sky-descent-forest') { const s=t<.35 ? t*.45 : .1575+((t-.35)/.65)*.8425; return h0+(h1-h0)*s; }
    return h0+(h1-h0)*t;
  }
  function buildStage(row) {
    const [stage,lat0,lon0,h0,lat1,lon1,h1,endChunk]=row, type=specialType(stage), chapterLane=lane(stage);
    const kmN=(lat1-lat0)*111.195, kmE=(lon1-lon0)*111.195*Math.cos(12.025*Math.PI/180), len=Math.hypot(kmE,kmN)||1;
    const perpE=-kmN/len, perpN=kmE/len;
    const baseAmplitude = type.includes('sky') || type==='root-sky' ? .12 : type==='inlet-root' ? .22 : .30;
    const wiggle=[0,.72,-.42,.58,-.34,0];
    const anchors=Array.from({length:6},(_,i)=>{
      const t=i/5, offset=baseAmplitude*wiggle[i]*(stage%2?1:-1);
      const e=kmE*t+perpE*offset, n=kmN*t+perpN*offset;
      const region=regions[type][i], form=landforms[type][i];
      return {
        anchorId:`stage-${stage}-anchor-${i+1}`,
        progress:t,
        latitudeDeg:round(lat0+n/111.195),
        longitudeDeg:round(lon0+e/(111.195*Math.cos(12.025*Math.PI/180))),
        altitudeKm:round(altitudeAt(type,h0,h1,t)),
        microLandform:form,
        watershedId:watershedFor(region),
        regionId:region,
        chunkId:i===0?boundaryStart[stage-1]:i===5?endChunk:`geo-${chapterLane}-${region}-${i}`
      };
    });
    anchors[0].latitudeDeg=lat0; anchors[0].longitudeDeg=lon0; anchors[0].altitudeKm=h0;
    anchors[5].latitudeDeg=lat1; anchors[5].longitudeDeg=lon1; anchors[5].altitudeKm=h1;
    return {stage,chapter:Math.ceil(stage/6),lane:chapterLane,routeType:type,startChunk:boundaryStart[stage-1],endChunk,anchors};
  }
  const stages= endpoints.map(buildStage);
  const haversine3d=(a,b)=>{const R=6371,p1=a.latitudeDeg*Math.PI/180,p2=b.latitudeDeg*Math.PI/180,dp=(b.latitudeDeg-a.latitudeDeg)*Math.PI/180,dl=(b.longitudeDeg-a.longitudeDeg)*Math.PI/180;const q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;const ground=2*R*Math.asin(Math.sqrt(q));return Math.hypot(ground,b.altitudeKm-a.altitudeKm);};
  const catmull=(p0,p1,p2,p3,t,key)=>.5*((2*p1[key])+(-p0[key]+p2[key])*t+(2*p0[key]-5*p1[key]+4*p2[key]-p3[key])*t*t+(-p0[key]+3*p1[key]-3*p2[key]+p3[key])*t*t*t);
  function sampleSpline(anchors,stepsPerSegment=24){const out=[];for(let i=0;i<anchors.length-1;i++){const p0=anchors[Math.max(0,i-1)],p1=anchors[i],p2=anchors[i+1],p3=anchors[Math.min(anchors.length-1,i+2)];for(let j=0;j<stepsPerSegment;j++){const t=j/stepsPerSegment;out.push({latitudeDeg:catmull(p0,p1,p2,p3,t,'latitudeDeg'),longitudeDeg:catmull(p0,p1,p2,p3,t,'longitudeDeg'),altitudeKm:catmull(p0,p1,p2,p3,t,'altitudeKm')});}}out.push({...anchors.at(-1)});return out;}
  stages.forEach(s=>{s.splineSamples=sampleSpline(s.anchors);s.routeDistanceKm=round(s.splineSamples.slice(1).reduce((sum,a,i)=>sum+haversine3d(s.splineSamples[i],a),0));const qDistance=Math.ceil(s.routeDistanceKm*1000/150),qBeats=3*(6+1+1);s.targetQuestions=Math.max(18,Math.min(60,Math.max(qDistance,qBeats)));s.targetCourses=Math.ceil(s.targetQuestions/8);});
  window.KOTOBA_WORLD_ROUTE_V2={schemaVersion:2,projection:{kind:'local-azimuthal-equidistant-ENU',origin:[12.025,142.000],planetRadiusKm:6371},spline:{kind:'catmull-rom',alpha:0,samplesPerAnchorSegment:24},stages};
})();
