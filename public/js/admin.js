// Admin Panel Management JavaScript Logic

let adminProducts = [];
let adminEnquiries = [];

document.addEventListener('DOMContentLoaded', () => {
  const adminAuthModal = document.getElementById('admin-auth-modal');
  const adminPassInput = document.getElementById('admin-pass-input');
  const adminAuthBtn = document.getElementById('admin-auth-btn');

  // Simple client admin check
  if (adminAuthBtn && adminPassInput) {
    adminAuthBtn.addEventListener('click', () => {
      if (adminPassInput.value === 'admin123' || adminPassInput.value === 'admin') {
        adminAuthModal.style.display = 'none';
        loadAdminData();
      } else {
        alert('Invalid Security Password. (Default demo pass: admin123)');
      }
    });
  } else {
    loadAdminData();
  }

  // Tab Switching
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
      const targetContent = document.getElementById(`tab-${target}`);
      if (targetContent) targetContent.style.display = 'block';
    });
  });

  // Product Modal Controls
  const addProductBtn = document.getElementById('add-product-btn');
  const productModal = document.getElementById('product-modal');
  const productForm = document.getElementById('product-form');

  if (addProductBtn && productModal) {
    addProductBtn.addEventListener('click', () => {
      document.getElementById('modal-title').textContent = 'Add New Industrial Product';
      document.getElementById('product-id').value = '';
      productForm.reset();
      productModal.style.display = 'flex';
    });
  }

  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveProduct();
    });
  }
});

async function loadAdminData() {
  await fetchAdminEnquiries();
  await fetchAdminProducts();
}

async function fetchAdminEnquiries() {
  const container = document.getElementById('enquiries-table-body');
  if (!container) return;

  try {
    const res = await fetch('/api/enquiries');
    const data = await res.json();

    if (data.success) {
      adminEnquiries = data.data;
      renderEnquiries();
    }
  } catch (err) {
    console.error('Error fetching enquiries:', err);
  }
}

function renderEnquiries() {
  const container = document.getElementById('enquiries-table-body');
  if (!container) return;

  if (adminEnquiries.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">No customer enquiries registered yet.</td></tr>`;
    return;
  }

  container.innerHTML = adminEnquiries.map(enq => {
    const dateStr = new Date(enq.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let badgeClass = 'status-new';
    if (enq.status === 'Contacted') badgeClass = 'status-contacted';
    if (enq.status === 'Closed') badgeClass = 'status-closed';

    return `
      <tr>
        <td><strong>${enq.name}</strong></td>
        <td>${enq.company || 'N/A'}</td>
        <td>
          <a href="mailto:${enq.email}">${enq.email}</a><br>
          <small style="color: var(--text-light);">${enq.phone}</small>
        </td>
        <td><span class="badge-tag" style="font-size:0.75rem;">${enq.productInterested}</span></td>
        <td style="max-width: 250px; font-size: 0.85rem;">${enq.message}</td>
        <td>
          <select onchange="updateStatus('${enq._id}', this.value)" style="padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.8rem;">
            <option value="New" ${enq.status === 'New' ? 'selected' : ''}>New</option>
            <option value="In Review" ${enq.status === 'In Review' ? 'selected' : ''}>In Review</option>
            <option value="Contacted" ${enq.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Closed" ${enq.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
        <td>
          <button onclick="deleteEnquiry('${enq._id}')" class="btn btn-sm" style="background:#fee2e2; color:#dc2626; border:none; padding:0.3rem 0.6rem;">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function updateStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) showToast('Enquiry status updated successfully.');
  } catch (err) {
    showToast('Failed to update status', false);
  }
}

async function deleteEnquiry(id) {
  if (!confirm('Are you sure you want to delete this customer enquiry record?')) return;
  try {
    const res = await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Enquiry deleted.');
      fetchAdminEnquiries();
    }
  } catch (err) {
    showToast('Failed to delete enquiry', false);
  }
}

async function fetchAdminProducts() {
  const container = document.getElementById('products-table-body');
  if (!container) return;

  try {
    const res = await fetch('/api/products');
    const data = await res.json();

    if (data.success) {
      adminProducts = data.data;
      renderAdminProducts();
    }
  } catch (err) {
    console.error('Error fetching admin products:', err);
  }
}

function renderAdminProducts() {
  const container = document.getElementById('products-table-body');
  if (!container) return;

  if (adminProducts.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">No products found.</td></tr>`;
    return;
  }

  container.innerHTML = adminProducts.map(p => {
    const img = p.images && p.images.length > 0 ? p.images[0] : '';
    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <img src="${img}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
            <strong>${p.name}</strong>
          </div>
        </td>
        <td><span class="badge-tag" style="font-size:0.75rem;">${p.category}</span></td>
        <td>${p.isFeatured ? '<span style="color:#10b981; font-weight:bold;">★ Featured</span>' : 'Standard'}</td>
        <td style="font-size:0.85rem; max-width:200px;">${p.shortDescription}</td>
        <td>
          <button onclick="editProduct('${p._id}')" class="btn btn-sm" style="background:#e0f2fe; color:#0369a1; border:none; padding:0.3rem 0.6rem; margin-right:0.3rem;">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button onclick="deleteProduct('${p._id}')" class="btn btn-sm" style="background:#fee2e2; color:#dc2626; border:none; padding:0.3rem 0.6rem;">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function editProduct(id) {
  const p = adminProducts.find(item => item._id === id);
  if (!p) return;

  document.getElementById('modal-title').textContent = 'Edit Product Record';
  document.getElementById('product-id').value = p._id;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-category').value = p.category;
  document.getElementById('prod-short').value = p.shortDescription;
  document.getElementById('prod-full').value = p.fullDescription;
  document.getElementById('prod-img').value = p.images ? p.images.join(', ') : '';
  document.getElementById('prod-featured').checked = Boolean(p.isFeatured);

  document.getElementById('product-modal').style.display = 'flex';
}

async function saveProduct() {
  const id = document.getElementById('product-id').value;
  const name = document.getElementById('prod-name').value.trim();
  const category = document.getElementById('prod-category').value;
  const shortDescription = document.getElementById('prod-short').value.trim();
  const fullDescription = document.getElementById('prod-full').value.trim();
  const imgStr = document.getElementById('prod-img').value.trim();
  const isFeatured = document.getElementById('prod-featured').checked;

  const images = imgStr ? imgStr.split(',').map(s => s.trim()) : [];

  const payload = {
    name,
    category,
    shortDescription,
    fullDescription,
    images,
    isFeatured,
    specifications: [
      { key: "Airflow / Output", value: "Custom Engineered" },
      { key: "Material", value: "Mild Steel / SS304 / FRP" }
    ],
    applications: ["Industrial Plant Ventilation", "Air Pollution Control"],
    features: ["Heavy Duty Construction", "ISO 1940 Dynamic Balancing"]
  };

  const url = id ? `/api/products/${id}` : '/api/products';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast(id ? 'Product updated successfully!' : 'New product added successfully!');
      document.getElementById('product-modal').style.display = 'none';
      fetchAdminProducts();
    } else {
      showToast(data.error || 'Operation failed', false);
    }
  } catch (err) {
    showToast('Failed to save product details.', false);
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product from the database catalog?')) return;

  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Product deleted from database.');
      fetchAdminProducts();
    }
  } catch (err) {
    showToast('Failed to delete product', false);
  }
}

function closeProductModal() {
  document.getElementById('product-modal').style.display = 'none';
}
