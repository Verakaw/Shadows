export default class Level {
  constructor(stage=1,endlessLevel=1,seed=1){
    this.stage=stage;this.name=stage===1?'Особняк':'Подвал';this.seed=seed>>>0;
    this.start={x:62,y:432};this.finish={x:847,y:220,w:42,h:58};this.platforms=[];this.keys=[];this.hazards=[];
    const p=(x,y,w,light,shadow,extra={})=>({x,y,w,h:15,solidInLight:light,solidInShadow:shadow,...extra});
    if(stage===1){
      this.platforms=[{x:0,y:500,w:960,h:40,solidInLight:true,solidInShadow:true,ground:true},p(178,420,126,true,false),p(345,344,120,false,true),p(506,275,120,true,false),p(665,349,122,false,true),p(808,278,112,true,true)];
      this.keys=[{x:240,y:385,visibleInLight:true},{x:724,y:311,visibleInShadow:true},{x:573,y:216,visibleInShadow:true}];
      this.hazards=[{x:337,y:477,w:132,h:23,type:'spikes',dangerInLight:true,dangerInShadow:false},{x:613,y:277,w:50,h:80,type:'electric',dangerInLight:false,dangerInShadow:true}];
    }else if(stage===2){
      this.start={x:48,y:432};this.finish={x:866,y:200,w:42,h:58};
      this.platforms=[{x:0,y:500,w:430,h:40,solidInLight:true,solidInShadow:true,ground:true},{x:570,y:500,w:390,h:40,solidInLight:true,solidInShadow:true,ground:true},p(130,420,110,true,false),p(280,344,110,false,true),p(430,324,100,true,true,{lift:true,baseY:324,amplitude:44,speed:1.5}),p(588,275,112,true,false),p(746,336,110,false,true),p(844,258,95,true,true)];
      this.keys=[{x:178,y:385,visibleInLight:true},{x:625,y:240,visibleInLight:true},{x:330,y:310,visibleInShadow:true},{x:782,y:299,visibleInShadow:true},{x:509,y:233,visibleInShadow:true}];
      this.hazards=[{x:300,y:477,w:105,h:23,type:'spikes',dangerInLight:true,dangerInShadow:false},{x:690,y:277,w:42,h:80,type:'electric',dangerInLight:false,dangerInShadow:true},{x:430,y:475,w:140,h:25,type:'pit',dangerInLight:true,dangerInShadow:true}];
    }else this.generateEndless(endlessLevel,p);
    this.keys.forEach(k=>{k.collected=false;k.visibleInLight=!!k.visibleInLight;k.visibleInShadow=!!k.visibleInShadow});
  }
  generateEndless(n,p){
    const startSeed=this.seed||1;let state=startSeed>>>0;
    const rng=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296};
    const pick=a=>a[Math.floor(rng()*a.length)];
    // Геометрии задают разные ритмы прыжков, а seed меняет их детали.
    const layouts=[
      [[126,430,106],[266,356,126],[424,292,104],[568,358,124],[718,284,110],[846,344,94]],
      [[112,402,122],[252,332,104],[389,382,124],[532,302,106],[678,356,122],[834,270,106]],
      [[140,438,96],[278,366,112],[428,294,124],[580,362,100],[724,306,120],[850,382,92]],
      [[104,390,116],[244,322,126],[400,376,102],[542,294,124],[692,354,104],[842,276,110]]
    ];
    const base=pick(layouts),layout=base.map(([x,y,w],i)=>[
      x+(i===0||i===5?0:Math.round((rng()-.5)*26)),
      Math.max(245,Math.min(448,y+Math.round((rng()-.5)*28))),
      Math.max(86,Math.min(132,w+Math.round((rng()-.5)*20)))
    ]);
    this.name=`Бесконечность ${n}`;this.start={x:38,y:432};this.finish={x:layout[5][0]+layout[5][2]-46,y:layout[5][1]-58,w:42,h:58};
    this.platforms=[{x:0,y:500,w:960,h:40,solidInLight:true,solidInShadow:true,ground:true}];
    const universalTarget=Math.max(2,5-Math.floor(n/2));
    const universal=new Set([0,5]);while(universal.size<Math.min(6,universalTarget))universal.add(Math.floor(rng()*6));
    const phase=rng()<.5?0:1;
    layout.forEach(([x,y,w],i)=>{
      const both=universal.has(i),light=both||((i+phase)%2===0),shadow=both||!light;
      const platform=p(x,y,w,light,shadow,{variant:Math.floor(rng()*3)});
      if(n>=3&&i>0&&i<5&&rng()<Math.min(.45,.12+n*.025))Object.assign(platform,{lift:true,baseY:y,amplitude:18+Math.floor(rng()*25),speed:.9+rng()*.9});
      this.platforms.push(platform);
    });
    const count=2+n,dangerCount=1+n,hazardGaps=[];
    const gapOrder=Array.from({length:5},(_,i)=>i).sort(()=>rng()-.5);
    for(let i=0;i<dangerCount;i++){
      const gap=gapOrder[i%gapOrder.length],a=layout[gap],b=layout[gap+1],choice=Math.floor(rng()*4);
      if(choice===0||choice===1){
        const x=Math.round((a[0]+a[2]+b[0])/2-19),y=Math.max(238,Math.min(a[1],b[1])+18+Math.floor(rng()*24));
        this.hazards.push({x,y,w:38+Math.floor(rng()*13),h:47+Math.floor(rng()*21),type:'electric',dangerInLight:choice===0,dangerInShadow:choice===1});
        hazardGaps.push({x,y,w:52,h:75});
      }else{
        const x=Math.max(195,Math.round((a[0]+a[2]+b[0])/2-30));
        this.hazards.push({x,y:477,w:42+Math.floor(rng()*30),h:23,type:'spikes',dangerInLight:choice===2,dangerInShadow:choice===3});
      }
    }
    const candidates=[];
    layout.forEach(([x,y,w],platform)=>[-42,-21,0,21,42].forEach(dx=>[-24,-44,-64].forEach(dy=>candidates.push({x:x+w/2+dx,y:y+dy,platform}))));
    const safe=candidates.filter(q=>!hazardGaps.some(h=>q.x>h.x-16&&q.x<h.x+h.w+16&&q.y>h.y-16&&q.y<h.y+h.h+16));
    for(let i=safe.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[safe[i],safe[j]]=[safe[j],safe[i]]}
    for(let i=0;i<count;i++){
      let spot=safe.length?safe[i%safe.length]:{x:layout[i%layout.length][0]+layout[i%layout.length][2]/2,y:layout[i%layout.length][1]-30,platform:i%layout.length};
      if(i>=safe.length){const base=layout[i%layout.length];spot={x:base[0]+base[2]/2+(rng()-.5)*48,y:base[1]-25-rng()*24,platform:i%layout.length}}
      const inLight=i===0?true:i===1?false:rng()<.5;
      this.keys.push({x:spot.x,y:spot.y,visibleInLight:inLight,visibleInShadow:!inLight});
    }
    this.seed=startSeed;
  }
}
