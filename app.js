const $=s=>document.querySelector(s);
const fmt=d3.format(',');
const COL=['#6c4cf1','#3b82f6','#16a37a','#e8912d'];
const MN=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const mlab=m=>MN[+m.slice(5,7)-1];
const T={biz:['Мой бизнес','AI-автоматизация: цели проекта и главный результат — 2 клиента на промышленные ангары за год.'],
 cl:['Клиент: металлоконструкции','Просмотры, посты, отзывы, вопросы и заявки по проекту производства металлоконструкций.']};
let view='biz';
function show(v){view=v;$('#v-biz').hidden=v!=='biz';$('#v-cl').hidden=v!=='cl';$('#filters').hidden=v!=='cl';
 $('#n-biz').setAttribute('aria-selected',v==='biz');$('#n-cl').setAttribute('aria-selected',v==='cl');
 $('#title').textContent=T[v][0];$('#sub').textContent=T[v][1];draw();}
$('#n-biz').onclick=()=>show('biz');$('#n-cl').onclick=()=>show('cl');
$('#period').onchange=draw;let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(draw,100)});
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const ICON={eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',doc:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'};
const TILES=[['views','Просмотры','eye','#6c4cf1'],['posts','Посты','doc','#3b82f6'],['reviews','Отзывы','star','#e8912d'],['questions','Вопросы агенту','chat','#16a37a'],['leads','Заявки','user','#e5484d']];
function tiles(rows){
 const box=$('#tiles');box.replaceChildren();const a=rows[rows.length-1],b=rows[rows.length-2];if(!a)return;
 TILES.forEach(([k,l,ic,c])=>{
  const t=el('div','card tile'),chip=el('div','chip');chip.style.background=c+'1f';chip.innerHTML=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[ic]}</svg>`;
  const dv=b&&+b[k]?(+a[k]-+b[k])/+b[k]:null,d=el('div','d '+(dv==null||dv===0?'flat':dv>0?'up':'down'),dv==null?'—':(dv>0?'+':'')+d3.format('.0%')(dv)+' к '+mlab(b.month));
  t.append(chip,el('div','l',l+' · '+mlab(a.month)),el('div','n',fmt(+a[k])),d);box.append(t);});
}
function line(box,rows,keys,names,cols,area){
 box.replaceChildren();const w=box.clientWidth||320,h=230,m={l:42,r:12,t:10,b:26};
 if(!rows.length){box.append(el('div','empty','Нет данных за период'));return}
 const x=d3.scalePoint(rows.map(r=>r.month),[m.l,w-m.r]).padding(.1);
 const y=d3.scaleLinear([0,d3.max(rows,r=>d3.max(keys,k=>+r[k]))||1],[h-m.b,m.t]).nice();
 const svg=d3.select(box).append('svg').attr('width','100%').attr('viewBox',`0 0 ${w} ${h}`);
 const gid='g'+Math.random().toString(36).slice(2);
 const df=svg.append('defs').append('linearGradient').attr('id',gid).attr('x2',0).attr('y2',1);
 [[0,.3],[1,0]].forEach(([o,op])=>df.append('stop').attr('offset',o).attr('stop-color',cols[0]).attr('stop-opacity',op));
 svg.selectAll('.gl').data(y.ticks(4)).join('line').attr('x1',m.l).attr('x2',w-m.r).attr('y1',y).attr('y2',y).attr('stroke','var(--grid)');
 svg.selectAll('.yt').data(y.ticks(4)).join('text').attr('x',m.l-8).attr('y',d=>y(d)+4).attr('text-anchor','end').attr('fill','var(--muted)').attr('font-size',11).text(d=>fmt(d));
 const step=Math.ceil(rows.length/6);
 svg.selectAll('.xt').data(rows.filter((r,i)=>i%step===0)).join('text').attr('x',r=>x(r.month)).attr('y',h-6).attr('text-anchor','middle').attr('fill','var(--muted)').attr('font-size',11).text(r=>mlab(r.month));
 if(area)svg.append('path').datum(rows).attr('fill',`url(#${gid})`).attr('d',d3.area().x(r=>x(r.month)).y0(h-m.b).y1(r=>y(+r[keys[0]])));
 keys.forEach((k,i)=>svg.append('path').datum(rows).attr('fill','none').attr('stroke',cols[i]).attr('stroke-width',2.5).attr('stroke-linecap','round').attr('stroke-linejoin','round').attr('d',d3.line().x(r=>x(r.month)).y(r=>y(+r[k]))));
 const tip=d3.select(box).append('div').attr('class','tip');
 const rule=svg.append('line').attr('y1',m.t).attr('y2',h-m.b).attr('stroke','var(--muted)').attr('stroke-dasharray','3 3').style('display','none');
 svg.append('rect').attr('width',w).attr('height',h).attr('fill','transparent').on('mousemove touchmove',ev=>{
  const r=d3.least(rows,r=>Math.abs(x(r.month)-d3.pointer(ev)[0]));rule.attr('x1',x(r.month)).attr('x2',x(r.month)).style('display',null);
  tip.style('display','block').style('left',Math.min(x(r.month)+10,w-150)+'px').style('top','6px').html('');tip.append('div').text(mlab(r.month)+' 2026');
  keys.forEach((k,i)=>{const d=tip.append('div');d.append('span').style('color',cols[i]).text('● ');d.append('span').text(names[i]+': '+fmt(+r[k]))});
 }).on('mouseleave',()=>{tip.style('display','none');rule.style('display','none')});
}
function legend(id,names,cols){$(id).replaceChildren(...names.map((n,i)=>{const s=el('span');const d=el('i');d.style.background=cols[i];s.append(d,n);return s}))}
function donut(box,rows){
 box.replaceChildren();const w=Math.min(box.clientWidth||260,300),r=w/2-6;
 const total=d3.sum(rows,d=>+d.count);
 const svg=d3.select(box).append('svg').attr('width','100%').attr('viewBox',`${-w/2} ${-w/2} ${w} ${w}`).style('max-height','240px');
 const arc=d3.arc().innerRadius(r*.64).outerRadius(r).cornerRadius(5).padAngle(.02);
 svg.selectAll('path').data(d3.pie().sort(null).value(d=>+d.count)(rows)).join('path').attr('d',arc).attr('fill',(d,i)=>COL[i%COL.length]).append('title').text(d=>d.data.source+': '+d.data.count);
 svg.append('text').attr('text-anchor','middle').attr('y',6).attr('font-size',30).attr('font-weight',700).attr('fill','var(--fg)').text(total);
 svg.append('text').attr('text-anchor','middle').attr('y',26).attr('font-size',11).attr('fill','var(--muted)').text('заявок');
 legend('#leg3',rows.map(d=>`${d.source} · ${d.count}`),COL);
}
function draw(){
 const goals=DATA.goals,all=DATA.metrics,last=all[all.length-1];
 const ge=$('#goals');ge.replaceChildren();
 goals.forEach(g=>{const p=Math.round(100*+g.progress),row=el('div','row'),a=el('div',null,g.goal);a.append(el('span','st',g.stage));
  const b=el('div','bar'),i=el('i');i.style.width=p+'%';b.append(i);row.append(a,b,el('div','p',p+'%'));ge.append(row)});
 $('#cl-now').textContent=last.clients;$('#gb').style.width=Math.min(100,100*last.clients/2)+'%';
 $('#gb-note').textContent=`Заявок в ${mlab(last.month)}: ${last.leads}`;
 if(view!=='cl')return;
 const n=+$('#period').value,rows=all.slice(-n);
 tiles(all);
 const per=n===12?'Весь год':`Последние ${n} мес.`;
 $('#c1-note').textContent=per+', 2026';$('#c2-note').textContent=per+', 2026';
 line($('#c1'),rows,['views'],['Просмотры'],[COL[0]],true);
 line($('#c2'),rows,['questions','leads','reviews'],['Вопросы','Заявки','Отзывы'],[COL[0],COL[1],COL[3]]);
 legend('#leg2',['Вопросы','Заявки','Отзывы'],[COL[0],COL[1],COL[3]]);
 donut($('#c3'),DATA.sources);
 const tb=$('#leads');tb.replaceChildren();
 DATA.leads.forEach(l=>{const tr=el('tr');tr.append(el('td',null,l.date.slice(8)+' '+mlab(l.date.slice(0,7))),el('td',null,l.name),el('td',null,l.source),el('td',null,l.type));
  const td=el('td');td.append(el('span','pill s-'+l.status,l.status));tr.append(td);tb.append(tr)});
}
draw();
