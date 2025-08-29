/* ===============================================================
   AKSILORIX :: LOGIKA.JS (v.FINAL - COMPLETE & DEBUGGED)
   Единый скрипт для всей интерактивности сайта.
   =============================================================== */

document.addEventListener('DOMContentLoaded', () => {

/**
   * ------------------------------------------------
   * Модуль 1: Мобильная навигация (ФИНАЛЬНАЯ ВЕРСИЯ)
   * ------------------------------------------------
   */
  const initMobileNav = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.site-nav');
    const body = document.body;

    if (!burger || !nav) return;

    const closeMenu = () => {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        body.classList.remove('nav-open');
    };

    const openMenu = () => {
        burger.setAttribute('aria-expanded', 'true');
        nav.classList.add('is-open');
        body.classList.add('nav-open');
    };

    burger.addEventListener('click', () => {
        nav.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    // --- ЛОГИКА ЗАКРЫТИЯ МЕНЮ ПО КЛИКУ НА ССЫЛКУ ---
    nav.addEventListener('click', (e) => {
        // Проверяем, был ли клик по ссылке внутри меню
        if (e.target.matches('a')) {
            closeMenu();
        }
    });
  };

  /**
   * ------------------------------------------------
   * Модуль 2: Анимация появления блоков при прокрутке
   * ------------------------------------------------
   */
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length === 0) return;

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
  };
  
  /**
   * ------------------------------------------------
   * Модуль 3: Анимация таймлайна "Как мы работаем"
   * ------------------------------------------------
   */
  const initProcessTimelineAnimation = () => {
    const processSteps = document.querySelectorAll('.process-step');
    if (processSteps.length === 0) return;

    const processObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target.classList.add('is-active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.8 });

    processSteps.forEach(step => processObserver.observe(step));
  };
  
  /**
   * ------------------------------------------------
   * Модуль 4: Анимация круговых диаграмм
   * ------------------------------------------------
   */
  const initDoughnutCharts = () => {
    const charts = document.querySelectorAll('.doughnut-chart');
    if (charts.length === 0) return;

    const animateValue = (element, start, end, duration) => {
      let startTimestamp = null;
      const finalPrefix = element.textContent.includes('≤') ? '≤' : '~';
      
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = progress * (end - start) + start;
        
        const isDecimal = end % 1 !== 0;
        if (isDecimal) {
            element.textContent = `${finalPrefix}${currentValue.toFixed(1)}%`;
        } else {
            element.textContent = `${finalPrefix}${Math.floor(currentValue)}%`;
        }

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
           element.textContent = `${finalPrefix}${end}%`;
        }
      };
      window.requestAnimationFrame(step);
    };

    const chartObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const chart = entry.target;
          const circle = chart.querySelector('.chart-circle');
          const valueSpan = chart.querySelector('.chart-value');
          const value = parseFloat(chart.dataset.value);
          const circumference = 2 * Math.PI * 14; // r = 14

          if (!circle || isNaN(value)) return;
          
          const offset = circumference - (value / 100) * circumference;
          circle.style.strokeDasharray = `${circumference} ${circumference}`;
          
          setTimeout(() => {
            circle.style.strokeDashoffset = offset;
          }, 200);

          if (valueSpan) {
            animateValue(valueSpan, 0, value, 1500);
          }
          
          observer.unobserve(chart);
        }
      });
    }, { threshold: 0.5 });

    charts.forEach(chart => chartObserver.observe(chart));
  };

  /**
   * ------------------------------------------------
   * Модуль 5: Переключатель "Арсенал" по услугам
   * ------------------------------------------------
   */
  const initArsenalSwitcher = () => {
    const switcher = document.querySelector('.arsenal-switcher');
    if (!switcher) return;

    const nav = switcher.querySelector('.arsenal-nav');
    const tabs = switcher.querySelectorAll('.arsenal-tab');
    const stacks = switcher.querySelectorAll('.tool-stack');

    // Используем делегирование событий для эффективности
    nav.addEventListener('click', (e) => {
      // Срабатываем только если клик был на кнопке-табе
      if (e.target.matches('.arsenal-tab')) {
        const clickedTab = e.target;
        const targetId = clickedTab.dataset.service + '-tools';

        // 1. Убираем класс 'is-active' у всех кнопок
        tabs.forEach(tab => tab.classList.remove('is-active'));
        // 2. Добавляем класс 'is-active' только нажатой кнопке
        clickedTab.classList.add('is-active');

        // 3. Убираем класс 'is-active' у всех контентных блоков
        stacks.forEach(stack => {
            stack.classList.remove('is-active');
        });
        // 4. Находим нужный контентный блок по ID и добавляем ему класс 'is-active'
        const targetStack = document.getElementById(targetId);
        if(targetStack) {
            targetStack.classList.add('is-active');
        }
      }
    });
  };

  /**
   * ------------------------------------------------
   * Модуль 6: Интерактивный слайдер "До/После" (Обновлено)
   * ------------------------------------------------
   */
  const initComparisonSlider = () => {
    const container = document.querySelector('.comparison-container');
    if (!container) return;

    const afterImage = container.querySelector('.comparison-image-after');
    const handle = container.querySelector('.comparison-handle');
    const labelLeft = container.querySelector('.comparison-label-left'); // Новая подпись "До"
    const labelRight = container.querySelector('.comparison-label-right'); // Новая подпись "После"
    let isDragging = false;

    const moveSlider = (x) => {
      const rect = container.getBoundingClientRect();
      let position = (x - rect.left) / rect.width * 100;
      position = Math.max(0, Math.min(position, 100));
      
      handle.style.left = `${position}%`;
      afterImage.style.clipPath = `inset(0 0 0 ${position}%)`;

      // Логика показа/скрытия подписей
      if (position < 10) { // Если ползунок почти полностью слева
        if (labelLeft) labelLeft.classList.remove('is-visible');
        if (labelRight) labelRight.classList.add('is-visible');
      } else if (position > 90) { // Если ползунок почти полностью справа
        if (labelLeft) labelLeft.classList.add('is-visible');
        if (labelRight) labelRight.classList.remove('is-visible');
      } else { // В остальных случаях
        if (labelLeft) labelLeft.classList.add('is-visible');
        if (labelRight) labelRight.classList.add('is-visible');
      }
    };

    const startDrag = (e) => { e.preventDefault(); isDragging = true; };
    const stopDrag = () => { isDragging = false; };
    
    const onDrag = (e) => {
      if (!isDragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      moveSlider(x);
    };

    handle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    handle.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);

    // Устанавливаем начальное положение слайдера в центр при загрузке
    // и сразу запускаем логику видимости подписей
    setTimeout(() => moveSlider(container.getBoundingClientRect().left + container.offsetWidth / 2), 100);
  };
  
  /**
   * ------------------------------------------------
   * Модуль 7: Обновление года в подвале
   * ------------------------------------------------
   */
  const initFooterYear = () => {
      const yearSpan = document.getElementById('year');
      if(yearSpan) {
          yearSpan.textContent = new Date().getFullYear();
      }
  };

  /**
   * ------------------------------------------------
   * Модуль 8: Карусель команды (ФИНАЛЬНАЯ, РАБОЧАЯ ВЕРСИЯ)
   * ------------------------------------------------
   */
  const initTeamCarousel = () => {
    const wrapper = document.querySelector('.team-carousel-wrapper');
    if (!wrapper) return;

    const viewport = wrapper.querySelector('.team-carousel-viewport');
    const track = wrapper.querySelector('.team-carousel-track');
    const cards = Array.from(wrapper.querySelectorAll('.team-member-card'));
    const prevBtn = wrapper.querySelector('.carousel-btn.prev');
    const nextBtn = wrapper.querySelector('.carousel-btn.next');
    const dotsContainer = wrapper.querySelector('.carousel-dots');

    if (!viewport || !track || cards.length === 0) return;

    let currentPage = 0;
    let totalPages = 1;

    const update = () => {
      const cardWidth = cards[0].offsetWidth;
      const cardsPerPage = Math.round(viewport.offsetWidth / cardWidth);
      totalPages = Math.ceil(cards.length / cardsPerPage);

      const offset = currentPage * cardWidth * cardsPerPage;
      track.style.transform = `translateX(-${offset}px)`;
      
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === currentPage) dot.classList.add('is-active');
        dot.addEventListener('click', () => {
          currentPage = i;
          update();
        });
        dotsContainer.appendChild(dot);
      }
      
      if(prevBtn) prevBtn.disabled = currentPage === 0;
      if(nextBtn) nextBtn.disabled = currentPage >= totalPages - 1;
    };

    if(nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
          currentPage++;
          update();
        }
      });
    }

    if(prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
          currentPage--;
          update();
        }
      });
    }
    
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        currentPage = 0;
        update();
      }, 200);
    });

    update();
  };

  /**
   * ------------------------------------------------
   * Модуль 9: Карусель отзывов (РАБОЧАЯ ВЕРСИЯ)
   * ------------------------------------------------
   */
  const initTestimonialsCarousel = () => {
    const wrapper = document.querySelector('.testimonials-carousel-wrapper');
    if (!wrapper) return;

    const viewport = wrapper.querySelector('.testimonials-carousel-viewport');
    const track = wrapper.querySelector('.testimonials-carousel-track');
    const cards = Array.from(wrapper.querySelectorAll('.testimonial-card'));
    const prevBtn = wrapper.querySelector('.carousel-btn.prev');
    const nextBtn = wrapper.querySelector('.carousel-btn.next');
    const dotsContainer = wrapper.querySelector('.carousel-dots');

    if (!viewport || !track || cards.length === 0) return;

    let currentPage = 0;
    let totalPages = 1;

    const update = () => {
      const cardWidth = cards[0].offsetWidth;
      if (cardWidth === 0) return;
      
      const cardsPerPage = Math.round(viewport.offsetWidth / cardWidth);
      totalPages = Math.ceil(cards.length / cardsPerPage);
      
      const offset = currentPage * viewport.offsetWidth;
      track.style.transform = `translateX(-${offset}px)`;

      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
          const dot = document.createElement('div');
          dot.classList.add('carousel-dot');
          if (i === currentPage) dot.classList.add('is-active');
          dot.addEventListener('click', () => {
            currentPage = i;
            update();
          });
          dotsContainer.appendChild(dot);
        }
      }
      
      if(prevBtn) prevBtn.disabled = currentPage === 0;
      if(nextBtn) nextBtn.disabled = currentPage >= totalPages - 1;
    };

    if(nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
          currentPage++;
          update();
        }
      });
    }

    if(prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
          currentPage--;
          update();
        }
      });
    }
    
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        currentPage = 0;
        update();
      }, 200);
    });

    setTimeout(update, 100);
  };

  /**
   * ------------------------------------------------
   * Модуль: Логика контактной формы и модального окна
   * ------------------------------------------------
   */
  const initContactForm = () => {
    const contactForm = document.querySelector('form[data-form="lead"]');
    const successModal = document.querySelector('#form-success');
    
    if (!contactForm || !successModal) return;

    // --- Функция для открытия модального окна ---
    const openModal = () => {
        successModal.classList.add('is-open');
    };

    // --- Функция для закрытия модального окна ---
    const closeModal = () => {
        successModal.classList.remove('is-open');
    };

    // --- Обработка отправки формы ---
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Предотвращаем перезагрузку страницы
        
        // Здесь в будущем будет код для реальной отправки данных на сервер (например, через fetch)
        
        openModal(); // Показываем окно
        contactForm.reset(); // Очищаем поля формы
    });

    // --- Обработка закрытия окна ---
    successModal.addEventListener('click', (event) => {
        // Закрываем по клику на кнопку с атрибутом [data-modal-close] или на фон
        if (event.target.matches('[data-modal-close]') || event.target.classList.contains('form-success')) {
            closeModal();
        }
    });

    // Закрываем по нажатию на Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && successModal.classList.contains('is-open')) {
            closeModal();
        }
    });
  };

  // --- ВЫЗОВ ВСЕХ ФУНКЦИЙ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ---
  initMobileNav();
  initScrollReveal();
  initProcessTimelineAnimation();
  initDoughnutCharts();
  initArsenalSwitcher();
  initComparisonSlider();
  initFooterYear();
  initTestimonialsCarousel();
  initContactForm();
  initTeamCarousel();
});