// Admin Panel Management JavaScript Logic — JWT-authenticated

let adminProducts = [];
let adminEnquiries = [];
let adminToken = sessionStorage.getItem('adminToken') || null; // Persisted in sessionStorage

// ─── Initialise ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const adminAuthModal = document.getElementById('admin-auth-modal');
  const adminPassInput = document.getElementById('admin-pass-input');
  const adminUsernameInput = document.getElementById('admin-username-input');
  const adminAuthBtn = document.getElementById('admin-auth-btn');

  // If already authenticated via sessionStorage, open portal directly
  if (adminToken) {
    if (adminAuthModal) adminAuthModal.style.display = 'none';
    const statusBadge = document.getElementById('admin-status-badge');
    if (statusBadge) statusBadge.style.display = 'inline-block';
    loadAdminData();
    initSocketIO();
  }

  // Tab Switching
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
      const el = document.getElementById(`tab-${target}`);
      if (el) el.style.display = 'block';

      // Load data when each tab opens
      if (target === 'dashboard') loadDashboardStats();
      if (target === 'enquiries') fetchAdminEnquiries();
      if (target === 'products') fetchAdminProducts();
    });
  });

  // Auth via JWT API
  if (adminAuthBtn) {
    adminAuthBtn.addEventListener('click', loginAdmin);
    adminPassInput && adminPassInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loginAdmin();
    });
  }

  // Product Modal Controls
  const addProductBtn = document.getElementById('add-product-btn');
  const productModal = document.getElementById('product-modal');
  const productForm = document.getElementById('product-form');

  if (addProductBtn && productModal) {
    addProductBtn.addEventListener('click', () => {
      document.getElementById('modal-title').textContent = 'Add New Industrial Product';
      document.getElementById('product-id').value = '';
      productForm.reset();
      const preview = document.getElementById('prod-img-preview');
      if (preview) preview.src = '/images/products/high-pressure-direct-drive-centrifugal-blower.png';
      const statusEl = document.getElementById('upload-status');
      if (statusEl) statusEl.textContent = '';
      productModal.style.display = 'flex';
    });
  }

  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveProduct();
    });
  }

  // Auto-poll for new enquiries every 30 seconds when logged in
  setInterval(() => {
    if (adminToken) fetchAdminEnquiries(true);
  }, 30000);
});

// ─── JWT Login ────────────────────────────────────────────────────────────────
async function loginAdmin() {
  const usernameInput = document.getElementById('admin-username-input');
  const passInput = document.getElementById('admin-pass-input');
  const authBtn = document.getElementById('admin-auth-btn');
  const errorEl = document.getElementById('auth-error');

  const username = usernameInput ? usernameInput.value.trim() : 'admin';
  const password = passInput ? passInput.value : '';

  if (!password) {
    if (errorEl) { errorEl.textContent = 'Please enter the password.'; errorEl.style.display = 'block'; }
    return;
  }

  authBtn.disabled = true;
  authBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      adminToken = data.token;
      sessionStorage.setItem('adminToken', data.token);
      document.getElementById('admin-auth-modal').style.display = 'none';
      const statusBadge = document.getElementById('admin-status-badge');
      if (statusBadge) statusBadge.style.display = 'inline-block';
      loadAdminData();
      initSocketIO();
    } else {
      if (errorEl) { errorEl.textContent = data.error || 'Invalid credentials.'; errorEl.style.display = 'block'; }
    }
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed. Try again.'; errorEl.style.display = 'block'; }
  } finally {
    authBtn.disabled = false;
    authBtn.innerHTML = 'Unlock Dashboard <i class="fa-solid fa-key"></i>';
  }
}

// ─── Helper: Authenticated Fetch ─────────────────────────────────────────────
async function adminFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    sessionStorage.removeItem('adminToken');
    adminToken = null;
    const modal = document.getElementById('admin-auth-modal');
    if (modal) modal.style.display = 'flex';
  }
  return res;
}

function logoutAdmin() {
  sessionStorage.removeItem('adminToken');
  adminToken = null;
  window.location.reload();
}

