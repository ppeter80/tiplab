/* TipLab — spoločné: rok + aktívna položka menu + indikátor prihlásenia */
(function(){
  var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
  var path=(location.pathname.split('/').pop()||'index.html')||'index.html';
  document.querySelectorAll('nav.main a').forEach(function(a){
    if(a.getAttribute('href')===path) a.classList.add('on');
  });
  // indikátor prihlásenia v hlavičke
  var name=localStorage.getItem('tiplab_name');
  var hw=document.querySelector('header.site .hwrap');
  if(hw && name){
    var box=document.createElement('span');
    box.style.cssText='margin-left:auto;font-size:12px;color:#8b95a3;display:flex;gap:6px;align-items:center;white-space:nowrap';
    box.innerHTML='👤 <span style="color:#eaf1f5;font-weight:600">'+name.replace(/[<>&"]/g,'')+
      '</span> <a href="gate.html?logout=1" style="color:#16d989;font-weight:600;text-decoration:none">Odhlásiť</a>';
    hw.appendChild(box);
  }
})();
