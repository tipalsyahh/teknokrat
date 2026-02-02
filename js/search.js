document.addEventListener('DOMContentLoaded', () => {

  const title = document.querySelector('h2.search-title');
  const container = document.getElementById('search-results');
  if (!title || !container) return;

  const params = new URLSearchParams(location.search);
  const query = decodeURIComponent(params.get('q') || '').trim();
  const queryLower = query.toLowerCase();

  title.textContent = `Search Result for '${query}'`;

  if (!query) {
    container.innerHTML = '<p>Masukkan kata kunci pencarian.</p>';
    return;
  }

  let page = 1;
  let loading = false;
  let finished = false;
  let firstLoaded = false;

  /* 🔥 LOADING AWAL */
  container.innerHTML = '<p>Sedang mencari berita...</p>';

  /* ================= RENDER ITEM ================= */
  function render(post) {
    const judul = post.title.rendered;
    const tanggal = new Date(post.date).toLocaleDateString('id-ID');

    const deskripsi =
      (post.excerpt?.rendered || '')
        .replace(/(<([^>]+)>)/gi, '')
        .slice(0, 140) + '...';

    const kategori =
      post._embedded?.['wp:term']?.[0]?.[0];

    const editor =
      post._embedded?.['wp:term']?.[2]?.[0]?.name || 'Redaksi';

    const media =
      post._embedded?.['wp:featuredmedia']?.[0]
        ?.media_details?.sizes?.medium?.source_url || '';

    const imgTag = media
      ? `<img src="${media}" loading="lazy" class="img-microweb">`
      : `<div class="img-placeholder"></div>`;

    return `
      <a href="halaman.html?${kategori?.slug || 'berita'}/${post.slug}"
         class="item-info">
        ${imgTag}
        <div class="berita-microweb">
          <p class="judul">${judul}</p>
          <p class="kategori">${kategori?.name || 'Berita'}</p>
          <div class="info-microweb">
            <p class="editor">By ${editor}</p>
            <p class="tanggal">${tanggal}</p>
          </div>
          <p class="deskripsi">${deskripsi}</p>
        </div>
      </a>
    `;
  }

  /* ================= LOAD DATA ================= */
  async function load() {
    if (loading || finished) return;
    loading = true;

    try {
      const res = await fetch(
        `https://lampost.co/microweb/teknokrat/wp-json/wp/v2/posts` +
        `?search=${encodeURIComponent(query)}` +
        `&per_page=50&page=${page}&_embed`
      );

      if (!res.ok) {
        finished = true;
        return;
      }

      const posts = await res.json();

      /* ❌ TIDAK ADA HASIL */
      if (!posts.length) {
        finished = true;

        if (!firstLoaded) {
          container.innerHTML =
            `<p>Tidak ada hasil untuk <b>${query}</b></p>`;
        }
        return;
      }

      /* 🔥 HAPUS LOADING SAAT DATA PERTAMA MASUK */
      if (!firstLoaded) {
        container.innerHTML = '';
        firstLoaded = true;
      }

      container.innerHTML += posts.map(render).join('');
      page++;

    } catch (err) {
      console.error(err);
    }

    loading = false;
  }

  /* ================= INFINITE SCROLL ================= */
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) load();
  }, { rootMargin: '200px' });

  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  container.after(sentinel);
  observer.observe(sentinel);

  /* INIT */
  load();

});
