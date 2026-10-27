// Минимальная замена dash API: данные берутся из data/*.js
(function(){
  const fns=[];
  window.dash={
    colors:['#2f6fed','#e07a1f','#2a9d6f','#8b5cf6','#d6336c','#0ea5b7','#a3a33a','#6b7280'],
    data:id=>window.DATA&&DATA[id]?{status:'ok',data:DATA[id],columns:Object.keys(DATA[id][0]||{})}:{status:'missing',data:[]},
    onData:fn=>{fns.push(fn);fn();}
  };
  let t;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>fns.forEach(f=>f()),100);});
})();
