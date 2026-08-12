document.addEventListener('DOMContentLoaded', async () => {
    const grid       = document.getElementById('dynamic-cases-grid');
    const featGrid   = document.getElementById('featured-cases-grid');
    const API_URL    = 'http://localhost:3000/api/cases';
    const STATIC_URL = 'data/cases.json';
    let allCases     = [];

    // ── load data ────────────────────────────────────────────
    try {
        let res;
        try { res = await fetch(API_URL); } catch (e) {}
        if (!res || !res.ok) res = await fetch(STATIC_URL);
        if (!res.ok) throw new Error('data unavailable');
        allCases = await res.json();
        renderAll(allCases);
    } catch (err) {
        console.error(err);
        if (grid)     grid.innerHTML     = '<div style="grid-column:1/-1;text-align:center;color:#b5152b;font-family:Inter,sans-serif;padding:40px;">Failed to load projects.</div>';
        if (featGrid) featGrid.innerHTML = '';
    }

    // ── screenshot helper ─────────────────────────────────────
    function screenshotSrc(url) {
        return 'https://api.microlink.io/?url=' + encodeURIComponent(url) + '&screenshot=true&meta=false&embed=screenshot.url';
    }

    // ── render ────────────────────────────────────────────────
    function renderAll(cases) {
        const featured = cases.filter(function(c) { return c.featured; });
        const regular  = cases.filter(function(c) { return !c.featured; });

        // Featured row
        if (featGrid) {
            featGrid.innerHTML = '';
            featured.forEach(function(c) {
                var img = screenshotSrc(c.link);
                var card = document.createElement('a');
                card.href = 'javascript:void(0)';
                card.className = 'hj-feat-card';
                card.setAttribute('onclick', "openCaseModal('" + c.id + "')");
                card.innerHTML =
                    '<div class="hj-feat-img">' +
                        '<img src="' + img + '" alt="' + c.title + '" loading="lazy" onerror="this.src=\'assets/hassam.png\'">' +
                        '<div class="hj-feat-overlay"><span>View Project</span></div>' +
                    '</div>' +
                    '<div class="hj-feat-body">' +
                        '<div class="hj-feat-cat">' + c.category + '</div>' +
                        '<div class="hj-feat-title">' + c.title + '</div>' +
                    '</div>';
                featGrid.appendChild(card);
            });
        }

        // Regular grid
        if (grid) {
            grid.innerHTML = '';
            regular.forEach(function(c) {
                var img = screenshotSrc(c.link);
                var arrowSVG =
                    '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M2.26 37.74L37.74 2.26" stroke="white" stroke-width="2" stroke-linecap="round"/>' +
                        '<path d="M2.26 2.26L37.74 2.26L37.74 37.74" stroke="white" stroke-width="2" stroke-linecap="round"/>' +
                    '</svg>';
                var card = document.createElement('a');
                card.href = 'javascript:void(0)';
                card.className = 'custom-case-item';
                card.setAttribute('onclick', "openCaseModal('" + c.id + "')");
                card.innerHTML =
                    '<div class="custom-case-img">' +
                        '<img src="' + img + '" alt="' + c.title + '" loading="lazy" onerror="this.src=\'assets/hassam.png\'">' +
                    '</div>' +
                    '<div class="custom-case-content">' +
                        '<div class="custom-case-info">' +
                            '<h4>' + c.title + '</h4>' +
                            '<p>' + c.category + '</p>' +
                        '</div>' +
                        '<div class="custom-case-arrow">' + arrowSVG + '</div>' +
                    '</div>';
                grid.appendChild(card);
            });
        }
    }

    // ── modal ─────────────────────────────────────────────────
    var modalOverlay = document.getElementById('customModalOverlay');
    var closeBtn     = document.getElementById('customModalClose');
    var mTitle       = document.getElementById('modalTitle');
    var mCat         = document.getElementById('modalCat');
    var mDesc        = document.getElementById('modalDesc');
    var mLink        = document.getElementById('modalLink');
    var mSlides      = document.getElementById('modalSlides');
    var btnPrev      = document.getElementById('modalPrev');
    var btnNext      = document.getElementById('modalNext');
    var currentSlideIdx = 0;
    var slideImages     = [];

    window.openCaseModal = function(id) {
        var project = allCases.find(function(c) { return c.id === id; });
        if (!project) return;

        mTitle.innerText = project.title;
        mCat.innerText   = project.category;
        mDesc.innerText  = project.description || '';
        mLink.href       = project.link;

        mSlides.innerHTML = '';
        slideImages = (project.images && project.images.length > 0)
            ? project.images
            : [screenshotSrc(project.link)];
        currentSlideIdx = 0;

        slideImages.forEach(function(src, idx) {
            var img = document.createElement('img');
            img.src = src;
            img.onerror = function() { img.src = 'assets/hassam.png'; };
            if (idx === 0) img.className = 'active';
            mSlides.appendChild(img);
        });

        btnPrev.style.display = slideImages.length > 1 ? 'block' : 'none';
        btnNext.style.display = slideImages.length > 1 ? 'block' : 'none';

        modalOverlay.style.display = 'flex';
        setTimeout(function() { modalOverlay.classList.add('show'); }, 10);
    };

    function closeModal() {
        modalOverlay.classList.remove('show');
        setTimeout(function() { modalOverlay.style.display = 'none'; }, 300);
    }

    if (closeBtn)     closeBtn.onclick     = closeModal;
    if (modalOverlay) modalOverlay.onclick  = function(e) { if (e.target === modalOverlay) closeModal(); };
    if (btnNext)      btnNext.onclick       = function() { moveSlide(1); };
    if (btnPrev)      btnPrev.onclick       = function() { moveSlide(-1); };

    function moveSlide(dir) {
        if (slideImages.length <= 1) return;
        var imgs = mSlides.querySelectorAll('img');
        imgs[currentSlideIdx].classList.remove('active');
        currentSlideIdx = (currentSlideIdx + dir + slideImages.length) % slideImages.length;
        imgs[currentSlideIdx].classList.add('active');
    }
});
