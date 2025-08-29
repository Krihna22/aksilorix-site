document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     1) ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ==========================*/
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* =========================
     2) ОБЩАЯ ЛОГИКА МОБИЛЬНОГО МЕНЮ
   ==========================*/
  const burger = qs('.burger');
  const mainNav = qs('#mainNav');
  if (burger && mainNav) {
    const openMenu = () => {
      burger.setAttribute('aria-expanded', 'true');
      mainNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      burger.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', () => {
      mainNav.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    mainNav.addEventListener('click', (e) => {
      if (e.target.closest('a[href^="#"]')) {
        closeMenu();
      }
    });
  }

  /* =========================
     3) УНИВЕРСАЛЬНАЯ ЛОГИКА ДЛЯ МОДАЛЬНЫХ ОКОН (ВОССТАНОВЛЕНО)
   ==========================*/
  let activeModal = null;
  let triggerElement = null;

  const openModal = (modalId) => {
    const modal = qs(`#${modalId}`);
    if (!modal) return;
    
    triggerElement = document.activeElement;
    activeModal = modal;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    
    const firstFocusable = qs('button, [href]', modal);
    if(firstFocusable) firstFocusable.focus();
  };

  const closeModal = () => {
    if (!activeModal) return;
    activeModal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (triggerElement) triggerElement.focus();
    activeModal = null;
  };

  // -- Логика для карусели внутри модального окна --
  const setupCarousel = (galleryContainer) => {
    const slides = qsa('.carousel-slide', galleryContainer);
    const prevButton = qs('.carousel-prev', galleryContainer);
    const nextButton = qs('.carousel-next', galleryContainer);
    if (slides.length <= 1) {
        if(prevButton) prevButton.style.display = 'none';
        if(nextButton) nextButton.style.display = 'none';
        return;
    }
    let currentSlideIndex = 0;
    const showSlide = (index) => {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        currentSlideIndex = index;
    };
    showSlide(0);
    nextButton.addEventListener('click', () => showSlide((currentSlideIndex + 1) % slides.length));
    prevButton.addEventListener('click', () => showSlide((currentSlideIndex - 1 + slides.length) % slides.length));
  };

  // -- Обработчики для всех триггеров модальных окон --
  qsa('[data-modal-trigger]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.dataset.modalTrigger;
      openModal(modalId);

      // Если это триггер галереи, запускаем карусель
      if (trigger.dataset.galleryContent) {
        const galleryContentId = trigger.dataset.galleryContent;
        const galleryModal = qs(`#${modalId}`);
        qsa('.gallery-container', galleryModal).forEach(c => c.style.display = 'none');
        const activeGallery = qs(`#${galleryContentId}`, galleryModal);
        if (activeGallery) {
          activeGallery.style.display = 'block';
          setupCarousel(activeGallery);
        }
      }
    });
  });

  // -- Обработчики для всех кнопок закрытия --
  qsa('[data-modal-close]').forEach(button => {
    button.addEventListener('click', closeModal);
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) {
      closeModal();
    }
  });

  /* =========================
     4) ЛОГИКА ФОРМЫ
   ==========================*/
  const contactForm = qs('form[data-form="lead"]');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      openModal('form-success');
      contactForm.reset();
    });
  }

/* =========================
   5) ЛОГИКА СЛАЙДЕРА "ДО/ПОСЛЕ" (ФИНАЛЬНАЯ ВЕРСИЯ с clip-path)
 ==========================*/
const initComparisonSliders = () => {
  qsa('.comparison-container').forEach(container => {
    const afterImage = qs('.comparison-image-after', container);
    const handle = qs('.comparison-handle', container);
    let isDragging = false;

    const moveSlider = (x) => {
      const containerRect = container.getBoundingClientRect();
      let position = x - containerRect.left;
      
      if (position < 0) position = 0;
      if (position > containerRect.width) position = containerRect.width;

      const positionPercent = (position / containerRect.width) * 100;

      // ИЗМЕНЕНО: Управляем свойством clip-path вместо width
      afterImage.style.clipPath = `inset(0 0 0 ${positionPercent}%)`;
      handle.style.left = `${positionPercent}%`;
    };

    const onDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      moveSlider(x);
    };

    const stopDrag = () => {
      isDragging = false;
      document.body.classList.remove('is-dragging-slider');
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchend', stopDrag);
    };
    
    const startDrag = (e) => {
      isDragging = true;
      document.body.classList.add('is-dragging-slider');
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('touchmove', onDrag);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
    };

    // Вешаем слушатель на сам ползунок для начала перетаскивания
    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag, { passive: false });
  });
};

initComparisonSliders();

  /* =========================
     6) ГОД В ФУТЕРЕ
   ==========================*/
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});