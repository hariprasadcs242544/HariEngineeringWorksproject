// Contact & Quote Form Submission Handler

document.addEventListener('DOMContentLoaded', () => {
  const enquiryForm = document.getElementById('enquiry-form');
  const productSelect = document.getElementById('productInterested');

  const typeSelect = document.getElementById('type');
  const submitBtn = enquiryForm ? enquiryForm.querySelector('button[type="submit"]') : null;

  function updateSubmitBtnState(val) {
    if (!submitBtn) return;
    const vLower = (val || '').toLowerCase();
    if (vLower.includes('order') || vLower.includes('purchase')) {
      submitBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Place Purchase Order (P-Token)`;
      submitBtn.style.background = '#10b981';
      submitBtn.style.borderColor = '#059669';
    } else if (vLower.includes('service')) {
      submitBtn.innerHTML = `<i class="fa-solid fa-wrench"></i> Submit Service Request (S-Token)`;
      submitBtn.style.background = '';
      submitBtn.style.borderColor = '';
    } else if (vLower.includes('enquiry')) {
      submitBtn.innerHTML = `<i class="fa-solid fa-envelope"></i> Submit General Enquiry (E-Token)`;
      submitBtn.style.background = '';
      submitBtn.style.borderColor = '';
    } else {
      submitBtn.innerHTML = `<i class="fa-solid fa-file-invoice"></i> Submit Quote Request (RFQ-Token)`;
      submitBtn.style.background = '';
      submitBtn.style.borderColor = '';
    }
  }

  // Pre-fill Product Interested from URL parameter if present
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledProduct = urlParams.get('product');
  if (prefilledProduct && productSelect) {
    // Check if option exists or add dynamic option
    let optionExists = false;
    for (let i = 0; i < productSelect.options.length; i++) {
      if (productSelect.options[i].value.toLowerCase() === prefilledProduct.toLowerCase()) {
        productSelect.selectedIndex = i;
        optionExists = true;
        break;
      }
    }
    if (!optionExists) {
      const newOpt = document.createElement('option');
      newOpt.value = prefilledProduct;
      newOpt.textContent = prefilledProduct;
      newOpt.selected = true;
      productSelect.appendChild(newOpt);
    }
  }

  // Pre-select Request Type from URL parameter if present (e.g. ?type=Order or ?type=RFQ)
  const prefilledType = urlParams.get('type');
  if (prefilledType && typeSelect) {
    const tLower = prefilledType.toLowerCase();
    if (tLower.includes('order') || tLower.includes('purchase')) {
      typeSelect.value = 'Order';
    } else if (tLower.includes('service')) {
      typeSelect.value = 'Service Request';
    } else if (tLower.includes('enquiry')) {
      typeSelect.value = 'General Enquiry';
    } else {
      typeSelect.value = 'RFQ';
    }
    updateSubmitBtnState(typeSelect.value);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      updateSubmitBtnState(e.target.value);
    });
  }

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const typeInput = document.getElementById('type');
      const nameInput = document.getElementById('name');
      const companyInput = document.getElementById('company');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const productInput = document.getElementById('productInterested');
      const messageInput = document.getElementById('message');
      const submitBtn = enquiryForm.querySelector('button[type="submit"]');

      // Basic client validation
      if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim() || !messageInput.value.trim()) {
        showToast('Please complete all mandatory fields (Name, Email, Phone, Message).', false);
        return;
      }

      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        showToast('Please enter a valid email address.', false);
        return;
      }

      const originalBtnContent = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting Request...`;

      try {
        const formData = {
          type: typeInput ? typeInput.value : 'RFQ',
          name: nameInput.value.trim(),
          company: companyInput ? companyInput.value.trim() : '',
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          productInterested: productInput ? productInput.value : 'General Enquiry',
          message: messageInput.value.trim()
        };

        const response = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          enquiryForm.reset();
          showConfirmationModal(data.data);
        } else {
          showToast(data.error || 'Failed to submit request. Please try again.', false);
        }
      } catch (error) {
        console.error('Submission error:', error);
        showToast('Network error occurred. Please check your internet connection.', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }
    });
  }
});
