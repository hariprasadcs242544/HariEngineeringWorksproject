// Gallery & Lightbox JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');

  if (galleryItems.length > 0 && lightboxModal) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.getAttribute('data-title') || 'Industrial Installation';
        const desc = item.getAttribute('data-desc') || 'Custom engineered installation by Hari Engineering Works.';

        if (img) {
          lightboxImg.src = img.src;
          lightboxTitle.textContent = title;
          lightboxDesc.textContent = desc;
          lightboxModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeModal = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeModal);
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeModal();
      }
    });
  }
});
