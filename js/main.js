import Game from './Game.js?v=4';import Input from './input.js?v=2';
const canvas=document.querySelector('#game'),input=new Input,game=new Game(canvas,input),primary=document.querySelector('#primary');
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>game.begin(b.dataset.mode)));
primary.addEventListener('click',()=>{if(game.state==='playing')game.pause();else if(game.state==='paused')game.start();else if(game.state==='menu')game.begin('campaign');else game.reset();primary.textContent=game.state==='playing'?'Пауза':game.state==='paused'?'Продолжить':'Начать'});
document.querySelector('#restart').addEventListener('click',()=>game.reset());
window.addEventListener('keydown',e=>{if(e.code==='KeyP'||e.code==='Escape'){e.preventDefault();game.pause()}else if(e.code==='KeyR'){e.preventDefault();game.reset()}},{passive:false});
document.querySelector('[data-control="pause"]').addEventListener('click',()=>game.pause());
document.addEventListener('visibilitychange',()=>{if(document.hidden){input.clear();if(game.state==='playing')game.pause()}else game.last=0});
