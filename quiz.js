const FALLBACK_QUESTIONS = [
  { q: "Which ocean is the largest by surface area?", opts: ["Atlantic","Indian","Pacific","Arctic"], a: 2 },
  { q: "Which element has the chemical symbol 'Fe'?", opts: ["Fluorine","Iron","Lead","Tin"], a: 1 },
  { q: "What's the smallest prime number?", opts: ["0","1","2","3"], a: 2 },
  { q: "What does CSS stand for?", opts: ["Creative Style Sheets","Cascading Style Sheets","Computed Style System","Colorful Style Sheets"], a: 1 },
  { q: "Which planet is known for its prominent ring system?", opts: ["Neptune","Mars","Saturn","Mercury"], a: 2 }
];

const API_URL = "https://opentdb.com/api.php?amount=20&type=multiple";

const TIME_PER_Q = 15;
let i = 0, score = 0, timeLeft = TIME_PER_Q, tickHandle = null, locked = false;
let QUESTIONS = [];
const history = [];

const card = document.getElementById('card');
const progressEl = document.getElementById('progress');


function decodeHTML(str){
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

function shuffle(arr){
  for (let j = arr.length - 1; j > 0; j--){
    const k = Math.floor(Math.random() * (j + 1));
    [arr[j], arr[k]] = [arr[k], arr[j]];
  }
  return arr;
}

async function loadQuestions(){
  progressEl.textContent = "";
  card.innerHTML = `<p class="loading">Fetching questions…</p>`;
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const data = await res.json();
    if (data.response_code !== 0 || !Array.isArray(data.results) || !data.results.length){
      throw new Error("No questions returned");
    }
    QUESTIONS = data.results.map(item => {
      const correctAnswer = decodeHTML(item.correct_answer);
      const opts = shuffle([...item.incorrect_answers.map(decodeHTML), correctAnswer]);
      return {
        q: decodeHTML(item.question),
        opts,
        a: opts.indexOf(correctAnswer)
      };
    });
  } catch (err) {
    QUESTIONS = FALLBACK_QUESTIONS;
    card.innerHTML = `<p class="loading">Couldn't reach the quiz API — using a short backup set instead.</p>`;
    await new Promise(r => setTimeout(r, 1200));
  }
  i = 0; score = 0; history.length = 0;
  render();
}

function render(){
  progressEl.textContent = `Q${i+1} / ${QUESTIONS.length}`;
  const item = QUESTIONS[i];
  locked = false;
  timeLeft = TIME_PER_Q;

  card.innerHTML = `
    <div class="clock">
      <div class="clock-ring" id="ring">${timeLeft}</div>
      <div class="clock-bar"><div class="clock-bar-fill" id="fill"></div></div>
    </div>
    <h1>${item.q}</h1>
    <div class="options" id="opts">
      ${item.opts.map((o,idx)=>`
        <button class="opt" data-idx="${idx}">
          <span class="letter">${String.fromCharCode(65+idx)}</span>
          <span>${o}</span>
        </button>`).join('')}
    </div>
  `;

  document.querySelectorAll('.opt').forEach(btn=>{
    btn.addEventListener('click', ()=> select(parseInt(btn.dataset.idx,10)));
  });

  startTimer();
}

function startTimer(){
  clearInterval(tickHandle);
  updateClock();
  tickHandle = setInterval(()=>{
    timeLeft--;
    updateClock();
    if (timeLeft <= 0){
      clearInterval(tickHandle);
      select(null);
    }
  }, 1000);
}

function updateClock(){
  const ring = document.getElementById('ring');
  const fill = document.getElementById('fill');
  if (!ring || !fill) return;
  ring.textContent = Math.max(timeLeft,0);
  fill.style.width = `${(Math.max(timeLeft,0)/TIME_PER_Q)*100}%`;
  const low = timeLeft <= 5;
  ring.classList.toggle('low', low);
  fill.classList.toggle('low', low);
}

function select(idx){
  if (locked) return;
  locked = true;
  clearInterval(tickHandle);
  const item = QUESTIONS[i];
  const buttons = document.querySelectorAll('.opt');
  buttons.forEach(b=> b.disabled = true);

  const correct = idx === item.a;
  if (correct) score++;
  history.push({ q: item.q, correct, timedOut: idx === null });

  buttons[item.a].classList.add('correct');
  if (idx !== null && !correct) buttons[idx].classList.add('wrong');

  setTimeout(()=>{
    i++;
    if (i < QUESTIONS.length){ render(); } else { renderResult(); }
  }, 900);
}

function renderResult(){
  progressEl.textContent = `Done`;
  const pct = Math.round((score/QUESTIONS.length)*100);
  let verdict;
  if (pct === 100) verdict = "Clean sweep. Nothing got past you.";
  else if (pct >= 70) verdict = "Sharp - most of that stuck.";
  else if (pct >= 40) verdict = "Worth another pass.";
  else verdict = "Rough round. Try it again.";

  card.innerHTML = `
    <div class="result">
      <div class="tally">${score}<span> / ${QUESTIONS.length}</span></div>
      <p class="verdict">${verdict}</p>
      <ul class="review">
        ${history.map(h=>`
          <li class="${h.correct ? 'hit':'miss'}">
            <span class="mark">${h.correct ? '✓':'✕'}</span>
            <span>${h.q}${h.timedOut ? ' — ran out of time' : ''}</span>
          </li>`).join('')}
      </ul>
      <button class="primary" id="again">RETURN BACK</button>
    </div>
  `;
  document.getElementById('again').addEventListener('click', loadQuestions);
}

loadQuestions();