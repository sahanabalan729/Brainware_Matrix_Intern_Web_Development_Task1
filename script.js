const datePicker = document.getElementById("date-picker");
const themeSelector = document.getElementById("theme-selector");
const taskInput = document.getElementById("task-input");
const taskCategory = document.getElementById("task-category");
const eventTitle = document.getElementById("event-title");
const eventTime = document.getElementById("event-time");
const noteInput = document.getElementById("note-input");
const noteList = document.getElementById("note-list");
const addNoteBtn = document.getElementById("add-note");

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function updateProgress() {
  const all = document.querySelectorAll(".task-ul li").length;
  const done = document.querySelectorAll(".task-ul li.done").length;
  const percent = all === 0 ? 0 : (done / all) * 100;
  document.getElementById("progress-fill").style.width = percent + "%";
}

function createListItem(text, container, isTask = true) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌ Remove";
  removeBtn.className = "remove-btn";
  removeBtn.onclick = () => {
    li.remove();
    if (!container.querySelector("ul").children.length) container.remove();
    if (isTask) updateProgress();
  };

  li.appendChild(span);
  li.appendChild(removeBtn);

  if (isTask) {
    li.classList.add("draggable");
    li.draggable = true;

    li.addEventListener("click", () => {
      li.classList.toggle("done");
      updateProgress();
    });

    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", text);
      li.classList.add("dragging");
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });
  }

  return li;
}

function dragOverHandler(e) {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const after = [...this.children].find(child =>
    e.clientY < child.getBoundingClientRect().top + child.offsetHeight / 2
  );
  if (after) {
    this.insertBefore(dragging, after);
  } else {
    this.appendChild(dragging);
  }
}

document.getElementById("add-task").onclick = () => {
  if (!taskInput.value.trim() || !datePicker.value) return;

  const date = datePicker.value;
  const category = taskCategory.value;

  let dateContainer = document.querySelector(`#tasks-${date}`);
  if (!dateContainer) {
    dateContainer = document.createElement("div");
    dateContainer.id = `tasks-${date}`;
    dateContainer.innerHTML = `<h3>📅 ${formatDate(date)}</h3>`;
    document.getElementById("daily-tasks-container").appendChild(dateContainer);
  }

  let categoryUl = dateContainer.querySelector(`.task-ul[data-category="${category}"]`);
  if (!categoryUl) {
    const title = document.createElement("h4");
    title.textContent = `${category}`;
    categoryUl = document.createElement("ul");
    categoryUl.className = "task-ul";
    categoryUl.dataset.category = category;
    categoryUl.addEventListener("dragover", dragOverHandler);
    dateContainer.appendChild(title);
    dateContainer.appendChild(categoryUl);
  }

  const li = createListItem(taskInput.value, dateContainer, true);
  categoryUl.appendChild(li);
  taskInput.value = "";
  updateProgress();
};

document.getElementById("add-event").onclick = () => {
  if (!eventTitle.value.trim() || !eventTime.value || !datePicker.value) return;

  const date = datePicker.value;
  let container = document.querySelector(`#events-${date}`);
  if (!container) {
    container = document.createElement("div");
    container.id = `events-${date}`;
    container.innerHTML = `<h3>📅 ${formatDate(date)}</h3><ul class="event-ul"></ul>`;
    document.getElementById("daily-events-container").prepend(container);
  }

  const text = `${eventTime.value} - ${eventTitle.value}`;
  const li = createListItem(text, container, false);
  container.querySelector("ul").appendChild(li);

  scheduleNotification(eventTitle.value, eventTime.value);
  eventTitle.value = "";
  eventTime.value = "";
};

function updateCountdown() {
  const items = [...document.querySelectorAll(".event-ul li")];
  if (!items.length) {
    document.getElementById("countdown-timer").textContent = "⏱️ Countdown: --";
    return;
  }

  let soonest = null;
  items.forEach(li => {
    const match = li.textContent.match(/^(\d{2}:\d{2})/);
    if (!match) return;
    const time = match[1];
    const eventDate = new Date();
    const [hours, mins] = time.split(":").map(Number);
    eventDate.setHours(hours, mins, 0, 0);
    if (!soonest || eventDate < soonest) soonest = eventDate;
  });

  const now = new Date();
  const diff = Math.max(0, soonest - now);
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  document.getElementById("countdown-timer").textContent =
    `⏱️ Countdown: ${mins}m ${secs}s`;
}

setInterval(updateCountdown, 1000);

function scheduleNotification(title, time) {
  const now = new Date();
  const eventTime = new Date(now.toDateString() + " " + time);
  const delay = eventTime - now - 60000;
  if (delay > 0) {
    setTimeout(() => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("⏰ Reminder", {
          body: `${title} starts in 1 minute!`,
        });
      }
      alert(`⏰ Reminder: ${title} starts in 1 minute!`);
    }, delay);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window) Notification.requestPermission();

  themeSelector.addEventListener("change", () => {
    document.body.className = "";
    document.body.classList.add(`${themeSelector.value}-mode`);
  });

  // Mood Tracker
  document.getElementById("add-mood").addEventListener("click", () => {
    const moodSelect = document.getElementById("mood-select");
    const mood = moodSelect.value;
    const log = document.getElementById("mood-log");

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const li = document.createElement("li");
    li.textContent = `${timestamp} — ${mood}`;
    log.appendChild(li);
  });

  // Add Notes with ⭐ emoji
  addNoteBtn.addEventListener("click", () => {
    const noteText = noteInput.value.trim();
    if (noteText !== " ") {
      const li = document.createElement("li");

      const content = document.createElement("span");
      content.textContent = noteText;
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌ Remove";
      deleteBtn.className = "note-delete-btn";
      deleteBtn.onclick = () => li.remove();

      li.appendChild(content);
      li.appendChild(deleteBtn);
      noteList.appendChild(li);
      noteInput.value = "";
    }
  });
});