// ─── Load All Admin Data ──────────────────────────────────────────────────────
async function loadAdminData() {
  loadDashboardStats();
  fetchAdminEnquiries();
  fetchAdminProducts();
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
async function loadDashboardStats() {
  try {
    const res = await adminFetch('/api/admin/dashboard-stats');
    const data = await res.json();
    if (!data.success) return;

    const s = data.data;
    const el = (id) => document.getElementById(id);

    if (el('stat-total-enquiries')) el('stat-total-enquiries').textContent = s.totalEnquiries || 0;
    if (el('stat-new-rfq')) el('stat-new-rfq').textContent = s.rfqs?.new || 0;
    if (el('stat-new-orders')) el('stat-new-orders').textContent = s.orders?.new || 0;
    if (el('stat-new-service')) el('stat-new-service').textContent = s.serviceRequests?.new || 0;
    if (el('stat-total-products')) el('stat-total-products').textContent = s.totalProducts || 0;

    // Recent activity feed
    const feed = el('activity-feed');
    if (feed && s.recentActivity) {
      if (s.recentActivity.length === 0) {
        feed.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem;">No recent activity yet.</p>';
      } else {
        feed.innerHTML = s.recentActivity.map(e => `
          <div style="display:flex; align-items:center; gap:1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-subtle);color:var(--primary-blue);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fa-solid ${e.type === 'Order' ? 'fa-box' : e.type === 'Service Request' ? 'fa-wrench' : 'fa-file-invoice'}"></i>
            </div>
            <div style="flex:1;min-width:0;">
              <p style="margin:0;font-weight:600;font-size:0.9rem;">${e.name} <span style="color:var(--text-muted);font-weight:400;">(${e.company || 'N/A'})</span></p>
              <p style="margin:0;font-size:0.8rem;color:var(--text-muted);">${e.token} · ${e.type} · ${new Date(e.createdAt).toLocaleString('en-IN', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
            </div>
            <span style="background:${e.status==='New'?'#fef3c7':e.status==='Completed'?'#dcfce7':'#e0f2fe'};color:${e.status==='New'?'#b45309':e.status==='Completed'?'#15803d':'#0369a1'};padding:0.2rem 0.6rem;border-radius:50px;font-size:0.75rem;font-weight:700;">${e.status}</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Dashboard stats error:', err);
  }
}

// ─── Enquiries ────────────────────────────────────────────────────────────────
async function fetchAdminEnquiries(silent = false) {
  const container = document.getElementById('enquiries-table-body');
  if (!container) return;

  try {
    const res = await adminFetch('/api/enquiries');
    const data = await res.json();
    if (data.success) {
      const prevCount = adminEnquiries.length;
      adminEnquiries = data.data;
      renderEnquiries();
      // Show toast if new enquiries came in silently
      if (silent && data.data.length > prevCount) {
        const diff = data.data.length - prevCount;
        showToast(`${diff} new enquiry received!`, true);
      }
    }
  } catch (err) {
    console.error('Error fetching enquiries:', err);
  }
}

function renderEnquiries() {
  const container = document.getElementById('enquiries-table-body');
  if (!container) return;

  if (adminEnquiries.length === 0) {
    container.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color:var(--text-muted);">No customer enquiries registered yet.</td></tr>`;
    return;
  }

  container.innerHTML = adminEnquiries.map(enq => {
    const dateStr = new Date(enq.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const tLower = (enq.type || '').toLowerCase();
    const typeIcon = (tLower.includes('order') || tLower.includes('purchase')) ? 'fa-cart-shopping' : tLower.includes('service') ? 'fa-wrench' : tLower.includes('enquiry') ? 'fa-envelope' : 'fa-file-invoice';
    const statusColors = {
      'New': '#fef3c7,#b45309',
      'In Review': '#e0f2fe,#0369a1',
      'Quoted': '#ede9fe,#7c3aed',
      'Confirmed': '#dcfce7,#15803d',
      'In Progress': '#e0f2fe,#0369a1',
      'Completed': '#dcfce7,#15803d',
      'Cancelled': '#fee2e2,#b91c1c'
    };
    const [sBg, sColor] = (statusColors[enq.status] || '#f1f5f9,#475569').split(',');

    return `
      <tr>
        <td><span style="font-family:monospace;font-size:0.82rem;font-weight:600;color:var(--primary-dark);">${enq.token}</span></td>
        <td><i class="fa-solid ${typeIcon}" style="color:var(--primary-blue);margin-right:4px;"></i>${enq.type || 'RFQ'}</td>
        <td><strong>${enq.name}</strong><br><small style="color:var(--text-muted);">${enq.company || 'N/A'}</small></td>
        <td>
          <a href="mailto:${enq.email}" style="color:var(--primary-blue);display:block;">${enq.email}</a>
          <small style="color:var(--text-light);">${enq.phone}</small>
        </td>
        <td><span class="badge-tag" style="font-size:0.72rem;">${enq.productInterested}</span></td>
        <td style="font-size:0.82rem;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${enq.message}">${enq.message}</td>
        <td>
          <select onchange="updateStatus('${enq._id}', this.value)" style="padding:0.25rem 0.5rem;border-radius:var(--radius-sm);font-size:0.8rem;border:1px solid var(--border-color);background:${sBg};color:${sColor};font-weight:600;">
            ${['New','In Review','Quoted','Confirmed','In Progress','Completed','Cancelled'].map(s =>
              `<option value="${s}" ${enq.status === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <button onclick="showEnquiryDetail('${enq._id}')" class="btn btn-sm" style="background:#e0f2fe;color:#0369a1;border:none;padding:0.3rem 0.55rem;margin-right:0.25rem;" title="View Detail">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button onclick="deleteEnquiry('${enq._id}')" class="btn btn-sm" style="background:#fee2e2;color:#dc2626;border:none;padding:0.3rem 0.55rem;" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function showEnquiryDetail(id) {
  const enq = adminEnquiries.find(e => e._id === id);
  if (!enq) return;

  let modal = document.getElementById('enquiry-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'enquiry-detail-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#fff;border-radius:var(--radius-lg);padding:2rem;max-width:600px;width:90%;box-shadow:var(--shadow-xl);max-height:90vh;overflow-y:auto;position:relative;">
      <button onclick="document.getElementById('enquiry-detail-modal').style.display='none'" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.3rem;cursor:pointer;color:var(--text-muted);"><i class="fa-solid fa-xmark"></i></button>
      <h3 style="color:var(--primary-dark);margin-bottom:0.25rem;">${enq.token}</h3>
      <span class="badge-tag">${enq.type}</span>
      <div style="margin:1.25rem 0;display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.9rem;">
        <div><strong>Name:</strong> ${enq.name}</div>
        <div><strong>Company:</strong> ${enq.company || 'N/A'}</div>
        <div><strong>Email:</strong> <a href="mailto:${enq.email}">${enq.email}</a></div>
        <div><strong>Phone:</strong> ${enq.phone}</div>
        <div style="grid-column:1/-1;"><strong>Product:</strong> ${enq.productInterested}</div>
        <div style="grid-column:1/-1;"><strong>Submitted:</strong> ${new Date(enq.createdAt).toLocaleString('en-IN')}</div>
      </div>
      <div style="background:#f8fafc;padding:1rem;border-radius:6px;margin-bottom:1rem;">
        <strong>Message / Requirements:</strong>
        <p style="margin:0.5rem 0 0 0;white-space:pre-line;">${enq.message}</p>
      </div>
      <div class="form-group">
        <label><strong>Admin Notes (Internal):</strong></label>
        <textarea id="detail-notes" class="form-control" rows="2" placeholder="Internal notes for team...">${enq.adminNotes || ''}</textarea>
      </div>
      <div class="form-group">
        <label><strong>Reply / Quote Message (visible to customer on Track page):</strong></label>
        <textarea id="detail-reply" class="form-control" rows="3" placeholder="e.g. Quote: INR 1,25,000 for 2 units. Delivery in 15 working days.">${enq.adminReply || ''}</textarea>
      </div>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
        <button onclick="saveEnquiryDetail('${enq._id}')" class="btn btn-primary btn-sm"><i class="fa-solid fa-floppy-disk"></i> Save Notes & Reply</button>
        <button onclick="document.getElementById('enquiry-detail-modal').style.display='none'" class="btn btn-secondary btn-sm">Close</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

async function saveEnquiryDetail(id) {
  const adminNotes = document.getElementById('detail-notes').value;
  const adminReply = document.getElementById('detail-reply').value;

  try {
    const res = await adminFetch(`/api/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ adminNotes, adminReply })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Notes and reply saved successfully.');
      document.getElementById('enquiry-detail-modal').style.display = 'none';
      fetchAdminEnquiries();
    } else {
      showToast(data.error || 'Failed to save.', false);
    }
  } catch (err) {
    showToast('Error saving details.', false);
  }
}

async function updateStatus(id, newStatus) {
  try {
    const res = await adminFetch(`/api/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Status updated.');
      // Update in-memory to avoid full re-fetch
      const idx = adminEnquiries.findIndex(e => e._id === id);
      if (idx !== -1) adminEnquiries[idx].status = newStatus;
    } else {
      showToast('Failed to update status.', false);
    }
  } catch (err) {
    showToast('Update failed.', false);
  }
}

async function deleteEnquiry(id) {
  if (!confirm('Permanently delete this enquiry record?')) return;
  try {
    const res = await adminFetch(`/api/enquiries/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Enquiry deleted.');
      fetchAdminEnquiries();
    } else {
      showToast(data.error || 'Delete failed.', false);
    }
  } catch (err) {
    showToast('Delete failed.', false);
  }
}

// ─── Products Catalog Management ──────────────────────────────────────────────
async function fetchAdminProducts() {
  const container = document.getElementById('products-table-body');
  if (!container) return;

  container.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading catalog products from database...</td></tr>`;

  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      adminProducts = data.data || [];
      renderAdminProducts();
    } else {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--danger);">${data.error || 'Failed to load products.'}</td></tr>`;
    }
  } catch (err) {
    console.error('Error fetching admin products:', err);
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--danger);">Error loading products from server.</td></tr>`;
  }
}

function renderAdminProducts() {
  const container = document.getElementById('products-table-body');
  if (!container) return;

  if (adminProducts.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2.5rem;color:var(--text-muted);">No products found in catalog. Click "Add New Product" to create one.</td></tr>`;
    return;
  }

  container.innerHTML = adminProducts.map(p => {
    const img = (p.images && p.images.length > 0) ? p.images[0] : '/images/products/high-pressure-direct-drive-centrifugal-blower.png';
    const appsList = Array.isArray(p.applications) ? p.applications : [];
    const appsHtml = appsList.length > 0
      ? appsList.slice(0, 3).map(a => `<span class="badge-tag" style="font-size:0.7rem;margin:2px;background:#f1f5f9;color:#334155;">${a}</span>`).join('') + (appsList.length > 3 ? ` <small style="color:var(--text-muted);font-size:0.72rem;">+${appsList.length - 3} more</small>` : '')
      : '<span style="color:var(--text-muted);font-size:0.8rem;">—</span>';

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <img src="${img}" alt="${p.name}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;border:1px solid var(--border-light);flex-shrink:0;" loading="lazy" onerror="this.src='/images/products/high-pressure-direct-drive-centrifugal-blower.png'">
            <div>
              <strong style="color:var(--text-main);font-size:0.92rem;">${p.name}</strong>
              <div style="font-size:0.78rem;color:var(--text-muted);max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.shortDescription || ''}</div>
            </div>
          </div>
        </td>
        <td><span class="badge-tag" style="font-size:0.73rem;">${p.category}</span></td>
        <td style="max-width:220px;">${appsHtml}</td>
        <td>${p.isFeatured ? '<span style="color:#10b981;font-weight:700;font-size:0.82rem;"><i class="fa-solid fa-star"></i> Featured</span>' : '<span style="color:#94a3b8;font-size:0.82rem;">Standard</span>'}</td>
        <td>
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.isActive!==false?'#10b981':'#ef4444'};margin-right:4px;"></span>
          <span style="font-size:0.8rem;font-weight:600;color:${p.isActive!==false?'#15803d':'#b91c1c'};">${p.isActive!==false?'Active':'Inactive'}</span>
        </td>
        <td>
          <button onclick="editProduct('${p._id}')" class="btn btn-sm" style="background:#e0f2fe;color:#0369a1;border:none;padding:0.35rem 0.65rem;margin-right:0.3rem;" title="Edit Product">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button onclick="deleteProduct('${p._id}')" class="btn btn-sm" style="background:#fee2e2;color:#dc2626;border:none;padding:0.35rem 0.65rem;" title="Delete Product">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function editProduct(id) {
  const p = adminProducts.find(item => item._id === id);
  if (!p) return;

  document.getElementById('modal-title').textContent = 'Edit Product: ' + p.name;
  document.getElementById('product-id').value = p._id;
  document.getElementById('prod-name').value = p.name || '';
  document.getElementById('prod-category').value = p.category || 'Industrial Blowers';
  document.getElementById('prod-short').value = p.shortDescription || '';
  document.getElementById('prod-full').value = p.fullDescription || '';

  // Used for / Applications
  const apps = Array.isArray(p.applications) ? p.applications.join(', ') : (p.applications || '');
  document.getElementById('prod-applications').value = apps;

  // Images & Preview
  const imgStr = p.images ? p.images.join(', ') : '';
  document.getElementById('prod-img').value = imgStr;
  const primaryImg = (p.images && p.images.length > 0) ? p.images[0] : '/images/products/high-pressure-direct-drive-centrifugal-blower.png';
  const preview = document.getElementById('prod-img-preview');
  if (preview) {
    preview.src = primaryImg;
    preview.style.display = 'block';
  }
  const statusEl = document.getElementById('upload-status');
  if (statusEl) statusEl.textContent = '';

  // Specifications
  let airflow = '', pressure = '', motor = '';
  if (Array.isArray(p.specifications)) {
    p.specifications.forEach(s => {
      const k = (s.key || '').toLowerCase();
      if (k.includes('airflow') || k.includes('capacity')) airflow = s.value;
      else if (k.includes('pressure')) pressure = s.value;
      else if (k.includes('motor') || k.includes('drive')) motor = s.value;
    });
  }
  document.getElementById('prod-airflow').value = airflow;
  document.getElementById('prod-pressure').value = pressure;
  document.getElementById('prod-motor').value = motor;

  // Features
  const feats = Array.isArray(p.features) ? p.features.join(', ') : (p.features || '');
  document.getElementById('prod-features').value = feats;

  document.getElementById('prod-featured').checked = Boolean(p.isFeatured);
  document.getElementById('prod-active').checked = p.isActive !== false;

  document.getElementById('product-modal').style.display = 'flex';
}

async function saveProduct() {
  const id = document.getElementById('product-id').value;
  const name = document.getElementById('prod-name').value.trim();
  const category = document.getElementById('prod-category').value;
  const shortDescription = document.getElementById('prod-short').value.trim();
  const fullDescription = document.getElementById('prod-full').value.trim();
  const applicationsRaw = document.getElementById('prod-applications').value.trim();
  const imgStr = document.getElementById('prod-img').value.trim();
  const airflow = document.getElementById('prod-airflow').value.trim();
  const pressure = document.getElementById('prod-pressure').value.trim();
  const motor = document.getElementById('prod-motor').value.trim();
  const featuresRaw = document.getElementById('prod-features').value.trim();
  const isFeatured = document.getElementById('prod-featured').checked;
  const isActive = document.getElementById('prod-active').checked;

  if (!name || !category || !shortDescription || !fullDescription) {
    showToast('Please fill in required fields (Name, Category, Descriptions).', false);
    return;
  }

  const images = imgStr ? imgStr.split(',').map(s => s.trim()).filter(Boolean) : [];
  const applications = applicationsRaw ? applicationsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const features = featuresRaw ? featuresRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const specifications = [];
  if (airflow) specifications.push({ key: 'Airflow Capacity (CFM / CMH)', value: airflow });
  if (pressure) specifications.push({ key: 'Static Pressure Rating', value: pressure });
  if (motor) specifications.push({ key: 'Drive / Motor Power', value: motor });

  const payload = {
    name,
    category,
    shortDescription,
    fullDescription,
    applications,
    features,
    specifications,
    images: images.length > 0 ? images : ['/images/products/high-pressure-direct-drive-centrifugal-blower.png'],
    isFeatured,
    isActive
  };

  const saveBtn = document.getElementById('save-prod-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
  }

  try {
    const url = id ? `/api/products/${id}` : '/api/products';
    const method = id ? 'PUT' : 'POST';
    const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      showToast(id ? 'Product updated successfully!' : 'New product added successfully!');
      closeProductModal();
      await fetchAdminProducts();
    } else {
      showToast(data.error || 'Failed to save product.', false);
    }
  } catch (err) {
    showToast('Failed to connect to server.', false);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Product';
    }
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to permanently delete this product from the database catalog?')) return;
  try {
    const res = await adminFetch(`/api/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Product deleted successfully.');
      fetchAdminProducts();
    } else {
      showToast(data.error || 'Delete failed.', false);
    }
  } catch (err) {
    showToast('Failed to delete product.', false);
  }
}

function closeProductModal() {
  document.getElementById('product-modal').style.display = 'none';
}

function updateImagePreview(val) {
  const preview = document.getElementById('prod-img-preview');
  if (!preview) return;
  const firstUrl = val.split(',')[0].trim();
  preview.src = firstUrl || '/images/products/high-pressure-direct-drive-centrifugal-blower.png';
}

async function uploadProductImage(fileInput) {
  if (!fileInput.files || fileInput.files.length === 0) return;
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('image', file);

  const statusEl = document.getElementById('upload-status');
  if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

  try {
    const headers = {};
    if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
    const res = await fetch('/api/products/upload-image', {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('prod-img').value = data.imageUrl;
      updateImagePreview(data.imageUrl);
      if (statusEl) statusEl.innerHTML = '<span style="color:#10b981;"><i class="fa-solid fa-check"></i> Uploaded!</span>';
    } else {
      if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444;">Upload failed: ${data.error || 'Error'}</span>`;
    }
  } catch (err) {
    if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444;">Upload error</span>';
  }
}

// ─── Toast Notification System ────────────────────────────────────────────────
function showToast(message, success = true, type = 'default', duration = 4000) {
  const container = document.getElementById('admin-toast');
  if (!container) return;

  const toast = document.createElement('div');
  const cls = type === 'new-enq' ? 'new-enq' : success ? 'success' : 'error';
  const icon = type === 'new-enq'
    ? 'fa-bell'
    : success ? 'fa-circle-check' : 'fa-circle-xmark';

  toast.className = `toast-item ${cls}`;
  toast.innerHTML = `
    <span class="toast-icon"><i class="fa-solid ${icon}"></i></span>
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()" title="Close">&times;</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ─── Notification Sound (Web Audio API) ──────────────────────────────────────
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) { /* AudioContext may not be available */ }
}

// ─── Socket.IO Real-Time Admin Listener ──────────────────────────────────────
let unreadCount = 0;

function initSocketIO() {
  if (typeof io === 'undefined') return;

  const socket = io({ reconnectionDelay: 3000, reconnectionAttempts: 10 });

  socket.on('connect', () => {
    socket.emit('join-admin');
    console.log('[Socket.IO] Connected to admin room');
  });

  socket.on('disconnect', () => {
    console.warn('[Socket.IO] Disconnected – will auto-reconnect');
  });

  socket.on('new-enquiry', (data) => {
    unreadCount++;
    updateBadge();
    playNotificationSound();

    // Rich toast
    const typeLabel = data.type || 'RFQ';
    const typeIcon = typeLabel === 'Order' ? '📦' : typeLabel === 'Service Request' ? '🔧' : '📋';
    const time = new Date(data.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    showToast(
      `${typeIcon} <strong>${typeLabel}</strong> from <strong>${data.name}</strong> (${data.company || 'N/A'}) – ${data.token} @ ${time} &nbsp;
       <button onclick="switchToEnquiries()" style="margin-left:4px;padding:2px 8px;border-radius:4px;background:#0284c7;color:#fff;border:none;cursor:pointer;font-size:0.8rem;">View</button>`,
      true, 'new-enq', 8000
    );

    // Auto-prepend to enquiries if that tab is visible
    if (document.getElementById('tab-enquiries').style.display !== 'none') {
      fetchAdminEnquiries(false);
    }
  });
}

function switchToEnquiries() {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('[data-tab="enquiries"]');
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
  const el = document.getElementById('tab-enquiries');
  if (el) el.style.display = 'block';
  fetchAdminEnquiries();
  unreadCount = 0;
  updateBadge();
}

function updateBadge() {
  let badge = document.getElementById('admin-notif-badge');
  if (!badge) {
    const btn = document.querySelector('[data-tab="enquiries"]');
    if (!btn) return;
    badge = document.createElement('span');
    badge.id = 'admin-notif-badge';
    badge.style.cssText = `
      display:inline-block; background:#ef4444; color:#fff;
      border-radius:50px; font-size:0.7rem; font-weight:800;
      padding:1px 7px; margin-left:6px; vertical-align:middle;
    `;
    btn.appendChild(badge);
  }
  badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
  badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
}

// Kick off socket after login
const _origLoadAdminData = loadAdminData;
// Re-expose so the socket is started once we're authenticated
function loadAdminData() {
  _origLoadAdminData();
  initSocketIO();
}
