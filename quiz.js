const QUESTIONS = [
  { q: "Which ocean is the largest by surface area?", opts: ["Atlantic","Indian","Pacific","Arctic"], a: 2 },
  { q: "In what year did the first email get sent, marking the start of networked messaging?", opts: ["1961","1971","1983","1990"], a: 1 },
  { q: "Which element has the chemical symbol 'Fe'?", opts: ["Fluorine","Iron","Lead","Tin"], a: 1 },
  { q: "Who composed the opera 'The Magic Flute'?", opts: ["Beethoven","Mozart","Verdi","Handel"], a: 1 },
  { q: "What's the smallest prime number?", opts: ["0","1","2","3"], a: 2 },
  { q: "Which country has the most time zones?", opts: ["Russia","USA","France","China"], a: 2 },
  { q: "What does CSS stand for?", opts: ["Creative Style Sheets","Cascading Style Sheets","Computed Style System","Colorful Style Sheets"], a: 1 },
  { q: "Which planet is known for its prominent ring system?", opts: ["Neptune","Mars","Saturn","Mercury"], a: 2 },
  { q: "Who painted the ceiling of the Sistine Chapel?", opts: ["Raphael","Michelangelo","Donatello","Titian"], a: 1 },
  { q: "What is the hardest natural substance on Earth?", opts: ["Quartz","Titanium","Diamond","Graphite"], a: 2 },
  { q: "Which river is the longest in the world?", opts: ["Amazon","Nile","Yangtze","Mississippi"], a: 1 },
  { q: "In computing, what does 'HTTP' stand for?", opts: ["HyperText Transfer Protocol","High Transfer Text Process","HyperText Transport Process","Host Terminal Transfer Protocol"], a: 0 },
  { q: "Which gas do plants primarily absorb for photosynthesis?", opts: ["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"], a: 2 },
  { q: "Who wrote the novel '1984'?", opts: ["Aldous Huxley","George Orwell","Ray Bradbury","H.G. Wells"], a: 1 },
  { q: "What is the currency of Japan?", opts: ["Won","Yuan","Ringgit","Yen"], a: 3 },
  { q: "Which continent is the Sahara Desert located on?", opts: ["Asia","Africa","Australia","South America"], a: 1 },
  { q: "How many bones are in the adult human body?", opts: ["186","206","226","246"], a: 1 },
  { q: "Which programming language is denoted by the file extension '.py'?", opts: ["Perl","PHP","Python","Pascal"], a: 2 },
  { q: "What is the tallest mountain in the world, measured from sea level?", opts: ["K2","Kangchenjunga","Mount Everest","Denali"], a: 2 },
  { q: "Which artist is known for the painting 'The Starry Night'?", opts: ["Claude Monet","Vincent van Gogh","Salvador Dalí","Edvard Munch"], a: 1 }
];

const TIME_PER_Q = 15;
let i = 0, score = 0, timeLeft = TIME_PER_Q, tickHandle = null, locked = false;
const history = [];

const card = document.getElementById('card');
const progressEl = document.getElementById('progress');

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
  document.getElementById('again').addEventListener('click', ()=>{
    i = 0; score = 0; history.length = 0;
    render();
  });
}

render();