"use strict";
const STORAGE_KEY = "goodhive-entries";
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentType = "book";
let currentRating = 0;
let searchQuery = "";

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Nav
function showView(view) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById("view-" + view).classList.add("active");
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  if (view === "home") renderHome();
  if (view === "books") renderGrid("book");
  if (view === "movies") renderGrid("movie");
}

function handleSearch(q) {
  searchQuery = q.trim().toLowerCase();
  const activeView = document.querySelector(".nav-item.active").dataset.view;
  if (activeView === "books") renderGrid("book");
  else if (activeView === "movies") renderGrid("movie");
  else if (activeView === "home") renderHome();
}

// Rating pips
function buildRatingPicker() {
  const el = document.getElementById("rating-picker");
  el.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const p = document.createElement("div");
    p.className = "pip";
    p.onclick = () => {
      currentRating = i;
      buildRatingPicker();
    };
    if (i <= currentRating) p.classList.add("filled");
    el.appendChild(p);
  }
}
function hexRow(rating) {
  let html = '<div class="hexrow">';
  for (let i = 1; i <= 5; i++)
    html += `<div class="pip${i <= rating ? " filled" : ""}"></div>`;
  return html + "</div>";
}

// Add form
function setEntryType(type) {
  currentType = type;
  document
    .querySelectorAll(".type-toggle button")
    .forEach((b) => b.classList.toggle("active", b.dataset.type === type));
  const isBook = type === "book";
  document.getElementById("label-title").textContent = "Title";
  document.getElementById("label-creator").textContent = isBook
    ? "Author"
    : "Director";
  document.getElementById("f-title").placeholder = isBook
    ? "e.g. The Left Hand of Darkness"
    : "e.g. Paris, Texas";
  document.getElementById("f-creator").placeholder = isBook
    ? "e.g. Ursula K. Le Guin"
    : "e.g. Wim Wenders";
  document.getElementById("opt-want").textContent = isBook
    ? "Want to read"
    : "Want to watch";
  document.getElementById("opt-progress").textContent = isBook
    ? "Reading"
    : "Watching";
  document.getElementById("opt-finished").textContent = isBook
    ? "Finished"
    : "Watched";
  document.getElementById("submit-label").textContent = isBook
    ? "Add book"
    : "Add movie";
}

function handleSubmit(e) {
  e.preventDefault();
  const entry = {
    id: uid(),
    type: currentType,
    title: document.getElementById("f-title").value.trim(),
    creator: document.getElementById("f-creator").value.trim(),
    year: document.getElementById("f-year").value.trim(),
    status: document.getElementById("f-status").value,
    cover: document.getElementById("f-cover").value.trim(),
    rating: currentRating,
    notes: document.getElementById("f-notes").value.trim(),
    addedAt: Date.now(),
  };
  entries.unshift(entry);
  save();
  document.getElementById("entry-form").reset();
  currentRating = 0;
  buildRatingPicker();
  const msg = document.getElementById("form-msg");
  msg.textContent = `Added "${entry.title}" to your ${currentType === "book" ? "shelf" : "watchlist"}.`;
  setTimeout(() => (msg.textContent = ""), 3000);
  updateCounts();
}

// Rendering
function statusLabel(status, type) {
  const map = {
    book: {
      want: "Want to read",
      "in-progress": "Reading",
      finished: "Finished",
    },
    movie: {
      want: "Want to watch",
      "in-progress": "Watching",
      finished: "Watched",
    },
  };
  return map[type][status] || status;
}

function cardHTML(entry) {
  const coverContent = entry.cover
    ? `<img src="${escapeHtml(entry.cover)}" alt="" onerror="this.parentElement.innerHTML='${escapeHtml(entry.title).replace(/'/g, "\\'")}'">`
    : escapeHtml(entry.title);
  return `
      <div class="card" onclick="openModal('${entry.id}')">
        <div class="cover">${coverContent}</div>
        <div class="card-body">
          <div class="card-title">${escapeHtml(entry.title)}</div>
          <div class="card-sub">${escapeHtml(entry.creator || (entry.type === "book" ? "Unknown author" : "Unknown director"))}${entry.year ? " · " + escapeHtml(entry.year) : ""}</div>
          <div class="card-footer">
            <span class="status-pill" data-status="${entry.status}">${statusLabel(entry.status, entry.type)}</span>
            ${hexRow(entry.rating)}
          </div>
        </div>
      </div>`;
}

