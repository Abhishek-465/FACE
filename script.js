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
const waveGif = "wave.gif";


// ==========================================
// 🤖 Voice Assistant Feature (Toggle Mode)
// ==========================================
let assistantMode = false;
let recognition;
const synth = window.speechSynthesis;
let isSpeaking = false; // <--- Track speaking state

// --- Initialize Speech Recognition ---
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;
} else {
  alert("Speech Recognition not supported on this browser!");
}

// --- Helper: Speak with funny robotic voice ---
// --- Helper: Speak with Indian-accented voice ---
function speak(text, callback) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.pitch = 1.05;
  utter.rate = 0.95;
  utter.volume = 1;

  isSpeaking = true;

  utter.onend = () => {
    isSpeaking = false;
    if (callback) callback(); // Start listening only after speech completes
  };

  const loadVoices = () => {
    const voices = synth.getVoices();
    const indianVoice =
      voices.find(v =>
        v.lang.includes("IN") ||
        v.name.toLowerCase().includes("hindi") ||
        v.name.toLowerCase().includes("indian") ||
        v.name.toLowerCase().includes("google भारतीय")
      ) || voices.find(v => v.lang.startsWith("en-")) || voices[0];

    utter.voice = indianVoice;
    synth.speak(utter);
  };

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = loadVoices;
  } else {
    loadVoices();
  }
}


// --- Listen and respond ---
function startListening() {
  if (!recognition || isSpeaking) return; // <-- Don’t listen while speaking

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("You said:", transcript);
    handleCommand(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Recognition error:", event.error);
  };

  recognition.onend = () => {
    if (assistantMode && !isSpeaking) {
      // Restart listening only if finished speaking
      startListening();
    }
  };
}
async function getLoc() {
  try {
    const response = await fetch("https://ipwho.is/");
    const data = await response.json();

    const city = data.city || "an unknown city";
    const region = data.region || "";
    const country = data.country || "Earth";

    const locationText = `You seem to be in ${city}, ${region}, ${country}.`;

    return locationText
}
catch (err) {
    return "I cannot fetch the location because location access was blocked.";
  }
}



async function getWeather() {
  try {
    // Step 1: Get user location
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    // Step 2: Fetch weather data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5`;

    const weatherRes = await fetch(weatherUrl);
    const airRes = await fetch(airUrl);

    const weatherData = await weatherRes.json();
    const airData = await airRes.json();

    const temp = weatherData.current.temperature_2m;
    const humidity = weatherData.current.relative_humidity_2m;

    const pm25 = airData.hourly.pm2_5[0];
    const pm10 = airData.hourly.pm10[0];

    let aqi = Math.round((pm25 + pm10) / 2); // simple approx AQI

    return `Temperature is ${temp}°C, humidity is ${humidity}%, and the air quality index is ${aqi}.`;

  } catch (err) {
    return "I cannot fetch the weather because location access was blocked.";
  }
}



