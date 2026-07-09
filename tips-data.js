/* TipLab — DÁTA TIPOV (backend v1; aktualizuje Robin/AI).
   Schéma tipu: {datum:'YYYY-MM-DD', sport:'futbal'|'tenis', zapas, tip, kurz:Number,
     jednotka:Number(stávka v jednotkách, default 1), vysledok:'won'|'lost'|'void'|'pending', text:'krátka analýza'}
   Kurzy sú orientačné (odhad trhu v čase tipu); pri ostrej prevádzke sa loguje reálny kurz stávkovne. */
const TIPS = [
  {
    id:'t2026-0710-sinner',
    datum:'2026-07-10', sport:'tenis',
    zapas:'Wimbledon, semifinále: Sinner – Djokovič',
    tip:'Jannik Sinner víťaz zápasu', kurz:1.55, jednotka:1, vysledok:'pending',
    text:'Sinner je obhajcom titulu a na tráve v skvelej forme. Djokovič (38) postúpil cez vyčerpávajúcu 5-setovú, takmer 5-hodinovú bitku s Augerom-Aliassimom — únava proti mladšiemu súperovi je reálny faktor. Pri kurze okolo 1,55 vidíme miernu value na Sinnera.'
  },
  {
    id:'t2026-0710-esp',
    datum:'2026-07-10', sport:'futbal',
    zapas:'MS 2026, štvrťfinále: Belgicko – Španielsko',
    tip:'Španielsko víťaz (1X2, riadny čas)', kurz:1.95, jednotka:1, vysledok:'pending',
    text:'Španielsko má mladší, kompaktnejší tím s dominantnou držbou lopty; belgická „zlatá generácia" je za zenitom. Favorit s kurzom blízko 2,00 v zápase, kde očakávame španielsku kontrolu — value.'
  },
  {
    id:'t2026-0711-arg',
    datum:'2026-07-11', sport:'futbal',
    zapas:'MS 2026, štvrťfinále: Argentína – Švajčiarsko',
    tip:'Argentína −1 (ázijský hendikep)', kurz:1.85, jednotka:1, vysledok:'pending',
    text:'Úradujúci majster sveta proti defenzívnemu Švajčiarsku. Čistá výhra má nízky kurz, preto ideme na hendikep −1: pri presvedčivom argentínskom víťazstve o dva a viac gólov je to lepšia value než 1X2.'
  }
];
