const root = document.documentElement;
const navLinks = Array.from(document.querySelectorAll("[data-view-link]"));
const views = Array.from(document.querySelectorAll(".view"));
const loginDialog = document.getElementById("loginDialog");
const loginForm = document.getElementById("loginForm");
const loginSubmit = document.getElementById("loginSubmit");
const dealDrawer = document.getElementById("dealDrawer");
const toast = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");

const savedTheme = localStorage.getItem("fenceflow-theme");
if (savedTheme) root.dataset.theme = savedTheme;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setView(viewId) {
  views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.viewLink === viewId));
  sidebar.classList.remove("open");
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setView(link.dataset.viewLink);
    history.replaceState(null, "", `#${link.dataset.viewLink}`);
  });
});

document.getElementById("themeToggle").addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "" : "dark";
  if (nextTheme) {
    root.dataset.theme = nextTheme;
    localStorage.setItem("fenceflow-theme", nextTheme);
  } else {
    root.removeAttribute("data-theme");
    localStorage.removeItem("fenceflow-theme");
  }
});

document.getElementById("openSidebar").addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.querySelectorAll("[data-open-login]").forEach((button) => {
  button.addEventListener("click", () => loginDialog.showModal());
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const login = String(data.get("login") || "").trim();
  const password = String(data.get("password") || "");
  const loginError = loginForm.querySelector('[data-error-for="login"]');
  const passwordError = loginForm.querySelector('[data-error-for="password"]');
  loginError.textContent = "";
  passwordError.textContent = "";

  let valid = true;
  if (!login || (!login.includes("@") && login.replace(/\D/g, "").length < 10)) {
    loginError.textContent = "Укажите email или телефон.";
    valid = false;
  }
  if (password.length < 8) {
    passwordError.textContent = "Пароль должен быть не короче 8 символов.";
    valid = false;
  }
  if (!valid) return;

  loginSubmit.textContent = "Проверяем...";
  loginSubmit.disabled = true;
  window.setTimeout(() => {
    loginSubmit.textContent = "Войти";
    loginSubmit.disabled = false;
    loginDialog.close();
    showToast("Вход выполнен. В production пользователь попадет в workspace своей компании.");
  }, 700);
});

document.querySelectorAll("[data-open-deal]").forEach((button) => {
  button.addEventListener("click", () => {
    dealDrawer.classList.add("open");
    dealDrawer.setAttribute("aria-hidden", "false");
    updateCalculator();
  });
});

document.getElementById("closeDeal").addEventListener("click", () => {
  dealDrawer.classList.remove("open");
  dealDrawer.setAttribute("aria-hidden", "true");
});

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

function updateCalculator() {
  const length = Number(document.getElementById("calcLength").value || 0);
  const height = Number(document.getElementById("calcHeight").value || 0);
  const base = Number(document.getElementById("calcType").value || 0);
  const gates = Number(document.getElementById("calcGates").value || 0);
  const wickets = Number(document.getElementById("calcWickets").value || 0);
  const discount = Number(document.getElementById("calcDiscount").value || 0);
  const materials = length * height * base;
  const posts = Math.ceil(length / 2.5) * 1850;
  const extras = gates * 52000 + wickets * 22000 + length * 900;
  const total = Math.max(0, (materials + posts + extras) * (1 - discount / 100));
  document.getElementById("calcTotal").textContent = currency.format(total);
}

["calcLength", "calcHeight", "calcType", "calcGates", "calcWickets", "calcDiscount"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateCalculator);
});

let draggedCard = null;
document.querySelectorAll(".deal-card").forEach((card) => {
  card.addEventListener("dragstart", () => {
    draggedCard = card;
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    draggedCard = null;
  });
});

document.querySelectorAll(".kanban-column").forEach((column) => {
  column.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  column.addEventListener("drop", () => {
    if (!draggedCard) return;
    column.appendChild(draggedCard);
    showToast("Этап сделки обновлен. В API будет PATCH /deals/:id/stage.");
  });
});

const initialHash = location.hash.replace("#", "");
if (initialHash && views.some((view) => view.id === initialHash)) {
  setView(initialHash);
}
