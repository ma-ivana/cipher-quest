const riddles = [
  {
    title: "El desplazamiento",
    description:
      "Julio César protegía sus mensajes moviendo cada letra tres lugares hacia adelante. Para leer este, mueve cada letra tres lugares hacia atrás.",
    cipher: "KRB HV XQ GLD LPSRUWDQWH",
    answer: "Hoy es un día importante",
    hint: "Por ejemplo, para descifrar la O, retrocede tres letras en el alfabeto: O → N → M → L.",
  },
  {
    title: "El espejo del alfabeto",
    description:
      "En este código, cada letra se cambia por su opuesta: la A se convierte en Z, la B en Y, y así sucesivamente. Se usa el alfabeto sin Ñ.",
    cipher: "VO HVXIVGL VHGZ YZQL OZ KOZMGZ WV OZ VMGIZWZ",
    answer: "el secreto esta bajo la planta de la entrada",
    hint: "A ↔ Z, B ↔ Y, C ↔ X. Busca la letra que ocupa la posición opuesta en el alfabeto.",
  },
  {
    title: "Escribí la palabra clave para seguir",
    description:
      "Usá la pista que encontraste.",
    cipher: "Resolvé el acertijo y escribí acá la palabra clave.",
    answer: "Jasperito",
    hint: "Le digo Jasper si me enojo, o también \"perro mugroso\", pero cuando es dulce y muy tiernito, le decimos ...",
  },
  {
    title: "Dibujos en clave",
    description:
      "¡Último reto! Descifra cada dibujo. Las dos últimas respuestas se juntan para formar un nombre.",
    rebuses: [
      {
        parts: [
          { drawing: "🙏", name: "dos manos juntas orando" },
          { drawing: "⚜️", name: "una flor de lis" },
          { drawing: "Z", name: "la letra z" },
        ],
        operators: ["+", "+"],
        answer: "feliz",
        hint: "Las manos representan la fe y la flor representa el lis. Agrega la última letra para formar un saludo.",
      },
      {
        parts: [
          { drawing: "📝✅", name: "una lista con tildes de verificación" },
          { drawing: "😗💨", name: "una boca que sopla" },
          { drawing: "🎂", name: "una torta con velitas encendidas" },

        ],
        operators: ["+", "+"],
        answer: "cumpleaños",
        hint: "La lista da la primera parte. La torta y quien sopla las velitas dan la segunda.",
      },
      {
        parts: [
          { drawing: "🍅", name: "un tomate" },
          { drawing: "🧉", name: "un mate" },
        ],
        operators: ["−"],
        answer: "to",
        hint: "A la palabra TOMATE sacale MATE. ¿Qué letras quedan?",
      },
      {
        parts: [
          { drawing: "🚲", name: "una bicicleta" },
          { drawing: "🔄", name: "un ciclo" },
          { drawing: "- ETA", name: "eta" },
        ],
        operators: ["−"],
        answer: "bi",
        hint: "A BICICLETA sacale CICLETA. Después juntá lo que queda con la respuesta anterior.",
      },
    ],
  },
];

const welcomeScreen = document.querySelector("#welcome-screen");
const puzzleScreen = document.querySelector("#puzzle-screen");
const winScreen = document.querySelector("#win-screen");
const nameForm = document.querySelector("#name-form");
const answerForm = document.querySelector("#answer-form");
const nameInput = document.querySelector("#player-name");
const answerInput = document.querySelector("#answer-input");
const titleElement = document.querySelector("#puzzle-title");
const stepLabel = document.querySelector("#step-label");
const playerBadge = document.querySelector("#player-badge");
const descriptionElement = document.querySelector("#puzzle-description");
const cipherBox = document.querySelector(".cipher-box");
const cipherElement = document.querySelector("#cipher-text");
const rebusBox = document.querySelector("#rebus-box");
const rebusForm = document.querySelector("#rebus-form");
const rebusClues = document.querySelector("#rebus-clues");
const progressFill = document.querySelector("#progress-fill");
const progressTrack = document.querySelector(".progress-track");
const feedback = document.querySelector("#feedback");
const hintButton = document.querySelector("#hint-button");
const hintText = document.querySelector("#hint-text");
const winTitle = document.querySelector("#win-title");
const playAgainButton = document.querySelector("#play-again-button");
const testSoundButton = document.querySelector("#test-sound-button");

