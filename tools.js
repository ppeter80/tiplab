/* TipLab — kalkulačky (klient-side, bez backendu) */
const $t = id => document.getElementById(id);
const eurT = n => (Math.round(n*100)/100).toLocaleString('sk-SK',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const pctT = n => (Math.round(n*100)/100).toLocaleString('sk-SK',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';
const num = id => +($t(id)||{}).value || 0;
function bind(ids, fn){ ids.forEach(id=>{const e=$t(id); if(e) e.addEventListener('input',fn);}); if(ids.some(id=>$t(id))) fn(); }

/* 1) Value / EV */
function valueCalc(){
  const p=Math.min(1,Math.max(0,num('v_p')/100)), o=num('v_o'), bank=num('v_bank');
  const out=$t('v_out'), verd=$t('v_verd'); if(!out) return;
  if(o<1.01||p<=0){out.innerHTML='<div class="sub">Zadaj kurz ≥ 1,01 a pravdepodobnosť > 0.</div>';verd.className='verdict';return;}
  const impl=1/o, edge=p*o-1, kelly=o>1?Math.max(0,edge/(o-1)):0, kHalf=kelly/2, cls=edge>0?'pos':'neg';
  out.innerHTML=
    `<div class="stat"><span>Implikovaná pravdepodobnosť (z kurzu)</span><b>${pctT(impl*100)}</b></div>`+
    `<div class="stat"><span>Tvoja pravdepodobnosť</span><b>${pctT(p*100)}</b></div>`+
    `<div class="stat"><span>Value / edge</span><b class="${cls}">${(edge>0?'+':'')+pctT(edge*100)}</b></div>`+
    `<div class="stat"><span>Očakávaný zisk (EV) na 1 € stávky</span><b class="${cls}">${(edge>0?'+':'')+eurT(edge)}</b></div>`+
    `<div class="stat"><span>Odporúčaná stávka (½ Kelly)</span><b>${edge>0?eurT(kHalf*bank)+' · '+pctT(kHalf*100)+' bankrollu':'—'}</b></div>`;
  if(edge>0){verd.className='verdict ok';verd.textContent=`✅ Value stávka: kurz ${$t('v_o').value} je vyšší, než zodpovedá tvojmu odhadu. Dlhodobo +${pctT(edge*100)} na vsadené €.`;}
  else{verd.className='verdict no';verd.textContent=`⛔ Žiadna value: pri tomto kurze je stávka dlhodobo stratová (${pctT(edge*100)}). Nestávkuj len kvôli favoritovi.`;}
}

/* 2) Staking / Kelly */
function stakeCalc(){
  const bank=num('s_bank'), o=num('s_o'), p=Math.min(1,Math.max(0,num('s_p')/100));
  const frac=+($t('s_frac')||{}).value||1;
  const out=$t('s_out'); if(!out) return;
  if(o<1.01||p<=0||bank<=0){out.innerHTML='<div class="sub">Zadaj bankroll, kurz ≥ 1,01 a pravdepodobnosť > 0.</div>';return;}
  const edge=p*o-1, kelly=Math.max(0,edge/(o-1)), used=kelly*frac, stake=used*bank;
  if(edge<=0){out.innerHTML='<div class="verdict no" style="display:block">⛔ Bez edge (kurz je nízky voči tvojmu odhadu) → Kelly odporúča <b>nestávkovať</b>.</div>';return;}
  out.innerHTML=
    `<div class="stat"><span>Edge</span><b class="pos">+${pctT(edge*100)}</b></div>`+
    `<div class="stat"><span>Plný Kelly</span><b>${pctT(kelly*100)} bankrollu</b></div>`+
    `<div class="stat"><span>Zvolený zlomok Kelly</span><b>${frac===1?'plný':frac===0.5?'½':'¼'} (${pctT(used*100)})</b></div>`+
    `<div class="stat"><span>Odporúčaná stávka</span><b class="big pos">${eurT(stake)}</b></div>`+
    `<div class="sub" style="margin-top:8px">Tip: väčšina profíkov hrá ½ alebo ¼ Kelly kvôli menšej variancii.</div>`;
}

/* 3) Surebet / arbitráž (2 výsledky) */
function arbCalc(){
  const a=num('a_a'), b=num('a_b'), total=num('a_total');
  const out=$t('a_out'); if(!out) return;
  if(a<1.01||b<1.01){out.innerHTML='<div class="sub">Zadaj oba kurzy ≥ 1,01 (na opačné výsledky u dvoch stávkovní).</div>';return;}
  const inv=1/a+1/b, margin=(inv-1)*100;
  if(inv>=1){
    out.innerHTML=`<div class="verdict no" style="display:block">⛔ Nie je surebet. Súčet implikovaných pravdepodobností = <b>${pctT(inv*100)}</b> (marža stávkovní +${pctT(margin)}). Bezrizikový zisk nie je možný.</div>`;return;
  }
  const stA=total*(1/a)/inv, stB=total*(1/b)/inv, payout=total/inv, profit=payout-total;
  out.innerHTML=
    `<div class="verdict ok" style="display:block">✅ SUREBET! Súčet implikovaných = ${pctT(inv*100)} < 100 %. Garantovaný zisk <b>${eurT(profit)}</b> (${pctT(profit/total*100)}).</div>`+
    `<div class="stat"><span>Staviť na výsledok A (kurz ${a})</span><b>${eurT(stA)}</b></div>`+
    `<div class="stat"><span>Staviť na výsledok B (kurz ${b})</span><b>${eurT(stB)}</b></div>`+
    `<div class="stat"><span>Výplata (nech padne čokoľvek)</span><b>${eurT(payout)}</b></div>`+
    `<div class="stat"><span>Garantovaný zisk</span><b class="pos">+${eurT(profit)}</b></div>`;
}

/* 4) AKU / parlay */
function parlayCalc(){
  const raw=($t('k_odds')||{}).value||'', stake=num('k_stake');
  const out=$t('k_out'); if(!out) return;
  const odds=raw.split(/[,;\s]+/).map(x=>parseFloat(x.replace(',','.'))).filter(n=>n>1);
  if(odds.length<2){out.innerHTML='<div class="sub">Zadaj aspoň 2 kurzy oddelené čiarkou (napr. 1.8, 2.1, 1.5).</div>';return;}
  const total=odds.reduce((s,o)=>s*o,1), payout=stake*total, profit=payout-stake;
  out.innerHTML=
    `<div class="stat"><span>Počet stávok v akumulátore</span><b>${odds.length}</b></div>`+
    `<div class="stat"><span>Celkový kurz</span><b class="big">${total.toFixed(2)}</b></div>`+
    `<div class="stat"><span>Výplata (pri stávke ${eurT(stake)})</span><b>${eurT(payout)}</b></div>`+
    `<div class="stat"><span>Čistý zisk</span><b class="pos">+${eurT(profit)}</b></div>`+
    `<div class="sub" style="margin-top:8px">Pozor: každý pridaný zápas zvyšuje kurz aj riziko — akumulátory majú dlhodobo nižšiu úspešnosť.</div>`;
}

/* 5) Prevodník kurzov */
function toFraction(x){ // x = desatinný kurz; vráti zlomkový (num/den, den<=20)
  const dec=x-1; let best={n:1,d:1,e:1e9};
  for(let d=1;d<=20;d++){const n=Math.round(dec*d);const e=Math.abs(dec-n/d);if(n>0&&e<best.e)best={n,d,e};}
  return best.n+'/'+best.d;
}
function convCalc(){
  const o=num('c_o'), out=$t('c_out'); if(!out) return;
  if(o<1.01){out.innerHTML='<div class="sub">Zadaj desatinný kurz ≥ 1,01.</div>';return;}
  const impl=1/o*100;
  const am = o>=2 ? '+'+Math.round((o-1)*100) : '−'+Math.round(100/(o-1));
  out.innerHTML=
    `<div class="stat"><span>Desatinný (európsky)</span><b>${o.toFixed(2)}</b></div>`+
    `<div class="stat"><span>Zlomkový (UK)</span><b>${toFraction(o)}</b></div>`+
    `<div class="stat"><span>Americký (moneyline)</span><b>${am}</b></div>`+
    `<div class="stat"><span>Implikovaná pravdepodobnosť</span><b>${pctT(impl)}</b></div>`;
}

/* 6) Porovnávač kurzov (tá istá stávka u viacerých stávkovní) */
function compareCalc(){
  const stake=num('pk_stake'), rows=[];
  for(let i=1;i<=4;i++){
    const o=+($t('pk_o'+i)||{}).value||0;
    const n=((($t('pk_n'+i)||{}).value)||('Stávkovňa '+i)).trim()||('Stávkovňa '+i);
    if(o>1) rows.push({n,o});
  }
  const out=$t('pk_out'); if(!out) return;
  if(rows.length<2){out.innerHTML='<div class="sub">Zadaj kurz aspoň pri dvoch stávkovniach.</div>';return;}
  rows.sort((a,b)=>b.o-a.o);
  const best=rows[0], worst=rows[rows.length-1], diff=stake*(best.o-worst.o);
  let h=rows.map((r,i)=>`<div class="stat"><span>${i===0?'🏆 ':''}${r.n}</span><b class="${i===0?'pos':''}">${r.o.toFixed(2)}${i===0?' · '+eurT(stake*r.o):''}</b></div>`).join('');
  h+=`<div class="verdict ok" style="display:block">🏆 Najlepší kurz: <b>${best.n} (${best.o.toFixed(2)})</b>. Pri stávke ${eurT(stake)} vyhráš <b>${eurT(stake*best.o)}</b> — o <b>${eurT(diff)}</b> viac než pri najhoršom (${worst.n} ${worst.o.toFixed(2)}).</div>`;
  out.innerHTML=h;
}

function initTools(){
  bind(['pk_o1','pk_o2','pk_o3','pk_o4','pk_n1','pk_n2','pk_n3','pk_n4','pk_stake'], compareCalc);
  bind(['v_p','v_o','v_bank'], valueCalc);
  bind(['s_bank','s_o','s_p','s_frac'], stakeCalc);
  bind(['a_a','a_b','a_total'], arbCalc);
  bind(['k_odds','k_stake'], parlayCalc);
  bind(['c_o'], convCalc);
}
