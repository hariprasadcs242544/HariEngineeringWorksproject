// Products Catalog JavaScript Logic

let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products-grid-container');
  const searchInput = document.getElementById('product-search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Load products on start if container is present
  if (productsContainer) {
    fetchProducts();
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const category = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'All';
      
      renderProducts(category, query);
    });
  }

  // Filter category handler
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

      renderProducts(category, query);
    });
  });
});

async function fetchProducts() {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
      <i class="fa-solid fa-gear fa-spin" style="font-size: 2.5rem; color: var(--primary-blue);"></i>
      <p style="margin-top: 1rem; color: var(--text-muted);">Loading engineering products catalog...</p>
    </div>
  `;

  try {
    const response = await fetch('/api/products');
    const resData = await response.json();

    if (resData.success && Array.isArray(resData.data)) {
      allProducts = resData.data;
      
      // Check URL query parameters for pre-selected category
      const urlParams = new URLSearchParams(window.location.search);
      const preCategory = urlParams.get('category');
      if (preCategory) {
        const targetBtn = Array.from(document.querySelectorAll('.filter-btn')).find(
          b => b.getAttribute('data-category').toLowerCase() === preCategory.toLowerCase()
        );
        if (targetBtn) targetBtn.click();
        else renderProducts('All', '');
      } else {
        renderProducts('All', '');
      }
    } else {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #ffffff; border-radius: var(--radius-md);">
          <p style="color: var(--danger);">Failed to load product catalog.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #ffffff; border-radius: var(--radius-md);">
        <p style="color: var(--danger);">Unable to connect to product server.</p>
      </div>
    `;
  }
}

function renderProducts(categoryFilter = 'All', searchQuery = '') {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  let filtered = [...allProducts];

  if (categoryFilter !== 'All') {
    filtered = filtered.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery) ||
      p.shortDescription.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: #ffffff; border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <i class="fa-solid fa-box-open" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem;"></i>
        <h4>No products found</h4>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try clearing your search query or selecting a different category filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(product => {
    const mainImg = product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80';

    const specPreview = product.specifications && product.specifications.length > 0 
      ? product.specifications[0] 
      : null;

    return `
      <div class="product-card fade-in-up visible">
        <div class="product-img-wrapper">
          <img src="${mainImg}" alt="${product.name}" loading="lazy">
          <span class="product-cat-badge">${product.category}</span>
        </div>
        <div class="product-card-body">
          <h3 class="product-card-title">${product.name}</h3>
          <p class="product-card-desc">${product.shortDescription}</p>

          ${specPreview ? `
            <div class="product-spec-preview">
              <div class="product-spec-row">
                <span>${specPreview.key}:</span>
                <strong>${specPreview.value}</strong>
              </div>
            </div>
          ` : ''}

          <div style="display: flex; gap: 0.5rem; margin-top: auto;">
            <a href="/product-detail?id=${product._id || product.slug}" class="btn btn-secondary btn-sm" style="flex: 1;">
              View Details <i class="fa-solid fa-arrow-right" style="font-size: 0.8rem;"></i>
            </a>
            <a href="/contact?product=${encodeURIComponent(product.name)}" class="btn btn-primary btn-sm">
              Enquire
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
