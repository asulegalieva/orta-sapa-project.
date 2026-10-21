
const STORAGE_KEY = "ortaSapaEvaluations";

let currentPage = "home";
let scores = {};
let organization = "";
let ageGroup = AGE_GROUPS[2];

function loadEvaluations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEvaluations(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getAverage(values) {
  const valid = values.filter(v => Number.isInteger(v) && v >= 1 && v <= 7);
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function formatScore(value) {
  return value === null ? "—" : value.toFixed(2);
}

function getSectionAverage(section) {
  return getAverage(
    section.items.map((_, i) => scores[`${section.id}-${i}`])
  );
}

function renderHome() {
  const records = loadEvaluations();
  const latest = records[records.length - 1];

  return `
    <div class="dashboard">
      <div class="card">
        <h2>Қош келдіңіз!</h2>
        <p>Мектепке дейінгі ұйымның білім беру ортасын бағалау жүйесі.</p>
        <button data-action="open-ecers">Бағалауды бастау</button>
      </div>
      <div class="card">
        <h3>Бағалау саны</h3>
        <p class="big-number">${records.length}</p>
      </div>
      <div class="card">
        <h3>Соңғы нәтиже</h3>
        <p class="big-number">${latest ? formatScore(latest.average) : "—"}</p>
      </div>
    </div>
    <div class="card">
      <h2>ECERS-3 бағалау бағыттары</h2>
      <div class="section-grid">
        ${ECERS_DATA.map(section => `
          <div class="section-card">
            <h3>${section.name}</h3>
            <p>${section.items.length} көрсеткіш</p>
          </div>
        `).join("")}
      </div>
    </div>`;
}

function renderEcers() {
  return `
    <div class="card">
      <h2>ECERS-3 бағалау</h2>
      <p>Ұйым туралы ақпаратты толтырып, әр көрсеткішке 1–7 балл қойыңыз.</p>
      <label>Мектепке дейінгі ұйымның атауы</label>
      <input id="organization" value="${escapeHtml(organization)}"
        placeholder="Балабақшаның атауы">
      <label>Жас тобы</label>
      <select id="age-group">
        ${AGE_GROUPS.map(age => `
          <option value="${escapeHtml(age)}"
            ${age === ageGroup ? "selected" : ""}>
            ${age}
          </option>
        `).join("")}
      </select>
    </div>
    ${ECERS_DATA.map(section => `
      <div class="card">
        <h2>${section.name}</h2>
        <p>Бөлімнің орташа балы:
          <strong>${formatScore(getSectionAverage(section))}</strong>
        </p>
        ${section.items.map((item, i) => {
          const key = `${section.id}-${i}`;
          const selected = scores[key];
          return `
            <div class="score-item">
              <p>${i + 1}. ${item}</p>
              <div class="score-options">
                ${SCORE_OPTIONS.map(n => `
                  <button type="button"
                    class="score-button ${selected === n ? "selected" : ""}"
                    data-score-key="${key}" data-score="${n}"
                    aria-pressed="${selected === n}">
                    ${n}
                  </button>
                `).join("")}
              </div>
            </div>`;
        }).join("")}
      </div>
    `).join("")}
    <div class="card">
      <h2>Жалпы нәтиже</h2>
      <p class="big-number">${formatScore(getAverage(Object.values(scores)))}</p>
      <button data-action="save-evaluation">Нәтижені сақтау</button>
    </div>`;
}

function renderResults() {
  const records = loadEvaluations();
  return `
    <div class="card">
      <h2>Нәтижелер</h2>
      ${records.length ? records.map(record => `
        <div class="result-row">
          <strong>${escapeHtml(record.organization)}</strong>
          <p>${escapeHtml(record.ageGroup)}</p>
          <p>Орташа балл: <strong>${formatScore(record.average)}</strong></p>
          <small>${escapeHtml(record.date)}</small>
        </div>
      `).join("") : "<p>Әзірге сақталған нәтижелер жоқ.</p>"}
    </div>`;
}

function renderCompare() {
  const records = loadEvaluations();
  return `
    <div class="card">
      <h2>Салыстыру</h2>
      ${records.length >= 2 ? `
        <p>Сақталған бағалаулардың орташа балдары:</p>
        ${records.map(record => `
          <div class="result-row">
            <strong>${escapeHtml(record.organization)}</strong>
            <span>${formatScore(record.average)} / 7</span>
          </div>
        `).join("")}
      ` : "<p>Салыстыру үшін кемінде екі бағалау нәтижесін сақтаңыз.</p>"}
    </div>`;
}

function renderHistory() {
  return `
    <div class="card">
      <h2>Бағалау тарихы</h2>
      ${renderResults()}
    </div>`;
}

function renderProgram() {
  return `
    <div class="card">
      <h2>${PROGRAM_INFO.title}</h2>
      <p>${PROGRAM_INFO.description}</p>
      <p>Бұл бөлімге типтік оқу бағдарламасының нақты талаптары мен дереккөздерін кейін қосамыз.</p>
    </div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function render() {
  const content = document.getElementById("page-content");
  const pages = {
    home: renderHome,
    ecers: renderEcers,
    program: renderProgram,
    results: renderResults,
    compare: renderCompare,
    history: renderHistory
  };

  content.innerHTML = (pages[currentPage] || renderHome)();

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === currentPage);
  });
}

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-page]");
  if (nav) {
    currentPage = nav.dataset.page;
    render();
    return;
  }

  const scoreButton = event.target.closest("[data-score-key]");
  if (scoreButton) {
    const key = scoreButton.dataset.scoreKey;
    const value = Number(scoreButton.dataset.score);

    if (scores[key] === value) {
      delete scores[key];
    } else {
      scores[key] = value;
    }

    render();
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;

  if (action === "open-ecers") {
    currentPage = "ecers";
    render();
  }

  if (action === "save-evaluation") {
    organization = document.getElementById("organization").value.trim();
    ageGroup = document.getElementById("age-group").value;

    if (!organization) {
      alert("Балабақшаның атауын енгізіңіз.");
      return;
    }

    const allScores = ECERS_DATA.flatMap(section =>
      section.items.map((_, i) => scores[`${section.id}-${i}`])
    );

    if (allScores.some(value => !Number.isInteger(value))) {
      alert("Сақтау алдында барлық көрсеткішті бағалаңыз.");
      return;
    }

    const records = loadEvaluations();
    records.push({
      organization,
      ageGroup,
      scores: { ...scores },
      average: getAverage(allScores),
      date: new Date().toLocaleString("kk-KZ")
    });

    saveEvaluations(records);
    alert("Бағалау нәтижесі сақталды.");
    currentPage = "results";
    render();
  }
});

document.addEventListener("change", event => {
  if (event.target.id === "organization") {
    organization = event.target.value;
  }
  if (event.target.id === "age-group") {
    ageGroup = event.target.value;
  }
});

render();
