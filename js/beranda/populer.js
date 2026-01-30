document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.berita-terpopuler');
  if (!container) return;

  const TERM_CACHE = {};
  const MEDIA_CACHE = {};

  function waktuYangLalu(dateString) {
    const sekarang = new Date();
    const waktuPost = new Date(dateString);
    const selisih = Math.floor((sekarang - waktuPost) / 1000);

    if (selisih < 60) return `${selisih} detik yang lalu`;
    const menit = Math.floor(selisih / 60);
    if (menit < 60) return `${menit} menit yang lalu`;
    const jam = Math.floor(menit / 60);
    if (jam < 24) return `${jam} jam yang lalu`;
    return `${Math.floor(jam / 24)} hari yang lalu`;
  }

  async function getEditor(post) {
    let editor = 'Redaksi';
    const termLink = post._links?.['wp:term']?.[2]?.href;
    if (!termLink) return editor;

    if (TERM_CACHE[termLink]) return TERM_CACHE[termLink];

    try {
      const res = await fetch(termLink);
      if (res.ok) {
        const data = await res.json();
        editor = data?.[0]?.name || editor;
        TERM_CACHE[termLink] = editor;
      }
    } catch (_) {}

    return editor;
  }

  async function getMedia(mediaId) {
    if (!mediaId) return 'image/default.jpg';
    if (MEDIA_CACHE[mediaId]) return MEDIA_CACHE[mediaId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
      );
      if (res.ok) {
        const media = await res.json();
        MEDIA_CACHE[mediaId] =
          media.media_details?.sizes?.medium?.source_url ||
          media.source_url ||
          'image/default.jpg';
      }
    } catch (_) {}

    return MEDIA_CACHE[mediaId] || 'image/default.jpg';
  }

  function renderFast(post, kategoriSlug) {
    const judul = post.title.rendered;
    const link = `halaman.html?${kategoriSlug}/${post.slug}`;
    const waktu = waktuYangLalu(post.date);
    const id = `lampung-${post.id}`;

    // 🔥 tampil langsung
    return `
      <a href="${link}" class="card-link" id="${id}">
        <div class="card-image-wrapper">
          <img src="image/default.jpg" alt="${judul}" class="card-image" loading="lazy">

          <div class="card-text-overlay">
            <span class="card-category">Lampung</span>
            <span class="card-text">${judul}</span>

            <div class="card-meta">
              <span class="editor">By ...</span>
              <span class="waktu">${waktu}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  }

  async function enrich(post) {
    const id = `lampung-${post.id}`;
    const el = document.getElementById(id);
    if (!el) return;

    const editor = await getEditor(post);
    const gambar = await getMedia(post.featured_media);

    el.querySelector('.editor').textContent = `By ${editor}`;
    el.querySelector('img').src = gambar;
  }

  async function init() {
    try {
      // 1️⃣ ambil kategori lampung
      const catRes = await fetch(
        'https://lampost.co/wp-json/wp/v2/categories?slug=lampung'
      );
      if (!catRes.ok) throw new Error('Gagal ambil kategori');

      const catData = await catRes.json();
      if (!catData.length) throw new Error('Kategori tidak ditemukan');

      const kategoriId = catData[0].id;
      const kategoriSlug = 'lampung';

      // 2️⃣ ambil post
      const postRes = await fetch(
        `https://lampost.co/wp-json/wp/v2/posts?per_page=6&categories=${kategoriId}&orderby=date&order=desc`
      );
      if (!postRes.ok) throw new Error('Gagal ambil post');

      const posts = await postRes.json();
      if (!posts.length) return;

      // 3️⃣ render cepat
      container.innerHTML = posts
        .map(post => renderFast(post, kategoriSlug))
        .join('');

      // 4️⃣ data pelengkap menyusul (parallel)
      posts.forEach(post => enrich(post));

    } catch (err) {
      console.error('Gagal load berita Lampung:', err);
      container.innerHTML = 'Gagal memuat berita Lampung';
    }
  }

  init();

});