let playerName = "";
let riddleIndex = 0;
let celebrationAudioContext = null;
const celebrationLayer = document.createElement("div");
celebrationLayer.id = "celebration-layer";
celebrationLayer.setAttribute("aria-hidden", "true");
document.body.append(celebrationLayer);

function getCelebrationAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtor) {
    return null;
  }

  if (!celebrationAudioContext) {
    celebrationAudioContext = new AudioCtor({ latencyHint: "interactive" });
  }

  return celebrationAudioContext;
}

function unlockCelebrationAudio() {
  const ctx = getCelebrationAudioContext();

  if (ctx?.state === "suspended") {
    ctx.resume().catch((error) => {
      console.warn("Could not unlock celebration audio:", error);
    });
  }
}

document.addEventListener("pointerdown", unlockCelebrationAudio, { once: true });
document.addEventListener("keydown", unlockCelebrationAudio, { once: true });

function normalizeAnswer(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function renderRebuses(rebuses) {
  rebusClues.replaceChildren();

  rebuses.forEach((rebus, index) => {
    const clue = document.createElement("div");
    clue.className = "rebus-clue";

    const equation = document.createElement("div");
    equation.className = "rebus-equation";
    equation.setAttribute(
      "aria-label",
      rebus.parts
        .map((part, partIndex) => {
          if (partIndex === 0) {
            return part.name;
          }

          const operator = rebus.operators[partIndex - 1] === "−" ? "menos" : "más";
          return `${operator} ${part.name}`;
        })
        .join(" "),
    );

    rebus.parts.forEach((part, partIndex) => {
      if (partIndex > 0) {
        const plus = document.createElement("span");
        plus.className = "rebus-plus";
        plus.setAttribute("aria-hidden", "true");
        plus.textContent = rebus.operators[partIndex - 1];
        equation.append(plus);
      }

      const drawing = document.createElement("span");
      drawing.className = "rebus-picture";
      drawing.setAttribute("aria-hidden", "true");
      drawing.textContent = part.drawing;
      equation.append(drawing);
    });

    const label = document.createElement("label");
    label.htmlFor = `rebus-answer-${index}`;
    label.textContent = index < 2 ? `Respuesta ${index + 1}` : `Parte ${index - 1} del nombre`;

    const input = document.createElement("input");
    input.id = `rebus-answer-${index}`;
    input.name = `rebusAnswer${index + 1}`;
    input.type = "text";
    input.autocomplete = "off";
    input.placeholder = "Escribe la palabra";
    input.required = true;

    clue.append(equation, label, input);
    rebusClues.append(clue);
  });
}

function showPuzzle() {
  const riddle = riddles[riddleIndex];
  const hasRebuses = Boolean(riddle.rebuses);

  welcomeScreen.hidden = true;
  winScreen.hidden = true;
  puzzleScreen.hidden = false;
  stepLabel.textContent = `MISIÓN 0${riddleIndex + 1} — 03`;
  titleElement.textContent = riddle.title;
  playerBadge.textContent = playerName;
  playerBadge.title = playerName;
  descriptionElement.textContent = riddle.description;
  cipherBox.hidden = hasRebuses;
  answerForm.hidden = hasRebuses;
  rebusBox.hidden = !hasRebuses;

  if (riddle.rebuses) {
    renderRebuses(riddle.rebuses);
    rebusForm.querySelector("button").disabled = false;
    rebusForm.querySelectorAll("input").forEach((input) => {
      input.disabled = false;
    });
  } else {
    cipherElement.textContent = riddle.cipher;
  }

  progressFill.style.width = `${((riddleIndex + 1) / riddles.length) * 100}%`;
  progressTrack.setAttribute("aria-valuenow", String(riddleIndex + 1));
  feedback.textContent = "";
  feedback.classList.remove("success");
  hintText.textContent = riddle.rebuses
    ? riddle.rebuses.map((rebus, index) => `Dibujo ${index + 1}: ${rebus.hint}`).join("\n")
    : riddle.hint;
  hintText.hidden = true;
  hintButton.disabled = false;
  answerInput.value = "";

  if (hasRebuses) {
    rebusForm.querySelector("input").focus();
  } else {
    answerInput.focus();
  }
}

async function playCelebrationSound() {
  const ctx = getCelebrationAudioContext();

  if (!ctx) {
    console.warn("Celebration audio is not supported in this browser.");
    return;
  }

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch (error) {
      console.warn("Could not start celebration audio:", error);
      return;
    }
  }

  const startTime = ctx.currentTime + 0.05;
  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  const fanfare = [659.25, 783.99, 987.77, 1318.51];
  fanfare.forEach((frequency, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = startTime + index * 0.16;

    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.27);

    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.28);
  });

  for (let burst = 0; burst < 22; burst += 1) {
    const noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.11), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    const noiseStart = startTime + 0.45 + burst * 0.075 + Math.random() * 0.035;

    for (let i = 0; i < noiseData.length; i += 1) {
      const envelope = Math.exp(-i / 900);
      noiseData[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noiseSource = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();

    noiseSource.buffer = noiseBuffer;
    filter.type = "bandpass";
    filter.frequency.value = 1900 + Math.random() * 900;
    filter.Q.value = 0.8;
    noiseGain.gain.setValueAtTime(0.0001, noiseStart);
    noiseGain.gain.exponentialRampToValueAtTime(0.52, noiseStart + 0.003);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, noiseStart + 0.09);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noiseSource.start(noiseStart);
    noiseSource.stop(noiseStart + 0.11);
  }

  const cheerStart = startTime + 0.65;
  const cheerDuration = 2.4;
  const cheerFilter = ctx.createBiquadFilter();
  const cheerGain = ctx.createGain();
  cheerFilter.type = "lowpass";
  cheerFilter.frequency.value = 2200;
  cheerGain.gain.setValueAtTime(0.0001, cheerStart);
  cheerGain.gain.exponentialRampToValueAtTime(0.18, cheerStart + 0.2);
  cheerGain.gain.setValueAtTime(0.18, cheerStart + cheerDuration - 0.4);
  cheerGain.gain.exponentialRampToValueAtTime(0.0001, cheerStart + cheerDuration);
  cheerFilter.connect(cheerGain);
  cheerGain.connect(master);

  [180, 226, 270, 320, 365].forEach((frequency, index) => {
    const voice = ctx.createOscillator();
    const voiceGain = ctx.createGain();
    const pitch = frequency * (0.92 + Math.random() * 0.16);

    voice.type = "sawtooth";
    voice.frequency.setValueAtTime(pitch, cheerStart);
    voice.frequency.linearRampToValueAtTime(pitch * (1.1 + Math.random() * 0.08), cheerStart + 0.45);
    voice.frequency.linearRampToValueAtTime(pitch * (0.96 + Math.random() * 0.12), cheerStart + cheerDuration);
    voiceGain.gain.value = 0.05 + index * 0.005;
    voice.connect(voiceGain);
    voiceGain.connect(cheerFilter);
    voice.start(cheerStart);
    voice.stop(cheerStart + cheerDuration);
  });
}

