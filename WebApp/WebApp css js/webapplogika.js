document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ==========================*/
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));


  /* =========================
     1) ОБЩАЯ ЛОГИКА МОБИЛЬНОГО МЕНЮ
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
     2) УНИВЕРСАЛЬНАЯ ЛОГИКА ДЛЯ МОДАЛЬНЫХ ОКОН (ЛАЙТБОКС, ФОРМА УСПЕХА)
   ==========================*/
  let triggerElement = null;

  const handleFocusTrap = (e, modal) => {
    if (e.key !== 'Tab') return;
    const focusableElements = qsa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  const openModal = (modal) => {
    if (!modal) return;
    triggerElement = document.activeElement;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modal.addEventListener('keydown', (e) => handleFocusTrap(e, modal));
    // Устанавливаем фокус на первый элемент в модальном окне (часто это кнопка закрытия)
    const focusableElements = qsa('button, [href]', modal);
    if(focusableElements.length) focusableElements[0].focus();
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    modal.removeEventListener('keydown', handleFocusTrap);
    if (triggerElement) {
      triggerElement.focus();
    }
  };

  // Обработчики для лайтбокса
  const lightbox = qs('#lightbox');
  if (lightbox) {
    const lightboxImage = qs('.lightbox-image', lightbox);
    qsa('.lightbox-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const imageUrl = trigger.getAttribute('href');
        const imageAlt = trigger.querySelector('img')?.getAttribute('alt') || 'Увеличенное изображение';
        lightboxImage.setAttribute('src', imageUrl);
        lightboxImage.setAttribute('alt', imageAlt);
        openModal(lightbox);
      });
    });
  }

  // Обработчики для всех кнопок закрытия модальных окон
  qsa('[data-modal-close]').forEach(button => {
    button.addEventListener('click', (e) => {
      const modal = e.target.closest('.form-success, .lightbox');
      closeModal(modal);
    });
  });
  
  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = qs('.is-open');
      if (openModal) closeModal(openModal);
    }
  });


  /* =========================
     3) ОБЩАЯ ЛОГИКА ФОРМЫ
   ==========================*/
  const contactForm = qs('form[data-form="lead"]');
  const successPopup = qs('#form-success');
  if (contactForm && successPopup) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Тут будет реальная отправка данных
      openModal(successPopup);
      contactForm.reset();
    });
  }

  /* =========================
     4) АНИМАЦИЯ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ
   ==========================*/
  const elementsToReveal = qsa('.reveal');
  if (elementsToReveal.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elementsToReveal.forEach(element => {
      observer.observe(element);
    });
  }


  /* =========================
     5) АВТОМАТИЧЕСКИЙ ГОД В ФУТЕРЕ
   ==========================*/
  const yearEl = qs('#year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});