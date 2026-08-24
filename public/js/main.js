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
