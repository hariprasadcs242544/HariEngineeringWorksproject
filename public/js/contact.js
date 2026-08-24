// Contact & Quote Form Submission Handler

document.addEventListener('DOMContentLoaded', () => {
  const enquiryForm = document.getElementById('enquiry-form');
  const productSelect = document.getElementById('productInterested');

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

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

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
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting Enquiry...`;

      try {
        const formData = {
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
          showToast(data.message || 'Your enquiry has been successfully registered!');
          enquiryForm.reset();
        } else {
          showToast(data.error || 'Failed to submit enquiry. Please try again.', false);
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
