const ROLE_TEMPLATES = {
  sde: {
    name: "SDE / Software Engineer",
    keywords: ["Java", "Python", "C++", "JavaScript", "React", "Node.js", "AWS", "SQL", "REST API", "Distributed Systems", "Data Structures", "Algorithms", "System Design"]
  },
  dataAnalyst: {
    name: "Data Analyst",
    keywords: ["SQL", "Python", "Excel", "Tableau", "Power BI", "Statistics", "Dashboard", "Data Cleaning", "Data Visualization", "A/B Testing", "KPI", "Business Insights"]
  },
  dataScientist: {
    name: "Data Scientist",
    keywords: ["Python", "SQL", "Machine Learning", "Statistics", "Regression", "Classification", "NLP", "TensorFlow", "PyTorch", "Scikit-learn", "Experimentation", "Predictive Modeling"]
  },
  rtl: {
    name: "RTL / FPGA Engineer",
    keywords: ["Verilog", "SystemVerilog", "RTL", "FPGA", "ASIC", "UVM", "Testbench", "Simulation", "ModelSim", "Quartus", "Vivado", "FSM", "FIFO", "ALU", "Counter", "Timing Analysis", "Waveform", "Synthesis"]
  },
  verification: {
    name: "Design Verification Engineer",
    keywords: ["SystemVerilog", "UVM", "Verification", "Testbench", "Coverage", "Assertion", "Simulation", "Regression Testing", "Functional Verification", "Constrained Random", "Debug", "Verdi"]
  },
  embedded: {
    name: "Embedded / Firmware Engineer",
    keywords: ["C", "C++", "Embedded C", "Microcontroller", "RTOS", "ARM", "SPI", "I2C", "UART", "Firmware", "Embedded Linux", "Board Bring-up", "Debugging", "Oscilloscope"]
  }
};

const SKILL_CATEGORIES = {
  "Programming Languages": ["Java", "Python", "C++", "C", "JavaScript", "TypeScript", "SQL", "Verilog", "SystemVerilog", "Embedded C", "MATLAB", "R"],
  "Tools / Platforms": ["React", "Node.js", "AWS", "Azure", "GCP", "Git", "Docker", "Kubernetes", "Excel", "Tableau", "Power BI", "TensorFlow", "PyTorch", "Scikit-learn", "ModelSim", "Quartus", "Vivado", "Verdi", "Linux", "Embedded Linux", "Oscilloscope"],
  "Technical Skills": ["REST API", "Distributed Systems", "Data Structures", "Algorithms", "System Design", "Machine Learning", "Statistics", "Regression", "Classification", "NLP", "Data Cleaning", "Data Visualization", "A/B Testing", "RTL", "FPGA", "ASIC", "UVM", "Testbench", "Simulation", "Coverage", "Assertion", "Synthesis", "Timing Analysis", "RTOS", "SPI", "I2C", "UART", "Debugging"],
  "Domain Skills": ["Business Insights", "KPI", "Dashboard", "Predictive Modeling", "Experimentation", "Functional Verification", "Constrained Random", "Regression Testing", "Firmware", "Microcontroller", "Board Bring-up", "FSM", "FIFO", "ALU", "Waveform"],
  "Soft Skills": ["Communication", "Leadership", "Collaboration", "Problem Solving", "Analytical", "Stakeholder Management", "Mentoring", "Presentation", "Cross-functional", "Teamwork"]
};

const STOP_WORDS = new Set([
  "and", "the", "with", "for", "you", "your", "our", "are", "will", "that", "this", "from", "have", "has", "job", "role", "work", "team", "years", "using", "into", "who", "all", "can", "but", "not", "about", "their", "they", "them", "what", "when", "where", "which", "preferred", "required", "requirements", "responsibilities", "experience", "skills", "ability", "including", "strong", "knowledge", "looking", "candidate", "company", "position", "opportunity", "degree", "related", "plus", "minimum", "excellent", "based", "such", "other", "more", "than", "through", "within", "across"
]);

const resumeInput = document.querySelector("#resume-text");
const jdInput = document.querySelector("#jd-text");
const results = document.querySelector("#results");

