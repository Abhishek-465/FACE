// --- Element references ---
const eyes = document.getElementById("eyes");
const eyesImg = document.getElementById("eyesImg");
const nose = document.getElementById("nose");
const mouth = document.getElementById("mouth");
const container = document.getElementById("container");
const face = document.getElementById("face");
const todo = document.getElementById("todo");

// --- GIF paths ---
const normalGif = "normal.gif";
const eyeChange1 = "fear.gif";
const eyeChange2 = "nose.gif";
const eyeChange3 = "eat.gif";
const fearGif = "fear.gif";
const happyGif = "love.gif";
const hugGif = "hug.gif";
const waterGif = "water.gif";

// --- Eye animation ---
function changeEyes(gifPath, duration = 5000) {
  eyesImg.classList.add("fade");
  setTimeout(() => {
    eyesImg.src = gifPath;
    eyesImg.classList.remove("fade");
  }, 300);
  setTimeout(() => {
    eyesImg.classList.add("fade");
    setTimeout(() => {
      eyesImg.src = normalGif;
      eyesImg.classList.remove("fade");
    }, 300);
  }, duration);
}

// --- Click interactions ---
eyes.addEventListener("click", () => changeEyes(eyeChange1));
nose.addEventListener("click", (e) => {
  e.stopPropagation();
  changeEyes(eyeChange2);
});
mouth.addEventListener("click", (e) => {
  e.stopPropagation();
  changeEyes(eyeChange3);
});

// --- Double Tap detection ---
let lastTap = 0;
container.addEventListener("touchstart", (e) => {
  const now = Date.now();
  if (now - lastTap < 300) changeEyes(fearGif);
  lastTap = now;
});

// --- Swipe detection ---
let startX, startY, endX, endY;
document.addEventListener("touchstart", (e) => {
  startX = e.changedTouches[0].screenX;
  startY = e.changedTouches[0].screenY;
});
document.addEventListener("touchend", (e) => {
  endX = e.changedTouches[0].screenX;
  endY = e.changedTouches[0].screenY;
  handleSwipe();
});
function handleSwipe() {
  const diffX = endX - startX;
  const diffY = endY - startY;
  if (Math.abs(diffY) > 100 && diffY > 0) changeEyes(happyGif);
  else if (Math.abs(diffX) > 100 && diffX > 0) changeEyes(hugGif);
}

// --- Inactivity Timer ---
let timer;
function resetTimer() {
  clearTimeout(timer);
  timer = setTimeout(showDateTime, 10000);
}
["click", "mousemove", "touchstart", "keydown"].forEach((evt) =>
  document.addEventListener(evt, resetTimer)
);
resetTimer();

function showDateTime() {
  const now = new Date();
  const txt = now.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let dateText = document.getElementById("dateText");
  if (!dateText) {
    dateText = document.createElement("p");
    dateText.id = "dateText";
    Object.assign(dateText.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "black",
      fontSize: "18px",
      fontWeight: "600",
      textAlign: "center",
      background: "transparent",
      margin: "0",
    });
    eyes.appendChild(dateText);
  }

  eyesImg.style.visibility = "hidden";
  dateText.textContent = txt;
  dateText.style.display = "block";

  setTimeout(() => {
    dateText.style.display = "none";
    eyesImg.style.visibility = "visible";
  }, 2000);

  resetTimer();
}

// --- Water Gif every 5 min ---
setInterval(() => changeEyes(waterGif), 5 * 60 * 1000);

// ============================
// ✅ To-Do List with Local Storage
// ============================
const addTaskBtn = document.getElementById("addTask");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// Load tasks from localStorage on startup
window.addEventListener("DOMContentLoaded", loadTasks);

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach((taskText) => {
    const li = createTaskElement(taskText);
    taskList.appendChild(li);
  });
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  const li = createTaskElement(taskText);
  taskList.appendChild(li);
  saveTasks(); // Save after adding
  taskInput.value = "";
}

function createTaskElement(taskText) {
  const li = document.createElement("li");
  li.innerHTML = `${taskText} <span>&times;</span>`;

  // Delete button handler
  li.querySelector("span").addEventListener("click", () => {
    li.remove();
    saveTasks(); // Save after deletion
  });

  return li;
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach((li) => {
    tasks.push(li.childNodes[0].textContent.trim());
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

container.addEventListener("click", (e) => {
  // only toggle if the user clicks the white area, not nose/mouth/eyes
  if (e.target === container) {
    face.classList.toggle("hidden");
    todo.classList.toggle("hidden");
  }
});