function escapeHtml(s) {
  return (s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function filtered(type) {
  return entries.filter((e) => e.type === type && matchesSearch(e));
}
function matchesSearch(e) {
  if (!searchQuery) return true;
  return (e.title + " " + e.creator).toLowerCase().includes(searchQuery);
}

function renderGrid(type) {
  const grid = document.getElementById(
    type === "book" ? "books-grid" : "movies-grid",
  );
  const list = filtered(type);
  const sub = document.getElementById(
    type === "book" ? "books-sub" : "movies-sub",
  );
  sub.textContent = `${list.length} ${type}${list.length === 1 ? "" : "s"}${searchQuery ? ` matching "${searchQuery}"` : ""}`;
  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="hive-mark"><span></span></div>
        ${searchQuery ? "No matches. Try a different search." : `Your ${type === "book" ? "shelf" : "watchlist"} is empty. Head to Add to log your first ${type}.`}
      </div>`;
    return;
  }
  grid.innerHTML = list.map(cardHTML).join("");
}

function renderHome() {
  const total = entries.length,
    books = entries.filter((e) => e.type === "book").length,
    movies = entries.filter((e) => e.type === "movie").length,
    inProgress = entries.filter((e) => e.status === "in-progress").length;
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-books").textContent = books;
  document.getElementById("stat-movies").textContent = movies;
  document.getElementById("stat-progress").textContent = inProgress;

  const recent = entries.filter(matchesSearch).slice(0, 6);
  const grid = document.getElementById("home-recent");
  grid.innerHTML = recent.length
    ? recent.map(cardHTML).join("")
    : `<div class="empty-state" style="grid-column:1/-1">
          <div class="hive-mark"><span></span></div>
          Nothing here yet. <a style="color:var(--accent);cursor:pointer" onclick="showView('add')">Add your first book or movie →</a>
        </div>`;
}

function updateCounts() {
  document.getElementById("count-books").textContent = entries.filter(
    (e) => e.type === "book",
  ).length;
  document.getElementById("count-movies").textContent = entries.filter(
    (e) => e.type === "movie",
  ).length;
}

// Modal
function openModal(id) {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;
  const modal = document.getElementById("modal-content");
  modal.innerHTML = `
      <button class="modal-close" onclick="closeModal()">×</button>
      <h2>${escapeHtml(entry.title)}</h2>
      <div class="modal-sub">${escapeHtml(entry.creator || "")}${entry.year ? " · " + escapeHtml(entry.year) : ""} · ${entry.type === "book" ? "Book" : "Movie"}</div>
      ${hexRow(entry.rating)}
      ${entry.notes ? `<div class="modal-notes">${escapeHtml(entry.notes)}</div>` : ""}
      <div class="modal-actions">
        <button onclick="cycleStatus('${entry.id}')">Mark as ${nextStatusLabel(entry)}</button>
        <button class="danger" onclick="deleteEntry('${entry.id}')">Remove</button>
      </div>
    `;
  document.getElementById("modal-overlay").classList.add("open");
}
function nextStatusLabel(entry) {
  const order = ["want", "in-progress", "finished"];
  const next = order[(order.indexOf(entry.status) + 1) % order.length];
  return statusLabel(next, entry.type);
}
function cycleStatus(id) {
  const entry = entries.find((e) => e.id === id);
  const order = ["want", "in-progress", "finished"];
  entry.status = order[(order.indexOf(entry.status) + 1) % order.length];
  save();
  openModal(id);
  refreshCurrentView();
}
function deleteEntry(id) {
  entries = entries.filter((e) => e.id !== id);
  save();
  closeModal();
  updateCounts();
  refreshCurrentView();
}
function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}
function refreshCurrentView() {
  const activeView = document.querySelector(".nav-item.active").dataset.view;
  if (activeView === "home") renderHome();
  if (activeView === "books") renderGrid("book");
  if (activeView === "movies") renderGrid("movie");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Init
buildRatingPicker();
updateCounts();
renderHome();
