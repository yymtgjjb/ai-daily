(function(){
'use strict';
var app=document.getElementById('app'),pick=document.getElementById('datepick'),
prev=document.getElementById('prev'),next=document.getElementById('next'),bar=document.getElementById('datebar');
var INDEX=[],CUR=null,FKEY='ai-daily-favs';
var CRED={official:['官方','b-official'],first:['一手','b-first'],media:['媒体','b-media']};
var CAT={'new':'新项目','classic':'高 Star 老牌','goal':'贴合你的目标'};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function safeUrl(u){return /^https?:\/\//i.test(u||'')?u:'#';}
function favs(){try{return JSON.parse(localStorage.getItem(FKEY))||{};}catch(e){return{};}}
function saveFavs(f){try{localStorage.setItem(FKEY,JSON.stringify(f));}catch(e){}}
function badge(c){var b=CRED[c]||CRED.media;return '<span class="badge '+b[1]+'">'+b[0]+'</span>';}
function favBtn(key,title,url,date){var on=!!favs()[key];
 return '<button class="fav" data-key="'+esc(key)+'" data-title="'+esc(title)+'" data-url="'+esc(url)+'" data-date="'+esc(date)+'" aria-pressed="'+on+'">'+(on?'★ 已收藏':'☆ 收藏')+'</button>';}
function linkBtn(url,label){return '<a class="link-btn" href="'+esc(safeUrl(url))+'" target="_blank" rel="noopener">'+esc(label||'看原文')+' ↗</a>';}
var ASK_SEC={'headline':'今日一句话','try':'今天最值得试','news':'要闻','repos':'开源项目','ideas':'AI 运用点子库','perks':'AI 福利'};
function askPrompt(x,section){
 var name=ASK_SEC[section]||'';
 var title=x&&(x.title||x.repo||x.text)||'';
 var url=x&&x.url||'';
 var what=x&&(x.plain||x.what||x.text)||'';
 var forYou=x&&x.for_you||'';
 var lines=['来源：每日 AI 快报'];
 if(name)lines.push('板块：'+name);
 if(title)lines.push('标题：'+title);
 if(url)lines.push('链接：'+url);
 if(what)lines.push('这是什么：'+what);
 if(forYou)lines.push('对我有什么用：'+forYou);
 lines.push('','我想了解的具体问题：','【】');
 return lines.join('\n');
}
function askBtn(x,section){
 var name=ASK_SEC[section]||'';
 var label='发给 AI 询问'+(name?' · '+name:'');
 return '<button type="button" class="ask" data-ask="'+encodeURIComponent(askPrompt(x,section))+'">'+esc(label)+'</button>';
}
var DIGEST={};
function itemDigestLines(x,i){
 var lines=['','--- 第 '+(i+1)+' 条 ---'];
 var title=x&&(x.title||x.repo||x.text)||'';
 var what=x&&(x.plain||x.what||x.text)||'';
 if(title)lines.push('标题：'+title);
 if(x&&x.url)lines.push('链接：'+x.url);
 if(what)lines.push('这是什么：'+what);
 if(x&&x.pain)lines.push('解决什么痛点：'+x.pain);
 if(x&&x.steps&&x.steps.length){lines.push('步骤：');x.steps.forEach(function(step,j){lines.push((j+1)+'. '+step);});}
 if(x&&x.how){
  if(Object.prototype.toString.call(x.how)==='[object Array]'){lines.push('具体可以怎么做：');x.how.forEach(function(step,j){lines.push((j+1)+'. '+step);});}
  else lines.push('我怎么用：'+x.how);
 }
 if(x&&x.run_with)lines.push('结合现有助手怎么跑通：'+x.run_with);
 if(x&&x.for_you)lines.push('对我有什么用：'+x.for_you);
 if(x&&x.framework)lines.push('可借鉴的思维：'+x.framework);
 if(x&&x.why)lines.push('推荐理由：'+x.why);
 if(x&&x.who)lines.push('谁能领：'+x.who);
 if(x&&x.deadline)lines.push('截止：'+x.deadline);
 if(x&&x.card)lines.push('绑卡：'+x.card);
 if(x&&x.auto_renew)lines.push('自动续费：'+x.auto_renew);
 if(x&&x.difficulty)lines.push('上手难度：'+x.difficulty);
 if(x&&x.source_name)lines.push('来源：'+x.source_name);
 return lines;
}
function digestPrompt(date,section,items){
 var name=ASK_SEC[section]||section||'';
 var list=(items||[]).filter(Boolean);
 var lines=['请用「分区淡彩看板」消化技能，带着我消化下面这一板块的每日 AI 快报。先读完全文，做成一页可视化思维看板：蓝段讲它是什么、对我有什么用；绿段讲原理和为什么成立；黄段讲能不能用、具体怎么做、有什么坑。不要编造原文没有的步骤、数字或提示词；专业术语第一次出现用大白话解释。做完把看板发给我，聊天里只写两三句要点。','','日期：'+(date||''),'板块：'+name,'共 '+list.length+' 条'];
 list.forEach(function(x,i){lines=lines.concat(itemDigestLines(x,i));});
 return lines.join('\n');
}
function digestBtn(id,date,section,items){
 var list=(items||[]).filter(Boolean);
 if(!list.length)return '';
 DIGEST[id]=digestPrompt(date,section,list);
 return '<button type="button" class="digest" data-digest-id="'+esc(id)+'">【消化】</button>';
}
var FILTER='all',SORT=false,DATA=null,MINE=['简历','求职','智能体','自动化','知识库'];
function sec(n,icon,title,body,cnt,key,extra){return '<details class="sec" open data-sec="'+key+'"><summary class="sec-h"><span class="num">'+n+'</span><h2>'+icon+' '+esc(title)+'</h2>'+(extra||'')+'<span class="cnt num">'+(cnt!=null?cnt+' 条':'')+'</span><span class="arrow" aria-hidden="true"></span></summary>'+body+'</details>';}
var OPEN={};
function item(key,head,title,brief,body){return '<details class="card item" data-k="'+esc(key)+'"'+(OPEN[key]?' open':'')+'><summary><div class="sum-main"><div class="tags">'+head+'</div><h3>'+esc(title)+'</h3><p class="plain brief">'+rich(brief)+'</p></div><span class="arrow" aria-hidden="true"></span></summary><div class="body">'+body+'</div></details>';}
function empty(t){return '<div class="card empty">'+esc(t)+'</div>';}
function fmtNum(n){n=Number(n)||0;return n>=10000?(n/10000).toFixed(1).replace(/\.0$/,'')+' 万':String(n);}
function stars(n){n=Number(n);if(!(n>=1&&n<=5))return '';return '<span class="stars" title="推荐指数 '+n+'/5" aria-label="推荐指数 '+n+' 星">'+'★'.repeat(n)+'<span class="off">'+'★'.repeat(5-n)+'</span></span>';}
function rich(s){return esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong class="term">$1</strong>');}
function field(label,body){return body?'<p class="plain"><span class="field-label">'+esc(label)+'：</span>'+rich(body)+'</p>':'';}
function forYou(x){return field('对你有什么用',x&&x.for_you);}
function framework(x){return field('可借鉴的思维',x&&x.framework);}
function tags(x){return (x.tags||[]).map(function(t){return '<span class="tag">#'+esc(t)+'</span>';}).join('');}
function match(x){if(FILTER==='all')return true;var t=x.tags||[];
 if(FILTER==='mine')return t.some(function(v){return MINE.indexOf(v)>=0;});
 if(FILTER==='简历')return t.indexOf('简历')>=0||t.indexOf('求职')>=0;return t.indexOf(FILTER)>=0;}
function prep(list){var l=(list||[]).map(function(x,i){x._i=i;return x;}).filter(match);
 if(SORT)l=l.slice().sort(function(a,b){return (b.stars_rec||0)-(a.stars_rec||0)||a._i-b._i;});return l;}
function noneMsg(def){return FILTER==='all'?def:'这个方向今天没有内容';}
function renderDay(d){
 DATA=d;DIGEST={};var h='';var hl=d.headline||{};
 h+='<div class="card hero"><div class="tags">'+(hl.credibility?badge(hl.credibility):'')+'<span class="tag">今日一句话</span></div><p class="lead">🌟 '+esc(hl.text||'今日无重大更新')+'</p>'+
   '<div class="actions">'+(hl.url?linkBtn(hl.url,'来源'):'')+askBtn(hl,'headline')+digestBtn('headline',d.date,'headline',hl&&(hl.text||hl.url)?[hl]:[])+'</div>'+'</div>';
 var t=d.try&&match(d.try)?d.try:null;
 h+=sec('01','🧪','今天最值得试',t?item('try',badge(t.credibility)+stars(t.stars_rec),t.title,t.plain,
   field('这是什么',t.plain)+forYou(t)+framework(t)+'<ol class="steps">'+(t.steps||[]).map(function(s){return '<li>'+rich(s)+'</li>';}).join('')+'</ol>'+
   '<p class="why"><span class="field-label">推荐理由：</span>'+rich(t.why)+'</p><div class="tags">'+tags(t)+'</div>'+
   '<div class="actions">'+linkBtn(t.url,'打开')+askBtn(t,'try')+favBtn(d.date+'#try',t.title,t.url,d.date)+'</div>'):empty(noneMsg('今日无重大更新')),t?1:0,'try',digestBtn('try',d.date,'try',t?[t]:[]));
 var hasIdeas=(d.ideas||[]).length;
 var ideaList=prep(d.ideas||[]);
 var nPerks=hasIdeas?'05':'04';
 var news=prep(d.news);
 h+=sec('02','📰','今日 AI 要闻',news.length?news.map(function(n){return item('news'+n._i,badge(n.credibility)+stars(n.stars_rec),n.title,n.plain,
   field('这是什么',n.plain)+forYou(n)+framework(n)+'<p class="why"><span class="field-label">推荐理由：</span>'+rich(n.why)+'</p>'+
   '<div class="meta"><span>'+esc(n.source_name)+'</span>'+(n.published?'<span class="date">'+esc(n.published)+'</span>':'')+'</div><div class="tags" style="margin-top:8px">'+tags(n)+'</div>'+
   '<div class="actions">'+linkBtn(n.url)+askBtn(n,'news')+favBtn(d.date+'#news'+n._i,n.title,n.url,d.date)+'</div>');}).join(''):empty(noneMsg('今日无重大更新')),news.length,'news',digestBtn('news',d.date,'news',news));
 var repos=prep(d.repos);
 h+=sec('03','🛠️','GitHub 项目',repos.length?repos.map(function(r){return item('repo'+r._i,'<span class="badge b-cat">'+esc(CAT[r.category]||r.category)+'</span>'+stars(r.stars_rec),r.repo,r.what,
   field('这是什么',r.what)+field('我怎么用',r.how)+forYou(r)+framework(r)+'<p class="why"><span class="field-label">推荐理由：</span>'+rich(r.why)+'</p>'+
   '<dl class="kv"><dt>Star 数</dt><dd><span class="bignum">'+fmtNum(r.stars)+'</span>（'+esc(r.stats_checked)+' 查询）</dd><dt>上手难度</dt><dd>'+esc(r.difficulty)+'</dd><dt>创建时间</dt><dd>'+esc(r.created||'—')+'</dd><dt>最近更新</dt><dd>'+esc(r.updated)+'</dd><dt>来源</dt><dd>'+badge(r.credibility||'first')+'</dd></dl>'+
   '<div class="tags" style="margin-top:8px">'+tags(r)+'</div><div class="actions">'+linkBtn(r.url,'打开 GitHub')+askBtn(r,'repos')+favBtn('repo:'+r.repo,r.repo,r.url,d.date)+'</div>');}).join(''):empty(noneMsg('今日无重大更新')),repos.length,'repos',digestBtn('repos',d.date,'repos',repos));
 if(hasIdeas){
  h+=sec('04','💡','AI 运用点子库',ideaList.length?ideaList.map(function(x){return item('idea'+x._i,badge(x.credibility)+stars(x.stars_rec)+(x.source_kind==='x'?'<span class="badge b-xhot">X 上最火</span>':''),x.title,x.what,
    field('这是做什么的',x.what)+field('解决什么痛点',x.pain)+
    '<p class="plain"><span class="field-label">具体可以怎么做：</span></p><ol class="steps">'+(x.how||[]).map(function(s){return '<li>'+rich(s)+'</li>';}).join('')+'</ol>'+
    field('结合 Grok Bot 和现有助手可以怎么跑通',x.run_with)+forYou(x)+framework(x)+
    '<p class="why"><span class="field-label">推荐理由：</span>'+rich(x.why)+'</p>'+
    '<div class="meta"><span>'+esc(x.source_name)+'</span>'+(x.published?'<span class="date">'+esc(x.published)+'</span>':'')+'</div><div class="tags" style="margin-top:8px">'+tags(x)+'</div>'+
    '<div class="actions">'+linkBtn(x.url)+askBtn(x,'ideas')+favBtn(d.date+'#idea'+x._i,x.title,x.url,d.date)+'</div>');}).join(''):empty(noneMsg('今日无可用点子')),ideaList.length,'ideas',digestBtn('ideas',d.date,'ideas',ideaList));
 }
 var perks=prep(d.perks);
 h+=sec(nPerks,'🎁','AI 福利',perks.length?perks.map(function(p){return item('perk'+p._i,badge(p.credibility)+stars(p.stars_rec),p.title,p.plain,
   field('这是什么',p.plain)+forYou(p)+framework(p)+'<dl class="kv"><dt>谁能领</dt><dd>'+esc(p.who)+'</dd><dt>截止</dt><dd>'+esc(p.deadline)+'</dd><dt>绑卡</dt><dd>'+esc(p.card)+'</dd><dt>自动续费</dt><dd>'+esc(p.auto_renew)+'</dd></dl>'+
   '<p class="why"><span class="field-label">推荐理由：</span>'+rich(p.why)+'</p><div class="actions">'+linkBtn(p.url,'官方链接')+askBtn(p,'perks')+favBtn(d.date+'#perk'+p._i,p.title,p.url,d.date)+'</div>');}).join(''):empty(noneMsg('今日无新福利')),perks.length,'perks',digestBtn('perks',d.date,'perks',perks));
 if(d.note)h+='<p class="note">ℹ️ '+esc(d.note)+'</p>';
 app.innerHTML=h;
 syncAll();
}
function syncAll(){var b=document.getElementById('toggleAll');if(!b)return;var it=app.querySelectorAll('details.item');
 var all=it.length&&Array.prototype.every.call(it,function(x){return x.open;});b.textContent=all?'全部收起':'全部展开';b.setAttribute('aria-expanded',String(!!all));}
app.addEventListener('toggle',function(e){var x=e.target;if(x.classList&&x.classList.contains('item')){if(x.open)OPEN[x.dataset.k]=1;else delete OPEN[x.dataset.k];syncAll();}},true);
function renderArchive(){
 app.innerHTML='<section><div class="sec-h"><h2>🗂️ 往期列表</h2></div>'+(INDEX.length?INDEX.map(function(e){return '<div class="card archive"><a href="?date='+esc(e.date)+'" data-date="'+esc(e.date)+'"><div class="date">'+esc(e.date)+'</div><div>'+esc(e.headline)+'</div></a></div>';}).join(''):empty('还没有往期'))+'</section>';
}
function renderFavs(){
 var f=favs(),keys=Object.keys(f).sort(function(a,b){return (f[b].t||0)-(f[a].t||0);});
 app.innerHTML='<section><div class="sec-h"><h2>⭐ 我的收藏</h2></div><p class="muted">只保存在这台设备的浏览器里，换设备或清缓存会丢失。</p>'+(keys.length?keys.map(function(k){var x=f[k];
  return '<div class="card"><h3>'+esc(x.title)+'</h3><div class="meta"><span>收藏自 '+esc(x.date)+'</span></div><div class="actions">'+linkBtn(x.url)+askBtn(x)+favBtn(k,x.title,x.url,x.date)+'</div></div>';}).join(''):empty('还没有收藏，点卡片上的「☆ 收藏」即可'))+'</section>';
}
function setView(v){
 Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(b){b.setAttribute('aria-pressed',String(b.dataset.view===v));});
 bar.classList.toggle('hidden',v!=='day');document.getElementById('filters').classList.toggle('hidden',v!=='day');document.getElementById('toggleAll').classList.toggle('hidden',v!=='day');
 if(v==='archive')renderArchive();else if(v==='favs')renderFavs();else loadDay(CUR);
}
function updateNav(){var i=INDEX.findIndex(function(e){return e.date===CUR;});
 prev.disabled=i<0||i>=INDEX.length-1; next.disabled=i<=0; pick.value=CUR;}
function loadDay(date){
 if(!date){app.innerHTML=empty('还没有任何一期');return;}
 CUR=date;updateNav();
 var u=new URL(location.href);u.searchParams.set('date',date);u.searchParams.delete('open');u.hash='';history.replaceState(null,'',u);
 app.innerHTML='<p class="muted">加载中…</p>';
 fetch('data/'+date+'.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
 .then(renderDay).catch(function(){app.innerHTML=empty('这一天的快报没找到（'+date+'）');});
}
document.addEventListener('click',function(e){
 var t=e.target.closest('button,a[data-date]');if(!t)return;
 if(t.classList.contains('chip')){FILTER=t.dataset.f;Array.prototype.forEach.call(document.querySelectorAll('.chip'),function(c){c.setAttribute('aria-pressed',String(c===t));});if(DATA)renderDay(DATA);}
 else if(t.id==='toggleAll'){var it=app.querySelectorAll('details.item'),open=t.getAttribute('aria-expanded')!=='true';
  Array.prototype.forEach.call(app.querySelectorAll('details.sec'),function(x){x.open=true;});
  Array.prototype.forEach.call(it,function(x){x.open=open;if(open)OPEN[x.dataset.k]=1;else delete OPEN[x.dataset.k];});syncAll();}
 else if(t.id==='sort'){SORT=!SORT;t.setAttribute('aria-pressed',String(SORT));t.textContent=SORT?'按默认顺序':'按推荐排序';if(DATA)renderDay(DATA);}
 else if(t.classList.contains('tab')){setView(t.dataset.view);}
 else if(t.classList.contains('fav')){var f=favs(),k=t.dataset.key;
  if(f[k])delete f[k];else f[k]={title:t.dataset.title,url:t.dataset.url,date:t.dataset.date,t:Date.now()};
  saveFavs(f);var on=!!f[k];t.setAttribute('aria-pressed',String(on));t.textContent=on?'★ 已收藏':'☆ 收藏';}
 else if(t.classList.contains('ask')||t.classList.contains('digest')){
  e.preventDefault();e.stopPropagation();
  var text='';
  if(t.classList.contains('digest'))text=DIGEST[t.getAttribute('data-digest-id')]||'';
  else{try{text=decodeURIComponent(t.dataset.ask||'');}catch(err){text=t.dataset.ask||'';}}
  var okText=t.classList.contains('digest')?'已复制消化提问':'已复制提问';
  function painted(ok){var old=t.getAttribute('data-label')||t.textContent;if(!t.getAttribute('data-label'))t.setAttribute('data-label',old);t.textContent=ok?okText:'复制失败，请重试';clearTimeout(t._askTimer);t._askTimer=setTimeout(function(){t.textContent=t.getAttribute('data-label');},1600);}
  function fallback(){var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px';document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy');}catch(err){}document.body.removeChild(ta);painted(ok);}
  if(!text){painted(false);return;}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){painted(true);}).catch(fallback);
  else fallback();}
 else if(t.matches('a[data-date]')){e.preventDefault();setView('day');loadDay(t.dataset.date);}
});
prev.onclick=function(){var i=INDEX.findIndex(function(e){return e.date===CUR;});if(i<INDEX.length-1)loadDay(INDEX[i+1].date);};
next.onclick=function(){var i=INDEX.findIndex(function(e){return e.date===CUR;});if(i>0)loadDay(INDEX[i-1].date);};
pick.onchange=function(){loadDay(pick.value);};
(new URLSearchParams(location.search).get('open')||'').split(',').forEach(function(k){if(k)OPEN[k]=1;});
fetch('data/index.json',{cache:'no-cache'}).then(function(r){return r.json();}).then(function(idx){
 INDEX=(idx.days||[]).slice().sort(function(a,b){return a.date<b.date?1:-1;});
 pick.innerHTML=INDEX.map(function(e){return '<option value="'+esc(e.date)+'">'+esc(e.date)+'</option>';}).join('');
 var q=new URLSearchParams(location.search).get('date')||location.hash.replace('#','');
 var ok=INDEX.some(function(e){return e.date===q;});
 CUR=ok?q:(INDEX[0]&&INDEX[0].date);
 if(q&&!ok&&/^\d{4}-\d{2}-\d{2}$/.test(q)){CUR=q;}
 loadDay(CUR);
}).catch(function(){app.innerHTML=empty('往期清单加载失败，请稍后刷新');});
})();
