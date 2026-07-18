import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";
import { getLesson, getPublishedLessons } from "./lessons.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, get, set, update, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const $ = (id) => document.getElementById(id);
const screens = [...document.querySelectorAll(".screen")];
const state = { firebaseReady:false, user:null, db:null, mode:null, roomCode:null, room:null, unsubscribe:null, lesson:null, nickname:"", quiz:null, demo:false };

const els = {
  connectionPill:$("connectionPill"), connectionText:$("connectionText"), lessonSelect:$("lessonSelect"), lessonDescription:$("lessonDescription"), firebaseHostNotice:$("firebaseHostNotice"), createRoom:$("createRoom"),
  hostLessonTitle:$("hostLessonTitle"), hostStatusBadge:$("hostStatusBadge"), hostRoomCode:$("hostRoomCode"), joinLink:$("joinLink"), startRoom:$("startRoom"), closeRoom:$("closeRoom"), playerCount:$("playerCount"), participantList:$("participantList"), hostLeaderboard:$("hostLeaderboard"),
  joinRoomCode:$("joinRoomCode"), nickname:$("nickname"), waitingRoomCode:$("waitingRoomCode"), waitingLessonTitle:$("waitingLessonTitle"), waitingName:$("waitingName"),
  quizLessonNumber:$("quizLessonNumber"), quizLessonTitle:$("quizLessonTitle"), liveScore:$("liveScore"), questionCurrent:$("questionCurrent"), questionTotal:$("questionTotal"), progressPercent:$("progressPercent"), progressBar:$("progressBar"), questionReference:$("questionReference"), questionText:$("questionText"), optionList:$("optionList"), feedbackBox:$("feedbackBox"), feedbackTitle:$("feedbackTitle"), feedbackText:$("feedbackText"), nextQuestion:$("nextQuestion"), playerLeaderboard:$("playerLeaderboard"),
  finalScore:$("finalScore"), finalTotal:$("finalTotal"), resultHeading:$("resultHeading"), resultMessage:$("resultMessage"), resultIcon:$("resultIcon"), rewardBadge:$("rewardBadge"), resultLeaderboard:$("resultLeaderboard"), toast:$("toast")
};

