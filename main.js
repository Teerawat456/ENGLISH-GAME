const elements = {
  playerHPBar: document.getElementById("player-hp-bar"),
  enemyHPBar: document.getElementById("enemy-hp-bar"),
  difficultyMenu: document.getElementById("difficulty-select"),
  battleContainer: document.getElementById("battle-container"),
  questionBox: document.getElementById("question"),
  questionText: document.getElementById("question-text"),
  answerButtons: document.getElementById("answerButtons"),
  actionButtons: document.getElementById("action-buttons"),
  log: document.getElementById("log"),
  scoreText: document.getElementById("score")
};

let playerHP, playerATK, enemyHP, enemyATK, score, currentDifficulty, isGuarding;
let questionPool = [];

function initGame(mode) {
  currentDifficulty = mode;
  isGuarding = false;
  score = 0;

  const config = {
    Easy: { player: [120, 20], enemy: [100, 10], pool: easyQuestions },
    Normal: { player: [100, 25], enemy: [100, 15], pool: normalQuestions },
    Hard: { player: [100, 15], enemy: [120, 20], pool: hardQuestions },
    Lunatic: { player: [80, 10], enemy: [200, 50], pool: lunaticQuestions }
  };


  const { player, enemy, pool } = config[mode];
  [playerHP, playerATK] = player;
  [enemyHP, enemyATK] = enemy;
  questionPool = [...pool];

  elements.playerHPBar.dataset.max = playerHP;
  elements.enemyHPBar.dataset.max = enemyHP;

  elements.difficultyMenu.style.display = "none";
  elements.battleContainer.style.display = "flex";
  elements.questionBox.style.display = "block";
  elements.actionButtons.style.display = "none";
  elements.log.textContent = "";
  elements.scoreText.textContent = "Score: 0";

  updateHPBars();
  askQuestion();
}

function updateHPBars() {
  const pMax = parseInt(elements.playerHPBar.dataset.max);
  const eMax = parseInt(elements.enemyHPBar.dataset.max);
  elements.playerHPBar.style.width = `${(playerHP / pMax) * 100}%`;
  elements.playerHPBar.textContent = `${playerHP} / ${pMax}`;
  elements.enemyHPBar.style.width = `${(enemyHP / eMax) * 100}%`;
  elements.enemyHPBar.textContent = `${enemyHP} / ${eMax}`;
}

function playerAction(type) {
  isGuarding = type === "guard";
  elements.actionButtons.style.display = "none";
  askQuestion();
}

function askQuestion() {
  if (questionPool.length === 0) {
    const fallback = {
      Easy: easyQuestions,
      Normal: normalQuestions,
      Hard: hardQuestions,
      Lunatic: lunaticQuestions
    };
    questionPool = [...fallback[currentDifficulty]];
  }

  const q = questionPool.splice(Math.floor(Math.random() * questionPool.length), 1)[0];
  elements.questionText.textContent = `❓ ${q.question}`;
  elements.answerButtons.innerHTML = "";

  shuffle(q.choices).forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => checkAnswer(choice, q.correct);
    elements.answerButtons.appendChild(btn);
  });
}

function checkAnswer(choice, correct) {
  document.querySelectorAll("#answerButtons button").forEach(b => b.disabled = true);
  const enemyGuard = Math.random() < 0.5;
  let logMsg = "";

  if (choice === correct) {
    const dmg = calculateDamage(playerATK, "Enemy", enemyGuard);
    enemyHP -= dmg;
    logMsg = `✅ ตอบถูก! Enemy -${dmg}${enemyGuard ? " (Guarded!)" : ""}`;
    score++;
  } else {
    const dmg = calculateDamage(enemyATK, "Player", isGuarding);
    playerHP -= dmg;
    logMsg = `❌ ตอบผิด! คุณโดน -${dmg}${isGuarding ? " (Guarded!)" : ""}`;
  }

  playerHP = Math.max(playerHP, 0);
  enemyHP = Math.max(enemyHP, 0);
  elements.log.textContent = logMsg;
  elements.scoreText.textContent = `Score: ${score}`;
  updateHPBars();

  if (playerHP <= 0 || enemyHP <= 0) {
    setTimeout(() => {
      elements.questionBox.style.display = "none";
      elements.actionButtons.style.display = "none";
      elements.log.textContent = playerHP <= 0 ? "❌ คุณแพ้แล้ว!" : "🎉 คุณชนะแล้ว!";
    }, 1500);
  } else {
    setTimeout(() => {
  elements.actionButtons.style.display = "block";
  elements.questionText.textContent = "";
  elements.answerButtons.innerHTML = "";
}, 1200);
  }
}

function calculateDamage(base, target, guarding) {
  const reduction = {
    Player: { Easy: 0.65, Normal: 0.25, Hard: 0.2, Lunatic: 0.15 },
    Enemy: { Easy: 0.15, Normal: 0.25, Hard: 0.5, Lunatic: 0.25}
  };
  const rate = reduction[target][currentDifficulty];
  return guarding ? Math.round(base * (1 - rate)) : base;
}

function resetGame() {
  location.reload();
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}