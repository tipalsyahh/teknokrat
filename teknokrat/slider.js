document.addEventListener('DOMContentLoaded', async () => {

/* =====================================================
   SLIDER HOMEPAGE
===================================================== */

const track = document.querySelector('.hero-track');
const dotsWrap = document.querySelector('.hero-dots');

if (track && dotsWrap) {

  try {

    const res = await fetch(
      'https://lampost.co/microweb/teknokrat/wp-json/wp/v2/posts?per_page=5&orderby=date&order=desc&_embed'
    );

    if (!res.ok) throw new Error('Gagal ambil data');

    const posts = await res.json();

    let slidesHTML = '';
    let dotsHTML = '';

    posts.forEach((post, i) => {

      const judul = post.title.rendered;

      const kategoriNama =
        post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Berita';

      const editor =
        post._embedded?.author?.[0]?.name || 'Redaksi';

      const gambar =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        'https://via.placeholder.com/800x400';

      const selisihJam = Math.floor(
        (Date.now() - new Date(post.date)) / 3600000
      );

      const waktu =
        selisihJam < 24
          ? `${selisihJam} jam yang lalu`
          : `${Math.floor(selisihJam / 24)} hari yang lalu`;

      /* 🔥 LINK SESUAI DETAIL */
      const link = `/?slug=${post.slug}`;

      slidesHTML += `
        <div class="hero-slide">
          <a href="${link}" class="hero-link">
            <div class="hero-image-box">
              <img src="${gambar}" class="hero-image" loading="lazy">

              <div class="hero-overlay">
                <span class="hero-category">${kategoriNama}</span>
                <span class="hero-title">${judul}</span>

                <div class="hero-meta">
                  <span class="hero-editor">By ${editor}</span>
                  <span class="hero-time">${waktu}</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      `;

      dotsHTML += `
        <span class="hero-dot ${i === 0 ? 'active' : ''}" data-i="${i}"></span>
      `;

    });

    track.innerHTML = slidesHTML;
    dotsWrap.innerHTML = dotsHTML;

    let index = 0;
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const total = slides.length;

    function goSlide(i) {
      track.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach(d => d.classList.remove('active'));
      dots[i].classList.add('active');
      index = i;
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goSlide(Number(dot.dataset.i));
      });
    });

    setInterval(() => {
      goSlide((index + 1) % total);
    }, 5000);

  } catch (err) {
    console.error(err);
  }
}

/* =====================================================
   DETAIL BERITA
===================================================== */

const berita = document.getElementById('berita');
const slug = new URLSearchParams(location.search).get("slug");

if (berita && slug) {

  try {

    document.getElementById("homePage").style.display = "none";
    document.getElementById("detailPage").style.display = "block";

    const api =
      `https://lampost.co/microweb/teknokrat/wp-json/wp/v2/posts?slug=${slug}&_embed`;

    const res = await fetch(api);
    const posts = await res.json();
    const post = posts[0];

    document.querySelector('.judul-berita').innerHTML = post.title.rendered;

    const isi = document.querySelector('.isi-berita');
    isi.innerHTML = post.content.rendered;

    isi.querySelectorAll('p').forEach(p => {
      if (!p.textContent.trim()) p.remove();
    });

    isi.querySelectorAll('a[href]').forEach(a => {
      try {
        const u = new URL(a.href);
        const s = u.pathname.split('/').filter(Boolean).at(-1);
        if (s) a.href = '/?slug=' + s;
      } catch {}
    });

    const gambar = document.querySelector('.gambar-berita');
    gambar.src =
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      'https://via.placeholder.com/800x400';

    document.getElementById('tanggal').innerText =
      new Date(post.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

    document.getElementById('editor').innerText =
      post._embedded?.author?.[0]?.name || 'Redaksi';

  } catch (e) {

    berita.innerHTML = "<p>Gagal memuat berita</p>";

  }
}

});
