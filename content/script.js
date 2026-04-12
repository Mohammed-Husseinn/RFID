const attendanceData = [
  { id: 1, name: "Abdelmohmen Faried", entryTime: "09:30:25 AM", status: "Online" },
  { id: 1, name: "Abdelmohmen Faried", entryTime: "09:30:25 AM", status: "Online" },
  { id: 1, name: "Abdelmohmen Faried", entryTime: "09:30:25 AM", status: "Online" },
  { id: 1, name: "Abdelmohmen Faried", entryTime: "09:30:25 AM", status: "Online" },
  { id: 1, name: "Abdelmohmen Faried", entryTime: "09:30:25 AM", status: "Online" },
  { id: 1, name: "Abdelmohmen Faried", entryTime: "09:30:25 AM", status: "Online" },
  { id: 1, name: "Abdelmohmen Faried", entryTime: "09:30:25 AM", status: "Online" },
  { id: 1, name: "Abdelmohmen Faried", entryTime: "09:30:25 AM", status: "Online" },
];

const body = document.getElementById("attendance-body");
const searchField = document.getElementById("student-search");
const refreshButton = document.getElementById("refresh-btn");
const themeToggle = document.querySelector(".theme-toggle");

const THEME_STORAGE_KEY = "rfid-attendance-theme";
const THEME_ICONS = {
  light: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      stroke-width="2.3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 2.7v2.4M12 18.9v2.4M4.7 12h2.4M16.9 12h2.4M6.8 6.8l1.7 1.7M15.5 15.5l1.7 1.7M17.2 6.8l-1.7 1.7M8.5 15.5l-1.7 1.7" />
    </svg>
  `,
  dark: `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M20.8 14.8A8.9 8.9 0 1 1 9.2 3.2a.75.75 0 0 1 .8.95A7.4 7.4 0 0 0 19.85 14a.75.75 0 0 1 .95.8Z" />
    </svg>
  `,
};

function readSavedTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures in private browsing or locked environments.
  }
}

function getPreferredTheme() {
  const saved = readSavedTheme();
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateThemeToggle(theme) {
  if (!themeToggle) {
    return;
  }

  themeToggle.innerHTML = THEME_ICONS[theme];

  const nextTheme = theme === "dark" ? "light" : "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
}

function setTheme(theme, shouldPersist = true) {
  document.body.dataset.theme = theme;
  updateThemeToggle(theme);

  if (shouldPersist) {
    saveTheme(theme);
  }
}

function renderRows(rows) {
  body.innerHTML = "";

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="4">No active students found.</td></tr>';
    return;
  }

  rows.forEach((student, index) => {
    const row = document.createElement("tr");
    row.style.animationDelay = `${index * 45}ms`;

    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.entryTime}</td>
      <td>${student.status}</td>
    `;

    body.appendChild(row);
  });
}

function applySearch() {
  const query = searchField.value.trim().toLowerCase();

  const filtered = attendanceData.filter((student) => {
    return (
      String(student.id).toLowerCase().includes(query) ||
      student.name.toLowerCase().includes(query) ||
      student.status.toLowerCase().includes(query)
    );
  });

  renderRows(filtered);
}

function formatNow() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date());
}

setTheme(getPreferredTheme(), false);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

searchField.addEventListener("input", applySearch);

refreshButton.addEventListener("click", () => {
  refreshButton.classList.add("is-spinning");

  const now = formatNow();
  attendanceData.forEach((student) => {
    student.entryTime = now;
  });

  applySearch();

  window.setTimeout(() => {
    refreshButton.classList.remove("is-spinning");
  }, 900);
});

renderRows(attendanceData);
