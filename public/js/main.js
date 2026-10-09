// Global JavaScript utilities for Hari Engineering Works

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }

  // Scroll Fade-in Animation Observer
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

  // Animated Counter Logic
  const statsCounters = document.querySelectorAll('.counter-num');
  if (statsCounters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          const target = parseInt(entry.target.getAttribute('data-target') || '0', 10);
          let current = 0;
          const duration = 2000;
          const step = Math.max(1, Math.floor(target / (duration / 16)));
          
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              entry.target.textContent = target + '+';
              clearInterval(timer);
            } else {
              entry.target.textContent = current + '+';
            }
          }, 16);
        }
      });
    }, { threshold: 0.5 });

    statsCounters.forEach(counter => counterObserver.observe(counter));
  }
});

// Toast notification helper
function showToast(message, isSuccess = true) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.style.borderLeftColor = isSuccess ? '#10b981' : '#ef4444';
  toast.innerHTML = `
    <i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'}" style="color: ${isSuccess ? '#10b981' : '#ef4444'}; font-size: 1.25rem;"></i>
    <div>
      <h5 style="margin: 0; font-size: 0.9rem;">${isSuccess ? 'Success' : 'Error'}</h5>
      <p style="margin: 0; font-size: 0.85rem; color: #475569;">${message}</p>
    </div>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Global Confirmation Modal for Tokens (Order / RFQ / Service Request)
function showConfirmationModal(data) {
  let modal = document.getElementById('token-confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'token-confirm-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const token = data.token || 'N/A';
  const type = data.type || 'RFQ';
  const name = data.name || '';
  const company = data.company || '';
  const product = data.productInterested || 'Industrial Request';

  modal.innerHTML = `
    <div class="modal-card fade-in-up" style="max-width: 540px; width: 90%; background: #ffffff; border-radius: 12px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; position: relative;">
      <button class="modal-close-btn" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.25rem; color: #64748b; cursor: pointer;">
        <i class="fa-solid fa-xmark"></i>
      </button>
      
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 60px; height: 60px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1rem auto;">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <span style="background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.75rem; border-radius: 50px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">
          ${type} Registered
        </span>
        <h3 style="font-size: 1.5rem; color: #0b3c5d; margin-top: 0.5rem;">Submission Confirmed!</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.25rem;">
          Your request reference token has been generated below:
        </p>
      </div>

      <!-- Token Highlight Box -->
      <div style="background: #f8fafc; border: 2px dashed #0284c7; border-radius: 8px; padding: 1.25rem; text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: 600;">Reference Token Number</div>
        <div id="modal-token-display" style="font-size: 1.8rem; font-weight: 800; color: #0284c7; font-family: monospace; letter-spacing: 1px; margin: 0.25rem 0 0.75rem 0;">
          ${token}
        </div>
        <button id="copy-token-btn" class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.4rem 1rem;">
          <i class="fa-regular fa-copy"></i> Copy Token
        </button>
      </div>

      <!-- Summary -->
      <div style="background: #f1f5f9; padding: 1rem; border-radius: 6px; font-size: 0.88rem; color: #334155; margin-bottom: 1.5rem;">
        <p style="margin: 0 0 0.4rem 0;"><strong>Name:</strong> ${name} ${company ? `(${company})` : ''}</p>
        <p style="margin: 0 0 0.4rem 0;"><strong>Item / Category:</strong> ${product}</p>
        <p style="margin: 0;"><strong>Status:</strong> <span style="color:#16a34a; font-weight:600;">NEW</span> (Pending Technical Review)</p>
      </div>

      <!-- Buttons -->
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <a href="/track?token=${encodeURIComponent(token)}" class="btn btn-primary" style="flex: 1; text-align: center; font-size: 0.9rem;">
          <i class="fa-solid fa-magnifying-glass"></i> Track Request Live
        </a>
        <button class="btn btn-secondary modal-close-action" style="flex: 1; font-size: 0.9rem;">
          Close
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  // Copy button listener
  const copyBtn = modal.querySelector('#copy-token-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(token).then(() => {
        copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => {
          copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy Token`;
        }, 2500);
      }).catch(err => {
        console.error('Clipboard copy failed', err);
      });
    });
  }

  // Close listeners
  const closeBtns = modal.querySelectorAll('.modal-close-btn, .modal-close-action');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  });
}

