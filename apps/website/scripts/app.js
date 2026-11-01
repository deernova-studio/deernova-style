import {createDeer} from './deer.js';
const $ = selector => document.querySelector(selector);
const theme=$('#theme');
try{const saved=localStorage.getItem('deernova-theme');if(['light','dark','system'].includes(saved))theme.value=saved;}catch{}
function applyTheme(){if(theme.value==='system')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=theme.value;try{localStorage.setItem('deernova-theme',theme.value);}catch{}}
theme.addEventListener('change',applyTheme);applyTheme();
createDeer($('#ascii-deer'),$('#motion'));
const observations={
 dawn:{category:'生活习性 / 观察 001',title:'晨昏之间，森林醒来。',body:'鹿不只在清晨或傍晚活动，不过黎明与黄昏往往是它们更活跃的时段。在一日的两端，留意林缘，也留意光。',source:'WDFW',url:'https://wdfw.wa.gov/species-habitats/living/species-facts/deer'},
 antlers:{category:'生长与更新 / 观察 002',title:'旧角落下，新枝长出。',body:'鹿角是骨质结构，不同于牛羊的角。大多数长角的鹿类，会季节性地脱去鹿角，再长出新的一副。自然的生长，也包含适时放下。',source:'NPS',url:'https://home.nps.gov/articles/hornsvantlers.htm'},
 spots:{category:'保护色 / 观察 003',title:'斑点，是穿在身上的光。',body:'白尾鹿幼崽褐色皮毛上的白色斑点，帮助它们融入周围环境。静卧时，那些小小的斑点就像穿过树叶、落在地面的碎光。',source:'NPS',url:'https://www.nps.gov/articles/000/fawns-at-vafo.htm'}
};
let current='dawn', bookmarks=[], notes=[];
try{const state=JSON.parse(localStorage.getItem('deernova-field-journal')||'{}');bookmarks=Array.isArray(state.bookmarks)?state.bookmarks.filter(k=>Object.hasOwn(observations,k)):[];notes=Array.isArray(state.notes)?state.notes.filter(n=>n&&typeof n.id==='string'&&typeof n.text==='string'&&Object.hasOwn(observations,n.topic)).slice(0,50):[];}catch{}
function persist(){try{localStorage.setItem('deernova-field-journal',JSON.stringify({bookmarks,notes}));return true;}catch{return false;}}
function status(text){$('#journal-status').textContent=text;}
function renderNotes(){const list=$('#saved-notes');list.replaceChildren();for(const note of notes.filter(n=>n.topic===current)){const item=document.createElement('li'),text=document.createElement('span'),remove=document.createElement('button');text.textContent=note.text;remove.type='button';remove.textContent='移除';remove.setAttribute('aria-label','移除记录：'+note.text.slice(0,20));remove.addEventListener('click',()=>{notes=notes.filter(n=>n.id!==note.id);const saved=persist();renderNotes();status(saved?'已移除这条记录。':'已从当前页面移除；浏览器存储不可用。');});item.append(text,remove);list.append(item);}}
function renderBookmark(){const selected=bookmarks.includes(current);$('#bookmark').setAttribute('aria-pressed',String(selected));$('#bookmark span').textContent=selected?'已收藏':'收藏';$('#bookmark').setAttribute('aria-label',selected?'取消收藏当前观察':'收藏当前观察');}
function selectTopic(topic){current=topic;const data=observations[topic];document.querySelectorAll('[data-topic]').forEach(tab=>{const selected=tab.dataset.topic===topic;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});$('#observation').setAttribute('aria-labelledby','tab-'+topic);$('#entry-category').textContent=data.category;$('#entry-title').textContent=data.title;$('#entry-body').textContent=data.body;$('#entry-source').textContent='资料来源 · '+data.source+' ↗';$('#entry-source').href=data.url;renderBookmark();renderNotes();status('你的记录只保存在这台设备上。');}
const tabs=[...document.querySelectorAll('[data-topic]')];
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTopic(tab.dataset.topic));tab.addEventListener('keydown',e=>{let target;if(e.key==='ArrowDown'||e.key==='ArrowRight')target=(i+1)%tabs.length;if(e.key==='ArrowUp'||e.key==='ArrowLeft')target=(i+tabs.length-1)%tabs.length;if(e.key==='Home')target=0;if(e.key==='End')target=tabs.length-1;if(target!==undefined){e.preventDefault();tabs[target].focus();selectTopic(tabs[target].dataset.topic);}});});
$('#bookmark').addEventListener('click',()=>{const was=bookmarks.includes(current);bookmarks=was?bookmarks.filter(k=>k!==current):[...bookmarks,current];const saved=persist();renderBookmark();status(saved?(was?'已取消收藏。':'已收藏这则观察。'):'收藏状态仅保留在当前页面；浏览器存储不可用。');});
const input=$('#note');function updateCount(){$('#note-count').textContent=input.value.length+' / 280';$('#save-note').disabled=!input.value.trim();}
input.addEventListener('input',updateCount);
$('#note-form').addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim();if(!text)return;if(notes.length>=50){status('已保存 50 条记录，请移除一些记录后再添加。');return;}notes.unshift({id:crypto.randomUUID(),topic:current,text:text.slice(0,280)});const saved=persist();input.value='';updateCount();renderNotes();status(saved?'已记下这一刻。':'已记下；浏览器存储不可用，关闭页面后将丢失。');});
selectTopic(current);updateCount();
let toastTimer;$('#copy-install').addEventListener('click',async()=>{const text='npx @deernova/style@latest install';try{await navigator.clipboard.writeText(text);$('#toast').textContent='已复制安装命令';}catch{$('#toast').textContent='请手动复制上方安装命令';}$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2500);});
