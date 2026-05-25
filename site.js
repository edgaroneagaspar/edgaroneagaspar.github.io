const pubs = Array.isArray(window.PUBLICATIONS) ? window.PUBLICATIONS : [];

const els = {
  metrics: document.getElementById("metrics"),
  search: document.getElementById("searchInput"),
  group: document.getElementById("groupSelect"),
  sort: document.getElementById("sortSelect"),
  type: document.getElementById("typeFilter"),
  topic: document.getElementById("topicFilter"),
  year: document.getElementById("yearFilter"),
  reset: document.getElementById("resetButton"),
  expand: document.getElementById("expandButton"),
  resultCount: document.getElementById("resultCount"),
  list: document.getElementById("publicationList")
};

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => collator.compare(String(a), String(b)));
}

function byYearDesc(a, b) {
  return b.year - a.year || collator.compare(a.title, b.title);
}

function byYearAsc(a, b) {
  return a.year - b.year || collator.compare(a.title, b.title);
}

function sortPublications(items) {
  const mode = els.sort.value;
  const copy = [...items];
  if (mode === "oldest") return copy.sort(byYearAsc);
  if (mode === "title") return copy.sort((a, b) => collator.compare(a.title, b.title) || b.year - a.year);
  if (mode === "type") return copy.sort((a, b) => collator.compare(a.type, b.type) || byYearDesc(a, b));
  return copy.sort(byYearDesc);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[ch]));
}

function doiHref(doi) {
  const clean = String(doi || "").trim().replace(/\s+/g, "");
  return clean ? `https://doi.org/${encodeURIComponent(clean).replace(/%2F/g, "/")}` : "";
}

function citationText(pub) {
  const parts = [];
  parts.push(`${pub.authors} (${pub.year}). ${pub.title}`);
  if (pub.venue) parts.push(pub.venue);
  if (pub.pages) parts.push(pub.pages);
  if (pub.doi) parts.push(`doi:${pub.doi}`);
  return parts.join(" ");
}

function populateFilters() {
  uniqueSorted(pubs.map(p => p.type)).forEach(value => {
    els.type.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`);
  });

  uniqueSorted(pubs.flatMap(p => p.topics || [])).forEach(value => {
    els.topic.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`);
  });

  [...new Set(pubs.map(p => p.year))].sort((a, b) => b - a).forEach(value => {
    els.year.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`);
  });
}

function renderMetrics() {
  const years = pubs.map(p => p.year);
  const doiCount = pubs.filter(p => p.doi).length;
  const types = uniqueSorted(pubs.map(p => p.type)).length;
  const yearRange = `${Math.min(...years)}–${Math.max(...years)}`;

  els.metrics.innerHTML = `
    <div class="metric"><strong>${pubs.length}</strong><span>publications in this database</span></div>
    <div class="metric"><strong>${yearRange}</strong><span>coverage by publication year</span></div>
    <div class="metric"><strong>${types}</strong><span>publication types</span></div>
    <div class="metric"><strong>${doiCount}</strong><span>entries with DOI links</span></div>
  `;
}

function publicationMatches(pub) {
  const q = els.search.value.trim().toLowerCase();
  const type = els.type.value;
  const topic = els.topic.value;
  const year = els.year.value;

  if (type && pub.type !== type) return false;
  if (topic && !(pub.topics || []).includes(topic)) return false;
  if (year && String(pub.year) !== year) return false;

  if (!q) return true;
  const haystack = [
    pub.year,
    pub.authors,
    pub.title,
    pub.type,
    pub.subtype,
    pub.venue,
    pub.pages,
    pub.doi,
    pub.primaryTopic,
    ...(pub.topics || [])
  ].join(" ").toLowerCase();

  return haystack.includes(q);
}

function groupPublications(items) {
  const mode = els.group.value;
  const groups = new Map();

  function add(key, pub) {
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(pub);
  }

  for (const pub of items) {
    if (mode === "year") add(String(pub.year), pub);
    else if (mode === "type") add(pub.type || "Other", pub);
    else if (mode === "topic") add(pub.primaryTopic || "Other", pub);
    else add("All publications", pub);
  }

  const entries = [...groups.entries()];
  if (mode === "year") return entries.sort((a, b) => Number(b[0]) - Number(a[0]));
  return entries.sort((a, b) => collator.compare(a[0], b[0]));
}

function renderPublication(pub) {
  const doi = doiHref(pub.doi);
  const tags = [pub.type, pub.primaryTopic, ...(pub.topics || []).filter(t => t !== pub.primaryTopic)];
  return `
    <article class="publication-card" id="${escapeHTML(pub.id)}">
      <div class="pub-topline">
        <div class="pub-year">${escapeHTML(pub.year)}</div>
        <div class="pub-type">${escapeHTML(pub.type)} · ${escapeHTML(pub.subtype)}</div>
      </div>
      <h3 class="pub-title">${escapeHTML(pub.title)}</h3>
      <p class="pub-authors">${escapeHTML(pub.authors)}</p>
      <p class="pub-venue">${escapeHTML(pub.venue)}${pub.pages ? `, ${escapeHTML(pub.pages)}` : ""}</p>
      <div class="pub-tags">
        ${uniqueSorted(tags).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}
      </div>
      <div class="pub-actions">
        ${doi ? `<a href="${doi}" target="_blank" rel="noopener">DOI</a>` : ""}
        <button type="button" data-copy="${escapeHTML(pub.id)}">Copy citation</button>
      </div>
      <details>
        <summary>Details</summary>
        <p class="citation">${escapeHTML(citationText(pub))}</p>
        ${pub.note ? `<p class="citation">${escapeHTML(pub.note)}</p>` : ""}
      </details>
    </article>
  `;
}

function render() {
  const filtered = sortPublications(pubs.filter(publicationMatches));
  const grouped = groupPublications(filtered);

  els.resultCount.textContent = `${filtered.length} of ${pubs.length} publications shown.`;

  if (!filtered.length) {
    els.list.innerHTML = `<div class="no-results">No publication matches the current filters.</div>`;
    return;
  }

  els.list.innerHTML = grouped.map(([groupName, items]) => `
    <section class="group">
      <div class="group-header">
        <h2>${escapeHTML(groupName)}</h2>
        <span class="group-count">${items.length} ${items.length === 1 ? "entry" : "entries"}</span>
      </div>
      ${sortPublications(items).map(renderPublication).join("")}
    </section>
  `).join("");
}

function copyCitationById(id) {
  const pub = pubs.find(p => p.id === id);
  if (!pub) return;
  navigator.clipboard?.writeText(citationText(pub));
}

function bindEvents() {
  [els.search, els.group, els.sort, els.type, els.topic, els.year].forEach(el => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  els.reset.addEventListener("click", () => {
    els.search.value = "";
    els.group.value = "year";
    els.sort.value = "newest";
    els.type.value = "";
    els.topic.value = "";
    els.year.value = "";
    render();
  });

  els.expand.addEventListener("click", () => {
    const details = [...document.querySelectorAll("details")];
    const shouldOpen = details.some(d => !d.open);
    details.forEach(d => d.open = shouldOpen);
    els.expand.textContent = shouldOpen ? "Collapse all details" : "Expand all abstracts/details";
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("button[data-copy]");
    if (!button) return;
    copyCitationById(button.dataset.copy);
    const original = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = original; }, 1200);
  });
}

populateFilters();
renderMetrics();
bindEvents();
render();
