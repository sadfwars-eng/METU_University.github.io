const TOPIC_DATA = SITE_DATA.topics;
const grid=document.getElementById("topicGrid");
const filters=document.getElementById("moduleFilters");
const searchInput=document.getElementById("searchInput");
const overlay=document.getElementById("lessonOverlay");
const modules=["Все темы",...new Set(TOPIC_DATA.map(t=>t.module))];
let activeModule="Все темы", activeTopicIndex=0;
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const paragraph=s=>safe(s).split(/\n\s*\n/).map(v=>`<p>${v.replace(/\n/g,"<br>")}</p>`).join("");
const getStored=(k,def)=>{try{return JSON.parse(localStorage.getItem(k))??def}catch{return def}};
const putStored=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
let done=getStored("metu-completed-v9",[]),last=getStored("metu-last-v9",null);
function renderFilters(){
 filters.innerHTML=modules.map(m=>`<button class="filter-btn ${m===activeModule?"active":""}" data-module="${safe(m)}">${safe(m)}</button>`).join("");
 filters.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{activeModule=b.dataset.module;renderFilters();renderTopics()}));
}
function renderTopics(){
 const q=searchInput.value.trim().toLowerCase();
 const shown=TOPIC_DATA.filter(t=>(activeModule==="Все темы"||t.module===activeModule)&&(`${t.title} ${t.module} ${t.theory}`.toLowerCase().includes(q)));
 grid.innerHTML=shown.map(t=>`<article class="topic-card" tabindex="0" role="button" data-id="${t.id}" aria-label="Открыть тему ${t.id}: ${safe(t.title)}"><div class="card-top"><span class="topic-number">${String(t.id).padStart(2,"0")}</span><span class="topic-arrow">${done.includes(t.id)?"✓":"↗"}</span></div><div class="module-name">${safe(t.module)}</div><h3>${safe(t.title)}</h3><div class="card-bottom"><span class="mini-pill">Теория</span><span class="mini-pill">Видео</span><span class="mini-pill">Практика</span>${done.includes(t.id)?'<span class="mini-pill complete">Пройдено</span>':""}</div></article>`).join("");
 document.getElementById("emptyState").classList.toggle("hidden",shown.length>0);
 grid.querySelectorAll(".topic-card").forEach(card=>{const open=()=>openTopic(Number(card.dataset.id));card.addEventListener("click",open);card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}})});
 document.getElementById("progressSummary").textContent=`· Пройдено ${done.length} из ${TOPIC_DATA.length}`;
 const cont=document.getElementById("continueBtn");
 cont.classList.toggle("hidden",!last);
 if(last){cont.textContent=`Продолжить: тема ${last} →`;cont.onclick=()=>openTopic(last)}
}
function videoEmbed(url){
 try{
 const u=new URL(url);
 let embed="";
 if(["youtube.com","www.youtube.com","m.youtube.com"].includes(u.hostname)&&u.pathname==="/watch"){
  const id=u.searchParams.get("v");
  if(id&&/^[a-zA-Z0-9_-]{11}$/.test(id)){
   const time=u.searchParams.get("t")||"0";
   const seconds=/^\d+s?$/.test(time)?parseInt(time,10):0;
   embed=`https://www.youtube-nocookie.com/embed/${id}${seconds?"?start="+seconds:""}`;
  }
 }else if(u.hostname==="youtu.be"){
  const id=u.pathname.slice(1);
  if(/^[a-zA-Z0-9_-]{11}$/.test(id))embed=`https://www.youtube-nocookie.com/embed/${id}`;
 }else if(u.hostname==="rutube.ru"&&/^\/video\/[a-f0-9]+\/?$/.test(u.pathname)){
  embed="https://rutube.ru/play/embed/"+u.pathname.split("/")[2];
 }
 if(embed)return `<div class="video-frame"><iframe src="${safe(embed)}" title="Видеоматериал по теме" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
 }catch{}
 return "";
}
function openTopic(id){
 const index=TOPIC_DATA.findIndex(t=>t.id===id);if(index<0)return;
 activeTopicIndex=index;const t=TOPIC_DATA[index];
 last=t.id;putStored("metu-last-v9",last);
 document.getElementById("lessonModule").textContent=t.module;
 document.getElementById("lessonNumber").textContent=`ТЕМА ${String(t.id).padStart(2,"0")} / ${TOPIC_DATA.length}`;
 document.getElementById("lessonTitle").textContent=t.title;
 document.getElementById("lessonGoal").textContent=t.goal;
 document.getElementById("lessonTheory").innerHTML=paragraph(t.theory);
 document.getElementById("lessonExample").innerHTML=paragraph(t.example);
 document.getElementById("lessonSteps").innerHTML=(t.practice||t.quiz||[]).map(x=>`<li>${safe(x)}</li>`).join("");
 document.getElementById("lessonPractice").innerHTML=`<p>${safe(t.how)}</p><h3>${safe(t.visualTitle||"Наглядная схема")}</h3><div class="visual-sequence">${(t.visual||[]).map(x=>`<span>${safe(x)}</span>`).join("<b>→</b>")}</div><p>${safe(t.visualCaption||"")}</p>`;
 document.getElementById("taskNotes").textContent=`Составьте подробный конспект по теме «${t.title}»: определения, основные признаки, примеры и вывод.`;
 document.getElementById("taskSpeech").textContent=`Подготовьте связный устный рассказ по теме «${t.title}» на 3–5 минут с примерами и заключением.`;
 document.getElementById("lessonSrs").textContent="СРС: "+(t.srs||"Не указано");
 document.getElementById("lessonSrsp").textContent="СРСП: "+(t.srsp||"Не указано");
 document.getElementById("lessonMotivation").textContent=t.motivation;
 const video=document.getElementById("videoEmbed");
 video.innerHTML=t.videoType==="video"?videoEmbed(t.videoUrl):"";
 document.getElementById("videoDescription").textContent=t.videoNote||"Дополнительный материал по теме.";
 const vlink=document.getElementById("videoSearch");
 vlink.href=t.videoUrl||("https://www.youtube.com/results?search_query="+encodeURIComponent(t.title));
 vlink.textContent=t.videoType==="video"?"Открыть видео отдельно ↗":"Открыть учебный материал ↗";
 document.getElementById("prevTopic").disabled=index===0;
 document.getElementById("nextTopic").textContent=index===TOPIC_DATA.length-1?"Вернуться к темам ↗":"Следующая тема →";
 const mark=document.getElementById("markDone");
 mark.textContent=done.includes(id)?"✓ Тема пройдена":"Отметить как пройденную";
 overlay.classList.remove("hidden");document.body.style.overflow="hidden";overlay.scrollTop=0;renderTopics();
 document.getElementById("closeLesson").focus();
}
function closeTopic(){overlay.classList.add("hidden");document.body.style.overflow="";document.getElementById("videoEmbed").innerHTML="";renderTopics()}
document.getElementById("closeLesson").onclick=closeTopic;
document.getElementById("backToTopics").onclick=closeTopic;
overlay.addEventListener("click",e=>{if(e.target===overlay)closeTopic()});
document.getElementById("prevTopic").onclick=()=>{if(activeTopicIndex>0)openTopic(TOPIC_DATA[activeTopicIndex-1].id)};
document.getElementById("nextTopic").onclick=()=>{if(activeTopicIndex<TOPIC_DATA.length-1)openTopic(TOPIC_DATA[activeTopicIndex+1].id);else closeTopic()};
document.getElementById("markDone").onclick=()=>{const id=TOPIC_DATA[activeTopicIndex].id;done=done.includes(id)?done.filter(x=>x!==id):[...done,id];putStored("metu-completed-v9",done);document.getElementById("markDone").textContent=done.includes(id)?"✓ Тема пройдена":"Отметить как пройденную";renderTopics()};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!document.getElementById("prankOverlay").classList.contains("hidden"))closePrank();else if(!overlay.classList.contains("hidden"))closeTopic()}});
searchInput.addEventListener("input",renderTopics);
document.getElementById("homeBrand").onclick=e=>{e.preventDefault();closeTopic();window.scrollTo({top:0,behavior:"smooth"})};
document.getElementById("menuBtn").onclick=()=>document.getElementById("topNav").classList.toggle("open");
document.querySelectorAll("#topNav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("topNav").classList.remove("open")));
document.getElementById("examQuestions").innerHTML=SITE_DATA.questions.map(x=>`<li>${safe(x)}</li>`).join("");
document.getElementById("literature").innerHTML=SITE_DATA.literature.map(x=>`<p><strong>${safe(x.type)}:</strong> ${safe(x.text)}</p>`).join("");
const prank=document.getElementById("prankOverlay");
function closePrank(){prank.classList.add("hidden");document.getElementById("memeImg").classList.add("hidden");document.getElementById("revealMeme").classList.remove("hidden");document.body.style.overflow=""}
document.getElementById("secretLink").onclick=e=>{e.preventDefault();prank.classList.remove("hidden");document.body.style.overflow="hidden"};
document.getElementById("closePrank").onclick=closePrank;
prank.onclick=e=>{if(e.target===prank)closePrank()};
document.getElementById("revealMeme").onclick=()=>{document.getElementById("memeImg").classList.remove("hidden");document.getElementById("revealMeme").classList.add("hidden")};
renderFilters();renderTopics();
