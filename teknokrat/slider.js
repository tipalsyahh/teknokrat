document.addEventListener('DOMContentLoaded', async () => {

const API = "https://lampost.co/microweb/teknokrat/wp-json/wp/v2/posts";

const track = document.querySelector('.hero-track');
const dotsWrap = document.querySelector('.hero-dots');

if (!track || !dotsWrap) return;

try {

  const res = await fetch(`${API}?per_page=5&orderby=date&order=desc&_embed`);
  if (!res.ok) throw new Error('Gagal ambil slider');

  const posts = await res.json();

  let slidesHTML = '';
  let dotsHTML = '';

  posts.forEach((post, i) => {

    const judul = post.title.rendered;

    const kategori =
      post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Berita';

    const editor =
      post._embedded?.author?.[0]?.name || 'Redaksi';

    const gambar =
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      'https://via.placeholder.com/800x400';

    const jam = Math.floor((Date.now() - new Date(post.date)) / 3600000);

    const waktu = jam < 24
      ? `${jam} jam yang lalu`
      : `${Math.floor(jam / 24)} hari yang lalu`;

    /* 🔥 LINK WORDPRESS ASLI */
    const link = post.link;

    slidesHTML += `
      <div class="hero-slide">
        <a href="${link}" class="hero-link">
          <div class="hero-image-box">
            <img src="${gambar}" class="hero-image" loading="lazy">

            <div class="hero-overlay">
              <span class="hero-category">${kategori}</span>
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

    dotsHTML += `<span class="hero-dot ${i===0?'active':''}" data-i="${i}"></span>`;
  });

  track.innerHTML = slidesHTML;
  dotsWrap.innerHTML = dotsHTML;

  let index = 0;
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const total = slides.length;

  function goSlide(i){
    track.style.transform = `translateX(-${i*100}%)`;
    dots.forEach(d=>d.classList.remove('active'));
    dots[i].classList.add('active');
    index=i;
  }

  dots.forEach(dot=>{
    dot.addEventListener('click',()=>goSlide(Number(dot.dataset.i)));
  });

  setInterval(()=>goSlide((index+1)%total),5000);

} catch(e){
  console.error(e);
}

});
