/* TipLab — tip-tracker (render). Dáta sú v tips-data.js (const TIPS). */
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

function tipBadge(v){return ({
  won:'<span class="tbadge win">✅ výhra</span>',
  lost:'<span class="tbadge lose">❌ prehra</span>',
  void:'<span class="tbadge">↩︎ void</span>',
  pending:'<span class="tbadge pend">⏳ čaká</span>'}[v]||v);}
function tipPending(tips){return tips.filter(t=>t.vysledok==='pending').length;}

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
  if(!tips.length){el.innerHTML='<div class="empty">🧪 Tu pribúdajú naše tipy — každý tu ostane aj s výsledkom, vrátane prehier.</div>';return;}
  const sorted = tips.slice().sort((a,b)=> a.datum<b.datum?1:(a.datum>b.datum?-1:0));
  el.innerHTML = sorted.map(t=>{
    const ico = t.sport==='tenis'?'🎾':'⚽';
    return `<div class="tip">
      <div class="tip-h"><span class="tip-m">${ico} ${t.zapas}</span>${tipBadge(t.vysledok)}</div>
      <div class="tip-t"><b>${t.tip}</b> <span class="tip-k">@ ${(+t.kurz).toFixed(2)}</span> <span class="sub">· ${t.datum}</span></div>
      ${t.text?`<div class="tip-a">${t.text}</div>`:''}
    </div>`;
  }).join('');
}
