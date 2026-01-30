document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.home');
  const loadMoreBtn = document.getElementById('loadMore');
  if (!container || !loadMoreBtn) return;

  const PER_PAGE = 6;
  const MAX_PAGE = 6;

  let page = 1;
  let isLoading = false;
  let hasMore = true;
  let kategoriId = null;

  /* ===============================
     CACHE
  =============================== */
  const catCache = {};
  const mediaCache = {};
  const editorCache = {};

  /* ===============================
     FORMAT TANGGAL
  =============================== */
  const formatTanggal = dateString => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/` +
           `${String(d.getMonth() + 1).padStart(2, '0')}/` +
           `${d.getFullYear()}`;
  };

  /* ===============================
     AMBIL ID KATEGORI OPINI
  =============================== */
  (async () => {
    try {
      const res = await fetch(
        'https://lampost.co/wp-json/wp/v2/categories?slug=bola'
      );
      if (!res.ok) throw new Error('Kategori gagal');

      const data = await res.json();
      if (!data.length) throw new Error('Kategori tidak ditemukan');

      kategoriId = data[0].id;
      loadPosts();

    } catch (err) {
      console.error(err);
      container.innerHTML = '<p>Kategori opini tidak tersedia</p>';
    }
  })();

  /* ===============================
     AMBIL KATEGORI
  =============================== */
  async function getCategory(catId) {
    if (!catId) return { name: 'Opini', slug: 'opini' };
    if (catCache[catId]) return catCache[catId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories/${catId}`
    );
    const data = await res.json();

    return (catCache[catId] = {
      name: data.name,
      slug: data.slug
    });
  }

  /* ===============================
     AMBIL GAMBAR
  =============================== */
  async function getMedia(mediaId) {
    if (!mediaId) return 'image/ai.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
    );
    const data = await res.json();

    return (mediaCache[mediaId] =
      data.media_details?.sizes?.medium?.source_url ||
      data.source_url ||
      'image/ai.jpg'
    );
  }

  /* ===============================
     ✍️ AMBIL EDITOR (SAMA PENAMPILAN)
  =============================== */
  async function getEditor(post) {
    let editor = 'Redaksi';

    const termLink = post._links?.['wp:term']?.[2]?.href;
    if (!termLink) return editor;

    if (editorCache[termLink]) return editorCache[termLink];

    try {
      const res = await fetch(termLink);
      if (res.ok) {
        const data = await res.json();
        editor = data?.[0]?.name || editor;
        editorCache[termLink] = editor;
      }
    } catch (_) {}

    return editor;
  }

  /* ===============================
     LOAD POSTS
  =============================== */
  async function loadPosts() {
    if (isLoading || !hasMore || page > MAX_PAGE) {
      loadMoreBtn.style.display = 'none';
      return;
    }

    isLoading = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/posts` +
        `?categories=${kategoriId}&per_page=${PER_PAGE}&page=${page}` +
        `&orderby=date&order=desc`
      );

      if (!res.ok) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      const posts = await res.json();
      if (!posts.length) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      const htmlArr = [];

      await Promise.all(
        posts.map(async post => {

          const judul = post.title.rendered;
          const slug = post.slug;
          const tanggal = formatTanggal(post.date);

          const catId = post.categories?.[0];
          const { name: kategori, slug: kategoriSlug } =
            await getCategory(catId);

          const gambar = await getMedia(post.featured_media);
          const editor = await getEditor(post);

          let deskripsi =
            post.excerpt?.rendered
              ?.replace(/<[^>]+>/g, '')
              ?.trim() || '';

          if (deskripsi.length > 150) {
            deskripsi = deskripsi.slice(0, 150) + '...';
          }

          const link = `../../halaman.html?${kategoriSlug}/${slug}`;

          htmlArr.push(`
            <a href="${link}" class="item-info">
              <img src="${gambar}" alt="${judul}" class="img-microweb" loading="lazy">
              <div class="berita-microweb">
                <p class="judul">${judul}</p>
                <p class="kategori">${kategori}</p>
                <div class="info-microweb">
                  <p class="editor">By ${editor}</p>
                  <p class="tanggal">${tanggal}</p>
                </div>
                <p class="deskripsi">${deskripsi}</p>
              </div>
            </a>
          `);

        })
      );

      container.insertAdjacentHTML('beforeend', htmlArr.join(''));
      page++;

    } catch (err) {
      console.error(err);
    } finally {
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  }

  loadMoreBtn.addEventListener('click', loadPosts);

});
