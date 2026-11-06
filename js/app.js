/**
 * BusGo - Global App Controller
 * Theme, RTL, Session Navbar, Toasts, City Swap, and Global UI interactions
 */

const BusGoUI = {
  init() {
    this.initTheme();
    this.initRTL();
    this.initNavbar();
    this.initCitySwapButtons();
    this.initDatePickers();
    this.initCopyButtons();
    this.initModals();
    this.initAccordions();
    this.initVideoPlayer();
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
      window.location.href = 'login.html?signedOut=true';
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
  }
};

// Auto run when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  BusGoUI.init();
});
