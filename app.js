'use strict';
const DATA = SITE_DATA;
const $ = (id) => document.getElementById(id);
const NAV = [
  ['home','Главная','⌂'], ['plan','План курса','▤'], ['materials','Материалы','▧'],
  ['literature','Литература','▥'], ['exam','Экзамен','★'], ['books','Книги','▣'], ['assistant','Помощник курса','✦']
];
const TOPIC_DONE_KEY = 'metuRusC1TopicsV3';
const EXAM_DONE_KEY = 'metuRusC1ExamV3';
let activeTab = 'home';
let activeModule = 'Все модули';
let materialCategory = 'Все темы';
let examQuery = '';
const MODULE_NAMES = [...new Set(DATA.topics.map(t => t.module))];
const EXAM_QUESTIONS = DATA.questions;
const MATERIALS = DATA.topics.map(t => ({
  category: t.module,
  title: t.videoType === 'video' ? `Видеоматериал: ${t.videoTitle}` : `Учебный источник: ${t.videoTitle}`,
  desc: t.videoNote,
  url: t.videoUrl,
  week: t.week,
  isVideo: t.videoType === 'video'
}));
const BOOKS = [
  {author:'А. С. Пушкин',title:'Евгений Онегин',year:'1833',desc:'Роман в стихах: гибкий литературный язык, авторские отступления, разные речевые регистры.',url:'https://ru.wikisource.org/wiki/Евгений_Онегин_(Пушкин)',src:'Викитека — читать и скачать'},
  {author:'Н. В. Гоголь',title:'Мёртвые души',year:'1842',desc:'Описательная проза, портретная характеристика персонажей и речевая индивидуализация.',url:'https://ru.wikisource.org/wiki/Мёртвые_души_(Гоголь)',src:'Викитека — читать и скачать'},
  {author:'И. С. Тургенев',title:'Отцы и дети',year:'1862',desc:'Диалоги и повествование как материал для сравнения речевых особенностей персонажей.',url:'https://ru.wikisource.org/wiki/Иван_Сергеевич_Тургенев',src:'Викитека — страница автора'},
  {author:'Ф. М. Достоевский',title:'Преступление и наказание',year:'1866',desc:'Психологическое повествование, рассуждение и сложная композиция романа.',url:'https://ru.wikisource.org/wiki/Автор:Фёдор_Михайлович_Достоевский',src:'Викитека — страница автора'},
  {author:'А. П. Чехов',title:'Рассказы',year:'1880-е–1900-е',desc:'Краткая проза для анализа темы, микротем, деталей и способов сжатого изложения.',url:'https://ru.wikisource.org/wiki/Антон_Павлович_Чехов',src:'Викитека — страница автора'},
  {author:'М. Ю. Лермонтов',title:'Герой нашего времени',year:'1840',desc:'Разные повествовательные формы — дневник, рассказ и повесть — в одном произведении.',url:'https://ru.wikisource.org/wiki/Герой_нашего_времени_(Лермонтов)',src:'Викитека — читать и скачать'}
];
const GRADES = [
  ['A','4,0','95–100%','Отлично'],['A−','3,67','90–94%','Отлично'],['B+','3,33','85–89%','Хорошо'],
  ['B','3,0','80–84%','Хорошо'],['B−','2,67','75–79%','Хорошо'],['C+','2,33','70–74%','Удовлетворительно'],
  ['C','2,0','65–69%','Удовлетворительно'],['C−','1,67','60–64%','Удовлетворительно'],['D+','1,33','55–59%','Удовлетворительно'],
  ['D−','1,0','50–54%','Удовлетворительно'],['F','0','0–49%','Неудовлетворительно']
];
function escapeHTML(value){return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function safeURL(value){try{const u=new URL(value);return u.protocol === 'https:' ? u.href : '#';}catch(e){return '#';}}
function paragraphs(value){return String(value || '').split(/\n\s*\n/).map(p=>`<p>${escapeHTML(p).replace(/\n/g,'<br>')}</p>`).join('');}
function getStored(key){try{return JSON.parse(localStorage.getItem(key) || '{}');}catch(e){return {};}}
function saveStored(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}}
function switchTab(tab){
  if(!$(`tab-${tab}`)) return;
  activeTab = tab;
  document.querySelectorAll('.tab-content').forEach(el=>el.classList.toggle('hidden',el.id !== `tab-${tab}`));
  document.querySelectorAll('[data-tab]').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));
  window.scrollTo({top:0,behavior:'smooth'});
}
function renderNav(){
  $('topNav').innerHTML = NAV.map(([id,label,icon])=>`<button type="button" class="nav-button ${id===activeTab?'active':''}" data-tab="${id}"><span class="nav-icon">${icon}</span>${escapeHTML(label)}</button>`).join('');
  $('sideNav').innerHTML = NAV.map(([id,label,icon])=>`<button type="button" class="${id===activeTab?'active':''}" data-tab="${id}"><span class="nav-icon">${icon}</span><span>${escapeHTML(label)}</span></button>`).join('');
  document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));
}
function renderHome(){
  $('tab-home').innerHTML = `
    <article class="academic-card hero-card">
      <span class="section-label">О дисциплине</span>
      <h2>Русский язык · уровень C1</h2>
      <p>Портал следует структуре курса METU: от функциональных стилей речи и норм языка — к функционально-смысловым типам речи, научной информации и структурно-смысловому анализу текста. Откройте неделю в плане, чтобы найти материал для объяснения, практические примеры и задания.</p>
      <div class="stats-grid">
        <div class="stat"><b>5</b><span>кредитов ECTS</span></div><div class="stat"><b>15</b><span>недель · 4 модуля</span></div>
        <div class="stat"><b>45 + 75 + 30</b><span>практика / СРС / СРСП, часов</span></div><div class="stat"><b>C1</b><span>уровень владения</span></div>
      </div>
    </article>
    <div class="two-col">
      <article class="academic-card"><span class="section-label">Цель дисциплины</span><h3 class="subhead">Коммуникативная компетенция</h3><p class="body-small">Формирование способности решать реальные коммуникативные задачи средствами русского языка в научной и профессиональной сферах: понимать тексты, выбирать стиль, выстраивать аргументацию и создавать устные и письменные сообщения.</p><div class="gold-rule"></div><h3 class="small-head">Что важно на занятии</h3><ul class="plain-list"><li>Определять цель и адресата текста.</li><li>Объяснять языковые и структурные особенности на конкретных примерах.</li><li>Переходить от определения к разбору текста и самостоятельному выводу.</li></ul></article>
      <article class="academic-card"><span class="section-label">Результаты обучения</span><h3 class="subhead">После курса студент умеет</h3><ul class="plain-list"><li><b>РО1.</b> Понимать цели и задачи профессиональной и научной коммуникации.</li><li><b>РО2.</b> Интерпретировать функционально-стилевые особенности текстов.</li><li><b>РО3.</b> Применять знания в учебных исследовательских работах.</li><li><b>РО4.</b> Работать с учебной и специальной литературой.</li><li><b>РО5–РО7.</b> Создавать тексты разных типов и жанров, вести монолог и диалог, демонстрировать критическое мышление.</li></ul></article>
    </div>
    <article class="academic-card"><div class="page-heading"><div><span class="section-label">Карта курса</span><h2>Четыре модуля</h2><p>Выберите модуль, чтобы перейти к неделям и открыть материал.</p></div><button class="btn btn-primary" data-goto-plan>Открыть план →</button></div><div class="two-col">${MODULE_NAMES.map((m,i)=>{const count=DATA.topics.filter(t=>t.module===m).length;const from=DATA.topics.filter(t=>t.module===m)[0]?.week;return `<button class="quick-card module-quick" data-module-jump="${escapeHTML(m)}" type="button"><span class="section-label">Модуль ${i+1} · ${count} тем</span><b>${escapeHTML(m.replace(/^Модуль \d+ · /,''))}</b><p>Начинается с недели ${from}. Открыть темы и материалы модуля.</p><span class="text-link">Перейти к модулю ↗</span></button>`;}).join('')}</div></article>
    <article class="academic-card"><span class="section-label">Как устроен портал</span><div class="three-col" style="margin-top:12px"><div class="quick-card"><b>Теория + пример</b><p>Определения, пояснения и наглядный пример для разбора со студентами.</p></div><div class="quick-card"><b>Наглядный мини-клип</b><p>Анимированная схема для каждой темы; там, где есть подходящее видео, встроен и видеоплеер.</p></div><div class="quick-card"><b>Вопросы и мотивация</b><p>Практика, мини-проверка, задания и отдельный мотивационный блок в конце каждой темы.</p></div></div></article>`;
  $('tab-home').querySelector('[data-goto-plan]').addEventListener('click',()=>switchTab('plan'));
  $('tab-home').querySelectorAll('[data-module-jump]').forEach(btn=>btn.addEventListener('click',()=>{activeModule=btn.dataset.moduleJump;renderPlan();switchTab('plan');}));
}
function topicCard(t){
  const nodes = (t.visual || []).map((v,i)=>`<div class="clip-node" style="--i:${i}">${escapeHTML(v)}</div>`).join('');
  const practice = (t.practice || []).map(x=>`<li>${escapeHTML(x)}</li>`).join('');
  const q = t.quiz || {q:'Какой вывод лучше всего отражает содержание темы?',options:['Содержание определяется только отдельными словами','Нужно учитывать цель, структуру и смысл','Для анализа достаточно одного примера'],answer:1,explain:'В работе с текстом нужно учитывать значение элементов и их связь с общей задачей.'};
  const options = (q.options || []).map((o,i)=>`<button type="button" class="quiz-option" data-quiz-option="${i}">${escapeHTML(o)}</button>`).join('');
  const embedURL = t.videoEmbed ? safeURL(t.videoEmbed) : '';
  const canEmbed = embedURL && (/youtube-nocookie\.com\/embed\//i.test(embedURL) || /youtube\.com\/embed\//i.test(embedURL) || /rutube\.ru\/play\/embed\//i.test(embedURL));
  const sourceUrl = safeURL(t.videoUrl);
  const resource = canEmbed
    ? `<div class="video-frame"><iframe src="${escapeHTML(embedURL)}" title="${escapeHTML(t.videoTitle || t.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="video-link-box"><b>${escapeHTML(t.videoTitle || 'Видеоматериал')}</b><p>${escapeHTML(t.videoNote || '')}</p><a class="text-link" href="${escapeHTML(sourceUrl)}" target="_blank" rel="noopener noreferrer">Открыть материал отдельно ↗</a></div>`
    : `<div class="video-link-box"><b>Дополнительный учебный источник</b><p>${escapeHTML(t.videoTitle || 'Материал по теме')} · ${escapeHTML(t.videoNote || 'Откройте источник для дополнительного изучения.')}</p><a class="text-link" href="${escapeHTML(sourceUrl)}" target="_blank" rel="noopener noreferrer">Открыть источник ↗</a><p style="margin-top:8px">Ссылка ведёт на учебный материал, а не выдаётся за видеоролик. Наглядный мини-клип по теме расположен выше.</p></div>`;
  return `<details class="topic-card" id="topic-${t.id}">
    <summary class="topic-summary"><span class="week-number">${String(t.week).padStart(2,'0')}</span><span class="topic-summary-text"><small>${escapeHTML(t.module)} · неделя ${t.week}</small><strong>${escapeHTML(t.title)}</strong></span><span class="chevron">⌄</span></summary>
    <div class="topic-body">
      <div class="topic-goal"><b>Цель темы</b><p>${escapeHTML(t.goal || '')}</p></div>
      <div class="topic-content-grid">
        <div>
          <section class="topic-block"><h3>Теория</h3><div class="theory-copy">${paragraphs(t.theory)}</div>${t.example?`<div class="example-box"><b>Пример для объяснения</b><p>${escapeHTML(t.example)}</p></div>`:''}</section>
          <section class="topic-block"><h3>Практика и обсуждение</h3><ol class="practice-list">${practice}</ol></section>
          <section class="topic-block"><h3>Мини-проверка</h3><div class="quiz-box" data-quiz="${t.id}"><p class="quiz-question">${escapeHTML(q.q)}</p><div class="quiz-options">${options}</div><div class="quiz-feedback" aria-live="polite"></div></div></section>
        </div>
        <div>
          <section class="clip-card"><h3>${escapeHTML(t.visualTitle || 'Наглядная схема')}</h3><p class="clip-caption">Короткий анимированный мини-клип — элементы подсвечиваются по очереди.</p><div class="clip-stage" aria-label="Наглядная схема темы">${nodes}</div><div class="clip-play"><span class="pulse-dot"></span> Смотрите на последовательность и объясните связь между этапами</div><p class="clip-caption" style="margin:9px 0 0">${escapeHTML(t.visualCaption || '')}</p></section>
          <section class="topic-block"><h3>${t.videoType==='video'?'Видеоматериал по теме':'Источник для углубления'}</h3>${resource}</section>
          <section class="teacher-tip"><h3>Подсказка преподавателю</h3><p>${escapeHTML(t.how || '')}</p></section>
        </div>
      </div>
      <div class="assignment-grid"><section class="assignment-box"><h4>📝 Задание · конспект</h4><p>Напишите конспект по теме «${escapeHTML(t.title)}»: сформулируйте определение, выделите 3–5 главных положений из теории и запишите пример своими словами. Завершите конспект кратким выводом (2–3 предложения).</p></section><section class="assignment-box"><h4>🎤 Задание · рассказ по теме</h4><p>Подготовьте устный рассказ на 2–3 минуты по теме «${escapeHTML(t.title)}». Объясните основную идею, разберите пример и ответьте на вопросы из раздела «Практика и обсуждение».</p></section></div>
      <details class="syllabus-tasks"><summary>Дополнительно по силлабусу: СРС и СРСП этой недели</summary><div class="assignment-grid"><section class="assignment-box"><h4>СРС</h4><p>${escapeHTML(t.srs || 'См. задание в силлабусе.')}</p></section><section class="assignment-box"><h4>СРСП</h4><p>${escapeHTML(t.srsp || 'См. задание в силлабусе.')}</p></section></div></details>
      <div class="complete-row"><label><input type="checkbox" data-topic-done="${t.id}"> Тема изучена</label><span>Неделя ${t.week} · ${t.week<=8?'РК 1 / первый модульный блок':'РК 2 / второй модульный блок'}</span></div>
      <section class="motivation"><div class="motivation-label">Мысль в завершение темы</div><p>“${escapeHTML(t.motivation || 'Понимание начинается с внимания к смыслу и практике.') }”</p></section>
    </div>
  </details>`;
}
function renderPlan(){
  const query = ($('topicSearch')?.value || '').trim().toLocaleLowerCase('ru');
  const visibleTopics = DATA.topics.filter(t=>(activeModule==='Все модули'||t.module===activeModule)&&(`${t.title} ${t.module} ${t.theory} ${t.example} ${t.srs} ${t.srsp}`).toLocaleLowerCase('ru').includes(query));
  const filters = ['Все модули',...MODULE_NAMES].map(m=>`<button type="button" class="filter-chip ${m===activeModule?'active':''}" data-module-filter="${escapeHTML(m)}">${escapeHTML(m==='Все модули'?'Все модули':m.replace(/^Модуль \d+ · /,''))}</button>`).join('');
  const groups = MODULE_NAMES.map((m,i)=>{const group=visibleTopics.filter(t=>t.module===m);if(!group.length)return '';return `<div class="module-group"><div class="module-banner"><span>${i+1}.</span> ${escapeHTML(m.replace(/^Модуль \d+ · /,''))} <small style="font:500 10px Inter;color:#82765e">· ${group.length} тем в списке</small></div>${group.map(topicCard).join('')}</div>`;}).join('');
  $('tab-plan').innerHTML = `<article class="academic-card"><div class="page-heading"><div><span class="section-label">15 недель · 4 модуля</span><h2>Календарно-тематический план</h2><p>Откройте тему, чтобы увидеть теорию, пример, анимированный мини-клип, видеоматериал или учебный источник, задания и отдельную мотивацию в конце.</p></div></div><div class="toolbar"><input id="topicSearch" class="search-field" type="search" placeholder="Поиск по темам и содержанию…" value="${escapeHTML(query)}" aria-label="Поиск по темам"><div><button class="btn" id="expandTopics">Раскрыть все</button> <button class="btn" id="collapseTopics">Свернуть все</button></div></div><div class="filter-row">${filters}</div><div id="planRoot">${groups || '<div class="empty-state">По этому запросу темы не найдены.</div>'}</div><div class="mini-callout">Порядок недель и формулировки тем сохранены по предоставленному силлабусу «Казахский (русский) язык». Дополнительные пояснения и учебные примеры предназначены для поддержки объяснения темы в аудитории.</div></article>`;
  $('topicSearch').addEventListener('input',()=>{const v=$('topicSearch').value;renderPlan();const input=$('topicSearch');input.focus();input.setSelectionRange(v.length,v.length);});
  $('tab-plan').querySelectorAll('[data-module-filter]').forEach(btn=>btn.addEventListener('click',()=>{activeModule=btn.dataset.moduleFilter;renderPlan();}));
  $('expandTopics').addEventListener('click',()=>document.querySelectorAll('#planRoot details.topic-card').forEach(d=>d.open=true));
  $('collapseTopics').addEventListener('click',()=>document.querySelectorAll('#planRoot details.topic-card').forEach(d=>d.open=false));
  $('tab-plan').querySelectorAll('[data-topic-done]').forEach(cb=>{cb.checked=Boolean(getStored(TOPIC_DONE_KEY)[cb.dataset.topicDone]);cb.addEventListener('change',()=>{const saved=getStored(TOPIC_DONE_KEY);saved[cb.dataset.topicDone]=cb.checked;saveStored(TOPIC_DONE_KEY,saved);updateTopicProgress();});});
  $('tab-plan').querySelectorAll('[data-quiz]').forEach(box=>{const t=DATA.topics.find(x=>String(x.id)===box.dataset.quiz);const quiz=t?.quiz;if(!quiz)return;box.querySelectorAll('[data-quiz-option]').forEach(btn=>btn.addEventListener('click',()=>{const selected=Number(btn.dataset.quizOption);box.querySelectorAll('[data-quiz-option]').forEach(b=>{b.classList.remove('correct','incorrect');b.disabled=true;});const correct=selected===quiz.answer;btn.classList.add(correct?'correct':'incorrect');if(!correct)box.querySelector(`[data-quiz-option="${quiz.answer}"]`)?.classList.add('correct');box.querySelector('.quiz-feedback').textContent=`${correct?'Верно.':'Пока неверно.'} ${quiz.explain || ''}`;}));});
}
function updateTopicProgress(){
  const saved=getStored(TOPIC_DONE_KEY);const done=DATA.topics.filter(t=>saved[t.id]).length;const pct=Math.round(done/DATA.topics.length*100);
  $('side-progress-label').textContent=`Тем изучено: ${done} из ${DATA.topics.length}`;$('side-progress-percent').textContent=`${pct}%`;$('side-progress-bar').style.width=`${pct}%`;
}
function renderMaterials(){
  const query=($('materialsSearch')?.value||'').trim().toLowerCase();
  const cats=['Все темы',...MODULE_NAMES];
  const items=MATERIALS.filter(m=>(materialCategory==='Все темы'||m.category===materialCategory)&&(`${m.title} ${m.desc} ${m.category}`).toLowerCase().includes(query));
  $('tab-materials').innerHTML=`<article class="academic-card"><div class="page-heading"><div><span class="section-label">Видео и учебные страницы</span><h2>Материалы по темам курса</h2><p>Ссылки на дополнительные ресурсы собраны из карточек тем. Видео помечены как видеоматериалы, остальные ссылки — как учебные источники.</p></div></div><input id="materialsSearch" class="search-field" type="search" placeholder="Найти материал или тему…" value="${escapeHTML(query)}"><div class="filter-row">${cats.map(c=>`<button class="filter-chip ${materialCategory===c?'active':''}" data-material-filter="${escapeHTML(c)}">${escapeHTML(c==='Все темы'?'Все темы':c.replace(/^Модуль \d+ · /,''))}</button>`).join('')}</div><div class="source-grid">${items.map(m=>`<article class="source-card"><span class="source-category">${m.isVideo?'Видеоматериал':'Учебный источник'} · неделя ${m.week}</span><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.desc||'Дополнительный материал по содержанию недели.')}</p><a href="${escapeHTML(safeURL(m.url))}" target="_blank" rel="noopener noreferrer">Открыть ресурс ↗</a></article>`).join('')||'<div class="empty-state">Материалы не найдены.</div>'}</div></article>`;
  $('materialsSearch').addEventListener('input',()=>{const val=$('materialsSearch').value;renderMaterials();const inp=$('materialsSearch');inp.focus();inp.setSelectionRange(val.length,val.length);});
  $('tab-materials').querySelectorAll('[data-material-filter]').forEach(btn=>btn.addEventListener('click',()=>{materialCategory=btn.dataset.materialFilter;renderMaterials();}));
}
function renderLiterature(){
  const groups=[['Основная литература',DATA.literature.filter(x=>x.type==='Основная литература')],['Дополнительная литература',DATA.literature.filter(x=>x.type==='Дополнительная литература')]];
  $('tab-literature').innerHTML=`<article class="academic-card"><div class="page-heading"><div><span class="section-label">Список литературы из силлабуса</span><h2>Учебные источники курса</h2><p>Библиография сохранена в соответствии с предоставленным файлом. Онлайн-ссылки открываются отдельно.</p></div></div>${groups.map(([heading,items])=>`<h3 class="subhead">${escapeHTML(heading)}</h3>${items.map((item,i)=>`<div class="literature-item"><div class="literature-number">${escapeHTML((item.text.match(/^\[(\d+)\]/)||[])[1]||String(i+1))}</div><div><p>${escapeHTML(item.text)}</p>${(item.text.match(/https?:\/\/[^\s]+/)||[])[0]?`<a class="text-link" target="_blank" rel="noopener noreferrer" href="${escapeHTML(safeURL((item.text.match(/https?:\/\/[^\s]+/)||[])[0].replace(/[.,;]+$/,'')))}">Открыть онлайн-источник ↗</a>`:''}</div></div>`).join('')}`).join('<div class="gold-rule"></div>')}<div class="mini-callout">Дополнительные электронные ресурсы, упомянутые в силлабусе: РМЭБРК, METU Library, Scopus, Академика и eLIBRARY.RU. Доступ к некоторым ресурсам может зависеть от учётной записи университета.</div></article>`;
}
function renderExam(){
  const saved=getStored(EXAM_DONE_KEY);const query=examQuery.toLowerCase().trim();const visible=EXAM_QUESTIONS.map((q,i)=>({q,i})).filter(x=>x.q.toLowerCase().includes(query));const done=EXAM_QUESTIONS.filter((q,i)=>saved[i]).length;const pct=Math.round(done/EXAM_QUESTIONS.length*100);
  $('tab-exam').innerHTML=`<article class="academic-card"><div class="page-heading"><div><span class="section-label">Итоговый контроль</span><h2>Подготовка к экзамену</h2><p>Отмечайте экзаменационные вопросы, которые уже повторили. Отметки сохраняются локально в вашем браузере.</p></div></div><div class="mini-callout"><b>Расчёт итоговой оценки:</b> И = 0,6 × средний рейтинг рубежного контроля + 0,4 × экзамен. Точные условия допуска и начисления баллов проверяйте по актуальным указаниям преподавателя и силлабусу.</div><h3 class="subhead" style="margin-top:20px">Шкала оценок</h3><div class="grade-grid">${GRADES.map(g=>`<div class="grade-item"><b>${g[0]}</b><span>${g[2]}</span><span>${g[3]}</span></div>`).join('')}</div><div class="gold-rule"></div><div class="page-heading"><div><h3 class="subhead">Экзаменационные вопросы</h3><p>Всего ${EXAM_QUESTIONS.length} вопросов.</p></div></div><div class="exam-progress"><span id="examStatus">Изучено: ${done} / ${EXAM_QUESTIONS.length}</span><b>${pct}%</b></div><div class="progress-track"><div id="examProgressBar" style="width:${pct}%"></div></div><div class="exam-tools"><input id="examSearch" class="search-field" type="search" placeholder="Найти вопрос…" value="${escapeHTML(examQuery)}"><button class="btn" id="clearExam">Снять все отметки</button></div><div class="exam-list">${visible.map(({q,i})=>`<div class="exam-question"><span class="qnum">${i+1}.</span><div>${escapeHTML(q)}</div><label><input type="checkbox" data-exam-done="${i}" ${saved[i]?'checked':''}> Готово</label></div>`).join('')||'<div class="empty-state">Вопросы не найдены.</div>'}</div></article>`;
  $('examSearch').addEventListener('input',()=>{examQuery=$('examSearch').value;const val=examQuery;renderExam();const inp=$('examSearch');inp.focus();inp.setSelectionRange(val.length,val.length);});
  $('tab-exam').querySelectorAll('[data-exam-done]').forEach(cb=>cb.addEventListener('change',()=>{const s=getStored(EXAM_DONE_KEY);s[cb.dataset.examDone]=cb.checked;saveStored(EXAM_DONE_KEY,s);renderExam();updateSideExamSummary();}));
  $('clearExam').addEventListener('click',()=>{if(confirm('Снять все отметки по экзаменационным вопросам?')){saveStored(EXAM_DONE_KEY,{});renderExam();updateSideExamSummary();}});
}
function renderBooks(){
  $('tab-books').innerHTML=`<article class="academic-card"><div class="page-heading"><div><span class="section-label">Дополнительное чтение</span><h2>Читаем по-русски</h2><p>Классические произведения, с которыми удобно практиковать чтение, выделение микротем, анализ повествования и сжатое изложение.</p></div></div><div class="book-list">${BOOKS.map((b,i)=>`<article class="book-card"><div class="book-icon">${['❝','▤','✒','◈','❦','▧'][i%6]}</div><div><h3>${escapeHTML(b.title)}</h3><p><b>${escapeHTML(b.author)}</b> · ${escapeHTML(b.year)}</p><p>${escapeHTML(b.desc)}</p><a href="${escapeHTML(safeURL(b.url))}" target="_blank" rel="noopener noreferrer">${escapeHTML(b.src)} ↗</a></div></article>`).join('')}</div><div class="mini-callout">Внешние библиотеки могут менять адреса или требовать дополнительных действий для скачивания. Раздел предназначен для расширения языковой практики, а не заменяет основную литературу из силлабуса.</div></article>`;
}
function assistantAnswer(query){
  const q=query.toLowerCase();
  const matches=DATA.topics.map(t=>{let score=0;const title=t.title.toLowerCase();if(title.split(/[^а-яёa-z0-9]+/i).some(word=>word.length>3&&q.includes(word)))score+=2;if(q.includes(`недел${t.week}`)||q.includes(String(t.week))&&q.includes('тема'))score+=3;if((t.theory+' '+t.example+' '+t.how).toLowerCase().includes(q))score+=1;return {t,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
  if(/срс|самостоятель/.test(q)){const t=matches[0]?.t;if(t)return `Для темы «${t.title}» (неделя ${t.week}) задание СРС: ${t.srs}\n\nОткройте «План курса» → неделю ${t.week}, чтобы посмотреть теорию, пример и вопросы для занятия.`;return 'Задания СРС собраны в каждой теме календарного плана. Откройте вкладку «План курса» и нужную неделю.';}
  if(/срсп|с преподавател/.test(q)){const t=matches[0]?.t;if(t)return `СРСП по теме «${t.title}»: ${t.srsp}\n\nДля объяснения преподавателю поможет раздел «Подсказка преподавателю» в карточке недели ${t.week}.`;return 'В календарном плане у каждой недели есть отдельный блок СРСП.';}
  if(/экзамен|вопрос/.test(q))return `В разделе «Экзамен» размещено ${EXAM_QUESTIONS.length} вопросов из силлабуса. Там можно искать по формулировкам и отмечать вопросы, которые уже повторили.`;
  if(/видео|ролик|клип/.test(q))return 'Для каждой темы календарного плана создан свой наглядный мини-клип-схема. Для тем с найденным видеоматериалом плеер показан прямо в карточке. Если ссылка ведёт на статью или справку, она обозначена как учебный источник, а не видео.';
  if(!matches.length)return 'Я работаю как локальный навигатор по материалам этого портала и не подключён к внешней ИИ-службе. Попробуйте написать название темы, номер недели, «СРС», «СРСП» или «экзамен». Например: «объясни цепную связь» или «СРС по 10 неделе».';
  const results=matches.map(({t})=>`ТЕМА ${t.week}. ${t.title}\nКлючевая идея: ${t.goal}\nПример: ${t.example}\nКак объяснить: ${t.how}`).join('\n\n---\n\n');
  return `Нашёл подходящие разделы курса:\n\n${results}\n\nОткройте «План курса», чтобы посмотреть полную теорию, мини-клип, материал и мотивационный блок в конце темы.`;
}
function renderAssistant(){
  $('tab-assistant').innerHTML=`<article class="academic-card chat-panel"><div class="chat-head"><div><span class="section-label">Вопросы по содержанию</span><h2>Помощник курса</h2><p class="body-small">Поиск по темам и заданиям, которые включены в этот портал.</p></div><span class="offline-badge">Локальный режим · без API-ключа</span></div><div class="chat-messages" id="chatMessages"><div class="message assistant">Здравствуйте! Я помогу найти тему, вспомнить её главную идею или показать задание на конспект и рассказ. Попробуйте: «объясни научный стиль», «СРС по 3 неделе» или «как готовиться к экзамену».</div></div><form class="chat-form" id="chatForm"><input id="chatInput" autocomplete="off" placeholder="Введите вопрос по курсу…" aria-label="Вопрос по курсу"><button class="btn btn-primary" type="submit">Отправить</button></form><p class="chat-help">Это локальный поиск по содержанию портала, а не полноценная внешняя ИИ-модель. Ваши сообщения не отправляются на сервер.</p></article>`;
  $('chatForm').addEventListener('submit',ev=>{ev.preventDefault();const input=$('chatInput');const value=input.value.trim();if(!value)return;const box=$('chatMessages');box.insertAdjacentHTML('beforeend',`<div class="message user">${escapeHTML(value)}</div><div class="message assistant">${escapeHTML(assistantAnswer(value))}</div>`);input.value='';box.scrollTop=box.scrollHeight;});
}
function updateSideExamSummary(){const saved=getStored(EXAM_DONE_KEY);const done=EXAM_QUESTIONS.filter((q,i)=>saved[i]).length;const pct=Math.round(done/EXAM_QUESTIONS.length*100);$('side-progress-label').textContent=`Вопросов изучено: ${done} / ${EXAM_QUESTIONS.length}`;$('side-progress-percent').textContent=`${pct}%`;$('side-progress-bar').style.width=`${pct}%`;}
function updateTopicProgress(){const saved=getStored(TOPIC_DONE_KEY);const done=DATA.topics.filter(t=>saved[t.id]).length;const pct=Math.round(done/DATA.topics.length*100);$('side-progress-label').textContent=`Тем изучено: ${done} из ${DATA.topics.length}`;$('side-progress-percent').textContent=`${pct}%`;$('side-progress-bar').style.width=`${pct}%`;}
function init(){
  if(!DATA || !Array.isArray(DATA.topics)){document.querySelector('.main-content').innerHTML='<div class="academic-card">Не удалось загрузить данные курса. Убедитесь, что файл content.js находится рядом с index.html.</div>';return;}
  renderNav();renderHome();renderPlan();renderMaterials();renderLiterature();renderExam();renderBooks();renderAssistant();updateSideExamSummary();
}
document.addEventListener('DOMContentLoaded',init);
