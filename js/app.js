/**
 * BusGo - Global App Controller
 * Theme, RTL, Session Navbar, Toasts, City Swap, and Global UI interactions
 */

// Immediate active subpage registration for refresh and session persistence
(function() {
  try {
    const rawPath = window.location.pathname;
    const pageName = rawPath.split('/').filter(Boolean).pop() || 'index.html';
    const fullUrl = pageName + window.location.search + window.location.hash;
    if (pageName && pageName !== 'index.html') {
      sessionStorage.setItem('rkbus_active_page', fullUrl);
      sessionStorage.setItem('rkbus_active_page_name', pageName);
    }
  } catch (e) {}
})();

const BusGoUI = {
  init() {
    this.initPagePersistence();
    this.initTheme();
    this.initRTL();
    this.initNavbar();
    this.initCounterAnimation();
    this.initCitySwapButtons();
    this.initDatePickers();
    this.initCopyButtons();
    this.initModals();
    this.initAccordions();
    this.initVideoPlayer();
    this.initPrintContainer();
  },

  // Navigation Persistence (Restores active subpage on refresh / Live Server reload)
  initPagePersistence() {
    try {
      const pathname = window.location.pathname;
      const pageName = pathname.split('/').filter(Boolean).pop() || 'index.html';
      const fullUrl = pageName + window.location.search + window.location.hash;

      if (pageName && pageName !== 'index.html') {
        sessionStorage.setItem('rkbus_active_page', fullUrl);
        sessionStorage.setItem('rkbus_active_page_name', pageName);
      } else if (pageName === 'index.html' || pathname === '/') {
        if (sessionStorage.getItem('rkbus_intentional_home') === 'true' || !sessionStorage.getItem('rkbus_active_page')) {
          sessionStorage.setItem('rkbus_active_page', 'index.html');
          sessionStorage.setItem('rkbus_active_page_name', 'index.html');
        }
      }

      // Capture link clicks globally to track intentional home navigation vs subpage transitions
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = (link.getAttribute('href') || '').trim();
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        if (href === 'index.html' || href === '/' || href.startsWith('index.html?') || href.startsWith('index.html#')) {
          sessionStorage.setItem('rkbus_intentional_home', 'true');
          sessionStorage.setItem('rkbus_active_page', href || 'index.html');
          sessionStorage.setItem('rkbus_active_page_name', 'index.html');
        } else {
          sessionStorage.removeItem('rkbus_intentional_home');
          sessionStorage.setItem('rkbus_active_page', href);
          const targetName = href.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || href;
          sessionStorage.setItem('rkbus_active_page_name', targetName);
        }
      }, { capture: true });

      // Handle pageshow / bfcache restoration
      window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
          const pName = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
          sessionStorage.setItem('rkbus_active_page', pName + window.location.search + window.location.hash);
          sessionStorage.setItem('rkbus_active_page_name', pName);
        }
      });
    } catch (e) {}
  },

  // Running Number Counters (Count-up animation when scrolled into view)
  initCounterAnimation() {
    const counterElements = document.querySelectorAll('[data-counter-target]');
    if (!counterElements.length) return;

    const animateCounter = (el) => {
      if (el.dataset.counterStarted === 'true') return;
      el.dataset.counterStarted = 'true';

      const target = parseFloat(el.getAttribute('data-counter-target'));
      const prefix = el.getAttribute('data-counter-prefix') || '';
      const suffix = el.getAttribute('data-counter-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
      const duration = parseInt(el.getAttribute('data-counter-duration') || '1800', 10);

      const startTime = performance.now();
      const easeOutCubic = (t) => (--t) * t * t + 1;

      // Start display at zero
      el.textContent = prefix + (0).toFixed(decimals) + suffix;

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const currentVal = eased * target;

        el.textContent = prefix + (decimals > 0 ? currentVal.toFixed(decimals) : Math.floor(currentVal)) + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : target) + suffix;
        }
      };

      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      counterElements.forEach(el => observer.observe(el));
    } else {
      counterElements.forEach(el => animateCounter(el));
    }
  },

  // 1. Theme Management (Default Dark)
  initTheme() {
    const savedTheme = localStorage.getItem(BUSGO_STORAGE_KEYS.THEME) || 'dark';
    this.applyTheme(savedTheme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    themeToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.toast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} theme`, 'info');
      });
    });
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(BUSGO_STORAGE_KEYS.THEME, theme);

    // Update icons on toggle buttons
    const icons = document.querySelectorAll('.theme-toggle-icon');
    icons.forEach(icon => {
      if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill text-amber-400 theme-toggle-icon text-lg';
      } else {
        icon.className = 'bi bi-moon-stars-fill text-slate-700 theme-toggle-icon text-lg';
      }
    });
  },

  // 2. RTL Management
  initRTL() {
    const savedRTL = localStorage.getItem(BUSGO_STORAGE_KEYS.RTL) === 'true';
    this.applyRTL(savedRTL);

    const rtlToggleBtns = document.querySelectorAll('.rtl-toggle-btn');
    rtlToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
        const newRTL = !isRTL;
        this.applyRTL(newRTL);
        this.toast(newRTL ? 'Switched to RTL mode' : 'Switched to LTR mode', 'info');
      });
    });
  },

  applyRTL(isRTL) {
    if (isRTL) {
      document.documentElement.setAttribute('dir', 'rtl');
      localStorage.setItem(BUSGO_STORAGE_KEYS.RTL, 'true');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      localStorage.setItem(BUSGO_STORAGE_KEYS.RTL, 'false');
    }

    const rtlBadges = document.querySelectorAll('.rtl-status-badge');
    rtlBadges.forEach(badge => {
      badge.textContent = isRTL ? 'RTL' : 'LTR';
    });

    const rtlBtns = document.querySelectorAll('.rtl-toggle-btn i');
    rtlBtns.forEach(icon => {
      icon.className = isRTL ? 'bi bi-arrow-left text-base' : 'bi bi-arrow-left-right text-base';
    });

    const rtlArrows = document.querySelectorAll('.rtl-arrow-icon');
    rtlArrows.forEach(arrow => {
      arrow.className = isRTL ? 'bi bi-arrow-left text-[11px] text-amber-400 rtl-arrow-icon' : 'bi bi-arrow-left-right text-[11px] text-slate-400 rtl-arrow-icon';
    });
  },

  // 3. Navbar & User Session
  initNavbar() {
    const currentUser = BusGoDB.getCurrentUser();
    const authContainer = document.getElementById('nav-auth-container');
    const mobileAuthContainer = document.getElementById('mobile-nav-auth-container');

    const renderAuth = (container, isMobile = false) => {
      if (!container) return;

      if (!isMobile) {
        if (currentUser) {
          container.innerHTML = `
            <a href="dashboard.html" class="nav-user-btn" aria-label="Traveler Dashboard">
              <img src="${currentUser.avatar || 'assets/images/avatar-ramkumar.jpg'}" alt="${currentUser.name}" class="w-8 h-8 rounded-full object-cover border-2 border-amber-400 shadow-sm shrink-0">
              <span class="nav-user-name font-bold text-xs truncate max-w-[120px]">${currentUser.name}</span>
            </a>
          `;
        } else {
          container.innerHTML = `
            <a href="login.html" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold btn-amber transition shadow-sm hover:scale-105" title="Sign In" aria-label="Sign In">
              <i class="bi bi-box-arrow-in-right text-sm"></i>
              <span>Sign In</span>
            </a>
          `;
        }
      } else {
        if (currentUser) {
          container.innerHTML = `
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div class="flex items-center gap-3 mb-2.5">
                <img src="${currentUser.avatar || 'assets/images/avatar-ramkumar.jpg'}" alt="${currentUser.name}" class="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shrink-0">
                <div class="truncate">
                  <p class="text-xs font-bold text-slate-100">${currentUser.name}</p>
                  <p class="text-[10px] text-slate-400 truncate">${currentUser.email}</p>
                </div>
              </div>
              <a href="dashboard.html" class="block py-1.5 px-3 rounded-lg bg-slate-800 text-xs font-semibold text-amber-400 flex items-center justify-between mb-1">
                <span>Go to Dashboard</span>
                <i class="bi bi-arrow-right"></i>
              </a>
              <button type="button" onclick="BusGoUI.handleLogout()" class="block py-1 text-xs text-rose-400 mt-1">Sign Out</button>
            </div>
          `;
        } else {
          container.innerHTML = `
            <div class="space-y-2">
              <a href="dashboard.html" class="block py-2 px-3 rounded-xl bg-slate-800 text-xs font-semibold text-amber-400 flex items-center justify-between mb-1 border border-slate-700">
                <span class="flex items-center gap-2"><i class="bi bi-speedometer2"></i> Traveler Dashboard</span>
                <i class="bi bi-arrow-right"></i>
              </a>
              <a href="login.html" class="block text-center py-2.5 rounded-xl btn-amber text-xs font-bold shadow-sm">
                <i class="bi bi-box-arrow-in-right mr-1.5"></i> Sign In
              </a>
            </div>
          `;
        }
      }
    };

    renderAuth(authContainer);
    renderAuth(mobileAuthContainer, true);

    // Mobile menu drawer toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileDrawerClose = document.getElementById('mobile-drawer-close');

    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      });
    }

    if (mobileDrawerClose && mobileDrawer) {
      mobileDrawerClose.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      });
    }

    // Support click-to-toggle on navigation dropdowns
    document.querySelectorAll('nav .group').forEach(group => {
      const btn = group.querySelector('button');
      const menu = group.querySelector('.group-hover\\:visible, [class*="group-hover:visible"]');
      if (btn && menu) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = menu.classList.contains('dropdown-open');
          document.querySelectorAll('.dropdown-open').forEach(el => el.classList.remove('dropdown-open', '!opacity-100', '!visible'));
          if (!isOpen) {
            menu.classList.add('dropdown-open', '!opacity-100', '!visible');
          }
        });
      }
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-open').forEach(el => el.classList.remove('dropdown-open', '!opacity-100', '!visible'));
    });
  },

  handleLogout() {
    BusGoDB.logout();
    this.toast('Signed out successfully. Please sign in to continue.', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
  },

  // 4. City Swap Animation & Functionality
  initCitySwapButtons() {
    const swapBtns = document.querySelectorAll('.btn-swap-cities');
    swapBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const form = btn.closest('form') || document.querySelector('.search-bus-form');
        if (!form) return;
        const fromInput = form.querySelector('[name="from_city"]');
        const toInput = form.querySelector('[name="to_city"]');
        if (fromInput && toInput) {
          btn.classList.add('rotate-180');
          setTimeout(() => btn.classList.remove('rotate-180'), 300);

          const temp = fromInput.value;
          fromInput.value = toInput.value;
          toInput.value = temp;
          this.toast('Cities swapped', 'info');
        }
      });
    });
  },

  // 5. Date pickers - min date today
  initDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
      input.min = today;
      if (!input.value) {
        input.value = today;
      }
    });
  },

  // 6. Copy promo code
  initCopyButtons() {
    const copyBtns = document.querySelectorAll('.btn-copy-code');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const code = btn.getAttribute('data-code');
        if (code) {
          navigator.clipboard.writeText(code).then(() => {
            this.toast(`Promo code "${code}" copied to clipboard!`, 'success');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="bi bi-check2"></i> Copied!`;
            setTimeout(() => {
              btn.innerHTML = originalText;
            }, 2000);
          }).catch(() => {
            this.toast(`Code: ${code}`, 'info');
          });
        }
      });
    });
  },

  // 7. Modals
  initModals() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.busgo-modal-backdrop.active');
        if (activeModal) {
          activeModal.classList.remove('active');
          document.body.classList.remove('overflow-hidden');
        }
      }
    });

    document.querySelectorAll('.busgo-modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
          document.body.classList.remove('overflow-hidden');
        }
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.busgo-modal-backdrop');
        if (modal) {
          modal.classList.remove('active');
          document.body.classList.remove('overflow-hidden');
        }
      });
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('overflow-hidden');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
    }
  },

  // 8. Exclusive FAQ Accordion
  initAccordions() {
    const faqDetails = document.querySelectorAll('.faq-accordion details, details[name="faq-accordion"]');
    faqDetails.forEach(d => {
      d.open = false;
    });
    faqDetails.forEach(targetDetail => {
      targetDetail.addEventListener('toggle', () => {
        if (targetDetail.open) {
          faqDetails.forEach(otherDetail => {
            if (otherDetail !== targetDetail && otherDetail.open) {
              otherDetail.open = false;
            }
          });
        }
      });
    });
  },

  // 9. Luxury Fleet Video Player Controller
  initVideoPlayer() {
    const video = document.getElementById('signatureBusVideo');
    if (!video) return;

    const soundBtn = document.getElementById('videoSoundBtn');
    const playBtn = document.getElementById('videoPlayToggleBtn');
    const switchBtn = document.getElementById('videoSwitchBtn');
    let isBusStandMode = true;

    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        isBusStandMode = !isBusStandMode;
        const titleBadge = document.getElementById('videoTitleBadge');
        const fleetName = document.getElementById('videoFleetName');
        const fleetMeta = document.getElementById('videoFleetMeta');

        if (isBusStandMode) {
          video.src = 'assets/videos/bus-stand-volvo.webm';
          if (titleBadge) titleBadge.textContent = '4K Bus Stand Live';
          if (fleetName) fleetName.textContent = 'Kilambakkam Bus Stand (KCBT)';
          if (fleetMeta) fleetMeta.textContent = 'Departure Bay 12 • Express Fleet';
          this.toast('Switched to Bus Stand Live View', 'info');
        } else {
          video.src = 'assets/videos/bus-tour.mp4';
          if (titleBadge) titleBadge.textContent = '4K Fleet Highway Cruise';
          if (fleetName) fleetName.textContent = 'Volvo 9600 Sleeper';
          if (fleetMeta) fleetMeta.textContent = 'Air Suspension • AC Lounge';
          this.toast('Switched to Highway Fleet Tour', 'info');
        }
        video.load();
        video.play().catch(() => {});
      });
    }

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        const icon = soundBtn.querySelector('i');
        if (icon) {
          if (video.muted) {
            icon.className = 'bi bi-volume-mute-fill';
            this.toast('Fleet tour audio muted', 'info');
          } else {
            icon.className = 'bi bi-volume-up-fill text-amber-400';
            this.toast('Fleet tour audio enabled', 'success');
          }
        }
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const icon = playBtn.querySelector('i');
        if (video.paused) {
          video.dataset.userPaused = '';
          video.play().then(() => {
            if (icon) icon.className = 'bi bi-pause-fill';
          }).catch(() => {});
        } else {
          video.dataset.userPaused = 'true';
          video.pause();
          if (icon) icon.className = 'bi bi-play-fill';
        }
      });
    }

    // Auto pause when scrolled away to save device battery & performance
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && !video.paused) {
            video.pause();
          } else if (entry.isIntersecting && video.paused && !video.dataset.userPaused) {
            video.play().catch(() => {});
          }
        });
      }, { threshold: 0.25 });
      observer.observe(video);
    }
  },

  // 10. Toast notification system
  toast(message, type = 'info', title = '') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const typeIcons = {
      success: 'bi-check-circle-fill text-emerald-400',
      error: 'bi-x-circle-fill text-rose-500',
      warning: 'bi-exclamation-triangle-fill text-amber-400',
      info: 'bi-info-circle-fill text-sky-400'
    };

    const toastEl = document.createElement('div');
    toastEl.className = 'toast-item';
    toastEl.innerHTML = `
      <i class="bi ${typeIcons[type] || typeIcons.info} text-xl mt-0.5"></i>
      <div class="flex-1">
        ${title ? `<h5 class="text-sm font-bold text-slate-100 mb-0.5">${title}</h5>` : ''}
        <p class="text-xs text-slate-300 leading-relaxed">${message}</p>
      </div>
      <button type="button" class="text-slate-400 hover:text-slate-100 text-sm transition" onclick="this.parentElement.remove()">
        <i class="bi bi-x-lg"></i>
      </button>
    `;

    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.add('hide');
      setTimeout(() => toastEl.remove(), 250);
    }, 3500);
  },

  // 11. Single-Sheet Professional Ticket Engine
  initPrintContainer() {
    if (!document.getElementById('rk-print-container')) {
      const container = document.createElement('div');
      container.id = 'rk-print-container';
      document.body.appendChild(container);
    }

    window.addEventListener('beforeprint', () => {
      const printContainer = document.getElementById('rk-print-container');
      if (printContainer && (!printContainer.innerHTML || printContainer.innerHTML.trim() === '')) {
        const bookings = typeof BusGoDB !== 'undefined' ? BusGoDB.getBookings() : [];
        if (bookings && bookings.length > 0) {
          printContainer.innerHTML = this.generateTicketHTML(bookings[0], true);
        }
      }
    });
  },

  generateTicketHTML(booking, isPrintOnly = false) {
    if (!booking) return '';

    const formattedBookedDate = booking.bookedAt 
      ? new Date(booking.bookedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const calcReporting = (depTime) => {
      try {
        const match = (depTime || '').match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return depTime;
        let h = parseInt(match[1]);
        let m = parseInt(match[2]);
        const ampm = match[3].toUpperCase();
        m -= 15;
        if (m < 0) {
          m += 60;
          h -= 1;
          if (h < 1) h = 12;
        }
        const mm = m < 10 ? '0' + m : m;
        return `${h}:${mm} ${ampm}`;
      } catch (e) {
        return depTime;
      }
    };

    const generateBarcode = (text) => {
      let rects = '';
      let x = 4;
      const str = String(text || 'RKBUS');
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        const w1 = (code % 3) + 1.2;
        const w2 = ((code * 2) % 3) + 1;
        rects += `<rect x="${x.toFixed(1)}" y="0" width="${w1.toFixed(1)}" height="26" fill="#0f172a" />`;
        x += w1 + 1.8;
        rects += `<rect x="${x.toFixed(1)}" y="0" width="${w2.toFixed(1)}" height="26" fill="#0f172a" />`;
        x += w2 + 1.8;
      }
      return `<svg viewBox="0 0 ${Math.ceil(x + 4)} 28" style="height: 22px; width: 140px;" preserveAspectRatio="none">${rects}</svg>`;
    };

    const containerClasses = isPrintOnly
      ? 'ticket-print-sheet'
      : 'ticket-modal-card p-4 sm:p-5 rounded-2xl max-w-3xl mx-auto shadow-2xl';

    const bgSheet = 'background: #ffffff !important; color: #0f172a !important; border: 1.5px solid #cbd5e1;';
    const cardBg = 'background: #f8fafc; border: 1.5px solid #e2e8f0;';
    const textMuted = 'color: #475569;';
    const textSub = 'color: #64748b;';
    const textDark = 'color: #0f172a;';
    const textBrand = 'color: #b45309;';
    const textGreen = 'color: #047857;';

    const totalFare = booking.fareBreakdown?.totalFare ?? 0;
    const baseFare = booking.fareBreakdown?.baseFare ?? totalFare;
    const tax = booking.fareBreakdown?.tax ?? 0;
    const discount = booking.fareBreakdown?.discount ?? 0;

    return `
      <div class="${containerClasses}" style="${bgSheet}">
        
        <!-- Header Strip with Logo -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="assets/images/logo.jpg" alt="RK BUS Logo" style="width: 46px; height: 46px; border-radius: 10px; object-fit: cover; border: 1.5px solid #f59e0b; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); shrink-0;">
            <div>
              <div style="font-size: 17px; font-weight: 900; letter-spacing: 0.5px; ${textDark} line-height: 1.2;">
                RK BUS <span style="color: #b45309;">EXPRESS</span>
              </div>
              <div style="font-size: 9.5px; font-weight: 800; ${textMuted} letter-spacing: 0.5px; text-transform: uppercase;">
                Tamil Nadu Intercity Luxury Liners • Official Boarding Pass
              </div>
              <div style="font-size: 8.5px; font-weight: 600; ${textSub}">
                GSTIN: 33AAACR8842K1ZX • 24x7 Helpline: +91 98765 43210 • support@rkbus.com
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; background: #ecfdf5; color: #047857; border: 1.5px solid #6ee7b7; font-size: 9.5px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
              ✓ ${booking.status === 'Cancelled' ? 'Cancelled' : 'Confirmed'}
            </span>
            <div style="font-family: monospace; font-size: 15px; font-weight: 900; ${textBrand} margin-top: 2px; letter-spacing: 0.8px;">
              ${booking.pnr}
            </div>
            <div style="font-size: 8.5px; font-weight: 700; ${textMuted}">
              Ticket #: TKT-${booking.pnr.replace(/[^0-9]/g, '') || '784291'} • Booked: ${formattedBookedDate}
            </div>
          </div>
        </div>

        <!-- Main Journey Corridor Strip -->
        <div style="${cardBg} border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px;">
          <div>
            <div style="font-size: 8.5px; text-transform: uppercase; font-weight: 800; ${textSub} letter-spacing: 0.5px;">ORIGIN</div>
            <div style="font-size: 14px; font-weight: 900; ${textDark}">${booking.from}</div>
            <div style="font-size: 12px; font-weight: 900; ${textBrand}">${booking.departureTime}</div>
            <div style="font-size: 9.5px; font-weight: 700; color: #334155;">Travel Date: ${booking.departureDate}</div>
          </div>
          <div style="text-align: center; padding: 0 10px;">
            <span style="font-size: 9px; font-weight: 800; background: #e2e8f0; color: #0f172a; padding: 2px 8px; border-radius: 9999px;">
              ${booking.duration || 'Direct'}
            </span>
            <div style="color: #d97706; font-size: 13px; margin: 2px 0;">────── 🚍 ──────></div>
            <div style="font-size: 9px; font-weight: 800; color: #334155;">${booking.operator}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 8.5px; text-transform: uppercase; font-weight: 800; ${textSub} letter-spacing: 0.5px;">DESTINATION</div>
            <div style="font-size: 14px; font-weight: 900; ${textDark}">${booking.to}</div>
            <div style="font-size: 12px; font-weight: 900; ${textGreen}">${booking.arrivalTime}</div>
            <div style="font-size: 9.5px; font-weight: 700; color: #334155;">Drop: Next Morning</div>
          </div>
        </div>

        <!-- Bus & Seat Details Strip -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 8px; font-size: 10px;">
          <div style="${cardBg} border-radius: 6px; padding: 6px 8px;">
            <span style="font-size: 8px; text-transform: uppercase; font-weight: 800; ${textSub} display: block;">COACH / BUS TYPE</span>
            <strong style="font-size: 10px; font-weight: 800; ${textDark}">${booking.busName || booking.busType}</strong>
          </div>
          <div style="${cardBg} border-radius: 6px; padding: 6px 8px;">
            <span style="font-size: 8px; text-transform: uppercase; font-weight: 800; ${textSub} display: block;">SEAT NUMBER(S)</span>
            <strong style="font-size: 12px; font-weight: 900; ${textBrand}">${booking.seats.join(', ')}</strong>
          </div>
          <div style="${cardBg} border-radius: 6px; padding: 6px 8px;">
            <span style="font-size: 8px; text-transform: uppercase; font-weight: 800; ${textSub} display: block;">BOARDING PLATFORM</span>
            <strong style="font-size: 10px; font-weight: 800; ${textDark}">Bay 4 • KCBT Concourse</strong>
          </div>
          <div style="${cardBg} border-radius: 6px; padding: 6px 8px;">
            <span style="font-size: 8px; text-transform: uppercase; font-weight: 800; ${textSub} display: block;">REPORTING TIME</span>
            <strong style="font-size: 10px; font-weight: 900; ${textBrand}">${calcReporting(booking.departureTime)} (15m Prior)</strong>
          </div>
        </div>

        <!-- Boarding & Dropping Point Breakdown -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
          <div style="${cardBg} border-radius: 6px; padding: 7px 9px; font-size: 9.5px;">
            <div style="font-size: 8.5px; font-weight: 900; text-transform: uppercase; ${textBrand} margin-bottom: 2px;">
              📍 BOARDING LOCATION
            </div>
            <div style="font-weight: 800; ${textDark} font-size: 10.5px;">${booking.boardingPoint}</div>
            <div style="font-size: 8px; font-weight: 600; ${textMuted} margin-top: 1px;">
              Reporting strictly 15 minutes before departure. Terminal Desk: +91 98765 00111
            </div>
          </div>
          <div style="${cardBg} border-radius: 6px; padding: 7px 9px; font-size: 9.5px;">
            <div style="font-size: 8.5px; font-weight: 900; text-transform: uppercase; ${textGreen} margin-bottom: 2px;">
              🏁 DROPPING LOCATION
            </div>
            <div style="font-weight: 800; ${textDark} font-size: 10.5px;">${booking.droppingPoint}</div>
            <div style="font-size: 8px; font-weight: 600; ${textMuted} margin-top: 1px;">
              Drop at Central Terminal Omni stand. Transit & taxis available 24/7.
            </div>
          </div>
        </div>

        <!-- Passenger Table -->
        <div style="margin-bottom: 8px; overflow: hidden; border-radius: 6px; border: 1.5px solid #cbd5e1; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: left;">
            <thead>
              <tr style="background: #f1f5f9; ${textDark} font-weight: 800; border-bottom: 1.5px solid #cbd5e1; font-size: 8px; text-transform: uppercase;">
                <th style="padding: 5px 7px;">#</th>
                <th style="padding: 5px 7px;">Passenger Name</th>
                <th style="padding: 5px 7px;">Age & Gender</th>
                <th style="padding: 5px 7px;">Seat</th>
                <th style="padding: 5px 7px;">Berth Type</th>
                <th style="padding: 5px 7px; text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${(booking.passengers || []).map((p, idx) => `
                <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                  <td style="padding: 5px 7px; font-weight: 700; ${textSub}">${idx + 1}</td>
                  <td style="padding: 5px 7px; font-weight: 800; color: #0f172a !important;">${p.name}</td>
                  <td style="padding: 5px 7px; font-weight: 600; color: #334155 !important;">${p.age} yrs • ${p.gender}</td>
                  <td style="padding: 5px 7px; font-weight: 900; color: #b45309 !important;">${p.seat}</td>
                  <td style="padding: 5px 7px; font-weight: 600; color: #334155 !important;">${p.seat.startsWith('U') ? 'Upper Sleeper' : 'Lower Sleeper'} Window</td>
                  <td style="padding: 5px 7px; text-align: right; font-weight: 800; color: #047857 !important;">Confirmed</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Fare Breakdown & Barcode/QR Section -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px; align-items: center; margin-bottom: 8px; padding: 7px 9px; ${cardBg} border-radius: 6px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 9px; ${textMuted} margin-bottom: 1px;">
              <span>Base Fare (${(booking.passengers || []).length} Passenger${(booking.passengers || []).length > 1 ? 's' : ''}):</span>
              <span style="font-weight: 800; ${textDark}">₹${baseFare.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 9px; ${textMuted} margin-bottom: 1px;">
              <span>Integrated GST (5%):</span>
              <span style="font-weight: 800; ${textDark}">₹${tax.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 9px; color: #047857; font-weight: 800; margin-bottom: 1px;">
                <span>Discount Applied (${booking.fareBreakdown?.promoCode || 'PROMO'}):</span>
                <span>-₹${discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; ${textDark} border-top: 1px dashed #cbd5e1; padding-top: 3px; margin-top: 2px;">
              <span>Total Amount Paid:</span>
              <span style="${textBrand}">₹${totalFare.toFixed(2)}</span>
            </div>
            <div style="font-size: 8px; ${textMuted} margin-top: 1px; font-weight: 600;">
              Payment Status: <strong style="color: #047857; font-weight: 900;">PAID ONLINE</strong> (${booking.paymentMethod || 'UPI / NetBanking'}) • Ref: TXN-${booking.pnr.replace(/[^0-9]/g, '') || '98421'}
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; text-align: center;">
            <div>
              ${generateBarcode(booking.pnr)}
              <div style="font-family: monospace; font-size: 8px; font-weight: 800; ${textDark} margin-top: 1px; letter-spacing: 0.5px;">
                * ${booking.pnr} *
              </div>
            </div>
            <div>
              <img src="${booking.qrCode || 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + booking.pnr}" alt="QR" style="width: 48px; height: 48px; background: #ffffff; padding: 2px; border-radius: 6px; border: 1px solid #cbd5e1;">
              <span style="font-size: 7.5px; font-weight: 700; color: #334155; display: block; margin-top: 1px;">Gate Entry QR</span>
            </div>
          </div>
        </div>

        <!-- Travel Policy Instructions in High-Contrast Box -->
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 10px; margin-bottom: 6px; font-size: 8px; line-height: 1.35;">
          <div style="font-weight: 900; color: #92400e; text-transform: uppercase; font-size: 8px; margin-bottom: 3px; letter-spacing: 0.5px;">
            ⚠️ IMPORTANT TRAVEL GUIDELINES:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px 10px; color: #78350f; font-weight: 600;">
            <div>• <strong style="color: #92400e; font-weight: 900;">Photo ID Mandatory:</strong> Original Government ID (Aadhaar / Voter ID / DL) required during boarding.</div>
            <div>• <strong style="color: #92400e; font-weight: 900;">Reporting Time:</strong> Please report at boarding point 15 mins prior. Coach departs sharply on schedule.</div>
            <div>• <strong style="color: #92400e; font-weight: 900;">Luggage Allowance:</strong> Max 23 kg check-in baggage per seat in lower luggage bay + 1 handbag inside cabin.</div>
            <div>• <strong style="color: #92400e; font-weight: 900;">Cancellations & Help:</strong> Easy cancellation via Dashboard. 24x7 WhatsApp support: +91 98765 43210.</div>
          </div>
        </div>

        <!-- Footer Signoff -->
        <div style="text-align: center; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; font-size: 7.5px; font-weight: 700; color: #475569;">
          Computer-generated official travel document & tax invoice • RK BUS TAMIL NADU EXPRESS • Have a pleasant journey!
        </div>

      </div>
    `;
  },

  printTicket(pnr) {
    let booking = null;
    if (typeof pnr === 'object' && pnr !== null) {
      booking = pnr;
    } else if (typeof BusGoDB !== 'undefined') {
      const bookings = BusGoDB.getBookings();
      booking = bookings.find(b => b.pnr === pnr);
    }
    if (!booking) {
      this.toast('Unable to find ticket details to print', 'error');
      return;
    }

    let printContainer = document.getElementById('rk-print-container');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'rk-print-container';
      document.body.appendChild(printContainer);
    }

    printContainer.innerHTML = this.generateTicketHTML(booking, true);

    setTimeout(() => {
      window.print();
    }, 80);
  }
};

// Auto run when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  BusGoUI.init();
});