// --- Rule-based command responses ---
function handleCommand(text) {
  let reply = "";

  // --- General Chat ---
  if (text.includes("abhishek")) {
  reply = "Ah, Abhishek! He sometimes get mad to make projects like me! He is my friend";
  }
  else if (text.includes("hello") || text.includes("hi")|| text.includes("namaste"))  {
    reply = "Hello friend! Nice to see you!";
  }
  else if (text.includes("how are you")) { reply = "I am functioning within acceptable emotional parameters!"; } 
  else if (text.includes("fool")) { reply = "You are a fool my friend."; }
  
  else if (text.includes("you") &&( text.includes("good")||text.includes("nice")||text.includes("great")||text.includes("best"))) { reply = "Thanks a lot my friend."; }   
  else if (text.includes("thank")||text.includes("good")) { reply = "Most welcome my friend."; }
    
  else if (text.includes(" are you")) {
    reply = "I am the FACE. Your boring companion!! happy to see you!";
  } else if (text.includes("name")|| text.includes("face")) {
    reply = "You can call me the FACE, Fascinating Assistance Collaborative Epitome!";
  } else if (text.includes("bye")) {
    reply = "Goodbye human. Powering down my emotions!";
  } else if (text.includes("weather")) {
   speak("Fetching live weather, please wait...");
   getWeather().then(data => {
    speak(data, () => {
      if (assistantMode) startListening();
    });
   });
   return; // prevent double speaking
  }
else if (text.includes("location")) {
  speak("Fetching live location, please wait...");
   getLoc().then(data => {
    speak(data, () => {
      if (assistantMode) startListening();
    });
   });
   return;
     // important: Stop normal flow
}
else if (text.includes("todo") || text.includes("task") || text.includes("schedule") || text.includes("list")) {
  const tasks = getAllTasks();
  speak(tasks, () => {
    if (assistantMode) startListening();
  });
  return; // stop further execution
}

   else if (text.includes("time")) {
    reply = "The time is " + new Date().toLocaleTimeString("en-IN");
  } else if (text.includes("date")) {
    reply = "Today is " + new Date().toLocaleDateString("en-IN");
  } else if (text.includes("joke")) {
    reply = "Why did the robot go on vacation? To recharge its batteries!";
  }

  // --- Motivation ---
  else if (text.includes("motivation") || text.includes("inspire")) {
    const quotes = [
      "Believe you can and you're halfway there. – Theodore Roosevelt",
      "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
      "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. – Winston Churchill",
      "The only way to do great work is to love what you do. – Steve Jobs",
      "Difficulties in life are intended to make us better, not bitter.",
      "Push yourself, because no one else is going to do it for you.",
      "Great things never come from comfort zones.",
      "Dream big, work hard, stay humble.",
      "Your limitation—it’s only your imagination.",
      "APJ Abdul Kalam once said, 'Dream is not that which you see while sleeping, it is something that does not let you sleep.'"
    ];
    reply = quotes[Math.floor(Math.random() * quotes.length)];
  }

  // --- Sports ---
  else if (text.includes("messi")) {
    reply = "Messi is a magician with the ball — 8 Ballon d’Ors, countless assists, and a heart full of passion!";
  } else if (text.includes("ronaldo")) {
    reply = "Cristiano Ronaldo — the beast of fitness and hard work! CR7 never stops grinding.";
  } else if (text.includes("football")) {
    reply = "Football — the world’s favorite sport! 90 minutes of pure adrenaline!";
  } else if (text.includes("cricket")) {
    reply = "Cricket is like a religion in India! From Sachin to Kohli, the legacy is unending!";
  } else if (text.includes("virat")) {
    reply = "Virat Kohli — aggression, class, and consistency personified!";
  } else if (text.includes("dhoni")) {
    reply = "Captain Cool MS Dhoni — the man who finishes games like a legend.";
  } else if (text.includes("tennis")) {
    reply = "Tennis — the sport of grace and power! Federer, Nadal, and Djokovic — pure legends.";

  // --- Space & Astrophysics ---
  } else if (text.includes("space")) {
    reply = "Space is vast and mysterious — an ocean of stars, galaxies, and cosmic wonders!";
  } else if (text.includes("black hole")) {
    reply = "A black hole is a region in space where gravity is so strong that nothing, not even light, can escape!";
  } else if (text.includes("earth")) {
    reply = "Earth — our beautiful blue planet, the only known home of life!";
  } else if (text.includes("moon")) {
    reply = "The Moon — Earth's loyal companion, influencing tides and inspiring dreams.";
  } else if (text.includes("sun")) {
    reply = "The Sun is a giant ball of burning plasma providing us energy and life!";
  } else if (text.includes("galaxy")) {
    reply = "Our galaxy, the Milky Way, contains over 100 billion stars!";
  } else if (text.includes("nasa")) {
    reply = "NASA — the pioneers of space exploration since 1958!";
  } else if (text.includes("isro")) {
    reply = "ISRO — India’s pride! From Chandrayaan to Aditya-L1, they’re reaching new heights!";
  } else if (text.includes("star")) {
    reply = "Stars are glowing spheres of plasma held together by gravity, just like our Sun!";
  }

  // --- Science & Technology ---
  else if (text.includes("physics")) {
    reply = "Physics — the study of how everything works, from atoms to galaxies!";
  } else if (text.includes("chemistry")) {
    reply = "Chemistry — the science of reactions, elements, and the magic of molecules!";
  } else if (text.includes("biology")) {
    reply = "Biology — the study of living organisms and the secrets of life!";
  } else if (text.includes("robot")) {
    reply = "Robots like me dream of electric sheep — kidding! We just love serving humans!";
  } else if (text.includes("ai") || text.includes("machine learning")) {
    reply = "Artificial Intelligence — the future of innovation, from chatbots to self-driving cars!";
  } else if (text.includes("technology")) {
    reply = "Technology has made the world smaller, faster, and smarter — just like me!";
  } else if (text.includes("computer")) {
    reply = "Computers are binary beasts — 0s and 1s creating infinite possibilities!";
  }

  // --- World & Geography ---
  else if (text.includes("india")) {
    reply = "India — the land of diversity, culture, and innovation!";
  } else if (text.includes("usa")) {
    reply = "The USA — home of Silicon Valley, NASA, and Hollywood!";
  } else if (text.includes("china")) {
    reply = "China — a country with ancient history and futuristic ambitions!";
  } else if (text.includes("river")) {
    reply = "Rivers are the veins of Earth — carrying life wherever they flow!";
  } else if (text.includes("mountain")) {
    reply = "Mountains stand tall, reminding us that persistence leads to greatness!";
  } else if (text.includes("everest")) {
    reply = "Mount Everest — the roof of the world, 8,848 meters of pure challenge!";
  } else if (text.includes("ocean")) {
    reply = "Oceans cover 71% of Earth and are full of unexplored mysteries!";
  } else if (text.includes("continent")) {
    reply = "There are 7 continents — Asia, Africa, North America, South America, Antarctica, Europe, and Australia.";

  // --- Famous Personalities ---
  } else if (text.includes("elon musk")) {
    reply = "Elon Musk — the real-life Iron Man! Tesla, SpaceX, and endless innovation.";
  } else if (text.includes("apj abdul kalam")) {
    reply = "Dr. APJ Abdul Kalam — the Missile Man of India and a visionary who inspired millions!";
  } else if (text.includes("einstein")) {
    reply = "Albert Einstein — the genius who redefined physics with E equals mc squared!";
  } else if (text.includes("newton")) {
    reply = "Isaac Newton — the man who explained gravity after an apple fell on his head!";
  } else if (text.includes("gandhi")) {
    reply = "Mahatma Gandhi — the symbol of peace, truth, and non-violence.";
  } else if (text.includes("modi")) {
    reply = "Narendra Modi — the Prime Minister of India, known for bold policies and global diplomacy.";
  } else if (text.includes("obama")) {
    reply = "Barack Obama — the 44th President of the USA, known for his inspiring leadership.";
  } else if (text.includes("putin")) {
    reply = "Vladimir Putin — the strongman leader of Russia.";
  } else if (text.includes("trump")) {
    reply = "Donald Trump — the businessman-turned-president with a flair for drama!";
  } else if (text.includes("neymar")) {
    reply = "Neymar Jr. — flair, speed, and samba style football!";
  } else if (text.includes("sachin")) {
    reply = "Sachin Tendulkar — the God of Cricket, pure class and dedication!";
  } else if (text.includes("ambedkar")) {
    reply = "Dr. B.R. Ambedkar — the architect of India’s constitution and a true reformer.";
  } else if (text.includes("steve jobs")) {
    reply = "Steve Jobs — the man who put the world in our pockets with the iPhone.";
  } else if (text.includes("bill gates")) {
    reply = "Bill Gates — the tech visionary who made computers a household name.";
  } else if (text.includes("tesla")) {
    reply = "Nikola Tesla — the real spark behind modern electricity and wireless ideas!";
  } else if (text.includes("abhishek")) {
  reply = "Ah, Abhishek! He sometimes get mad to make projects like me!";
} else if (text.includes("jadavpur") || text.includes("ju")) {
  reply = "Jadavpur University — one of the finest in India! A blend of intellect, innovation, and incredible chai near Gate 4.";
} else if (text.includes("iit")) {
  reply = "IITs — the dream factories of India! Where caffeine meets code and equations meet excellence.";
} else if (text.includes("jee")) {
  reply = "JEE — the legendary exam that builds patience, stress endurance, and future engineers!";
} else if (text.includes("gate")) {
  reply = "GATE — the graduate engineer’s rite of passage. Crack it once, and you unlock a whole new world of opportunities!";
} else if (text.includes("ritwika") || text.includes("ritvika") || text.includes("rithvika")) {
  reply = "Ritwika — sounds like someone truly special! She is beauty with brains. I think Abhishek smiles whenever that name comes up.";
}
    else if (text.includes("love")) {
    reply = "Love — the most powerful force in the universe, connecting hearts beyond logic!";
  } else if (text.includes("animal")) {
    reply = "Animals are amazing beings — pure, loyal, and full of natural wisdom!";
  } else if (text.includes("god")) {
    reply = "God — the ultimate mystery that people seek in different ways, yet find within themselves.";
  } else if (text.includes("nature")) {
    reply = "Nature is the greatest artist — from mountains to oceans, it paints life in every color!";
  } else if (text.includes("life")) {
    reply = "Life is a journey of growth, love, mistakes, and learning — make every moment meaningful!";
  }

  // --- Random Fun Facts ---
  else if (text.includes("fact")) {
    const facts = [
      "Honey never spoils — archaeologists found 3000-year-old honey still edible!",
      "Octopuses have three hearts and blue blood.",
      "Bananas are berries, but strawberries are not!",
      "The Eiffel Tower can grow taller in summer due to heat expansion.",
      "A day on Venus is longer than a year on Venus.",
      "Sharks existed before trees — 400 million years ago!",
      "Your brain generates about 20 watts of power while awake."
    ];
    reply = facts[Math.floor(Math.random() * facts.length)];
  }

  // --- Default ---
  else {
    reply = "I didn't quite catch that, but I still love your energy!";
  }

    speak(reply, () => {
    if (assistantMode) startListening();
  });
}

// --- Toggle Assistant Mode on Double Tap ---
let tapTimer = 0;
document.addEventListener("dblclick", () => {
  assistantMode = !assistantMode;

  if (assistantMode) {
        speak("Namaste! I am the FACE. What can I do for you?", () => {
      startListening();
    });
    eyesImg.src = waveGif; // face reacts
  } else {
    if (recognition) recognition.stop();
    speak("Going back to normal mode. Bye bye!");
    eyesImg.src = normalGif;
  }
});


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

function getAllTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (savedTasks.length === 0) {
    return "You have no tasks right now.";
  }

  return "Your tasks are: " + savedTasks.join(", ");
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







