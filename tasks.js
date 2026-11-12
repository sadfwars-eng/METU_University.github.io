// v15: четыре задания для каждой темы; четвёртая отметка зависит от сохранённого теста.
// Хранилище только локальное. Проверка преподавателя осуществляется отдельно.
const taskIds=['requiredTaskNotes','requiredTaskSpeech','requiredTaskSlides'];
const taskKey=(sid,id)=>`metu-required-tasks-v15-${sid}-${id}`;
function getTaskState(sid,id){
 const state=getStored(taskKey(sid,id),[false,false,false]);
 return Array.isArray(state)?[0,1,2].map(i=>state[i]===true):[false,false,false];
}
function isQuizSubmitted(sid,id){return Boolean(getQuizSaved(quizStorageKey(sid,id)))}
function isAllTasksComplete(sid,id){return getTaskState(sid,id).every(Boolean)&&isQuizSubmitted(sid,id)}
function syncTaskProgress(){
 const t=TOPIC_DATA[activeTopicIndex];if(!t)return;
 const state=getTaskState(currentSyllabus,t.id),quizSent=isQuizSubmitted(currentSyllabus,t.id);
 taskIds.forEach((id,i)=>{document.getElementById(id).checked=state[i]});
 document.getElementById('requiredTaskQuiz').checked=quizSent;
 document.getElementById('requiredQuizStatus').textContent=quizSent?'Ответы отправлены и сохранены. Изменить их нельзя.':'Пройдите тест и нажмите «Отправить ответы». Галочка появится автоматически.';
 const n=state.filter(Boolean).length+(quizSent?1:0);
 document.getElementById('requiredProgressText').textContent=`Выполнено: ${n} из 4`;
 document.getElementById('requiredProgressFill').style.width=`${n*25}%`;
 document.getElementById('requiredCompletionStatus').textContent=n===4?'✓ Все четыре задания выполнены. Тема полностью пройдена.':'Тема ещё не выполнена полностью.';
 const old=done.includes(t.id),completed=n===4;
 if(completed!==old){done=completed?[...done,t.id]:done.filter(x=>x!==t.id);putStored('metu-completed-v11-'+currentSyllabus,done);renderTopics()}
 const mark=document.getElementById('markDone');
 mark.textContent=completed?'✓ Все 4 задания выполнены':`Выполнено ${n} из 4 заданий`;
 mark.disabled=true;mark.title='Статус определяется четырьмя обязательными заданиями автоматически';
}
for(let i=0;i<taskIds.length;i++){
 document.getElementById(taskIds[i]).addEventListener('change',()=>{
  const t=TOPIC_DATA[activeTopicIndex];if(!t)return;
  const state=getTaskState(currentSyllabus,t.id);state[i]=document.getElementById(taskIds[i]).checked;
  try{localStorage.setItem(taskKey(currentSyllabus,t.id),JSON.stringify(state))}catch{
   alert('Не удалось сохранить отметку в этом браузере.');
   document.getElementById(taskIds[i]).checked=!state[i];return;
  }
  syncTaskProgress();
 });
}
// Не даём вручную пометить тему полностью выполненной, обходя задания.
document.getElementById('markDone').onclick=()=>{};
const previousOpenTopicWithQuiz=openTopic;
openTopic=function(id){previousOpenTopicWithQuiz(id);syncTaskProgress()};
// Вызывается и при открытии, и после подтверждённой отправки теста.
const previousRenderQuiz=renderQuiz;
renderQuiz=function(){previousRenderQuiz();syncTaskProgress()};
// При переключении силлабусов карточки строятся из текущих отметок.
const previousSwitchSyllabus=switchSyllabus;
switchSyllabus=function(n){previousSwitchSyllabus(n);done=TOPIC_DATA.filter(t=>isAllTasksComplete(currentSyllabus,t.id)).map(t=>t.id);putStored('metu-completed-v11-'+currentSyllabus,done);renderTopics()};
// Согласуем прежний флаг «пройдено» с четырьмя заданиями, не трогая отправленные тесты.
done=TOPIC_DATA.filter(t=>isAllTasksComplete(currentSyllabus,t.id)).map(t=>t.id);
putStored('metu-completed-v11-'+currentSyllabus,done);renderTopics();
