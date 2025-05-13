/* static/js/timer.js */
let timer          = null;   // setInterval 핸들
let minutes        = 15;
let seconds        = 0;
let isPaused       = true;   // 처음엔 멈춤
let baseMinutes    = 15;     // Clear 시 복원할 분
let hasStartedOnce = false;  // Start 를 눌러야 true

/* 화면 표기 */
function updateDisplay() {
  document.getElementById('timer').textContent =
    `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

/* 1초 주기 틱 */
function runTicker() {
  timer = setInterval(() => {
    if (!isPaused) {
      if (minutes === 0 && seconds === 0) {
        clearInterval(timer);
        isPaused = true;
        hasStartedOnce = false;
        document.getElementById('start-clear-btn').textContent = 'Start';
        return;
      }
      if (seconds > 0) { seconds--; }
      else { seconds = 59; minutes--; }
      updateDisplay();
    }
  }, 1000);
}

/* Pause / Resume */
function togglePauseResume() {
  if (!hasStartedOnce) return;     // 아직 시작 안 했으면 무시
  const btn = document.getElementById('pause-resume-btn');
  isPaused  = !isPaused;
  btn.textContent = isPaused ? 'Resume' : 'Pause';
}

/* Start  ↔  Clear */
function startClearHandler() {
  const startBtn = document.getElementById('start-clear-btn');
  const pauseBtn = document.getElementById('pause-resume-btn');

  /* ─── Start 동작 ─── */
  if (startBtn.textContent === 'Start') {
    hasStartedOnce = true;
    isPaused       = false;
    pauseBtn.textContent = 'Pause';
    startBtn.textContent = 'Clear';
    clearInterval(timer);   // 혹시 남아 있던 틱 제거
    runTicker();
    return;
  }

  /* ─── Clear 동작 ─── */
  clearInterval(timer);
  minutes        = baseMinutes;
  seconds        = 0;
  isPaused       = true;
  hasStartedOnce = false;
  updateDisplay();
  pauseBtn.textContent  = 'Pause';
  startBtn.textContent  = 'Start';
}

/* 시간 선택 */
function chooseTime() {
  const val = parseInt(prompt('Enter new time in minutes:'));
  if (!isNaN(val) && val > 0) {
    baseMinutes     = val;
    minutes         = val;
    seconds         = 0;
    isPaused        = true;
    hasStartedOnce  = false;

    updateDisplay();
    clearInterval(timer);

    document.getElementById('pause-resume-btn').textContent = 'Pause';
    document.getElementById('start-clear-btn').textContent  = 'Start';
  } else {
    alert('Invalid input. Please enter a positive number.');
  }
}

/* 초기 화면 */
updateDisplay();
