const $ = (selector) => document.querySelector(selector);

const hourRange = $("#hour-range");
const minuteRange = $("#minute-range");
const hourOutput = $("#hour-output");
const minuteOutput = $("#minute-output");
const spokenTime = $("#spoken-time");
const timeClue = $("#time-clue p");
const challengeTargetLabel = $("#challenge-target");
const challengeFeedback = $("#challenge-feedback");
const checkClockButton = $("#check-clock");
const streakCount = $("#streak-count");
const quizScoreLabel = $("#quiz-score");
const quizFeedback = $("#quiz-feedback");
const answerOptions = $("#answer-options");

const clockParts = {
  practice: {
    face: $("#practice-clock"),
    hourHand: $("#practice-hour-hand"),
    minuteHand: $("#practice-minute-hand"),
    ticks: $("#practice-ticks"),
  },
  quiz: {
    face: $("#quiz-clock"),
    hourHand: $("#quiz-hour-hand"),
    minuteHand: $("#quiz-minute-hand"),
    ticks: $("#quiz-ticks"),
  },
};

function addClockTicks(group) {
  const svgNamespace = "http://www.w3.org/2000/svg";
  for (let tick = 0; tick < 60; tick += 1) {
    const angle = (tick * 6 - 90) * (Math.PI / 180);
    const major = tick % 5 === 0;
    const innerRadius = major ? 117 : 124;
    const outerRadius = 131;
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", String(160 + Math.cos(angle) * innerRadius));
    line.setAttribute("y1", String(160 + Math.sin(angle) * innerRadius));
    line.setAttribute("x2", String(160 + Math.cos(angle) * outerRadius));
    line.setAttribute("y2", String(160 + Math.sin(angle) * outerRadius));
    if (major) line.classList.add("major-tick");
    group.append(line);
  }
}

Object.values(clockParts).forEach((clock) => addClockTicks(clock.ticks));

