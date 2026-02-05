document.addEventListener('DOMContentLoaded', async () => {

const container = document.querySelector('.terbaru');
if (!container) return;

const API = "https://lampost.co/microweb/teknokrat/wp-json/wp/v2/posts";

try {

  const res = await fetch(`${API}?per_page=12&orderby=date&order=desc&_embed`);
  if (!res.ok) throw new Error('API gagal');

  const posts = await res.json();
  let output = '';

  posts.forEach(post => {

    const judul = post.title.rendered;

    const gambar =
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      'https://via.placeholder.com/400x250';

    const tanggal = new Date(post.date).toLocaleDateString('id-ID',{
      day:'2-digit',
      month:'long',
      year:'numeric'
    });

    /* 🔥 LINK WORDPRESS ASLI */
    const link = post.link;

    output += `
      <a href="${link}" class="item-microweb">
        <img src="${gambar}" class="img-terbaru-teknokrat" loading="lazy">

        <div class="berita-microweb">
          <p class="judul-terbaru">${judul}</p>

          <div class="info-microweb">
            <p class="tanggal">${tanggal}</p>
          </div>
        </div>
      </a>
    `;
  });

  container.innerHTML = output || '<p>Konten tidak tersedia</p>';

} catch(err){

  console.error(err);
  container.innerHTML = '<p>Konten gagal dimuat</p>';

}

});
