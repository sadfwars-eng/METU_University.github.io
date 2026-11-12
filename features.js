const BOOK_COUNT_1=23, BOOK_COUNT_2=22;
// Учебные тесты: 5 различных вопросов на тему, одно подтверждённое отправление на браузер.
const quizEl=document.getElementById('quizContainer');
const quizStorageKey=(sid,id)=>`metu-quiz-final-v14-${sid}-${id}`;
function getQuizSaved(key){try{return JSON.parse(localStorage.getItem(key))}catch{return null}}
function renderQuiz(){
 const t=TOPIC_DATA[activeTopicIndex];if(!t)return;
 const key=quizStorageKey(currentSyllabus,t.id),questions=METU_QUIZZES[`${currentSyllabus}-${t.id}`]||[];
 const saved=getQuizSaved(key);
 document.querySelector('#quizSection h2').textContent=`Тест по теме · ${questions.length} вопросов`;
 const legacy=Boolean(saved && !saved.quizVersion);
 if(saved){
   if(legacy){quizEl.innerHTML=`<div class="quiz-final"><strong>✓ Ранее отправленный тест сохранён</strong><p>Ответы старой версии остались заблокированы на этом устройстве. Вопросы обновлены, поэтому прежние ответы нельзя достоверно сопоставить с новыми. Покажите преподавателю запись о сдаче.</p></div>`;return;}
   quizEl.innerHTML=`<div class="quiz-final"><strong>✓ Тест отправлен · ${new Date(saved.at).toLocaleString('ru-RU')}</strong><p>Ответы сохранены на этом устройстве. Редактирование заблокировано. Покажите преподавателю выбранные ответы.</p></div>`+questions.map((q,i)=>`<div class="quiz-item"><b>${i+1}. ${safe(q.question)}</b><div class="quiz-choices">${q.options.map(o=>`<div class="quiz-choice ${saved.answers[i]===o.value?'selected':''}">${safe(o.value)}. ${safe(o.label)} ${saved.answers[i]===o.value?'✓':''}</div>`).join('')}</div></div>`).join('');
   return;
 }
 quizEl.innerHTML=`<form id="topicQuizForm">${questions.map((q,i)=>`<fieldset class="quiz-item"><legend>${i+1}. ${safe(q.question)}</legend><div class="quiz-choices">${q.options.map(o=>`<label class="quiz-choice"><input type="radio" name="q${i}" value="${o.value}" required> <span>${safe(o.value)}. ${safe(o.label)}</span></label>`).join('')}</div></fieldset>`).join('')}<button type="submit" class="btn btn-primary quiz-submit">Отправить ответы (навсегда на этом устройстве) →</button></form>`;
 const form=document.getElementById('topicQuizForm');
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const answers=questions.map((q,i)=>form.querySelector(`input[name="q${i}"]:checked`)?.value||null);
  if(answers.some(a=>!a)){alert(`Ответьте на все ${questions.length} вопросов.`);return}
  if(!confirm('Отправить ответы? После отправки изменить их на этом устройстве нельзя.'))return;
  if(getQuizSaved(key)){renderQuiz();return}
  try{localStorage.setItem(key,JSON.stringify({answers,at:new Date().toISOString(),quizVersion:16}))}catch{alert('Браузер не смог сохранить ответы. Проверьте свободное место и режим браузера.');return}
  renderQuiz();
 });
}
const oldOpenTopic=openTopic;
openTopic=function(id){oldOpenTopic(id);renderQuiz()};
// Книжный просмотр силлабусов: страницы сохранены как изображения с водяным знаком.
const bookCounts={1:BOOK_COUNT_1,2:BOOK_COUNT_2};
let bookId=1,bookPageNum=1;
const bookOverlay=document.getElementById('bookOverlay');
function drawBook(){
 document.getElementById('bookPage').src=`book_pages/${bookId}/${String(bookPageNum).padStart(2,'0')}.jpg`;
 document.getElementById('bookCounter').textContent=`Страница ${bookPageNum} из ${bookCounts[bookId]}`;
 document.getElementById('bookPrev').disabled=bookPageNum===1;
 document.getElementById('bookPrevBottom').disabled=bookPageNum===1;
 document.getElementById('bookNext').disabled=bookPageNum===bookCounts[bookId];
 document.getElementById('bookNextBottom').disabled=bookPageNum===bookCounts[bookId];
}
function openBook(n){bookId=n;bookPageNum=1;document.getElementById('bookTitle').textContent=`Syllabus ${n}`;bookOverlay.classList.remove('hidden');document.body.style.overflow='hidden';drawBook()}
function closeBook(){bookOverlay.classList.add('hidden');document.body.style.overflow=''}
function turnBook(delta){bookPageNum=Math.max(1,Math.min(bookCounts[bookId],bookPageNum+delta));drawBook()}
document.getElementById('openBook1').onclick=()=>openBook(1);
document.getElementById('openBook2').onclick=()=>openBook(2);
document.getElementById('closeBook').onclick=closeBook;
document.getElementById('bookPrev').onclick=()=>turnBook(-1);
document.getElementById('bookNext').onclick=()=>turnBook(1);
document.getElementById('bookPrevBottom').onclick=()=>turnBook(-1);
document.getElementById('bookNextBottom').onclick=()=>turnBook(1);
bookOverlay.addEventListener('click',e=>{if(e.target===bookOverlay)closeBook()});
document.addEventListener('keydown',e=>{if(!bookOverlay.classList.contains('hidden')){if(e.key==='Escape')closeBook();if(e.key==='ArrowRight')turnBook(1);if(e.key==='ArrowLeft')turnBook(-1)}});
// Gentle browser copy protection: not a guarantee against copying public materials.
bookOverlay.addEventListener('contextmenu',e=>e.preventDefault());
bookOverlay.addEventListener('dragstart',e=>e.preventDefault());
