window.addEventListener("load", () => {

    const items = document.querySelectorAll(`
        .iklan-gambar,
        .container-beranda > *,
        .lampung,
        footer,
        .container,
        .info,
        .bener,
        .container-microweb,
        .gaya-hidup,
        .populer-mobile,
        .hero-slider,
        .news
    `);

    items.forEach((item, index) => {
        item.classList.add("animate-item");
        item.style.animationDelay = `${index * 0.18}s`;
    });

});