let toastTimer;
function showScreen(id){ screens.forEach(s=>s.classList.toggle("active",s.id===id)); window.scrollTo({top:0,behavior:"smooth"}); }
function toast(msg){ clearTimeout(toastTimer); els.toast.textContent=msg; els.toast.classList.add("show"); toastTimer=setTimeout(()=>els.toast.classList.remove("show"),2400); }
function setConnection(type,text){ els.connectionPill.className=`connection-pill ${type}`; els.connectionText.textContent=text; }
function normalizeCode(v){ return String(v||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6); }
function esc(v){ return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function lessonNumber(n){ const c=["零","一","二","三","四","五","六","七","八","九","十"]; if(n<=10)return `第${c[n]}課`; if(n<20)return `第十${c[n-10]}課`; if(n===20)return "第二十課"; return `第${n}課`; }
function randomCode(){ const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join(""); }

function populateLessons(){ const list=getPublishedLessons(); els.lessonSelect.innerHTML=list.map(l=>`<option value="${esc(l.id)}">${lessonNumber(l.number)}｜${esc(l.title)}</option>`).join(""); updateLessonDescription(); }
function updateLessonDescription(){ const l=getLesson(els.lessonSelect.value); els.lessonDescription.textContent=l?`${l.passage}｜${l.questions.length} 題｜答中 ${Math.round(l.rewardThreshold*100)}% 可獲獎勵提示`:""; }

async function initFirebase(){
  if(!isFirebaseConfigured){ setConnection("demo","單機示範"); els.firebaseHostNotice.hidden=false; els.createRoom.disabled=true; return; }
  try{
    const app=initializeApp(firebaseConfig); state.db=getDatabase(app); const auth=getAuth(app);
    await new Promise((resolve,reject)=>{ let done=false; onAuthStateChanged(auth,async user=>{ if(done)return; if(user){done=true;state.user=user;state.firebaseReady=true;setConnection("online","即時連線");resolve();return;} try{await signInAnonymously(auth);}catch(e){done=true;reject(e);} },reject); });
  }catch(e){ console.error(e); setConnection("error","連線失敗"); els.firebaseHostNotice.hidden=false; els.createRoom.disabled=true; toast("Firebase 連線失敗，請檢查設定。"); }
}
function stopListening(){ if(typeof state.unsubscribe==="function")state.unsubscribe(); state.unsubscribe=null; }

async function createRoom(){
  if(!state.firebaseReady){toast("請先完成 Firebase 設定。");return;}
  const lesson=getLesson(els.lessonSelect.value); if(!lesson)return;
  els.createRoom.disabled=true; els.createRoom.textContent="建立中…";
  try{
    let code="";
    for(let i=0;i<8;i++){ const candidate=randomCode(); if(!(await get(ref(state.db,`rooms/${candidate}`))).exists()){code=candidate;break;} }
    if(!code)throw new Error("room-code");
    await set(ref(state.db,`rooms/${code}`),{ownerUid:state.user.uid,lessonId:lesson.id,lessonTitle:lesson.title,status:"waiting",createdAt:serverTimestamp(),startedAt:null,players:{}});
    state.mode="host"; state.roomCode=code; state.lesson=lesson;
    els.hostLessonTitle.textContent=`${lessonNumber(lesson.number)}｜${lesson.title}`; els.hostRoomCode.textContent=code;
    const url=new URL(window.location.href); url.search=""; url.hash=""; url.searchParams.set("room",code); els.joinLink.value=url.toString();
    listenRoom(code); showScreen("hostRoomScreen");
  }catch(e){console.error(e);toast("未能建立房間，請重試。");}
  finally{els.createRoom.disabled=false;els.createRoom.textContent="建立房間";}
}

function statusText(s){return s==="active"?"進行中":s==="closed"?"已結束":"等待中";}
function renderHost(room){
  const players=Object.entries(room.players||{}).map(([uid,p])=>({uid,...p}));
  els.hostStatusBadge.textContent=statusText(room.status); els.hostStatusBadge.className=`room-status ${room.status}`;
  els.playerCount.textContent=players.length; els.startRoom.disabled=room.status!=="waiting"||players.length===0; els.closeRoom.disabled=room.status==="closed";
  els.participantList.innerHTML=players.length?players.map(p=>`<span class="participant-chip"><span></span>${esc(p.name)}</span>`).join(""):`<p class="empty-state">暫時未有人加入。</p>`;
  renderLeaderboard(els.hostLeaderboard,players);
}
async function startRoom(){ try{await update(ref(state.db,`rooms/${state.roomCode}`),{status:"active",startedAt:serverTimestamp()});}catch(e){console.error(e);toast("未能開始問答。");} }
async function closeRoom(){ try{await update(ref(state.db,`rooms/${state.roomCode}`),{status:"closed"});}catch(e){console.error(e);toast("未能結束房間。");} }

async function joinRoom(){
  if(!state.firebaseReady){toast("即時多人模式尚未設定。");return;}
  const code=normalizeCode(els.joinRoomCode.value), name=els.nickname.value.trim().slice(0,20), btn=$("joinRoom");
  if(code.length!==6){toast("請輸入六位房間碼。");return;} if(!name){toast("請輸入暱稱。");return;}
  btn.disabled=true;btn.textContent="加入中…";
  try{
    const snap=await get(ref(state.db,`rooms/${code}`)); if(!snap.exists()){toast("找不到這個房間碼。");return;}
    const room=snap.val(); if(room.status==="closed"){showScreen("closedScreen");return;}
    const lesson=getLesson(room.lessonId); if(!lesson){toast("這個房間的課堂尚未發布。");return;}
    await set(ref(state.db,`rooms/${code}/players/${state.user.uid}`),{name,score:0,total:lesson.questions.length*10,progress:0,finished:false,joinedAt:Date.now(),completedAt:0});
    state.mode="player";state.roomCode=code;state.nickname=name;state.lesson=lesson;state.demo=false;state.quiz=null;
    els.waitingRoomCode.textContent=code;els.waitingLessonTitle.textContent=`${lessonNumber(lesson.number)}｜${lesson.title}`;els.waitingName.textContent=`${name}，你已成功加入。`;
    listenRoom(code);
  }catch(e){console.error(e);toast("加入房間失敗，請重試。");}
  finally{btn.disabled=false;btn.textContent="加入房間";}
}

function listenRoom(code){
  stopListening(); state.unsubscribe=onValue(ref(state.db,`rooms/${code}`),snap=>{
    if(!snap.exists()){toast("這個房間已不存在。");resetHome();return;}
    const room=snap.val();state.room=room;
    if(state.mode==="host"){renderHost(room);return;}
    if(state.mode==="player"){
      const players=Object.entries(room.players||{}).map(([uid,p])=>({uid,...p})); renderLeaderboard(els.playerLeaderboard,players,state.user?.uid);renderLeaderboard(els.resultLeaderboard,players,state.user?.uid);
      if(room.status==="waiting"&&!state.quiz?.finished)showScreen("waitingScreen");
      else if(room.status==="active"&&!state.quiz)beginQuiz(false);
      else if(room.status==="closed"&&!state.quiz?.finished)showScreen("closedScreen");
    }
  },e=>{console.error(e);toast("未能讀取房間資料。");});
}

function storageKey(){return state.demo?`markQuiz:demo:${state.lesson.id}`:`markQuiz:${state.roomCode}:${state.user?.uid}:${state.lesson.id}`;}
function beginQuiz(demo=false){
  state.demo=demo; const stored=localStorage.getItem(storageKey());
  if(stored){try{const q=JSON.parse(stored);if(q.lessonId===state.lesson.id&&!q.finished)state.quiz=q;}catch{localStorage.removeItem(storageKey());}}
  if(!state.quiz||state.quiz.lessonId!==state.lesson.id)state.quiz={lessonId:state.lesson.id,index:0,score:0,answered:false,finished:false};
  els.quizLessonNumber.textContent=lessonNumber(state.lesson.number);els.quizLessonTitle.textContent=state.lesson.title;els.questionTotal.textContent=state.lesson.questions.length;renderQuestion();showScreen("quizScreen");
}
function saveQuiz(){localStorage.setItem(storageKey(),JSON.stringify(state.quiz));}
function renderQuestion(){
  const q=state.lesson.questions[state.quiz.index], total=state.lesson.questions.length, done=state.quiz.index+(state.quiz.answered?1:0), percent=Math.round(done/total*100), letters=["A","B","C","D","E","F"];
  els.liveScore.textContent=state.quiz.score;els.questionCurrent.textContent=state.quiz.index+1;els.progressPercent.textContent=`${percent}%`;els.progressBar.style.width=`${percent}%`;els.questionReference.textContent=q.reference||state.lesson.passage;els.questionText.textContent=q.text;els.feedbackBox.hidden=true;els.feedbackBox.className="feedback";els.nextQuestion.hidden=true;
  els.optionList.innerHTML=q.options.map((o,i)=>`<button class="option-button" type="button" data-option="${i}"><span class="option-letter">${letters[i]}</span><span>${esc(o)}</span></button>`).join("");
  els.optionList.querySelectorAll(".option-button").forEach(b=>b.addEventListener("click",()=>answerQuestion(Number(b.dataset.option))));
}
async function answerQuestion(selected){
  if(state.quiz.answered)return; state.quiz.answered=true; const q=state.lesson.questions[state.quiz.index], correct=selected===q.correctIndex; if(correct)state.quiz.score+=10;
  [...els.optionList.querySelectorAll(".option-button")].forEach((b,i)=>{b.disabled=true;if(i===q.correctIndex)b.classList.add("correct");if(i===selected&&!correct)b.classList.add("wrong");});
  els.feedbackBox.hidden=false;els.feedbackBox.classList.add(correct?"correct":"wrong");els.feedbackTitle.textContent=correct?"答對了！":"再看一次經文";els.feedbackText.textContent=q.explanation;els.liveScore.textContent=state.quiz.score;els.nextQuestion.hidden=false;els.nextQuestion.textContent=state.quiz.index===state.lesson.questions.length-1?"查看結果":"下一題";saveQuiz();
  if(!state.demo&&state.firebaseReady){try{await update(ref(state.db,`rooms/${state.roomCode}/players/${state.user.uid}`),{score:state.quiz.score,progress:state.quiz.index+1});}catch(e){console.error(e);toast("分數同步失敗，稍後會再嘗試。");}}
}
async function nextQuestion(){
  if(!state.quiz.answered)return;
  if(state.quiz.index<state.lesson.questions.length-1){state.quiz.index++;state.quiz.answered=false;saveQuiz();renderQuestion();window.scrollTo({top:0,behavior:"smooth"});return;}
  state.quiz.finished=true;saveQuiz();
  if(!state.demo&&state.firebaseReady){try{await update(ref(state.db,`rooms/${state.roomCode}/players/${state.user.uid}`),{score:state.quiz.score,progress:state.lesson.questions.length,finished:true,completedAt:Date.now()});}catch(e){console.error(e);}}
  renderResult();
}
function renderResult(){
  const total=state.lesson.questions.length*10, ratio=total?state.quiz.score/total:0, rewarded=ratio>=state.lesson.rewardThreshold;
  els.finalScore.textContent=state.quiz.score;els.finalTotal.textContent=total;els.rewardBadge.hidden=!rewarded;els.resultIcon.textContent=rewarded?"🎉":"📖";els.resultHeading.textContent=rewarded?"完成挑戰！":"完成了，再接再厲！";els.resultMessage.textContent=rewarded?`你答中 ${Math.round(ratio*100)}%，已達到本課八成獎勵標準。`:`你答中 ${Math.round(ratio*100)}%。重點不是鬥快，而是透過經文更認識耶穌。`;
  if(state.demo)els.resultLeaderboard.innerHTML=`<div class="leader-row me"><div class="rank">1</div><div class="leader-name"><strong>單機示範</strong><small>已完成 ${state.lesson.questions.length}/${state.lesson.questions.length}</small></div><div class="leader-score">${state.quiz.score} 分</div></div>`;
  showScreen("resultScreen");
}

function sortedPlayers(players){return [...players].sort((a,b)=>(b.score||0)-(a.score||0)||(b.progress||0)-(a.progress||0)||((a.completedAt||Number.MAX_SAFE_INTEGER)-(b.completedAt||Number.MAX_SAFE_INTEGER)));}
function renderLeaderboard(container,players,currentUid=null){
  const list=sortedPlayers(players||[]); if(!list.length){container.innerHTML=`<p class="empty-state">排行榜仍在等待參加者。</p>`;return;}
  const totalQ=state.lesson?.questions?.length||1;
  container.innerHTML=list.map((p,i)=>`<div class="leader-row ${currentUid&&p.uid===currentUid?"me":""}"><div class="rank">${i+1}</div><div class="leader-name"><strong>${esc(p.name)}${currentUid&&p.uid===currentUid?"（你）":""}</strong><small>${p.finished?"已完成":`進度 ${p.progress||0}/${totalQ}`}</small></div><div class="leader-score">${p.score||0} 分</div></div>`).join("");
}

function startDemo(){ const lesson=getPublishedLessons()[0];state.mode="player";state.lesson=lesson;state.roomCode="DEMO";state.nickname="單機示範";state.quiz=null;state.demo=true;localStorage.removeItem(`markQuiz:demo:${lesson.id}`);els.playerLeaderboard.innerHTML=`<div class="leader-row me"><div class="rank">1</div><div class="leader-name"><strong>單機示範（你）</strong><small>準備開始</small></div><div class="leader-score">0 分</div></div>`;beginQuiz(true);}
function resetHome(){stopListening();Object.assign(state,{mode:null,roomCode:null,room:null,lesson:null,nickname:"",quiz:null,demo:false});history.replaceState({},"",window.location.pathname);showScreen("homeScreen");}
function prefill(){const code=normalizeCode(new URLSearchParams(location.search).get("room"));if(code){els.joinRoomCode.value=code;showScreen("joinScreen");}}

function wire(){
  $("brandHome").addEventListener("click",resetHome);$("goHost").addEventListener("click",()=>showScreen("hostSetupScreen"));$("goJoin").addEventListener("click",()=>showScreen("joinScreen"));$("startDemo").addEventListener("click",startDemo);document.querySelectorAll("[data-back-home]").forEach(b=>b.addEventListener("click",resetHome));
  els.lessonSelect.addEventListener("change",updateLessonDescription);els.createRoom.addEventListener("click",createRoom);els.startRoom.addEventListener("click",startRoom);els.closeRoom.addEventListener("click",closeRoom);$("newRoom").addEventListener("click",()=>{stopListening();state.roomCode=null;state.room=null;showScreen("hostSetupScreen");});
  $("copyJoinLink").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(els.joinLink.value);toast("已複製加入連結。");}catch{els.joinLink.select();document.execCommand("copy");toast("已複製加入連結。");}});
  els.joinRoomCode.addEventListener("input",e=>e.target.value=normalizeCode(e.target.value));$("joinRoom").addEventListener("click",joinRoom);els.nextQuestion.addEventListener("click",nextQuestion);[els.joinRoomCode,els.nickname].forEach(i=>i.addEventListener("keydown",e=>{if(e.key==="Enter")joinRoom();}));
}

async function init(){populateLessons();wire();prefill();await initFirebase();}
init();
