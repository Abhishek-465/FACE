// --- Element references ---
const eyes = document.getElementById("eyes");
const eyesImg = document.getElementById("eyesImg");
const nose = document.getElementById("nose");
const mouth = document.getElementById("mouth");
const container = document.querySelector(".container");

// --- GIF paths ---
let normalGif = "normal.gif";
let eyeChange1 = "fear.gif";  // when eyes clicked
let eyeChange2 = "nose.gif";  // when nose clicked
let eyeChange3 = "eat.gif";   // when mouth clicked
let fearGif = "fear.gif";     // on double tap
let happyGif = "love.gif";    // on swipe down
let hugGif = "hug.gif";       // on swipe right
let waterGif = "water.gif";   // every 1 min

// --- Utility: Change eyes temporarily ---
function changeEyes(gifPath, duration = 5000) {
  // Fade out current image
  eyesImg.classList.add("fade-out");

  // After fade-out completes, change image and fade back in
  setTimeout(() => {
    eyesImg.src = gifPath;
    eyesImg.classList.remove("fade-out");
    eyesImg.classList.add("fade-in");
  }, 500); // wait for fade-out to finish

  // After duration, fade out and restore normal eyes
  setTimeout(() => {
    eyesImg.classList.add("fade-out");
    setTimeout(() => {
      eyesImg.src = normalGif;
      eyesImg.classList.remove("fade-out");
      eyesImg.classList.add("fade-in");
    }, 500);
  }, duration);
}


// --- Event Listeners for Click Interactions ---
eyes.addEventListener("click", () => changeEyes(eyeChange1));
nose.addEventListener("click", () => changeEyes(eyeChange2));
mouth.addEventListener("click", () => changeEyes(eyeChange3));

// --- Double Tap Detection ---
let lastTapTime = 0;
let lastTapX = 0;
let lastTapY = 0;
const DOUBLE_TAP_THRESHOLD = 300;
const POSITION_TOLERANCE = 10;

container.addEventListener("touchstart", (e) => {
  const currentTime = new Date().getTime();
  const tapX = e.touches[0].clientX;
  const tapY = e.touches[0].clientY;

  if (
    currentTime - lastTapTime < DOUBLE_TAP_THRESHOLD &&
    Math.abs(tapX - lastTapX) < POSITION_TOLERANCE &&
    Math.abs(tapY - lastTapY) < POSITION_TOLERANCE
  ) {
    e.preventDefault();
    changeEyes(fearGif);
  }

  lastTapTime = currentTime;
  lastTapX = tapX;
  lastTapY = tapY;
});

// --- Swipe Detection ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipeGesture();
});

function handleSwipeGesture() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffY) > 100 && diffY > 0) {
    changeEyes(happyGif);
  } else if (Math.abs(diffX) > 100 && diffX > 0) {
    changeEyes(hugGif);
  }
}

// ==========================
// --- Inactivity Timer ---
// ==========================
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(showDateTime, 100000); // 5s idle
}

// Call this on every user activity
["click", "mousemove", "touchstart", "keydown"].forEach((evt) =>
  document.addEventListener(evt, resetInactivityTimer)
);

// --- Show Date/Time Overlay ---
function showDateTime() {
  const now = new Date();
  const dateTimeStr = now.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let dateText = document.getElementById("dateText");
  if (!dateText) {
    dateText = document.createElement("p");
    dateText.id = "dateText";
    dateText.style.position = "absolute";
    dateText.style.top = "50%";
    dateText.style.left = "50%";
    dateText.style.transform = "translate(-50%, -50%)";
    dateText.style.color = "black";
    dateText.style.fontSize = "20px";
    dateText.style.fontWeight = "600";
    dateText.style.textAlign = "center";
    dateText.style.margin = "0";
    dateText.style.background = "transparent";
    dateText.style.padding = "8px 12px";
    dateText.style.borderRadius = "10px";
    dateText.style.zIndex = "10";
    dateText.style.display = "none";
    eyes.style.position = "relative";
    eyes.appendChild(dateText);
  }

  // Hide eyes temporarily
  eyesImg.style.visibility = "hidden";
  dateText.innerText = dateTimeStr;
  dateText.style.display = "block";

  setTimeout(() => {
    dateText.style.display = "none";
    eyesImg.style.visibility = "visible";
  }, 2000);

  // Restart inactivity timer
  resetInactivityTimer();
}

// Start the inactivity timer on load
resetInactivityTimer();

// ==========================
// --- Periodic Water Gif ---
// ==========================
setInterval(() => {
  changeEyes(waterGif);
}, 15* 60* 1000); // every 15 minute
