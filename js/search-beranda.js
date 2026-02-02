document.addEventListener('DOMContentLoaded', () => {
function bindSearch(container) {
    if (!container) return;

    const input = container.querySelector('.search-input');
    const btn = container.querySelector('.search-btn');

    function goSearch() {
      const q = input.value;

      if (!q || !q.trim()) {
        alert('Masukkan kata kunci pencarian');
        return;
      }

      window.location.href =
        `search.html?q=${encodeURIComponent(q.trim())}`;
    }

    /* klik icon (kalau ada) */
    if (btn) {
      btn.addEventListener('click', goSearch);
    }

    /* ENTER */
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        goSearch();
      }
    });
  }
  bindSearch(document.getElementById('searchBeranda'));
  bindSearch(document.getElementById('searchSidebar'));

});