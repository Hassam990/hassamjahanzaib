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

    // ── arrow SVG ─────────────────────────────────────────────
    var arrowSVG =
        '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M2.26 37.74L37.74 2.26" stroke="white" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M2.26 2.26L37.74 2.26L37.74 37.74" stroke="white" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>';

    // ── render ────────────────────────────────────────────────
    function renderAll(cases) {
        var featured = cases.filter(function(c) { return c.featured; });
        var regular  = cases.filter(function(c) { return !c.featured; });

        // Featured row — clicking opens project in new tab
        if (featGrid) {
            featGrid.innerHTML = '';
            featured.forEach(function(c) {
                var img  = screenshotSrc(c.link);
                var card = document.createElement('a');
                card.href   = c.link;
                card.target = '_blank';
                card.rel    = 'noopener noreferrer';
                card.className = 'hj-feat-card';
                card.innerHTML =
                    '<div class="hj-feat-img">' +
                        '<img src="' + img + '" alt="' + c.title + '" loading="lazy" onerror="this.src=\'assets/hassam.png\'">' +
                        '<div class="hj-feat-overlay"><span>Visit Project ↗</span></div>' +
                    '</div>' +
                    '<div class="hj-feat-body">' +
                        '<div class="hj-feat-cat">' + c.category + '</div>' +
                        '<div class="hj-feat-title">' + c.title + '</div>' +
                    '</div>';
                featGrid.appendChild(card);
            });
        }

        // Regular grid — clicking opens project in new tab
        if (grid) {
            grid.innerHTML = '';
            regular.forEach(function(c) {
                var img  = screenshotSrc(c.link);
                var card = document.createElement('a');
                card.href   = c.link;
                card.target = '_blank';
                card.rel    = 'noopener noreferrer';
                card.className = 'custom-case-item';
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

});
