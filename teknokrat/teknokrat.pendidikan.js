document.addEventListener('DOMContentLoaded', async () => {

const container = document.querySelector('.Pendidikan');
if (!container) return;

const API_POST = "https://lampost.co/microweb/teknokrat/wp-json/wp/v2/posts";
const API_CAT  = "https://lampost.co/microweb/teknokrat/wp-json/wp/v2/categories";

try {

  /* =====================================================
     AMBIL ID KATEGORI "akademik"
  ===================================================== */

  const catRes = await fetch(`${API_CAT}?slug=akademik`);
  if (!catRes.ok) throw new Error('Kategori gagal');

  const catData = await catRes.json();
  if (!catData.length) throw new Error('Kategori tidak ada');

  const kategoriId = catData[0].id;

  /* =====================================================
     AMBIL POST BERDASARKAN KATEGORI
  ===================================================== */

  const res = await fetch(
    `${API_POST}?categories=${kategoriId}&per_page=13&orderby=date&order=desc&_embed`
  );

  if (!res.ok) throw new Error('Post gagal');

  const posts = await res.json();
  let output = '';

  posts.forEach(post => {

    const judul = post.title.rendered;

    const kategori =
      post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Pendidikan';

    const editor =
      post._embedded?.author?.[0]?.name || 'Redaksi';

    const gambar =
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      'https://via.placeholder.com/400x250';

    let deskripsi =
      post.excerpt?.rendered?.replace(/<[^>]+>/g,'').trim() || '';

    if(deskripsi.length>150) deskripsi = deskripsi.slice(0,150)+'...';

    const tanggal = new Date(post.date).toLocaleDateString('id-ID',{
      day:'2-digit',month:'2-digit',year:'numeric'
    });

    /* 🔥 LINK WORDPRESS ASLI */
    const link = post.link;

    output += `
      <a href="${link}" class="item-info">
        <img src="${gambar}" class="img-microweb" loading="lazy">

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
    `;
  });

  container.innerHTML = output || '<p>Konten pendidikan tidak tersedia</p>';

} catch(err){

  console.error(err);
  container.innerHTML = '<p>Konten gagal dimuat</p>';

}

});
