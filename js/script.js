// Filtre des projets
const boutons = document.querySelectorAll('.filters button');
const projets = document.querySelectorAll('.project');
boutons.forEach(b => b.addEventListener('click', () => {
  boutons.forEach(x => x.setAttribute('aria-pressed', x === b));
  const f = b.dataset.filter;
  projets.forEach(p => { p.hidden = f !== 'all' && p.dataset.cat !== f; });
}));
// Mixer : Mute / Solo
const mixer = () => {
  const solo = [...projets].some(p => p.querySelector('.s').getAttribute('aria-pressed') === 'true');
  projets.forEach(p => {
    const m = p.querySelector('.m').getAttribute('aria-pressed') === 'true';
    const s = p.querySelector('.s').getAttribute('aria-pressed') === 'true';
    p.classList.toggle('dim', m || (solo && !s));
  });
};
document.querySelectorAll('.ms button').forEach(b => b.addEventListener('click', () => {
  b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
  mixer();
}));
// Forme d'onde de fond : les barres se colorent selon la progression du défilement
const wave = document.getElementById('wave');
let bars = [];
function frac(x){ return x - Math.floor(x); }
function drawWave(){
  const W = innerWidth, H = innerHeight, step = 9, n = Math.floor(W / step);
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = 0.3 + 0.7 * Math.abs(Math.sin(t * 9) * 0.6 + Math.sin(t * 23 + 1) * 0.4);
    const noise = 0.5 + 0.5 * frac(Math.sin(i * 12.9898) * 43758.5453);
    const v = Math.max(0.03, env * noise) * H * 0.4;
    out += '<rect x="' + (i * step + 1) + '" y="' + (H / 2 - v).toFixed(1) +
           '" width="5" height="' + (2 * v).toFixed(1) + '" rx="2.5"/>';
  }
  wave.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + out + '</svg>';
  bars = wave.querySelectorAll('rect');
  playWave();
}
function playWave(){
  const max = document.documentElement.scrollHeight - innerHeight;
  const r = max > 0 ? scrollY / max : 0;
  const limit = Math.round(r * bars.length);
  bars.forEach((b, i) => b.classList.toggle('on', i < limit));
}
drawWave();
addEventListener('resize', drawWave);
addEventListener('scroll', playWave, {passive:true});
// Barre de transport : lecture auto, stop, compteur
const playBtn = document.getElementById('play'), stopBtn = document.getElementById('stop'), timeEl = document.getElementById('time');
const DUREE = 90; // durée "du morceau" en secondes
let lecture = false, y = 0, dernier = 0;
function compteur(){
  const max = document.documentElement.scrollHeight - innerHeight;
  const sec = Math.round((max > 0 ? scrollY / max : 0) * DUREE);
  timeEl.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
}
function arret(){ lecture = false; playBtn.setAttribute('aria-pressed', 'false'); playBtn.textContent = '▶'; }
function pas(t){
  if (!lecture) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  if (Math.abs(scrollY - y) > 4 || y >= max) { arret(); return; } // l'utilisateur a repris la main, ou fin
  y += 70 * (t - dernier) / 1000; dernier = t;
  scrollTo({top: y, behavior: 'instant'});
  requestAnimationFrame(pas);
}
playBtn.addEventListener('click', () => {
  if (lecture) { arret(); return; }
  lecture = true; y = scrollY; dernier = performance.now();
  playBtn.setAttribute('aria-pressed', 'true'); playBtn.textContent = '❚❚';
  requestAnimationFrame(pas);
});
stopBtn.addEventListener('click', () => { arret(); scrollTo({top: 0, behavior: 'smooth'}); });
addEventListener('scroll', compteur, {passive:true});
compteur();
// Année du pied de page
document.getElementById('annee').textContent = new Date().getFullYear();
document.getElementById('maj').textContent = new Date(document.lastModified).toLocaleDateString('fr-FR');

// Bouton de thème clair / sombre (le choix est mémorisé dans le navigateur)
const themeBtn = document.getElementById('theme');
function majBoutonTheme(){
  const sombre = document.documentElement.getAttribute('data-theme') === 'dark';
  themeBtn.setAttribute('aria-label', sombre ? 'Passer au thème clair' : 'Passer au thème sombre');
}
themeBtn.addEventListener('click', () => {
  const suivant = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', suivant);
  try { localStorage.setItem('theme', suivant); } catch (e) {}
  majBoutonTheme();
});
// Sans choix mémorisé, on suit les changements de réglage de l'appareil
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  let memo = null;
  try { memo = localStorage.getItem('theme'); } catch (err) {}
  if (!memo) { document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light'); majBoutonTheme(); }
});
majBoutonTheme();
