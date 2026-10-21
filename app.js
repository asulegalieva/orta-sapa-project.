
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
      <h2>Үлгілік бағдарлама</h2>
      <p>
        Мектепке дейінгі тәрбие мен оқытудың үлгілік оқу бағдарламасы
        балалардың жас ерекшеліктеріне сәйкес дамуына, тәрбиеленуіне
        және мектепке дейінгі білім беру мазмұнын меңгеруіне бағытталған.
      </p>
    </div>

    <div class="card">
      <h2>Бағдарламаның негізгі бағыттары</h2>
      <p>Мектепке дейінгі тәрбие мен оқыту бес бағыт бойынша жүзеге асырылады:</p>

      <div class="result-row">
        <strong>1. Физикалық қасиеттерді дамыту</strong>
        <p>Қимыл-қозғалыс белсенділігін, дене дағдыларын және салауатты өмір салтының негіздерін қалыптастыру.</p>
      </div>

      <div class="result-row">
        <strong>2. Коммуникативтік дағдыларды дамыту</strong>
        <p>Баланың сөйлеуін, тілдік қарым-қатынасын және өз ойын жеткізу қабілетін дамыту.</p>
      </div>

      <div class="result-row">
        <strong>3. Танымдық және зияткерлік дағдыларды дамыту</strong>
        <p>Қоршаған ортаны тану, ойлау, қарапайым математикалық түсініктер мен зерттеушілік қызығушылықты дамыту.</p>
      </div>

      <div class="result-row">
        <strong>4. Шығармашылық дағдыларын, зерттеу іс-әрекетін дамыту</strong>
        <p>Сурет салу, мүсіндеу, құрастыру, музыка және шығармашылық әрекеттер арқылы баланың қабілеттерін дамыту.</p>
      </div>

      <div class="result-row">
        <strong>5. Әлеуметтік-эмоционалды дағдыларды қалыптастыру</strong>
        <p>Эмоцияларды түсіну, басқа адамдармен қарым-қатынас жасау, өзіне және қоршаған ортаға қамқорлық таныту дағдыларын қалыптастыру.</p>
      </div>
    </div>

    <div class="card">
      <h2>Үлгілік бағдарлама мен ORTA SAPA байланысы</h2>
      <p>
        Үлгілік бағдарлама мектепке дейінгі тәрбие мен оқытудың мазмұнын
        айқындайды, ал ORTA SAPA білім беру ортасының сапасын бағалауға,
        нәтижелерді талдауға және жақсартуды қажет ететін бағыттарды
        анықтауға көмектеседі.
      </p>
      <p>
        ECERS-3 бағалау нәтижелері білім беру ортасын жетілдіру кезінде
        қосымша талдау құралы ретінде пайдаланылуы мүмкін.
      </p>
    </div>

    <div class="card">
      <h2>Нормативтік құжаттар</h2>
      <p>Төмендегі сілтемелер арқылы нормативтік құжаттармен танысуға болады.</p>

      <div class="result-row">
        <strong>1. Үлгілік оқу бағдарламасы</strong>
        <p>Мектепке дейінгі тәрбие мен оқытудың үлгілік оқу бағдарламасы.</p>
        <a href="https://adilet.zan.kz/kaz/docs/V1600014235"
           target="_blank" rel="noopener noreferrer">
          Құжатты ашу ↗
        </a>
      </div>

      <div class="result-row">
        <strong>2. Мемлекеттік жалпыға міндетті стандарт</strong>
        <p>Мектепке дейінгі тәрбие мен оқытудың мемлекеттік жалпыға міндетті стандарты.</p>
        <a href="https://adilet.zan.kz/kaz/docs/V2200029031"
           target="_blank" rel="noopener noreferrer">
          Құжатты ашу ↗
        </a>
      </div>

      <div class="result-row">
        <strong>3. Үлгілік оқу жоспарлары</strong>
        <p>Мектепке дейінгі тәрбие мен оқытудың үлгілік оқу жоспарлары.</p>
        <a href="https://adilet.zan.kz/kaz/docs/V1200008275"
           target="_blank" rel="noopener noreferrer">
          Құжатты ашу ↗
        </a>
      </div>
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
