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
function sec(n,title,body){return '<section><h2><span class="num">'+n+'</span>'+esc(title)+'</h2>'+body+'</section>';}
function empty(t){return '<div class="card empty">'+esc(t)+'</div>';}
function fmtNum(n){n=Number(n)||0;return n>=10000?(n/10000).toFixed(1).replace(/\.0$/,'')+' 万':String(n);}

function renderDay(d){
 var h='';
 var hl=d.headline||{};
 h+=sec(1,'今日一句话','<div class="card hero"><p>'+esc(hl.text||'今日无重大更新')+'</p>'+
   (hl.url?'<div class="meta">'+badge(hl.credibility)+linkBtn(hl.url,'来源')+'</div>':'')+'</div>');
 var t=d.try;
 h+=sec(2,'今天最值得试的一件事', t?('<div class="card"><h3>'+esc(t.title)+'</h3><p class="plain">'+esc(t.plain)+'</p>'+
   '<ol class="steps">'+(t.steps||[]).map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol>'+
   '<p class="why"><b>推荐理由：</b>'+esc(t.why)+'</p><div class="meta">'+badge(t.credibility)+'</div>'+
   '<div class="actions">'+linkBtn(t.url,'打开')+favBtn(d.date+'#try',t.title,t.url,d.date)+'</div></div>'):empty('今日无重大更新'));
 var news=d.news||[];
 h+=sec(3,'今日 AI 要闻',news.length?news.map(function(n,i){return '<div class="card"><h3>'+esc(n.title)+'</h3><p class="plain">'+esc(n.plain)+'</p>'+
   '<p class="why"><b>推荐理由：</b>'+esc(n.why)+'</p><div class="meta">'+badge(n.credibility)+'<span>'+esc(n.source_name)+'</span>'+(n.published?'<span>'+esc(n.published)+'</span>':'')+'</div>'+
   '<div class="actions">'+linkBtn(n.url)+favBtn(d.date+'#news'+i,n.title,n.url,d.date)+'</div></div>';}).join(''):empty('今日无重大更新'));
 var repos=d.repos||[];
 h+=sec(4,'GitHub 项目',repos.length?repos.map(function(r){return '<div class="card"><h3>'+esc(r.repo)+'</h3>'+
   '<div class="meta" style="margin:0 0 8px"><span class="badge b-media">'+esc(CAT[r.category]||r.category)+'</span>'+badge(r.credibility||'first')+'</div>'+
   '<p class="plain"><b>这是什么：</b>'+esc(r.what)+'</p><p class="plain"><b>我怎么用：</b>'+esc(r.how)+'</p>'+
   '<p class="why"><b>推荐理由：</b>'+esc(r.why)+'</p>'+
   '<dl class="kv"><dt>上手难度</dt><dd>'+esc(r.difficulty)+'</dd><dt>Star 数</dt><dd>'+fmtNum(r.stars)+'（'+esc(r.stats_checked)+' 查询）</dd><dt>最近更新</dt><dd>'+esc(r.updated)+'</dd></dl>'+
   '<div class="actions">'+linkBtn(r.url,'打开 GitHub')+favBtn('repo:'+r.repo,r.repo,r.url,d.date)+'</div></div>';}).join(''):empty('今日无重大更新'));
 var perks=d.perks||[];
 h+=sec(5,'AI 福利',perks.length?perks.map(function(p,i){return '<div class="card"><h3>'+esc(p.title)+'</h3><p class="plain">'+esc(p.plain)+'</p>'+
   '<p class="why"><b>推荐理由：</b>'+esc(p.why)+'</p>'+
   '<dl class="kv"><dt>谁能领</dt><dd>'+esc(p.who)+'</dd><dt>截止时间</dt><dd>'+esc(p.deadline)+'</dd><dt>要绑卡吗</dt><dd>'+esc(p.card)+'</dd><dt>自动续费</dt><dd>'+esc(p.auto_renew)+'</dd></dl>'+
   '<div class="meta">'+badge(p.credibility)+'</div><div class="actions">'+linkBtn(p.url,'官方链接')+favBtn(d.date+'#perk'+i,p.title,p.url,d.date)+'</div></div>';}).join(''):empty('今日无新福利'));
 if(d.note)h+='<p class="muted">'+esc(d.note)+'</p>';
 app.innerHTML=h;
}
function renderArchive(){
 app.innerHTML='<section><h2>往期列表</h2>'+(INDEX.length?INDEX.map(function(e){return '<div class="card archive"><a href="?date='+esc(e.date)+'" data-date="'+esc(e.date)+'"><div class="d">'+esc(e.date)+'</div><div>'+esc(e.headline)+'</div></a></div>';}).join(''):empty('还没有往期'))+'</section>';
}
function renderFavs(){
 var f=favs(),keys=Object.keys(f).sort(function(a,b){return (f[b].t||0)-(f[a].t||0);});
 app.innerHTML='<section><h2>我的收藏</h2><p class="muted">只保存在这台设备的浏览器里，换设备或清缓存会丢失。</p>'+(keys.length?keys.map(function(k){var x=f[k];
  return '<div class="card"><h3>'+esc(x.title)+'</h3><div class="meta"><span>收藏自 '+esc(x.date)+'</span></div><div class="actions">'+linkBtn(x.url)+favBtn(k,x.title,x.url,x.date)+'</div></div>';}).join(''):empty('还没有收藏，点卡片上的「☆ 收藏」即可'))+'</section>';
}
function setView(v){
 Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(b){b.setAttribute('aria-pressed',String(b.dataset.view===v));});
 bar.classList.toggle('hidden',v!=='day');
 if(v==='archive')renderArchive();else if(v==='favs')renderFavs();else loadDay(CUR);
}
function updateNav(){var i=INDEX.findIndex(function(e){return e.date===CUR;});
 prev.disabled=i<0||i>=INDEX.length-1; next.disabled=i<=0; pick.value=CUR;}
function loadDay(date){
 if(!date){app.innerHTML=empty('还没有任何一期');return;}
 CUR=date;updateNav();
 var u=new URL(location.href);u.searchParams.set('date',date);u.hash='';history.replaceState(null,'',u);
 app.innerHTML='<p class="muted">加载中…</p>';
 fetch('data/'+date+'.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
 .then(renderDay).catch(function(){app.innerHTML=empty('这一天的快报没找到（'+date+'）');});
}
document.addEventListener('click',function(e){
 var t=e.target.closest('button,a[data-date]');if(!t)return;
 if(t.classList.contains('tab')){setView(t.dataset.view);}
 else if(t.classList.contains('fav')){var f=favs(),k=t.dataset.key;
  if(f[k])delete f[k];else f[k]={title:t.dataset.title,url:t.dataset.url,date:t.dataset.date,t:Date.now()};
  saveFavs(f);var on=!!f[k];t.setAttribute('aria-pressed',String(on));t.textContent=on?'★ 已收藏':'☆ 收藏';}
 else if(t.matches('a[data-date]')){e.preventDefault();setView('day');loadDay(t.dataset.date);}
});
prev.onclick=function(){var i=INDEX.findIndex(function(e){return e.date===CUR;});if(i<INDEX.length-1)loadDay(INDEX[i+1].date);};
next.onclick=function(){var i=INDEX.findIndex(function(e){return e.date===CUR;});if(i>0)loadDay(INDEX[i-1].date);};
pick.onchange=function(){loadDay(pick.value);};
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
