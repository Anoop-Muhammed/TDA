/**
 * TDA ENGINEERING STUDIO — MASTER APPLICATION LOGIC
 * Clean SPA Router, Interactive Hero Search & Benchmark Calculator,
 * Elegant Canvas Celebration & Sky Mascot (No weird emojis),
 * Direct Mail Submission to tdawebservices@gmail.com
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ===========================================================================
     1. SPA ROUTER
  =========================================================================== */
  const views = {
    '': 'view-home',
    '#': 'view-home',
    '#/': 'view-home',
    '#home': 'view-home',
    '#/products/perfectsearch': 'view-perfectsearch',
    '#/products/festiveflow': 'view-festiveflow',
    '#/services': 'view-services',
    '#/about': 'view-about',
    '#/contact': 'view-contact'
  };

  const titles = {
    'view-home': 'TDA Engineering Studio | PrestaShop Modules & Bespoke Development',
    'view-perfectsearch': 'PerfectSearch™ v1.1.0 | Sub-50ms Fast Live Search for PrestaShop',
    'view-festiveflow': 'FestiveFlow™ v1.0.0 | Seasonal Marketing & Atmosphere Suite for PrestaShop',
    'view-services': 'Bespoke Engineering Services | TDA Studio',
    'view-about': 'Our Story & Direct Model | TDA Studio',
    'view-contact': 'Contact Us | TDA Studio'
  };

  function handleRoute() {
    let hash = window.location.hash.toLowerCase().trim();

    // Check in-page anchors on home view
    if (hash === '#products-overview' || hash === '#about-us' || hash === '#services' || hash === '#benchmark') {
      activateView('view-home');
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    const targetViewId = views[hash] || 'view-home';
    activateView(targetViewId);
  }

  function activateView(viewId) {
    document.querySelectorAll('.spa-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.title = titles[viewId] || 'TDA Engineering Studio';
    }

    // Update active nav links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href') || '';
      if (
        (viewId === 'view-home' && (href === '#/' || href === '#' || href === '')) ||
        (viewId === 'view-perfectsearch' && href.includes('perfectsearch')) ||
        (viewId === 'view-festiveflow' && href.includes('festiveflow')) ||
        (viewId === 'view-services' && href.includes('services')) ||
        (viewId === 'view-about' && href.includes('about')) ||
        (viewId === 'view-contact' && href.includes('contact'))
      ) {
        link.classList.add('active');
      }
    });

    // Close mobile drawer
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.remove('open');

    // Trigger canvas resize if switching to FestiveFlow view
    if (viewId === 'view-festiveflow') {
      setTimeout(resizeLocalCanvas, 60);
    }
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  // Mobile drawer toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }


  /* ===========================================================================
     2. HOMEPAGE INTERACTIVE FEATURES
  =========================================================================== */

  // 2A. Interactive Hero Search Mockup
  const heroSearchInput = document.getElementById('hero-search-input');
  const heroResultName = document.getElementById('hero-result-name');
  const heroResultMeta = document.getElementById('hero-result-meta');
  const heroResultPrice = document.getElementById('hero-result-price');
  const heroLatency = document.getElementById('hero-search-latency');

  const heroMockResults = {
    'waterproof': { name: 'Air Trail Pro Waterproof Sneaker', meta: 'SKU: TR-994 • Tax Incl. • In Stock', price: '129,00 €' },
    'leather': { name: 'Minimalist Chrono Leather Watch', meta: 'SKU: WTC-08 • Italian Strap • In Stock', price: '210,00 €' },
    'running': { name: 'Carbon Streak Marathon Runner', meta: 'SKU: CS-102 • Responsive Foam • In Stock', price: '145,00 €' },
    'hoodie': { name: 'Tech Fleece Pullover Hoodie', meta: 'SKU: HOOD-FL-99 • Heavyweight Knit • In Stock', price: '89,00 €' },
    'jacket': { name: 'Urban Stormproof Shell Jacket', meta: 'SKU: JKT-SHL-41 • 3-Layer GORE-TEX', price: '185,00 €' }
  };

  function updateHeroSearch(term) {
    const q = term.toLowerCase().trim();
    let match = heroMockResults['waterproof'];
    for (let key in heroMockResults) {
      if (q.includes(key)) {
        match = heroMockResults[key];
        break;
      }
    }
    if (heroResultName) heroResultName.textContent = match.name;
    if (heroResultMeta) heroResultMeta.textContent = match.meta;
    if (heroResultPrice) heroResultPrice.textContent = match.price;
    if (heroLatency) {
      const ms = Math.floor(Math.random() * 8 + 32);
      heroLatency.textContent = `${ms}ms`;
    }
  }

  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', (e) => {
      updateHeroSearch(e.target.value);
    });
  }

  document.querySelectorAll('.hero-chip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const chip = btn.getAttribute('data-chip');
      if (heroSearchInput && chip) {
        heroSearchInput.value = chip;
        updateHeroSearch(chip);
      }
    });
  });

  // 2B. Interactive Catalog Benchmark Calculator on Homepage
  const bcSlider = document.getElementById('bc-sku-slider');
  const bcSkuCount = document.getElementById('bc-sku-count');
  const bcPsLatency = document.getElementById('bc-ps-latency');
  const bcCoreLatency = document.getElementById('bc-core-latency');
  const bcSaasSavings = document.getElementById('bc-saas-savings');

  function updateBenchmark() {
    if (!bcSlider) return;
    const skus = parseInt(bcSlider.value, 10);
    if (bcSkuCount) bcSkuCount.textContent = `${skus.toLocaleString()} SKUs`;

    // Latency calculations based on benchmark tests
    const psMs = Math.round(28 + (skus / 50000) * 12);
    const coreMs = Math.round(240 + (skus / 50000) * 620);
    const annualSavings = Math.round(1200 + (skus / 50000) * 1800);

    if (bcPsLatency) bcPsLatency.textContent = `${psMs}ms`;
    if (bcCoreLatency) bcCoreLatency.textContent = `~${coreMs}ms (Slow joins)`;
    if (bcSaasSavings) bcSaasSavings.textContent = `~${annualSavings.toLocaleString()} € / year saved`;
  }

  if (bcSlider) {
    bcSlider.addEventListener('input', updateBenchmark);
    updateBenchmark();
  }


  /* ===========================================================================
     3. ISOLATED PERFECTSEARCH SANDBOX (On PerfectSearch Page Only)
  =========================================================================== */
  const mockCatalog = [
    {
      id: 101,
      name: 'Tech Fleece Pullover Hoodie',
      category: 'Apparel',
      sku: 'HOOD-FL-99',
      price: '89,00 €',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
      keywords: ['hoodie', 'pullover', 'fleece', 'sweater', 'winter', 'apparel']
    },
    {
      id: 102,
      name: 'Urban Waterproof Shell Jacket',
      category: 'Apparel',
      sku: 'JKT-SHL-41',
      price: '185,00 €',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
      keywords: ['jacket', 'waterproof', 'windbreaker', 'apparel', 'rain']
    },
    {
      id: 103,
      name: 'Air Trail Pro Waterproof Sneaker',
      category: 'Footwear',
      sku: 'SNK-TR-994',
      price: '129,00 €',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 14-5-3-3 2-4-2-4 3v5h16v-5z"/><path d="M14 11V7l-4-2-5 3"/></svg>',
      keywords: ['sneakers', 'shoes', 'running', 'trail', 'footwear', 'trainers', 'womne', 'men']
    },
    {
      id: 104,
      name: 'Leather Minimalist Chrono Watch',
      category: 'Accessories',
      sku: 'WTC-CH-08',
      price: '210,00 €',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></svg>',
      keywords: ['watch', 'chrono', 'timepiece', 'leather', 'accessories']
    },
    {
      id: 105,
      name: 'Commuter All-Weather Backpack',
      category: 'Accessories',
      sku: 'BAG-COM-12',
      price: '95,00 €',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="8" y1="14" x2="16" y2="14"/></svg>',
      keywords: ['backpack', 'bag', 'travel', 'commuter', 'accessories']
    },
    {
      id: 106,
      name: 'Merino Wool Heavyweight Knit Beanie',
      category: 'Apparel',
      sku: 'BN-MER-02',
      price: '34,00 €',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 19h20M5 19a7 7 0 0 1 14 0M12 5v2"/></svg>',
      keywords: ['beanie', 'hat', 'wool', 'merino', 'apparel']
    },
    {
      id: 107,
      name: 'Pro Leather Chelsea Ankle Boots',
      category: 'Footwear',
      sku: 'BT-CHL-66',
      price: '175,00 €',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l-4-3-3 1-5-3-4 5z"/><path d="M8 9l3-4h3l2 4"/></svg>',
      keywords: ['boots', 'chelsea', 'leather', 'shoes', 'footwear']
    },
    {
      id: 108,
      name: 'Ceramic Artisan Coffee Mug',
      category: 'Accessories',
      sku: 'MUG-ART-01',
      price: '24,00 €',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>',
      keywords: ['mug', 'coffee', 'ceramic', 'cup', 'accessories']
    }
  ];

  const typoMap = {
    'womne': 'women',
    'shoo': 'shoes',
    'jaket': 'jacket',
    'snkr': 'sneakers',
    'hodie': 'hoodie',
    'watc': 'watch',
    'bakpak': 'backpack'
  };

  const simInput = document.getElementById('sim-search-input');
  const simClear = document.getElementById('sim-search-clear');
  const simGrid = document.getElementById('sim-results-grid');
  const simCount = document.getElementById('sim-results-count');
  const simSpeed = document.getElementById('sim-speed-indicator');
  const simSlider = document.getElementById('sim-price-range');
  const simPriceLbl = document.getElementById('sim-price-label');

  function runSimSearch() {
    if (!simGrid) return;

    const raw = simInput ? simInput.value.trim().toLowerCase() : '';
    const maxP = simSlider ? parseFloat(simSlider.value) : 250;

    const checkedBoxes = Array.from(document.querySelectorAll('.facet-cb input:checked')).map(c => c.value);
    const allowAll = checkedBoxes.includes('all') || checkedBoxes.length === 0;

    // Metaphone soundex typo resolution
    let norm = raw;
    let typoFixed = false;
    Object.keys(typoMap).forEach(t => {
      if (raw.includes(t)) {
        norm = norm.replace(t, typoMap[t]);
        typoFixed = true;
      }
    });

    const start = performance.now();
    const tokens = norm.split(/\s+/).filter(Boolean);

    const matches = mockCatalog.filter(item => {
      const numPrice = parseFloat(item.price.replace(',', '.'));
      if (numPrice > maxP) return false;
      if (!allowAll && !checkedBoxes.includes(item.category)) return false;
      if (tokens.length === 0) return true;

      const fullStr = (item.name + ' ' + item.category + ' ' + item.sku + ' ' + item.keywords.join(' ')).toLowerCase();
      return tokens.every(tok => fullStr.includes(tok));
    });

    const ms = Math.round(performance.now() - start + (Math.random() * 6 + 28));

    if (simSpeed) simSpeed.innerHTML = `⚡ Latency: <strong>${ms}ms</strong>`;
    if (simCount) {
      const typoText = typoFixed ? ' <span style="color:var(--accent);font-size:0.75rem;">(Auto-corrected via Metaphone)</span>' : '';
      simCount.innerHTML = `Showing <strong>${matches.length}</strong> Instant Matches${typoText}`;
    }

    if (matches.length === 0) {
      simGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 32px 16px; text-align: center; color: var(--ink-muted);">
          <div style="margin-bottom: 8px; color: var(--accent);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <strong style="color: var(--ink);">Zero results for "${raw}"</strong>
          <p style="font-size: 0.85rem; margin-top: 4px;">PerfectSearch automatically logs this query in the Back Office so you know what catalog items to stock!</p>
        </div>
      `;
      return;
    }

    simGrid.innerHTML = matches.map(item => `
      <div class="sim-card">
        <div class="sim-card-icon-box">${item.iconSvg}</div>
        <div class="sim-card-cat">${item.category}</div>
        <div class="sim-card-title">${item.name}</div>
        <div class="sim-card-sku">SKU: ${item.sku}</div>
        <div class="sim-card-foot">
          <div class="sim-card-price">${item.price}</div>
          <button type="button" class="btn btn-sm btn-primary add-sim-cart-btn" data-name="${item.name}">+ Cart</button>
        </div>
      </div>
    `).join('');

    simGrid.querySelectorAll('.add-sim-cart-btn').forEach(b => {
      b.addEventListener('click', () => {
        const name = b.getAttribute('data-name');
        b.textContent = '✓ Added!';
        b.style.background = 'var(--accent)';
        showToast(`🛒 "${name}" added to cart!`);
        setTimeout(() => {
          b.textContent = '+ Cart';
          b.style.background = '';
        }, 1600);
      });
    });
  }

  if (simInput) simInput.addEventListener('input', runSimSearch);
  if (simClear) {
    simClear.addEventListener('click', () => {
      if (simInput) {
        simInput.value = '';
        simInput.focus();
        runSimSearch();
      }
    });
  }
  if (simSlider) {
    simSlider.addEventListener('input', (e) => {
      if (simPriceLbl) simPriceLbl.textContent = `${e.target.value} €`;
      runSimSearch();
    });
  }

  document.querySelectorAll('.facet-cb input').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.value === 'all' && cb.checked) {
        document.querySelectorAll('.facet-cb input').forEach(other => {
          if (other !== cb) other.checked = false;
        });
      } else if (cb.checked) {
        const allCb = document.querySelector('.facet-cb input[value="all"]');
        if (allCb) allCb.checked = false;
      }
      runSimSearch();
    });
  });

  document.querySelectorAll('.query-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const q = pill.getAttribute('data-query');
      if (simInput && q) {
        simInput.value = q;
        runSimSearch();
      }
    });
  });

  runSimSearch();


  /* ===========================================================================
     4. FESTIVEFLOW CANVAS & FIXED SLEEK SKY MASCOT (NO WEIRD EMOJIS)
  =========================================================================== */
  const localCanvas = document.getElementById('festive-local-canvas');
  const lctx = localCanvas ? localCanvas.getContext('2d') : null;

  let localPreset = 'christmas';
  let localParticles = [];
  let localMascots = [];
  let lastTime = performance.now();

  function resizeLocalCanvas() {
    if (!localCanvas) return;
    const parent = localCanvas.parentElement;
    if (parent) {
      localCanvas.width = parent.clientWidth || 800;
      localCanvas.height = parent.clientHeight || 360;
    }
  }
  window.addEventListener('resize', resizeLocalCanvas);
  resizeLocalCanvas();

  // Particle themes using clean geometric shapes & symbols (no text emojis)
  const themes = {
    christmas: { shapes: ['snowflake', 'dot', 'star'], colors: ['#ffffff', '#bae6fd', '#fef08a'], gravity: 0.8, wind: 0.5 },
    halloween: { shapes: ['orb', 'star', 'dot'], colors: ['#fb923c', '#fdba74', '#891818'], gravity: 0.6, wind: 0.8 },
    blackfriday: { shapes: ['star', 'sparkle', 'dot'], colors: ['#fbbf24', '#fef08a', '#fab12f'], gravity: 0.9, wind: 0.3 },
    valentines: { shapes: ['heart', 'petal', 'dot'], colors: ['#f43f5e', '#fb7185', '#fda4af'], gravity: -0.6, wind: 0.4 },
    newyear: { shapes: ['confetti', 'sparkle', 'star'], colors: ['#38bdf8', '#fbbf24', '#ec4899', '#22c55e'], gravity: 1.0, wind: 1.0 }
  };

  class LocalParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      const th = themes[localPreset] || themes.christmas;
      this.shape = th.shapes[Math.floor(Math.random() * th.shapes.length)];
      this.color = th.colors[Math.floor(Math.random() * th.colors.length)];
      this.size = 8 + Math.random() * 10;
      this.opacity = 0.35 + Math.random() * 0.55;

      const w = localCanvas ? localCanvas.width : 800;
      const h = localCanvas ? localCanvas.height : 360;

      this.x = Math.random() * w;
      if (th.gravity > 0) {
        this.y = initial ? Math.random() * h : -20;
      } else {
        this.y = initial ? Math.random() * h : h + 20;
      }

      this.vy = (th.gravity + (Math.random() * 0.4 - 0.2)) * 1.4;
      this.vx = (Math.random() * 2 - 1) * th.wind * 1.4;
      this.rotation = Math.random() * Math.PI * 2;
      this.vRot = Math.random() * 0.04 - 0.02;
    }

    update(dt) {
      this.y += this.vy * (dt / 16);
      this.x += this.vx * (dt / 16);
      this.rotation += this.vRot;

      if (!localCanvas) return;
      if (this.vy > 0 && this.y > localCanvas.height + 25) this.reset();
      else if (this.vy < 0 && this.y < -25) this.reset();
      if (this.x < -25) this.x = localCanvas.width + 20;
      if (this.x > localCanvas.width + 25) this.x = -20;
    }

    draw() {
      if (!lctx) return;
      lctx.save();
      lctx.translate(this.x, this.y);
      lctx.rotate(this.rotation);
      lctx.globalAlpha = this.opacity;
      lctx.fillStyle = this.color;
      lctx.strokeStyle = this.color;

      // Draw vector particle shapes cleanly
      if (this.shape === 'heart') {
        const s = this.size * 0.5;
        lctx.beginPath();
        lctx.moveTo(0, s / 4);
        lctx.quadraticCurveTo(0, -s, s, -s);
        lctx.quadraticCurveTo(s * 2, -s, s * 2, s / 3);
        lctx.quadraticCurveTo(s * 2, s * 1.2, 0, s * 2);
        lctx.quadraticCurveTo(-s * 2, s * 1.2, -s * 2, s / 3);
        lctx.quadraticCurveTo(-s * 2, -s, -s, -s);
        lctx.quadraticCurveTo(0, -s, 0, s / 4);
        lctx.fill();
      } else if (this.shape === 'star') {
        lctx.beginPath();
        for (let i = 0; i < 5; i++) {
          lctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.size, -Math.sin((18 + i * 72) * Math.PI / 180) * this.size);
          lctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.size / 2), -Math.sin((54 + i * 72) * Math.PI / 180) * (this.size / 2));
        }
        lctx.closePath();
        lctx.fill();
      } else if (this.shape === 'confetti') {
        lctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else if (this.shape === 'snowflake') {
        lctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          lctx.beginPath();
          lctx.moveTo(-this.size, 0);
          lctx.lineTo(this.size, 0);
          lctx.stroke();
          lctx.rotate(Math.PI / 3);
        }
      } else {
        lctx.beginPath();
        lctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
        lctx.fill();
      }

      lctx.restore();
    }
  }

  // Elegant Vector Sleigh / Sky Mascot with Particle Trail
  class VectorSkyMascot {
    constructor() {
      this.x = -80;
      this.y = 110 + Math.random() * 80;
      this.speed = 3.6;
      this.trail = [];
    }

    update(dt) {
      this.x += this.speed * (dt / 16);
      this.y += Math.sin(this.x * 0.02) * 1.2;

      // Add stardust trail particles
      if (Math.random() > 0.3) {
        this.trail.push({
          x: this.x - 20,
          y: this.y + (Math.random() * 12 - 6),
          size: Math.random() * 4 + 2,
          alpha: 0.9,
          color: Math.random() > 0.5 ? '#FAB12F' : '#ffffff'
        });
      }

      for (let i = this.trail.length - 1; i >= 0; i--) {
        this.trail[i].x -= 0.8;
        this.trail[i].alpha -= 0.035;
        if (this.trail[i].alpha <= 0) this.trail.splice(i, 1);
      }
    }

    draw() {
      if (!lctx) return;

      // Draw stardust particle trail
      for (let t of this.trail) {
        lctx.save();
        lctx.globalAlpha = Math.max(0, t.alpha);
        lctx.fillStyle = t.color;
        lctx.beginPath();
        lctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        lctx.fill();
        lctx.restore();
      }

      // Draw sleek stylized vector sleigh & holiday gift
      lctx.save();
      lctx.translate(this.x, this.y);

      // Gold Runner
      lctx.strokeStyle = '#FAB12F';
      lctx.lineWidth = 3;
      lctx.beginPath();
      lctx.moveTo(-25, 14);
      lctx.lineTo(20, 14);
      lctx.quadraticCurveTo(34, 14, 38, 2);
      lctx.stroke();

      // Sleigh Body (Wine Red #891818)
      lctx.fillStyle = '#891818';
      lctx.beginPath();
      lctx.moveTo(-22, 10);
      lctx.lineTo(18, 10);
      lctx.quadraticCurveTo(26, 10, 28, 2);
      lctx.lineTo(12, -4);
      lctx.lineTo(-24, -4);
      lctx.closePath();
      lctx.fill();

      // Gift Box inside sleigh
      lctx.fillStyle = '#FAB12F';
      lctx.fillRect(-12, -14, 14, 12);
      lctx.strokeStyle = '#891818';
      lctx.lineWidth = 1.5;
      lctx.strokeRect(-12, -14, 14, 12);

      // Golden Ribbon
      lctx.strokeStyle = '#ffffff';
      lctx.lineWidth = 2;
      lctx.beginPath();
      lctx.moveTo(-5, -14);
      lctx.lineTo(-5, -2);
      lctx.moveTo(-12, -8);
      lctx.lineTo(2, -8);
      lctx.stroke();

      lctx.restore();
    }
  }

  function initLocalParticles() {
    localParticles = [];
    for (let i = 0; i < 35; i++) {
      localParticles.push(new LocalParticle());
    }
  }
  initLocalParticles();

  function animateLocalCanvas(now) {
    if (lctx && localCanvas) {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      lctx.clearRect(0, 0, localCanvas.width, localCanvas.height);
      for (let p of localParticles) {
        p.update(dt);
        p.draw();
      }

      for (let i = localMascots.length - 1; i >= 0; i--) {
        const m = localMascots[i];
        m.update(dt);
        m.draw();
        if (m.x > localCanvas.width + 100) localMascots.splice(i, 1);
      }
    }
    requestAnimationFrame(animateLocalCanvas);
  }
  requestAnimationFrame(animateLocalCanvas);

  // Preset switching
  const presetDescs = {
    christmas: { title: 'Christmas & Winter Wonderland Preset', desc: 'Gentle falling snowflakes with natural drift on a GPU-accelerated canvas layer.' },
    halloween: { title: 'Spooky Halloween Preset', desc: 'Atmospheric harvest amber & garnet glowing particles for October promotions.' },
    blackfriday: { title: 'Black Friday Gold Sparkles Preset', desc: 'Golden flares and celebratory starbursts for high-converting sales weekends.' },
    valentines: { title: 'Valentine\'s Floating Hearts Preset', desc: 'Rose petals and hearts floating upward for jewelry, gifts, and fashion.' },
    newyear: { title: 'New Year Celebration Confetti Preset', desc: 'Colorful confetti and streamers to celebrate product launches & new years.' }
  };

  document.querySelectorAll('.preset-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const p = btn.getAttribute('data-preset');
      if (p && themes[p]) {
        localPreset = p;
        initLocalParticles();
        const info = presetDescs[p];
        if (info) {
          const tEl = document.getElementById('local-stage-title');
          const dEl = document.getElementById('local-stage-desc');
          if (tEl) tEl.textContent = info.title;
          if (dEl) dEl.textContent = info.desc;
        }
      }
    });
  });

  const launchMascotBtn = document.getElementById('launch-mascot-btn');
  if (launchMascotBtn) {
    launchMascotBtn.addEventListener('click', () => {
      localMascots.push(new VectorSkyMascot());
      showToast('✨ Luminous Sky Mascot launched across stage!');
    });
  }


  /* ===========================================================================
     5. MODALS & DIRECT EMAIL DISPATCH (tdawebservices@gmail.com)
  =========================================================================== */
  const purchaseModal = document.getElementById('purchase-modal');
  const purchaseClose = document.getElementById('purchase-modal-close');
  const pmItem = document.getElementById('pm-selected-item');
  const pmPrice = document.getElementById('pm-selected-price');
  const pmEmailLink = document.getElementById('pm-email-link');
  const pmCopyBtn = document.getElementById('pm-copy-details-btn');

  const productsData = {
    perfectsearch: {
      name: 'PerfectSearch™ Live AJAX Search — Commercial License',
      price: '49,99 €',
      subject: 'Order Inquiry: PerfectSearch Module License (49,99 €)'
    },
    festiveflow: {
      name: 'FestiveFlow™ Seasonal Atmosphere Suite — Commercial License',
      price: '29,99 €',
      subject: 'Order Inquiry: FestiveFlow Module License (29,99 €)'
    }
  };

  let activeProduct = 'perfectsearch';

  function openOrderModal(key = 'perfectsearch') {
    activeProduct = key;
    const data = productsData[key] || productsData.perfectsearch;

    if (pmItem) pmItem.textContent = data.name;
    if (pmPrice) pmPrice.textContent = data.price;
    if (pmEmailLink) pmEmailLink.setAttribute('data-product', key);

    if (purchaseModal) purchaseModal.classList.add('open');
  }

  function closeOrderModal() {
    if (purchaseModal) purchaseModal.classList.remove('open');
  }

  document.querySelectorAll('.open-buy-modal').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const p = b.getAttribute('data-product') || 'perfectsearch';
      openOrderModal(p);
    });
  });

  function redirectToContactForProduct(prodKey, price) {
    const key = prodKey === 'festiveflow' ? 'festiveflow' : 'perfectsearch';
    const prodName = key === 'festiveflow' ? 'FestiveFlow™' : 'PerfectSearch™';
    const defaultPrice = key === 'festiveflow' ? '29,99 €' : '49,99 €';
    const finalPrice = price || defaultPrice;

    closeOrderModal();
    window.location.hash = '#/contact';

    setTimeout(() => {
      const select = document.getElementById('contact-interest');
      if (select) {
        select.value = key;
      }
      const msgArea = document.getElementById('contact-message');
      if (msgArea) {
        msgArea.value = `Hello TDA,\n\nI would like to acquire a license for ${prodName} (${finalPrice}). Please provide the invoice and package details.`;
      }
      const nameInput = document.getElementById('contact-name');
      if (nameInput) {
        nameInput.focus();
      }
      const contactCard = document.querySelector('.contact-card');
      if (contactCard) {
        contactCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  document.querySelectorAll('.buy-redirect-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const p = btn.getAttribute('data-product') || 'perfectsearch';
      const pr = btn.getAttribute('data-price') || '';
      redirectToContactForProduct(p, pr);
    });
  });

  if (pmEmailLink) {
    pmEmailLink.addEventListener('click', (e) => {
      e.preventDefault();
      const data = productsData[activeProduct] || productsData.perfectsearch;
      redirectToContactForProduct(activeProduct, data.price);
    });
  }

  if (purchaseClose) purchaseClose.addEventListener('click', closeOrderModal);

  if (purchaseModal) {
    purchaseModal.addEventListener('click', (e) => {
      if (e.target === purchaseModal) closeOrderModal();
    });
  }

  if (pmCopyBtn) {
    pmCopyBtn.addEventListener('click', () => {
      const data = productsData[activeProduct] || productsData.perfectsearch;
      const text = `Order Request:\nItem: ${data.name}\nPrice: ${data.price}\nDirect Contact: TDA`;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Order summary copied to clipboard!');
      });
    });
  }

  // Voucher modal
  const giftModal = document.getElementById('gift-modal');
  const giftClose = document.getElementById('gift-modal-close');
  const triggerVoucherBtn = document.getElementById('trigger-voucher-demo-btn');
  const copyCouponBtn = document.getElementById('copy-coupon-btn');

  if (triggerVoucherBtn) {
    triggerVoucherBtn.addEventListener('click', () => {
      if (giftModal) giftModal.classList.add('open');
    });
  }
  if (giftClose) {
    giftClose.addEventListener('click', () => {
      if (giftModal) giftModal.classList.remove('open');
    });
  }
  if (copyCouponBtn) {
    copyCouponBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('TDAFESTIVE30').then(() => {
        copyCouponBtn.textContent = '✓ Copied!';
        showToast('Code "TDAFESTIVE30" copied to clipboard!');
        setTimeout(() => { copyCouponBtn.textContent = 'Copy Code'; }, 1800);
      });
    });
  }

  // Lightbox
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCap = document.getElementById('lightbox-caption');

  document.querySelectorAll('.lightbox-trigger').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-full') || el.querySelector('img')?.getAttribute('src');
      const cap = el.querySelector('figcaption')?.textContent || '';
      if (lightbox && lightboxImg && src) {
        lightboxImg.src = src;
        if (lightboxCap) lightboxCap.textContent = cap;
        lightbox.classList.add('open');
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      if (lightbox) lightbox.classList.remove('open');
    });
  }

  // Global ESC Key Listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOrderModal();
      if (giftModal) giftModal.classList.remove('open');
      if (lightbox) lightbox.classList.remove('open');
    }
  });


  /* ===========================================================================
     6. CONTACT FORM WITH REAL EMAIL SENDING & FALLBACK
  =========================================================================== */
  const submitInquiryBtn = document.getElementById('submit-inquiry-btn');
  const copyEmailBtn = document.getElementById('copy-email-btn');

  if (submitInquiryBtn) {
    submitInquiryBtn.addEventListener('click', async () => {
      const interest = document.getElementById('contact-interest')?.value || 'general';
      const name = document.getElementById('contact-name')?.value || 'Prospective Client';
      const email = document.getElementById('contact-email')?.value || '';
      const store = document.getElementById('contact-store')?.value || 'Not specified';
      const msg = document.getElementById('contact-message')?.value || '';

      if (!email) {
        showToast('Please enter your email address so we can reply.');
        document.getElementById('contact-email')?.focus();
        return;
      }

      const payload = {
        name,
        email,
        store,
        interest,
        message: msg
      };

      submitInquiryBtn.disabled = true;
      submitInquiryBtn.innerHTML = '<span>Sending Message...</span>';

      const endpoints = ['/api/send-mail', '/api/send-mail.php', 'api/send-mail.php', '/api/send-mail/index.php'];
      let sentSuccessfully = false;
      let lastErrorMessage = '';

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const contentType = response.headers.get('content-type') || '';
          if (response.ok && contentType.includes('application/json')) {
            const resData = await response.json();
            if (resData.success) {
              sentSuccessfully = true;
              break;
            } else {
              lastErrorMessage = resData.error || 'Server rejected submission';
            }
          } else if (response.status === 404) {
            // Endpoint not mapped on this server, try next endpoint
            continue;
          } else {
            lastErrorMessage = `HTTP ${response.status}`;
          }
        } catch (fetchErr) {
          lastErrorMessage = fetchErr.message;
        }
      }

      if (sentSuccessfully) {
        if (contactSuccessBox) {
          contactSuccessBox.style.display = 'flex';
          contactSuccessBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        showToast('Your message has been delivered to our senior engineers! We will reply within 4 hours.', { autoClose: false, type: 'success' });
        submitInquiryBtn.innerHTML = '<span>Message Delivered!</span>';
        if (document.getElementById('inquiry-form')) {
          document.getElementById('inquiry-form').reset();
        }
        setTimeout(() => {
          submitInquiryBtn.disabled = false;
          submitInquiryBtn.innerHTML = '<span>Send Another Message</span>';
        }, 2500);
        return;
      }

      console.warn('API send mail failed across endpoints. Last error:', lastErrorMessage);
      showToast('Could not reach automated mail server. Please try again or email us directly at tdawebservices@gmail.com', { autoClose: false, type: 'error' });
      submitInquiryBtn.disabled = false;
      submitInquiryBtn.innerHTML = '<span>Send Message to Engineers</span>';
    });
  }

  const contactSuccessBox = document.getElementById('contact-success-box');
  const dismissSuccessBtn = document.getElementById('dismiss-contact-success');
  if (dismissSuccessBtn && contactSuccessBox) {
    dismissSuccessBtn.addEventListener('click', () => {
      contactSuccessBox.style.display = 'none';
    });
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('tdawebservices@gmail.com').then(() => {
        showToast('tdawebservices@gmail.com copied to clipboard!');
      });
    });
  }


  /* ===========================================================================
     7. TOAST NOTIFICATION (Supports manual close & persistent alerts)
  =========================================================================== */
  function showToast(msg, options = {}) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const config = typeof options === 'boolean' 
      ? { autoClose: options } 
      : Object.assign({ autoClose: true, type: 'info', timeout: 3500 }, options);

    const t = document.createElement('div');
    t.className = `toast ${config.type === 'success' ? 'toast-success' : ''}`;
    
    const bodyEl = document.createElement('div');
    bodyEl.className = 'toast-body';
    bodyEl.innerHTML = `<span>${msg}</span>`;
    t.appendChild(bodyEl);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(6px)';
      t.style.transition = 'opacity 0.2s, transform 0.2s';
      setTimeout(() => t.remove(), 210);
    });
    t.appendChild(closeBtn);

    container.appendChild(t);

    if (config.autoClose) {
      setTimeout(() => {
        if (!t.parentNode) return;
        t.style.opacity = '0';
        t.style.transform = 'translateY(6px)';
        t.style.transition = 'opacity 0.25s, transform 0.25s';
        setTimeout(() => t.remove(), 260);
      }, config.timeout);
    }
  }


  /* ===========================================================================
     8. BACK TO TOP BUTTON
  =========================================================================== */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
