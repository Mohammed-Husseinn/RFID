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
  light:
    "M12 4.5a.9.9 0 0 1 .9.9v1.35a.9.9 0 1 1-1.8 0V5.4a.9.9 0 0 1 .9-.9Zm0 12.75a.9.9 0 0 1 .9.9v1.35a.9.9 0 0 1-1.8 0v-1.35a.9.9 0 0 1 .9-.9Zm7.5-4.35a.9.9 0 0 1 0 1.8h-1.35a.9.9 0 1 1 0-1.8h1.35Zm-12.75 0a.9.9 0 0 1 0 1.8H5.4a.9.9 0 0 1 0-1.8h1.35Zm9.056-5.07a.9.9 0 0 1 1.272 0l.956.956a.9.9 0 0 1-1.272 1.272l-.956-.956a.9.9 0 0 1 0-1.272Zm-9.828 9.828a.9.9 0 0 1 1.272 0l.956.956a.9.9 0 1 1-1.272 1.272l-.956-.956a.9.9 0 0 1 0-1.272Zm11.1 2.228a.9.9 0 0 1 0-1.272l.956-.956a.9.9 0 1 1 1.272 1.272l-.956.956a.9.9 0 0 1-1.272 0Zm-9.828-9.828a.9.9 0 0 1 0-1.272l.956-.956a.9.9 0 1 1 1.272 1.272l-.956.956a.9.9 0 0 1-1.272 0ZM12 8.1a3.9 3.9 0 1 1 0 7.8 3.9 3.9 0 0 1 0-7.8Z",
  dark: "M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z",
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

  const iconPath = themeToggle.querySelector("path");
  if (iconPath) {
    iconPath.setAttribute("d", THEME_ICONS[theme]);
  }

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
