let habits = JSON.parse(localStorage.getItem("habits")) || [];
let currentLang = localStorage.getItem("lang") || "ru";
let theme = localStorage.getItem("theme") || "dark";
let selectedHabit = null;

const translations = {
  ru: { title: "Мой трекер привычек", placeholder: "Введите привычку", add: "Добавить", calendar: "Календарь" },
  kz: { title: "Менің әдет трекерім", placeholder: "Әдет енгізіңіз", add: "Қосу", calendar: "Күнтізбе" },
  en: { title: "My Habit Tracker", placeholder: "Enter habit", add: "Add", calendar: "Calendar" }
};

function save() { localStorage.setItem("habits", JSON.stringify(habits)); }

function render() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";
  habits.forEach((habit, index) => {
    let streak = habit.streak || 0;
    list.innerHTML += `
      <div class="habit ${habit.done ? 'done' : ''}" onclick="selectHabit(${index})">
        <span>${habit.name} ${streak > 0 ? '('+streak+' дн.)' : ''}</span>
        <div>
          <button onclick="toggle(${index}); event.stopPropagation();">✔</button>
          <button onclick="removeHabit(${index}); event.stopPropagation();">❌</button>
        </div>
      </div>
    `;
  });
  renderCalendar();
  renderChart();
}

function addHabit() {
  const input = document.getElementById("habitInput");
  if(input.value.trim() === "") return;
  habits.push({ name: input.value, done: false, streak: 0, lastDate: null, calendar: {} });
  input.value = "";
  save();
  render();
}

function toggle(index) {
  const habit = habits[index];
  const today = new Date().toDateString();
  if(!habit.done) {
    if(habit.lastDate === new Date(Date.now() - 86400000).toDateString()){
      habit.streak = (habit.streak || 0) + 1;
    } else {
      habit.streak = 1;
    }
    habit.lastDate = today;
    habit.calendar[today] = true;
  } else {
    habit.calendar[today] = false;
  }
  habit.done = !habit.done;
  save();
  render();
}

function removeHabit(index){
  habits.splice(index,1);
  save();
  render();
}

function changeLanguage() {
  const lang = document.getElementById("languageSelect").value;
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyLanguage();
}

function applyLanguage() {
  document.getElementById("title").innerText = translations[currentLang].title;
  document.getElementById("habitInput").placeholder = translations[currentLang].placeholder;
  document.getElementById("addBtn").innerText = translations[currentLang].add;
  document.getElementById("languageSelect").value = currentLang;
  document.getElementById("calendarTitle").innerText = translations[currentLang].calendar;
}

function toggleTheme() {
  if(theme === "dark") {
    document.body.classList.add("light");
    theme = "light";
  } else {
    document.body.classList.remove("light");
    theme = "dark";
  }
  localStorage.setItem("theme", theme);
}

function renderCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";
  if(selectedHabit === null) return;
  const habit = habits[selectedHabit];
  const today = new Date();
  const monthDays = 30;
  for(let i=0;i<monthDays;i++){
    let d = new Date(today.getFullYear(), today.getMonth(), i+1);
    const dateStr = d.toDateString();
    const done = habit.calendar[dateStr] || false;
    const dayDiv = document.createElement("div");
    dayDiv.className = "day" + (done ? " done" : "");
    dayDiv.innerText = i+1;
    dayDiv.onclick = () => {
      habit.calendar[dateStr] = !habit.calendar[dateStr];
      save();
      render();
    };
    cal.appendChild(dayDiv);
  }
}

function renderChart() {
  const chart = document.getElementById("chart");
  chart.innerHTML = "";
  if(selectedHabit === null) return;
  const habit = habits[selectedHabit];
  const days = Object.values(habit.calendar).slice(-30);
  days.forEach(done => {
    const bar = document.createElement("div");
    bar.className = "bar" + (done ? " done" : "");
    bar.style.height = (done ? 50 : 10) + "px";
    chart.appendChild(bar);
  });
}

function selectHabit(index) {
  selectedHabit = index;
  render();
}

applyLanguage();
if(theme === "light") document.body.classList.add("light");
render();
