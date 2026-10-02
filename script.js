// Poetry Haven: all data lives in the browser's localStorage (no backend).

const $ = (sel) => document.querySelector(sel);

// ---------- Storage helpers ----------
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

// ---------- Password hashing (SHA-256) ----------
async function hashPassword(text) {
  if (!window.crypto || !crypto.subtle) return btoa(text); // fallback for non-secure contexts
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- State ----------
let mode = "login"; // "login" or "signup"
let currentUser = store.get("ph_session", null);

function getUsers() { return store.get("ph_users", {}); }
function getPoems() {
  const poems = store.get("ph_poems", null);
  if (poems) return poems;
  const samples = [
    {
      id: 1, author: "Poetry Haven", date: "2026-01-01", title: "First Light",
      content: "The page is empty, and that is the point.\nA window opens, a pen finds its way,\nand morning writes the first line for you.",
    },
    {
      id: 2, author: "Poetry Haven", date: "2026-01-02", title: "Small Hours",
      content: "Rain on the roof keeps time.\nThe kettle hums a low reply.\nSome poems only visit when it's quiet.",
    },
  ];
  store.set("ph_poems", samples);
  return samples;
}

// ---------- Rendering ----------
function renderAuth() {
  const loggedIn = Boolean(currentUser);
  $("#welcome").hidden = !loggedIn;
  $("#welcome").textContent = loggedIn ? `Hello, ${currentUser}` : "";
  $("#logout").hidden = !loggedIn;
  $("#open-auth").hidden = loggedIn;
  $("#poem-form").hidden = !loggedIn;
  $("#login-hint").hidden = loggedIn;
}

function renderPoems() {
  const list = $("#poem-list");
  list.replaceChildren();
  const poems = getPoems().slice().reverse(); // newest first

  if (poems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No poems yet. Log in and publish the first one.";
    list.append(empty);
    return;
  }

  for (const poem of poems) {
    const card = document.createElement("article");
    card.className = "poem";

    const title = document.createElement("h3");
    title.textContent = poem.title; // textContent prevents HTML injection

    const body = document.createElement("p");
    body.className = "body";
    body.textContent = poem.content;

    const meta = document.createElement("div");
    meta.className = "meta";
    const by = document.createElement("span");
    by.textContent = `by ${poem.author}, ${poem.date}`;
    meta.append(by);

    if (poem.author === currentUser) {
      const del = document.createElement("button");
      del.className = "danger";
      del.textContent = "Delete";
      del.addEventListener("click", () => deletePoem(poem.id));
      meta.append(del);
    }

    card.append(title, body, meta);
    list.append(card);
  }
}

// ---------- Actions ----------
function deletePoem(id) {
  if (!confirm("Delete this poem?")) return;
  store.set("ph_poems", getPoems().filter((p) => p.id !== id));
  renderPoems();
}

function setMode(newMode) {
  mode = newMode;
  const isLogin = mode === "login";
  $("#auth-title").textContent = isLogin ? "Log in" : "Sign up";
  $("#auth-submit").textContent = isLogin ? "Log in" : "Create account";
  $("#switch-mode").textContent = isLogin ? "Need an account? Sign up" : "Have an account? Log in";
  $("#password").autocomplete = isLogin ? "current-password" : "new-password";
  $("#auth-error").textContent = "";
}

// ---------- Event listeners ----------
$("#open-auth").addEventListener("click", () => {
  setMode("login");
  $("#auth-form").reset();
  $("#auth-dialog").showModal();
});
$("#close-auth").addEventListener("click", () => $("#auth-dialog").close());
$("#switch-mode").addEventListener("click", () => setMode(mode === "login" ? "signup" : "login"));

$("#auth-form").addEventListener("submit", async (event) => {
  event.preventDefault(); // we close the dialog ourselves, only if the details are valid
  const username = $("#username").value.trim();
  const password = $("#password").value;
  const users = getUsers();
  const hashed = await hashPassword(password);
  const error = $("#auth-error");

  if (mode === "signup") {
    if (users[username]) {
      error.textContent = "That username is taken. Choose another one.";
      return;
    }
    users[username] = hashed;
    store.set("ph_users", users);
  } else if (users[username] !== hashed) {
    error.textContent = "Wrong username or password. Check both and try again.";
    return;
  }

  currentUser = username;
  store.set("ph_session", currentUser);
  $("#auth-dialog").close();
  renderAuth();
  renderPoems();
});

$("#logout").addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("ph_session");
  renderAuth();
  renderPoems();
});

$("#poem-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const poems = getPoems();
  poems.push({
    id: Date.now(),
    title: $("#title").value.trim(),
    content: $("#content").value.trim(),
    author: currentUser,
    date: new Date().toISOString().slice(0, 10),
  });
  store.set("ph_poems", poems);
  event.target.reset();
  renderPoems();
});

// ---------- Start ----------
setMode("login");
renderAuth();
renderPoems();