function normalize(text) {
  return text.toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

function includesKeyword(text, keyword) {
  const normalizedText = ` ${normalize(text)} `;
  const normalizedKeyword = normalize(keyword);
  if (normalizedKeyword === "c") return /(^|[^a-z0-9+#])c([^a-z0-9+#]|$)/i.test(text);
  if (normalizedKeyword === "r") return /(^|[^a-z0-9])r([^a-z0-9]|$)/i.test(text);
  const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(normalizedText);
}

function uniqueByNormalized(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalize(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function allKnownKeywords() {
  return uniqueByNormalized([
    ...Object.values(ROLE_TEMPLATES).flatMap((role) => role.keywords),
    ...Object.values(SKILL_CATEGORIES).flat()
  ]);
}

function extractJdKeywords(jdText) {
  const known = allKnownKeywords().filter((keyword) => includesKeyword(jdText, keyword));
  const words = jdText.match(/[A-Za-z][A-Za-z+#./-]{2,}/g) || [];
  const frequency = new Map();

  words.forEach((word) => {
    const cleaned = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
    if (cleaned.length < 4 || STOP_WORDS.has(cleaned) || /^\d+$/.test(cleaned)) return;
    frequency.set(cleaned, (frequency.get(cleaned) || 0) + 1);
  });

  const frequentTerms = [...frequency.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  return uniqueByNormalized([...known, ...frequentTerms]).slice(0, 32);
}

function detectRole(jdText) {
  return Object.entries(ROLE_TEMPLATES)
    .map(([id, role]) => ({
      id,
      role,
      score: role.keywords.filter((keyword) => includesKeyword(jdText, keyword)).length / role.keywords.length
    }))
    .sort((a, b) => b.score - a.score)[0];
}

function analyze() {
  const resume = resumeInput.value.trim();
  const jd = jdInput.value.trim();
  const error = document.querySelector("#input-error");

  if (!resume || !jd) {
    error.hidden = false;
    return;
  }
  error.hidden = true;

  const jdKeywords = extractJdKeywords(jd);
  const matched = jdKeywords.filter((keyword) => includesKeyword(resume, keyword));
  const missing = jdKeywords.filter((keyword) => !includesKeyword(resume, keyword));
  const keywordRate = jdKeywords.length ? matched.length / jdKeywords.length : 0;

  const selectedRole = document.querySelector("#role-template").value;
  const detected = detectRole(jd);
  const role = selectedRole === "auto"
    ? detected
    : { id: selectedRole, role: ROLE_TEMPLATES[selectedRole], score: null };

  const categoryResults = Object.entries(SKILL_CATEGORIES).map(([name, skills]) => {
    const jdSkills = skills.filter((skill) => includesKeyword(jd, skill));
    const relevantSkills = jdSkills.length ? jdSkills : skills.filter((skill) => includesKeyword(role.role.keywords.join(" "), skill));
    const matchedSkills = relevantSkills.filter((skill) => includesKeyword(resume, skill));
    return {
      name,
      relevantSkills,
      matchedSkills,
      rate: relevantSkills.length ? matchedSkills.length / relevantSkills.length : null
    };
  });

  const relevantCategories = categoryResults.filter((category) => category.relevantSkills.length);
  const coveredCategories = relevantCategories.filter((category) => category.matchedSkills.length).length;
  const categoryRate = relevantCategories.length ? coveredCategories / relevantCategories.length : 0;

  const roleMatches = role.role.keywords.filter((keyword) => includesKeyword(resume, keyword));
  const roleRate = roleMatches.length / role.role.keywords.length;

  const keywordPoints = keywordRate * 50;
  const skillPoints = categoryRate * 30;
  const rolePoints = roleRate * 20;
  const score = Math.round(keywordPoints + skillPoints + rolePoints);

  renderResults({
    score,
    matched,
    missing,
    jdKeywords,
    categoryResults,
    role,
    roleMatches,
    keywordPoints,
    skillPoints,
    rolePoints
  });
}

function renderTags(containerId, items, type, emptyMessage) {
  const container = document.querySelector(containerId);
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }
  items.forEach((item) => {
    const tag = document.createElement("span");
    tag.className = `tag ${type}`;
    tag.textContent = item;
    container.appendChild(tag);
  });
}

function riskForScore(score) {
  if (score < 50) return {
    level: "High Risk",
    className: "high",
    color: "#c83f4c",
    message: "The resume may be screened out before a recruiter review. Core role evidence is currently too limited."
  };
  if (score < 75) return {
    level: "Medium Risk",
    className: "medium",
    color: "#b96d08",
    message: "The resume shows relevant experience, but several gaps could weaken its ranking against stronger applicants."
  };
  return {
    level: "Low Risk",
    className: "low",
    color: "#168565",
    message: "The resume has strong alignment. Focus next on clear evidence, outcomes, and human readability."
  };
}

function riskDistribution(score) {
  const high = Math.max(8, 78 - score);
  const medium = Math.max(12, 52 - Math.abs(score - 62) * 0.55);
  const low = Math.max(8, score - 42);
  const total = high + medium + low;
  return {
    high: (high / total) * 100,
    medium: (medium / total) * 100,
    low: (low / total) * 100
  };
}

function getMissingSkills(data) {
  const knownSkills = uniqueByNormalized(Object.values(SKILL_CATEGORIES).flat());
  return data.missing
    .filter((keyword) => knownSkills.some((skill) => normalize(skill) === normalize(keyword)))
    .sort((a, b) => {
      const aRole = data.role.role.keywords.some((item) => normalize(item) === normalize(a)) ? 1 : 0;
      const bRole = data.role.role.keywords.some((item) => normalize(item) === normalize(b)) ? 1 : 0;
      return bRole - aRole;
    })
    .slice(0, 6);
}

function getTopMissingKeywords(data, missingSkills) {
  const skillSet = new Set(missingSkills.map(normalize));
  const nonSkills = data.missing.filter((keyword) => !skillSet.has(normalize(keyword)));
  return uniqueByNormalized([...nonSkills, ...data.missing]).slice(0, 6);
}

function buildResumeRisks(data, risk) {
  const risks = [];
  const uncoveredCategories = data.categoryResults
    .filter((category) => category.relevantSkills.length && !category.matchedSkills.length)
    .map((category) => category.name);

  if (data.missing.length >= data.matched.length) {
    risks.push("Too many important JD terms lack direct resume evidence.");
  }
  if (uncoveredCategories.length) {
    risks.push(`No clear evidence found for ${uncoveredCategories.slice(0, 2).join(" and ")}.`);
  }
  if (data.roleMatches.length < Math.ceil(data.role.role.keywords.length * 0.4)) {
    risks.push(`The resume does not yet signal a clear ${data.role.role.name} profile.`);
  }
  if (!/\d+%|\d+\+|\$\d+|\d+\s*(users|customers|projects|hours|days|weeks|months|years)/i.test(resumeInput.value)) {
    risks.push("Achievements lack measurable outcomes or evidence of impact.");
  }
  if (!/summary|profile|objective/i.test(resumeInput.value)) {
    risks.push("The target role is not reinforced through a focused summary.");
  }
  if (!risks.length || risk.className === "low") {
    risks.push("Strong alignment still depends on ATS-friendly formatting and truthful evidence.");
  }
  return risks.slice(0, 4);
}

function buildNotes(data) {
  const topMissing = data.missing.slice(0, 5);
  const weakCategories = data.categoryResults
    .filter((category) => category.relevantSkills.length && !category.matchedSkills.length)
    .map((category) => category.name);

  const notes = [];
  if (topMissing.length) {
    notes.push(`Prioritize truthful evidence for ${topMissing.join(", ")}. Add these terms only where your actual experience supports them.`);
  } else {
    notes.push("Keyword coverage is strong. Keep the wording natural and make sure each important skill is backed by evidence.");
  }

  if (weakCategories.length) {
    notes.push(`Strengthen the ${weakCategories.join(" and ")} sections with a relevant project, internship, or measurable accomplishment.`);
  } else {
    notes.push("Skill-category coverage is balanced. Improve specificity by pairing skills with scope, actions, and measurable outcomes.");
  }

  if (data.roleMatches.length < Math.ceil(data.role.role.keywords.length * 0.4)) {
    notes.push(`The resume does not yet read clearly as a ${data.role.role.name} profile. Reorder projects and bullets so the target-role evidence appears early.`);
  } else {
    notes.push(`The resume signals a ${data.role.role.name} direction. Reinforce it in the headline, summary, and strongest two projects.`);
  }

  if (data.score < 75) {
    notes.push("A likely screening issue is insufficient direct overlap with the JD. Tailor the skills and project bullets for this specific posting before applying.");
  } else {
    notes.push("Before applying, verify formatting, use standard section headings, and remove graphics or tables that a real ATS may parse poorly.");
  }
  return notes;
}

function renderResults(data) {
  const risk = riskForScore(data.score);
  const distribution = riskDistribution(data.score);
  const missingSkills = getMissingSkills(data);
  const topMissingKeywords = getTopMissingKeywords(data, missingSkills);
  const resumeRisks = buildResumeRisks(data, risk);
  results.hidden = false;

  const pie = document.querySelector("#risk-pie");
  pie.style.setProperty("--high-risk", `${distribution.high}%`);
  pie.style.setProperty("--medium-risk", `${distribution.high + distribution.medium}%`);
  document.querySelector("#risk-label").textContent = risk.level;
  document.querySelector("#risk-message").textContent =
    data.score >= 75 ? "Strong target alignment" : data.score >= 50 ? "Promising, with clear gaps" : "Significant tailoring needed";
  document.querySelector("#risk-description").textContent = risk.message;

  renderPriorityList("#top-missing-skills", missingSkills, "No major role-specific skill gaps detected.");
  renderPriorityList("#top-missing-keywords", topMissingKeywords, "No major keyword gaps detected.");
  const riskList = document.querySelector("#top-resume-risks");
  riskList.innerHTML = "";
  resumeRisks.forEach((item) => riskList.insertAdjacentHTML("beforeend", `<li><span>${item}</span></li>`));

  document.querySelector("#detected-role").textContent = `Analysis template: ${data.role.role.name}`;
  renderTags("#matched-keywords", data.matched, "matched", "No JD keywords matched yet.");
  renderTags("#missing-keywords", data.missing, "missing", "No major keyword gaps detected.");

  const categoryList = document.querySelector("#skill-categories");
  categoryList.innerHTML = "";
  data.categoryResults.forEach((category) => {
    const rate = category.rate === null ? 0 : Math.round(category.rate * 100);
    const detail = category.relevantSkills.length
      ? category.matchedSkills.length === category.relevantSkills.length
        ? "Strong evidence"
        : category.matchedSkills.length
          ? "Partial evidence"
          : "Evidence missing"
      : "Not emphasized by this role";
    categoryList.insertAdjacentHTML("beforeend", `
      <div class="category-item">
        <div><span>${category.name}</span><small>${detail}</small></div>
        <div class="category-track"><span style="width:${rate}%"></span></div>
      </div>
    `);
  });

  const notesList = document.querySelector("#consultant-notes");
  notesList.innerHTML = "";
  buildNotes(data).forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note;
    notesList.appendChild(li);
  });

  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderPriorityList(selector, items, emptyMessage) {
  const container = document.querySelector(selector);
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "priority-item";
    row.textContent = item;
    container.appendChild(row);
  });
}

async function readPdf(file) {
  if (!window.pdfjsLib) throw new Error("PDF reader could not load. Check your internet connection.");
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const buffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    updateFileProgress(pageNumber / pdf.numPages, `Reading PDF page ${pageNumber} of ${pdf.numPages}...`);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }
  return pages.join("\n\n");
}

async function readImage(file) {
  if (!window.Tesseract) throw new Error("Image reader could not load. Check your internet connection.");
  const result = await window.Tesseract.recognize(file, "eng", {
    logger: (message) => {
      if (message.status === "recognizing text") {
        updateFileProgress(message.progress, `Recognizing image text... ${Math.round(message.progress * 100)}%`);
      } else {
        updateFileProgress(message.progress || 0.08, "Preparing image recognition...");
      }
    }
  });
  return result.data.text;
}

function updateFileProgress(progress, message) {
  const wrap = document.querySelector("#ocr-progress");
  wrap.hidden = false;
  document.querySelector("#ocr-progress-bar").style.width = `${Math.max(progress * 100, 4)}%`;
  document.querySelector("#ocr-progress-text").textContent = message;
}

async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.querySelector("#file-status");
  status.textContent = `Reading ${file.name}`;
  updateFileProgress(0.04, "Starting local document reading...");

  try {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const text = isPdf ? await readPdf(file) : await readImage(file);
    resumeInput.value = text.trim();
    status.textContent = `${file.name} · ${text.trim().split(/\s+/).filter(Boolean).length} words`;
    updateFileProgress(1, "Document text imported successfully.");
  } catch (error) {
    status.textContent = "Could not read file";
    updateFileProgress(0, error.message);
  }
}

function updateWordCount() {
  const count = jdInput.value.trim() ? jdInput.value.trim().split(/\s+/).length : 0;
  document.querySelector("#jd-word-count").textContent = `${count} words`;
}

function loadDemo() {
  resumeInput.value = `ALEX MORGAN
Software Engineer

EXPERIENCE
Software Engineering Intern — Atlas Commerce
• Built React and JavaScript dashboard features used by 40+ operations users.
• Developed Node.js REST API endpoints and optimized SQL queries, reducing response time by 28%.
• Deployed services to AWS and collaborated with product and design stakeholders.

PROJECTS
TaskFlow — Full Stack Application
• Created a React and Node.js application with PostgreSQL, Git, and Docker.
• Applied data structures and algorithms to improve search performance.

SKILLS
JavaScript, Python, SQL, React, Node.js, AWS, Git, Docker, Communication, Collaboration`;

  jdInput.value = `We are hiring a Software Engineer to design and build reliable cloud services. The engineer will develop REST API services, work with distributed systems, and partner with a cross-functional team.

Required skills:
• Strong Java or Python programming experience
• Experience with JavaScript, React, and Node.js
• Knowledge of AWS, SQL, data structures, algorithms, and system design
• Understanding of distributed systems and scalable backend architecture
• Strong communication, collaboration, and problem solving skills`;
  document.querySelector("#role-template").value = "auto";
  updateWordCount();
}

document.querySelector("#analyze-button").addEventListener("click", analyze);
document.querySelector("#load-demo").addEventListener("click", loadDemo);
document.querySelector("#resume-file").addEventListener("change", handleFile);
document.querySelector("#print-report").addEventListener("click", () => window.print());
jdInput.addEventListener("input", updateWordCount);
