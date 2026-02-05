document.addEventListener('DOMContentLoaded', async () => {

  const berita = document.getElementById('berita');
  if (!berita) return;

  // 🔥 ambil slug dari ?slug=
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) return;

  try {

    const api =
      `https://lampost.co/microweb/teknokrat/wp-json/wp/v2/posts?slug=${slug}&_embed`;

    const res = await fetch(api);
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();
    if (!posts.length) throw new Error('Berita tidak ada');

    const post = posts[0];

    /* ===== TAMPILKAN DETAIL ===== */

    document.getElementById("homePage").style.display = "none";
    document.getElementById("detailPage").style.display = "block";

    /* ================= JUDUL ================= */

    document.querySelector('.judul-berita').innerHTML = post.title.rendered;

    /* ================= ISI ================= */

    const isi = document.querySelector('.isi-berita');
    isi.innerHTML = post.content.rendered;

    isi.querySelectorAll('p').forEach(p => {
      if (!p.textContent.trim()) p.remove();
    });

    /* ================= REDIRECT LINK ================= */

    isi.querySelectorAll('a[href]').forEach(link => {

      const href = link.getAttribute('href');
      if (!href) return;

      try {

        const url = href.startsWith('http')
          ? new URL(href)
          : new URL(href, 'https://lampost.co');

        const slugBerita = url.pathname.split('/').filter(Boolean).at(-1);

        if (slugBerita) {
          link.href = `/?slug=${slugBerita}`;
          link.target = '_self';
        }

      } catch { }

    });

    /* ================= GAMBAR ================= */

    const gambar = document.querySelector('.gambar-berita');

    gambar.src =
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      'https://via.placeholder.com/800x400';

    gambar.style.width = "100%";

    isi.querySelectorAll('img').forEach(img => {
      img.style.width = "100%";
      img.removeAttribute("height");
      img.removeAttribute("width");
    });

    /* ================= TANGGAL ================= */

    document.getElementById('tanggal').innerText =
      new Date(post.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

    /* ================= EDITOR ================= */

    document.getElementById('editor').innerText =
      post._embedded?.author?.[0]?.name || 'Redaksi';

  } catch (err) {

    console.error(err);
    berita.innerHTML = '<p>Gagal memuat berita</p>';

  }

});
