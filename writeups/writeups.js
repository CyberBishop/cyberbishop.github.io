(() => {
  const list = document.getElementById('list'), cards = document.getElementById('cards'), post = document.getElementById('post');
  let posts = [];
  const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function renderList() {
    cards.innerHTML = posts.map(p => `
      <a class="card pcard${p.cover ? '' : ' nocover'} in reveal" href="#/${p.slug}">
        ${p.cover ? `<img src="../${p.cover}" alt="" loading="lazy">` : ''}
        <div>
          <span class="tag">${fmt(p.date)} · ${p.minutes} min read</span>
          <h3>${esc(p.title)}</h3>
          <p class="tags">${p.tags.map(t => '#' + esc(t)).join(' ')}</p>
        </div>
      </a>`).join('');
  }

  function route() {
    const slug = location.hash.replace(/^#\/?/, '');
    const p = posts.find(x => x.slug === slug);
    if (!p) {
      document.title = 'Writeups · Timi Alabi';
      post.hidden = true; list.hidden = false; return;
    }
    document.title = p.title + ' · Timi Alabi';
    list.hidden = true; post.hidden = false;
    post.innerHTML = `
      <a class="back" href="#/">← all writeups</a>
      <p class="meta">${fmt(p.date)} · ${p.minutes} min read</p>
      <h1>${esc(p.title)}</h1>
      <p class="tags">${p.tags.map(t => '#' + esc(t)).join(' ')}</p>
      <div class="prose">${marked.parse(p.body)}</div>
      <a class="back" href="#/">← all writeups</a>`;
    post.querySelectorAll('a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
    scrollTo(0, 0);
  }

  fetch('posts.json').then(r => r.json()).then(d => { posts = d; renderList(); route(); })
    .catch(() => { cards.textContent = 'Could not load writeups.'; });
  addEventListener('hashchange', route);
})();