function formatTime(hour, minute) {
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

function numberWord(number) {
  const words = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
  return words[number % 12];
}

function phraseForTime(hour, minute) {
  const currentHour = numberWord(hour);
  const nextHour = numberWord(hour + 1);
  if (minute === 0) return `${currentHour} o'clock`;
  if (minute === 15) return `quarter past ${currentHour}`;
  if (minute === 30) return `half past ${currentHour}`;
  if (minute === 45) return `quarter to ${nextHour}`;
  if (minute < 30) return `${minute} minutes past ${currentHour}`;
  return `${60 - minute} minutes to ${nextHour}`;
}

function clueForTime(hour, minute) {
  const currentHour = numberWord(hour);
  if (minute === 0) {
    return `At <strong>${formatTime(hour, minute)}</strong>, the long hand is on 12 and the little hand points to ${currentHour}. That's ${phraseForTime(hour, minute)}!`;
  }

  const minuteMark = minute / 5;
  const shortHandHint = minute < 30
    ? `The little hand is moving from ${currentHour} toward ${numberWord(hour + 1)}.`
    : `The little hand is moving from ${currentHour} toward ${numberWord(hour + 1)}.`;
  const minuteHint = minute === 30
    ? "The long hand is on 6, which means 30 minutes have passed."
    : `The long hand points to ${minuteMark}, which means ${minute} minutes.`;
  return `At <strong>${formatTime(hour, minute)}</strong>, ${minuteHint} ${shortHandHint} That's ${phraseForTime(hour, minute)}!`;
}

function updateClock(clock, hour, minute, labelPrefix) {
  const hourAngle = ((hour % 12) * 30) + (minute * 0.5);
  const minuteAngle = minute * 6;
  clock.hourHand.style.transform = `rotate(${hourAngle}deg)`;
  clock.minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
  clock.face.setAttribute("aria-label", `${labelPrefix} showing ${formatTime(hour, minute)}`);
}

function updatePracticeClock() {
  const hour = Number(hourRange.value);
  const minute = Number(minuteRange.value);
  const timePhrase = phraseForTime(hour, minute);

  hourOutput.value = String(hour);
  minuteOutput.value = String(minute).padStart(2, "0");
  updateClock(clockParts.practice, hour, minute, "Analog practice clock");
  spokenTime.textContent = `It's ${timePhrase}!`;
  timeClue.innerHTML = clueForTime(hour, minute);

  if (!challengeSolved) {
    challengeFeedback.textContent = "Use the sliders above, then check your clock.";
  }
}

hourRange.addEventListener("input", updatePracticeClock);
minuteRange.addEventListener("input", updatePracticeClock);

let challenge = { hour: 4, minute: 30 };
let wins = 0;
let challengeSolved = false;

function randomQuarterHour() {
  const hour = Math.floor(Math.random() * 12) + 1;
  const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
  return { hour, minute };
}

function makeNewChallenge() {
  challenge = randomQuarterHour();
  challengeSolved = false;
  challengeTargetLabel.textContent = formatTime(challenge.hour, challenge.minute);
  challengeFeedback.textContent = "Use the sliders above, then check your clock.";
  checkClockButton.disabled = false;
}

checkClockButton.addEventListener("click", () => {
  if (challengeSolved) return;

  const hour = Number(hourRange.value);
  const minute = Number(minuteRange.value);
  if (hour === challenge.hour && minute === challenge.minute) {
    challengeSolved = true;
    wins += 1;
    streakCount.textContent = String(wins);
    challengeFeedback.textContent = "You got it! Both hands are in just the right place. ⭐";
    checkClockButton.disabled = true;
  } else {
    challengeFeedback.textContent = "Almost there! Check the little hand and the long hand, then try again.";
  }
});

$("#new-challenge").addEventListener("click", makeNewChallenge);

$("#hear-time").addEventListener("click", () => {
  const hour = Number(hourRange.value);
  const minute = Number(minuteRange.value);
  const message = `It's ${phraseForTime(hour, minute)}.`;

  if (!("speechSynthesis" in window)) {
    spokenTime.textContent = `${message} Your browser can't read it out loud, but you can say it together!`;
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = document.documentElement.lang || "en";
  window.speechSynthesis.speak(utterance);
});

/* Quiz: choose the spoken time that matches a fresh analog clock. */
let quizScore = 0;
let quizTime = { hour: 5, minute: 15 };
let quizAnswered = false;

function shuffle(list) {
  const shuffled = [...list];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function allQuizTimes() {
  const times = [];
  for (let hour = 1; hour <= 12; hour += 1) {
    for (const minute of [0, 15, 30, 45]) {
      times.push({ hour, minute, label: phraseForTime(hour, minute) });
    }
  }
  return times;
}

function renderQuizOptions() {
  const correctLabel = phraseForTime(quizTime.hour, quizTime.minute);
  const distractors = shuffle(allQuizTimes().filter((time) => time.label !== correctLabel)).slice(0, 3);
  const choices = shuffle([{ ...quizTime, label: correctLabel }, ...distractors]);
  answerOptions.replaceChildren();

  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.textContent = choice.label;
    button.addEventListener("click", () => answerQuiz(button, choice.label === correctLabel, correctLabel));
    answerOptions.append(button);
  });
}

function answerQuiz(selectedButton, isCorrect, correctLabel) {
  if (quizAnswered) return;
  quizAnswered = true;
  const options = [...answerOptions.querySelectorAll("button")];
  options.forEach((button) => {
    button.disabled = true;
    if (button.textContent === correctLabel) button.classList.add("is-correct");
  });

  if (isCorrect) {
    quizScore += 1;
    quizScoreLabel.textContent = String(quizScore);
    quizFeedback.textContent = "That's right! You read both hands like a time-telling star! ✨";
  } else {
    selectedButton.classList.add("is-wrong");
    quizFeedback.textContent = `Close! The clock says ${correctLabel}. Have another go when you're ready.`;
  }
}

function makeNewQuiz() {
  quizTime = randomQuarterHour();
  quizAnswered = false;
  updateClock(clockParts.quiz, quizTime.hour, quizTime.minute, "Analog quiz clock");
  quizFeedback.textContent = "Choose the answer that matches the clock!";
  renderQuizOptions();
}

$("#next-quiz").addEventListener("click", makeNewQuiz);

/* Small-screen navigation */
const menuToggle = $(".menu-toggle");
const primaryNav = $("#primary-nav");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.querySelector(".sr-only").textContent = "Open menu";
  primaryNav.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.querySelector(".sr-only").textContent = isOpen ? "Open menu" : "Close menu";
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

$("#current-year").textContent = String(new Date().getFullYear());
updatePracticeClock();
updateClock(clockParts.quiz, quizTime.hour, quizTime.minute, "Analog quiz clock");
renderQuizOptions();
