/* TipLab — spoločné: rok + aktívna položka menu */
(function(){
  var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
  var path=(location.pathname.split('/').pop()||'index.html')||'index.html';
  document.querySelectorAll('nav.main a').forEach(function(a){
    if(a.getAttribute('href')===path) a.classList.add('on');
  });
})();