function launchCelebration() {
  celebrationLayer.replaceChildren();

  const colors = ["#c5f36b", "#f9d775", "#7ee7ff", "#ff88b8", "#b8a0ff", "#88f0bd"];
  const totalPieces = 120;

  for (let index = 0; index < totalPieces; index += 1) {
    const piece = document.createElement("span");
    const kind = index % 8 === 0 ? "serpentine" : index % 3 === 0 ? "glitter" : "confetti";
    const hue = colors[index % colors.length];

    piece.className = `celebration-${kind}`;
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    piece.style.setProperty("--duration", `${6 + Math.random() * 6}s`);
    piece.style.setProperty("--delay", `${Math.random() * 0.8}s`);
    piece.style.background = hue;
    piece.style.opacity = "0";
    piece.style.animationDelay = `${Math.random() * 0.6}s`;

    if (kind === "confetti") {
      piece.style.width = `${8 + Math.random() * 12}px`;
      piece.style.height = `${14 + Math.random() * 18}px`;
      piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    } else if (kind === "serpentine") {
      piece.style.width = `${16 + Math.random() * 10}px`;
      piece.style.height = `${68 + Math.random() * 32}px`;
      piece.style.borderRadius = "999px";
      piece.style.background = `repeating-linear-gradient(180deg, ${hue} 0 10px, rgba(255,255,255,0.85) 10px 16px)`;
    } else {
      piece.style.width = `${6 + Math.random() * 5}px`;
      piece.style.height = piece.style.width;
      piece.style.boxShadow = `0 0 8px ${hue}`;
    }

    celebrationLayer.append(piece);
  }

  window.setTimeout(() => {
    celebrationLayer.replaceChildren();
  }, 11000);
}

