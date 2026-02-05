document.addEventListener('DOMContentLoaded', async () => {

const container = document.querySelector('.home');
const loadMoreBtn = document.getElementById('loadMore');
if (!container || !loadMoreBtn) return;

const API = "https://lampost.co/microweb/teknokrat/wp-json/wp/v2/posts";
const PER_PAGE = 10;

let page = 1;
let isLoading = false;
let hasMore = true;

async function loadPosts() {

  if (isLoading || !hasMore) return;
  isLoading = true;

  try {

    const res = await fetch(`${API}?per_page=${PER_PAGE}&page=${page}&orderby=date&order=desc&_embed`);

    if (!res.ok) {
      if (res.status === 400) {
        hasMore = false;
        loadMoreBtn.style.display = "none";
        return;
      }
      throw new Error("API gagal");
    }

    const posts = await res.json();

    if (!posts.length) {
      hasMore = false;
      loadMoreBtn.style.display = "none";
      return;
    }

    let output = '';

    posts.forEach(post => {

      const judul = post.title.rendered;

      const kategori =
        post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Teknokrat';

      const editor =
        post._embedded?.author?.[0]?.name || 'Redaksi';

      const deskripsi =
        post.excerpt?.rendered?.replace(/<[^>]+>/g,'').slice(0,150)+'...';

      const gambar =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        'https://via.placeholder.com/400x250';

      const tanggal = new Date(post.date).toLocaleDateString('id-ID',{
        day:'2-digit',
        month:'2-digit',
        year:'numeric'
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

    container.insertAdjacentHTML('beforeend', output);
    page++;

  } catch (err) {

    console.error(err);

  } finally {

    isLoading = false;

  }
}

/* LOAD AWAL */
loadPosts();

/* LOAD MORE */
loadMoreBtn.addEventListener('click', loadPosts);

});
