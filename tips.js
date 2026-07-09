/* TipLab — dáta tipov + tip-tracker (zdieľané) */
/* Každý tip: {datum:'YYYY-MM-DD', sport:'futbal'|'tenis', zapas, tip, kurz:Number,
   jednotka:Number(=stávka v jednotkách,default 1), vysledok:'won'|'lost'|'void'|'pending'} */
/* ZATIAĽ PRÁZDNE — žiadne vymyslené výsledky. Reálne tipy pridávame počas MS 2026 a Wimbledonu. */
const TIPS = [];

const _eur = n => (Math.round(n*100)/100).toLocaleString('sk-SK',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const _pct = n => (Math.round(n*100)/100).toLocaleString('sk-SK',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';
const _u = n => (Math.round(n*100)/100).toLocaleString('sk-SK',{minimumFractionDigits:2,maximumFractionDigits:2});

function tipStats(tips){
  const settled = tips.filter(t=>t.vysledok==='won'||t.vysledok==='lost');
  const staked = settled.reduce((s,t)=>s+(t.jednotka||1),0);
  const profit = settled.reduce((s,t)=>{const u=t.jednotka||1;return s+(t.vysledok==='won'?u*(t.kurz-1):-u);},0);
  const wins = settled.filter(t=>t.vysledok==='won').length;
  return {n:settled.length,staked,profit,wins,
    yield: staked>0?profit/staked*100:0,
    wr: settled.length?wins/settled.length*100:0};
}

function tipBadge(v){return ({won:'<span class="pos">✅ výhra</span>',lost:'<span class="neg">❌ prehra</span>',
  void:'<span class="sub">↩︎ void</span>',pending:'<span class="sub">⏳ čaká</span>'}[v]||v);}

function renderTrackerStats(elId, tips){
  const s = tipStats(tips), pc = s.profit>=0?'pos':'neg';
  document.getElementById(elId).innerHTML =
    `<div class="box"><div class="k">Tipov (uzavretých)</div><div class="v">${s.n}</div></div>`+
    `<div class="box"><div class="k">Úspešnosť</div><div class="v">${s.n?_pct(s.wr):'—'}</div></div>`+
    `<div class="box"><div class="k">Yield</div><div class="v ${pc}">${s.n?(s.profit>=0?'+':'')+_pct(s.yield):'—'}</div></div>`+
    `<div class="box"><div class="k">Zisk (jednotky)</div><div class="v ${pc}">${s.n?(s.profit>=0?'+':'')+_u(s.profit):'—'}</div></div>`;
}

function renderTrackerTable(elId, tips){
  const el = document.getElementById(elId);
  if(!tips.length){el.innerHTML='<div class="empty">🧪 Prvé tipy pridávame počas <b>MS 2026</b> a Wimbledonu. Každý tip tu ostane aj s výsledkom — vrátane prehier.</div>';return;}
  let h='<div class="tablewrap"><table><thead><tr><th>Dátum</th><th>Zápas / tip</th><th class="r">Kurz</th><th class="r">Výsledok</th></tr></thead><tbody>';
  tips.forEach(t=>{h+=`<tr><td>${t.datum}<br><span class="sub">${t.sport==='tenis'?'🎾':'⚽'} ${t.sport||''}</span></td>`+
    `<td>${t.zapas}<br><span class="sub">${t.tip}</span></td>`+
    `<td class="r">${(+t.kurz).toFixed(2)}</td><td class="r">${tipBadge(t.vysledok)}</td></tr>`;});
  h+='</tbody></table></div>';
  el.innerHTML=h;
}
