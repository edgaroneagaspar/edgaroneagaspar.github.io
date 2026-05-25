const Publications = (() => {
  const state = {
    data: [],
    query: '',
    groupBy: 'year',
    type: 'all',
    topic: 'all'
  };

  const byYearDesc = (a, b) => b.year - a.year || a.title.localeCompare(b.title);

  function normalize(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function doiUrl(doi) {
    return doi ? `https://doi.org/${doi}` : '';
  }

  function unique(values) {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }

  function publicationMatches(pub) {
    const haystack = normalize([
      pub.year,
      pub.type,
      pub.authors.join(' '),
      pub.title,
      pub.venue,
      pub.doi,
      pub.topics.join(' ')
    ].join(' '));

    const matchesSearch = !state.query || haystack.includes(normalize(state.query));
    const matchesType = state.type === 'all' || pub.type === state.type;
    const matchesTopic = state.topic === 'all' || pub.topics.includes(state.topic);
    return matchesSearch && matchesType && matchesTopic;
  }

  function groupKey(pub) {
    if (state.groupBy === 'year') return String(pub.year);
    if (state.groupBy === 'type') return pub.type;
    if (state.groupBy === 'topic') return pub.topics[0] || 'Other';
    return 'All publications';
  }

  function groupSort(a, b) {
    if (state.groupBy === 'year') return Number(b[0]) - Number(a[0]);
    return a[0].localeCompare(b[0]);
  }

  function renderPublication(pub) {
    const doi = pub.doi ? `<a class="doi" href="${doiUrl(pub.doi)}">doi:${pub.doi}</a>` : '';
    const tags = pub.topics.map(topic => `<span class="tag">${topic}</span>`).join('');
    return `
      <article class="publication">
        <p class="publication-title">${pub.title}</p>
        <p class="publication-authors">${pub.authors.join(', ')}</p>
        <p class="publication-venue">${pub.venue}. ${pub.year}. ${pub.type}.</p>
        ${doi}
        <p class="publication-tags">${tags}</p>
      </article>`;
  }

  function render() {
    const target = document.getElementById('publication-results');
    const counter = document.getElementById('publication-count');
    if (!target) return;

    const filtered = state.data.filter(publicationMatches).sort(byYearDesc);
    if (counter) counter.textContent = `${filtered.length} publication${filtered.length === 1 ? '' : 's'}`;

    if (!filtered.length) {
      target.innerHTML = '<div class="card"><p>No publications match the current filters.</p></div>';
      return;
    }

    const groups = new Map();
    for (const pub of filtered) {
      const key = groupKey(pub);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(pub);
    }

    target.innerHTML = [...groups.entries()].sort(groupSort).map(([key, pubs]) => `
      <section class="publication-group">
        <h2>${key}</h2>
        <div class="pub-list">${pubs.map(renderPublication).join('')}</div>
      </section>
    `).join('');
  }

  function fillControls() {
    const typeSelect = document.getElementById('filter-type');
    const topicSelect = document.getElementById('filter-topic');
    const types = unique(state.data.map(pub => pub.type));
    const topics = unique(state.data.flatMap(pub => pub.topics));

    if (typeSelect) {
      typeSelect.innerHTML = '<option value="all">All types</option>' + types.map(type => `<option value="${type}">${type}</option>`).join('');
    }
    if (topicSelect) {
      topicSelect.innerHTML = '<option value="all">All topics</option>' + topics.map(topic => `<option value="${topic}">${topic}</option>`).join('');
    }
  }

  function setupControls() {
    const search = document.getElementById('publication-search');
    const group = document.getElementById('group-by');
    const type = document.getElementById('filter-type');
    const topic = document.getElementById('filter-topic');

    if (search) search.addEventListener('input', event => { state.query = event.target.value; render(); });
    if (group) group.addEventListener('change', event => { state.groupBy = event.target.value; render(); });
    if (type) type.addEventListener('change', event => { state.type = event.target.value; render(); });
    if (topic) topic.addEventListener('change', event => { state.topic = event.target.value; render(); });
  }

  async function init() {
    const target = document.getElementById('publication-results');
    if (!target) return;

    try {
      const response = await fetch('../assets/data/publications.json');
      if (!response.ok) throw new Error(`Could not load publications.json: ${response.status}`);
      state.data = await response.json();
      fillControls();
      setupControls();
      render();
    } catch (error) {
      target.innerHTML = `<div class="card"><p>The publication data could not be loaded. On GitHub Pages this normally works automatically; if you are opening the files locally, use a small local web server rather than file://.</p><p>${error.message}</p></div>`;
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Publications.init);