function showWin() {
  puzzleScreen.hidden = true;
  winScreen.hidden = false;
  winTitle.textContent = "¡Feliz cumpleaños, Tobi!";
  playCelebrationSound();
  launchCelebration();
  playAgainButton.focus();
}

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  playerName = nameInput.value.trim();

  if (!playerName) {
    nameInput.focus();
    return;
  }

  riddleIndex = 0;
  showPuzzle();
});

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const riddle = riddles[riddleIndex];

  if (normalizeAnswer(answerInput.value) !== normalizeAnswer(riddle.answer)) {
    feedback.textContent = "Ese no es el mensaje. ¡Inténtalo de nuevo!";
    feedback.classList.remove("success");
    answerInput.focus();
    return;
  }

  feedback.textContent = "¡Correcto! Mensaje descifrado.";
  feedback.classList.add("success");
  riddleIndex += 1;

  if (riddleIndex === riddles.length) {
    window.setTimeout(showWin, 650);
    return;
  }

  window.setTimeout(showPuzzle, 650);
});

rebusForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const rebuses = riddles[riddleIndex].rebuses;
  const inputs = [...rebusForm.querySelectorAll("input")];
  let allCorrect = true;

  inputs.forEach((input, index) => {
    const isCorrect =
      normalizeAnswer(input.value) === normalizeAnswer(rebuses[index].answer);
    input.classList.toggle("incorrect", !isCorrect);
    input.classList.toggle("correct", isCorrect);
    allCorrect = allCorrect && isCorrect;
  });

  if (!allCorrect) {
    feedback.textContent = "Revisa las respuestas marcadas e inténtalo otra vez.";
    feedback.classList.remove("success");
    rebusForm.querySelector("input.incorrect").focus();
    return;
  }

  feedback.textContent = "¡Las tres palabras son correctas!";
  feedback.classList.add("success");
  rebusForm.querySelectorAll("input, button").forEach((control) => {
    control.disabled = true;
  });
  window.setTimeout(showWin, 650);
});

hintButton.addEventListener("click", () => {
  hintText.hidden = false;
  hintButton.disabled = true;
});

playAgainButton.addEventListener("click", () => {
  winScreen.hidden = true;
  welcomeScreen.hidden = false;
  nameInput.focus();
});

testSoundButton.addEventListener("click", playCelebrationSound);
