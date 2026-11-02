const riddles = [
  {
    title: "El desplazamiento",
    description:
      "Julio César protegía sus mensajes moviendo cada letra tres lugares hacia adelante. Para leer este, mueve cada letra tres lugares hacia atrás.",
    cipher: "OD SXHUWD HVWD DELHUWD",
    answer: "la puerta esta abierta",
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
          { drawing: "🎂", name: "una torta con velitas encendidas" },
          { drawing: "😗💨", name: "una boca que sopla" },
        ],
        operators: ["+", "+"],
        answer: "cumpleaños",
        hint: "La lista da la primera parte. La torta y quien sopla las velitas dan la segunda.",
      },
      {
        parts: [
          { drawing: "🍅", name: "un tomate" },
          { drawing: "MATE", name: "la palabra mate" },
        ],
        operators: ["−"],
        answer: "to",
        hint: "A la palabra TOMATE sacale MATE. ¿Qué letras quedan?",
      },
      {
        parts: [
          { drawing: "🚲", name: "una bicicleta" },
          { drawing: "CICLETA", name: "la palabra cicleta" },
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

let playerName = "";
let riddleIndex = 0;

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

function showWin() {
  puzzleScreen.hidden = true;
  winScreen.hidden = false;
  winTitle.textContent = "¡Feliz cumpleaños, Tobi!";
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
