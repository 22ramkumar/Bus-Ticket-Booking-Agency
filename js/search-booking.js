/**
 * BusGo - Search Results, Interactive Seat Selection, Passenger Forms & Booking Engine
 * Tamil Nadu Edition
 */

const CURRENCY = '₹';

const BookingEngine = {
  activeBus: null,
  activeDate: null,
  selectedSeats: [],
  selectedBoarding: null,
  selectedDropping: null,
  appliedPromo: null,
  includeInsurance: false,

  init() {
    this.initSearchParams();
    this.renderBuses();
    this.initFiltersAndSorting();
    this.initPromoFromURL();
    this.checkAutoOpenSeat();
  },

  // Auto-open seat selector if coming from "Book Seats" button or search results
  checkAutoOpenSeat() {
    const params = new URLSearchParams(window.location.search);
    const busId = params.get('busId');
    const autoSeat = params.get('autoseat');

    let targetBusId = busId;

    if (!targetBusId && (autoSeat === 'true' || autoSeat === '1')) {
      const firstDrawer = document.querySelector('[id^="seat-drawer-"]');
      if (firstDrawer) {
        targetBusId = firstDrawer.id.replace('seat-drawer-', '');
      }
    }

    // If there is only 1 bus displayed (like Coimbatore -> Ooty in Image 1!), auto open it!
    if (!targetBusId) {
      const allDrawers = document.querySelectorAll('[id^="seat-drawer-"]');
      if (allDrawers.length === 1) {
        targetBusId = allDrawers[0].id.replace('seat-drawer-', '');
      }
    }

    if (targetBusId) {
      setTimeout(() => {
        const drawer = document.getElementById(`seat-drawer-${targetBusId}`);
        if (drawer && drawer.classList.contains('hidden')) {
          this.toggleSeatLayout(targetBusId);
        }
        const card = document.getElementById(`bus-card-${targetBusId}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 180);
    }
  },

  // Read search parameters from URL or ActiveSearch state
  initSearchParams() {
    const params = new URLSearchParams(window.location.search);
    const stored = BusGoDB.getActiveSearch() || {};

    const fromCity = params.get('from') || stored.from || "Chennai, TN";
    const toCity = params.get('to') || stored.to || "Coimbatore, TN";
    const travelDate = params.get('date') || stored.date || new Date().toISOString().split('T')[0];

    this.activeDate = travelDate;

    // Populate inputs if on page
    const fromInput = document.querySelector('[name="from_city"]');
    const toInput = document.querySelector('[name="to_city"]');
    const dateInput = document.querySelector('[name="travel_date"]');

    if (fromInput) fromInput.value = fromCity;
    if (toInput) toInput.value = toCity;
    if (dateInput) {
      dateInput.value = travelDate;
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    // Update heading labels
    const queryHeader = document.getElementById('search-summary-route');
    if (queryHeader) {
      queryHeader.innerHTML = `
        <span class="font-bold text-slate-100">${fromCity}</span>
        <i class="bi bi-arrow-right text-amber-400 mx-2 route-arrow"></i>
        <span class="font-bold text-slate-100">${toCity}</span>
      `;
    }

    const querySub = document.getElementById('search-summary-meta');
    if (querySub) {
      const dateObj = new Date(travelDate);
      const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      querySub.textContent = `${formattedDate} • 1 Passenger • All Classes`;
    }
  },

  initPromoFromURL() {
    const params = new URLSearchParams(window.location.search);
    const promoCode = params.get('promo');
    if (promoCode) {
      const promoInput = document.getElementById('promo-input');
      if (promoInput) {
        promoInput.value = promoCode;
      }
    }
  },

  // Filter & Sort
  initFiltersAndSorting() {
    const filterForm = document.getElementById('bus-filters-form');
    if (filterForm) {
      filterForm.addEventListener('change', () => this.renderBuses());
    }

    const sortSelect = document.getElementById('bus-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => this.renderBuses());
    }

    const priceSlider = document.getElementById('price-range-slider');
    const priceDisplay = document.getElementById('price-range-display');
    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener('input', (e) => {
        priceDisplay.textContent = `₹${e.target.value}`;
        this.renderBuses();
      });
    }

    // Modify Search Form
    const modifyForm = document.getElementById('modify-search-form');
    if (modifyForm) {
      modifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const from = modifyForm.querySelector('[name="from_city"]').value;
        const to = modifyForm.querySelector('[name="to_city"]').value;
        const date = modifyForm.querySelector('[name="travel_date"]').value;

        BusGoDB.setActiveSearch({ from, to, date });
        window.location.href = `booking.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
      });
    }
  },

  renderBuses() {
    const container = document.getElementById('bus-results-list');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const stored = BusGoDB.getActiveSearch() || {};
    const fromCity = params.get('from') || stored.from || "Chennai, TN";
    const toCity = params.get('to') || stored.to || "Coimbatore, TN";

    let buses = BusGoDB.getBuses(fromCity, toCity);
    if (!buses.length) {
      buses = BusGoDB.getBuses();
    }

    // Apply Filter form values
    const filterForm = document.getElementById('bus-filters-form');
    if (filterForm) {
      const selectedTypes = Array.from(filterForm.querySelectorAll('input[name="bus_type"]:checked')).map(cb => cb.value);
      if (selectedTypes.length > 0 && !selectedTypes.includes('all')) {
        buses = buses.filter(b => selectedTypes.includes(b.category));
      }

      const maxPrice = parseFloat(document.getElementById('price-range-slider')?.value || 2000);
      buses = buses.filter(b => b.fare <= maxPrice);

      const selectedTimes = Array.from(filterForm.querySelectorAll('input[name="time_slot"]:checked')).map(cb => cb.value);
      if (selectedTimes.length > 0) {
        buses = buses.filter(b => {
          const hour = parseInt(b.departureTime.split(':')[0], 10);
          const isPM = b.departureTime.includes('PM');
          const hr24 = isPM && hour < 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

          if (selectedTimes.includes('morning') && hr24 >= 6 && hr24 < 12) return true;
          if (selectedTimes.includes('afternoon') && hr24 >= 12 && hr24 < 18) return true;
          if (selectedTimes.includes('evening') && hr24 >= 18 && hr24 < 23) return true;
          if (selectedTimes.includes('night') && (hr24 >= 23 || hr24 < 6)) return true;
          return false;
        });
      }
    }

    // Sorting
    const sortSelect = document.getElementById('bus-sort-select');
    const sortValue = sortSelect ? sortSelect.value : 'price_asc';

    if (sortValue === 'price_asc') {
      buses.sort((a, b) => a.fare - b.fare);
    } else if (sortValue === 'price_desc') {
      buses.sort((a, b) => b.fare - a.fare);
    } else if (sortValue === 'rating') {
      buses.sort((a, b) => b.rating - a.rating);
    } else if (sortValue === 'duration') {
      buses.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    }

    // Update count indicator
    const countBadge = document.getElementById('bus-results-count');
    if (countBadge) {
      countBadge.textContent = `${buses.length} Buses Available`;
    }

    if (buses.length === 0) {
      container.innerHTML = `
        <div class="glass-card rounded-2xl p-12 text-center">
          <i class="bi bi-bus-front text-5xl text-slate-500 mb-4 block"></i>
          <h4 class="text-xl font-bold text-slate-200 mb-2">No buses match your filters</h4>
          <p class="text-sm text-slate-400 max-w-md mx-auto mb-6">Try resetting filters or adjusting your price and departure time preferences.</p>
          <button type="button" onclick="BookingEngine.resetFilters()" class="px-5 py-2.5 rounded-xl btn-amber text-sm font-bold">
            Reset All Filters
          </button>
        </div>
      `;
      return;
    }

    // Render cards
    container.innerHTML = buses.map(bus => {
      const bookedSeats = BusGoDB.getBookedSeats(bus.id, this.activeDate);
      const remainingSeats = Math.max(0, bus.totalSeats - bookedSeats.length);

      return `
        <div class="glass-card rounded-2xl p-5 md:p-6 mb-5 transition-all duration-300 hover:border-amber-500/40" id="bus-card-${bus.id}">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <!-- Left Info: Operator & Bus Details -->
            <div class="lg:col-span-4">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl font-bold">
                  <i class="bi ${bus.operatorLogo || 'bi-shield-check'}"></i>
                </div>
                <div>
                  <h4 class="font-bold text-base text-slate-100 flex items-center gap-2">
                    ${bus.operator}
                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <i class="bi bi-star-fill text-[10px]"></i> ${bus.rating}
                    </span>
                  </h4>
                  <p class="text-xs text-slate-400">${bus.busName}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-3">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  ${bus.busType}
                </span>
                <span class="text-xs text-slate-400">${bus.totalRatings} verified reviews</span>
              </div>
            </div>

            <!-- Middle: Timing, Route, Duration -->
            <div class="lg:col-span-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-lg font-extrabold text-slate-100">${bus.departureTime}</p>
                  <p class="text-xs text-slate-400 font-medium truncate max-w-[130px]">${bus.from}</p>
                  <p class="text-[11px] text-amber-400/80 mt-0.5">${bus.boardingPoints[0].name.split('(')[0]}</p>
                </div>

                <div class="flex flex-col items-center px-3">
                  <span class="text-xs text-slate-400 font-semibold mb-1">${bus.duration}</span>
                  <div class="w-28 md:w-36 flex items-center relative">
                    <div class="w-2 h-2 rounded-full bg-slate-500"></div>
                    <div class="flex-1 h-[2px] bg-slate-700 relative">
                      <i class="bi bi-bus-front text-amber-400 text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-1"></i>
                    </div>
                    <div class="w-2 h-2 rounded-full bg-amber-400"></div>
                  </div>
                  <span class="text-[10px] text-emerald-400 mt-1 font-medium">Direct Non-Stop</span>
                </div>

                <div class="text-right">
                  <p class="text-lg font-extrabold text-slate-100">${bus.arrivalTime}</p>
                  <p class="text-xs text-slate-400 font-medium truncate max-w-[130px]">${bus.to}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">${bus.droppingPoints[0].name.split('(')[0]}</p>
                </div>
              </div>

              <!-- Amenities & Travel Date Pills -->
              <div class="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
                <span class="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <i class="bi bi-calendar-event"></i> Travel Date: ${this.activeDate}
                </span>
                ${bus.amenities.slice(0, 4).map(amenity => `
                  <span class="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded">
                    <i class="bi bi-check2 text-amber-400 text-xs"></i> ${amenity}
                  </span>
                `).join('')}
              </div>
            </div>

            <!-- Right: Fare & Action -->
            <div class="lg:col-span-3 lg:border-l lg:border-slate-800 lg:pl-6 flex flex-row lg:flex-col justify-between items-center lg:items-end">
              <div class="text-left lg:text-right">
                <span class="text-xs text-slate-400 block">Starting from</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-black text-amber-400">₹${bus.fare}</span>
                  <span class="text-xs text-slate-400">/ seat</span>
                </div>
                <p class="text-xs ${remainingSeats <= 5 ? 'text-rose-400 font-bold' : 'text-emerald-400'} mt-1">
                  ${remainingSeats} seats left
                </p>
              </div>

              <button type="button" id="btn-select-seats-${bus.id}" onclick="BookingEngine.toggleSeatLayout('${bus.id}')" class="px-5 py-2.5 rounded-xl btn-amber font-bold text-sm flex items-center gap-2 mt-0 lg:mt-4 shadow-sm hover:scale-105 transition-all">
                <span class="seat-btn-text">Select Seats</span>
                <i class="bi bi-chevron-down text-xs transition-transform" id="seat-chevron-${bus.id}"></i>
              </button>
            </div>

          </div>

          <!-- Collapsible Seat Selection Container (Image 2) -->
          <div id="seat-drawer-${bus.id}" class="hidden mt-6 pt-6 border-t border-slate-200 dark:border-slate-800"></div>

        </div>
      `;
    }).join('');
  },

  resetFilters() {
    const filterForm = document.getElementById('bus-filters-form');
    if (filterForm) filterForm.reset();
    const priceSlider = document.getElementById('price-range-slider');
    if (priceSlider) priceSlider.value = 2000;
    const priceDisplay = document.getElementById('price-range-display');
    if (priceDisplay) priceDisplay.textContent = '₹2000';
    this.renderBuses();
    BusGoUI.toast('Filters reset to default', 'info');
  },

  // Toggle visual seat selection drawer
  toggleSeatLayout(busId) {
    const drawer = document.getElementById(`seat-drawer-${busId}`);
    const chevron = document.getElementById(`seat-chevron-${busId}`);
    const btn = document.getElementById(`btn-select-seats-${busId}`);
    if (!drawer) return;

    if (!drawer.classList.contains('hidden')) {
      drawer.classList.add('hidden');
      if (chevron) chevron.classList.remove('rotate-180');
      if (btn && typeof btn.querySelector === 'function') {
        const textSpan = btn.querySelector('.seat-btn-text');
        if (textSpan) textSpan.textContent = 'Select Seats';
      }
      this.activeBus = null;
      this.selectedSeats = [];
      return;
    }

    // Close any other open drawers
    document.querySelectorAll('[id^="seat-drawer-"]').forEach(d => d.classList.add('hidden'));
    document.querySelectorAll('[id^="seat-chevron-"]').forEach(c => c.classList.remove('rotate-180'));
    document.querySelectorAll('.seat-btn-text').forEach(t => t.textContent = 'Select Seats');

    this.activeBus = BusGoDB.getBusById(busId) || BusGoDB.getBuses().find(b => b.id === busId);
    this.selectedSeats = [];
    this.selectedBoarding = this.activeBus.boardingPoints[0].name;
    this.selectedDropping = this.activeBus.droppingPoints[0].name;

    drawer.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
    if (btn && typeof btn.querySelector === 'function') {
      const textSpan = btn.querySelector('.seat-btn-text');
      if (textSpan) textSpan.textContent = 'Hide Seats';
    }

    this.renderSeatLayout(drawer, this.activeBus);
  },

  renderSeatLayout(container, bus) {
    const bookedSeats = BusGoDB.getBookedSeats(bus.id, this.activeDate);

    container.innerHTML = `
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        <!-- Left/Center: Two Deck Cards (Image 2) -->
        <div class="xl:col-span-8 bg-slate-100/60 dark:bg-slate-950/70 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          
          <!-- Legend Header matching Image 2 -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
            <div>
              <h5 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <i class="bi bi-grid-3x3-gap-fill text-amber-500"></i> Select Your Desired Seats
              </h5>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Click on any available berth (green outline) to select or unselect.</p>
            </div>

            <!-- Legend items matching Image 2 -->
            <div class="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              <!-- Available -->
              <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <span class="w-4 h-6 rounded-md border-2 border-emerald-600 bg-white dark:bg-slate-800 inline-flex flex-col justify-end items-center p-0.5 shadow-sm">
                  <span class="w-2.5 h-1 rounded-full bg-emerald-300 dark:bg-emerald-600"></span>
                </span>
                <span>Available</span>
              </div>
              <!-- Selected -->
              <div class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                <span class="w-4 h-6 rounded-md border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/60 inline-flex items-center justify-center text-[10px]">
                  <i class="bi bi-person-fill text-blue-600 dark:text-blue-400"></i>
                </span>
                <span>Selected</span>
              </div>
              <!-- Sold -->
              <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <span class="w-4 h-6 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 inline-flex items-center justify-center text-[10px] text-slate-400">✕</span>
                <span>Sold</span>
              </div>
              <!-- Ladies Sold -->
              <div class="flex items-center gap-1.5 text-pink-500 font-medium">
                <span class="w-4 h-6 rounded-md border border-pink-300 dark:border-pink-900/60 bg-pink-50 dark:bg-pink-950/40 inline-flex items-center justify-center text-[10px] text-pink-400">✕</span>
                <span>Ladies Sold</span>
              </div>
            </div>
          </div>

          <!-- The 2 Side-by-Side Decks Container (Exact match for Image 2) -->
          <div id="deck-wrapper-${bus.id}">
            ${this.generateTwoDecksHTML(bus, bookedSeats)}
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400 text-center mt-5">
            <i class="bi bi-info-circle mr-1 text-amber-500"></i> Selected berths will be reserved exclusively for you. Maximum 6 seats per booking.
          </p>

        </div>

        <!-- Right: Boarding & Selection Summary Sidebar -->
        <div class="xl:col-span-4 space-y-4">
          
          <!-- Boarding & Dropping Points -->
          <div class="deck-container-card space-y-3">
            <h6 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <i class="bi bi-geo-alt-fill text-amber-500"></i> Boarding & Dropping Point
            </h6>
            <div>
              <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Boarding Point</label>
              <select id="select-boarding-point" onchange="BookingEngine.selectedBoarding = this.value" class="w-full form-control-busgo rounded-xl px-3 py-2 text-xs font-semibold">
                ${bus.boardingPoints.map(bp => `<option value="${bp.name}">${bp.time} - ${bp.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Dropping Point</label>
              <select id="select-dropping-point" onchange="BookingEngine.selectedDropping = this.value" class="w-full form-control-busgo rounded-xl px-3 py-2 text-xs font-semibold">
                ${bus.droppingPoints.map(dp => `<option value="${dp.name}">${dp.time} - ${dp.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Selected Seats Summary Card -->
          <div class="deck-container-card">
            <div class="flex items-center justify-between mb-2">
              <h6 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Selected Seats</h6>
              <span class="text-xs font-bold text-amber-500" id="summary-seat-count-badge">0 Seats</span>
            </div>

            <div id="selected-seats-pills" class="flex flex-wrap gap-2 min-h-[38px] items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 mb-3">
              <span class="text-xs text-slate-400 italic">No seats selected yet</span>
            </div>

            <!-- Price Breakdown -->
            <div class="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div class="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Base Fare (<span id="summary-seat-count">0</span> seats)</span>
                <span class="font-bold text-slate-800 dark:text-slate-200" id="summary-base-fare">₹0.00</span>
              </div>
              <div class="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Taxes & GST (10%)</span>
                <span class="font-bold text-slate-800 dark:text-slate-200" id="summary-tax">₹0.00</span>
              </div>
              <div class="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Convenience Fee</span>
                <span class="font-bold text-slate-800 dark:text-slate-200" id="summary-fee">₹0.00</span>
              </div>
              <div class="flex justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Amount</span>
                <span class="text-amber-500" id="summary-total-fare">₹0.00</span>
              </div>
            </div>

            <!-- Action Button -->
            <button type="button" id="btn-proceed-passengers" disabled onclick="BookingEngine.openPassengerStep()" class="mt-3 w-full py-2 px-3 rounded-lg btn-amber font-bold text-xs flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed transition shadow-sm">
              <span>Proceed to Passenger Details</span>
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>

        </div>

      </div>
    `;
  },

  // Generates 2 Side-by-Side Decks exactly matching Image 2
  generateTwoDecksHTML(bus, bookedSeats) {
    const lowerRows = [
      { single: "L01", d1: "L02", d2: "L03" },
      { single: "L04", d1: "L05", d2: "L06" },
      { single: "L07", d1: "L08", d2: "L09" },
      { single: "L10", d1: "L11", d2: "L12" },
      { single: "L13", d1: "L14", d2: "L15" }
    ];

    const upperRows = [
      { single: "U01", d1: "U02", d2: "U03" },
      { single: "U04", d1: "U05", d2: "U06" },
      { single: "U07", d1: "U08", d2: "U09" },
      { single: "U10", d1: "U11", d2: "U12" },
      { single: "U13", d1: "U14", d2: "U15" }
    ];

    const renderBerthCell = (seatId, fare) => {
      const isSelected = this.selectedSeats.includes(seatId);
      const isBooked = bookedSeats.includes(seatId);
      const isLadies = BusGoDB.isSeatLadiesReserved(seatId);

      if (isBooked) {
        if (isLadies) {
          // Ladies Sold: soft pink tint with pink cross (Image 2)
          return `
            <div class="berth-cell" title="Seat ${seatId} - Sold (Female Passenger)">
              <div class="berth-box berth-ladies-sold">
                <div class="flex-1 flex items-center justify-center">
                  <span class="berth-ladies-cross">✕</span>
                </div>
              </div>
              <span class="berth-subtext text-slate-400 dark:text-slate-500">Sold</span>
            </div>
          `;
        }
        // Regular Sold: subtle gray with slate cross (Image 2)
        return `
          <div class="berth-cell" title="Seat ${seatId} - Sold">
            <div class="berth-box berth-sold">
              <div class="flex-1 flex items-center justify-center">
                <span class="berth-cross">✕</span>
              </div>
            </div>
            <span class="berth-subtext text-slate-400 dark:text-slate-500">Sold</span>
          </div>
        `;
      }

      if (isSelected) {
        // Selected: blue border, person icon, blue pillow, bold blue price (Image 2)
        return `
          <div class="berth-cell" onclick="BookingEngine.handleSeatClick('${seatId}')" title="Seat ${seatId} (Selected: ₹${fare})">
            <div class="berth-box berth-selected" data-seat="${seatId}">
              <div class="flex-1 flex items-center justify-center">
                <i class="bi bi-person-fill text-blue-600 dark:text-blue-400 text-lg sm:text-xl"></i>
              </div>
              <div class="berth-pillow"></div>
            </div>
            <span class="berth-subtext font-bold text-blue-600 dark:text-blue-400">₹${fare}</span>
          </div>
        `;
      }

      // Available: sharp green border, bottom green pillow, bold price (Image 2)
      return `
        <div class="berth-cell" onclick="BookingEngine.handleSeatClick('${seatId}')" title="Seat ${seatId} - Click to select (₹${fare})">
          <div class="berth-box berth-available" data-seat="${seatId}">
            <div></div>
            <div class="berth-pillow"></div>
          </div>
          <span class="berth-subtext font-bold text-slate-800 dark:text-slate-200">₹${fare}</span>
        </div>
      `;
    };

    const renderDeck = (title, iconClass, subtitle, rows) => `
      <div class="deck-container-card flex flex-col justify-between">
        <!-- Deck Header matching Image 2 -->
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
              <i class="bi ${iconClass}"></i>
            </div>
            <div>
              <h6 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">${title}</h6>
              <p class="text-[10px] text-slate-400">${subtitle}</p>
            </div>
          </div>
          <span class="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            1 + 2 Berth
          </span>
        </div>

        <!-- Rows Container -->
        <div class="space-y-3 sm:space-y-4">
          ${rows.map(row => `
            <div class="flex items-center justify-between gap-2 sm:gap-3">
              <!-- Left Single Berth -->
              ${renderBerthCell(row.single, bus.fare)}

              <!-- Gangway / Aisle Space -->
              <div class="flex-1 flex items-center justify-center">
                <span class="text-[9px] text-slate-300 dark:text-slate-700 select-none tracking-widest uppercase">AISLE</span>
              </div>

              <!-- Right Double Berths -->
              <div class="flex items-center gap-1.5 sm:gap-2">
                ${renderBerthCell(row.d1, bus.fare)}
                ${renderBerthCell(row.d2, bus.fare)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-xl mx-auto my-2">
        ${renderDeck("Lower Deck", "bi-circle-fill text-[8px]", "Driver Cabin Level", lowerRows)}
        ${renderDeck("Upper Deck", "bi-layers-half", "Panorama Roof Level", upperRows)}
      </div>
    `;
  },

  handleSeatClick(seatId) {
    if (!this.activeBus) return;

    const bookedSeats = BusGoDB.getBookedSeats(this.activeBus.id, this.activeDate);
    if (bookedSeats.includes(seatId)) {
      BusGoUI.toast(`Seat ${seatId} is already booked.`, 'error');
      return;
    }

    if (this.selectedSeats.includes(seatId)) {
      this.selectedSeats = this.selectedSeats.filter(s => s !== seatId);
    } else {
      if (this.selectedSeats.length >= 6) {
        BusGoUI.toast('You can select a maximum of 6 seats per transaction.', 'warning');
        return;
      }
      this.selectedSeats.push(seatId);
    }

    // Instantly re-render the two decks container to reflect Image 2 selected/available state
    const deckWrapper = document.getElementById(`deck-wrapper-${this.activeBus.id}`);
    if (deckWrapper) {
      deckWrapper.innerHTML = this.generateTwoDecksHTML(this.activeBus, bookedSeats);
    }

    this.updateSelectionSummary();
  },

  updateSelectionSummary() {
    const pillsContainer = document.getElementById('selected-seats-pills');
    const seatCountEl = document.getElementById('summary-seat-count');
    const baseFareEl = document.getElementById('summary-base-fare');
    const taxEl = document.getElementById('summary-tax');
    const feeEl = document.getElementById('summary-fee');
    const totalFareEl = document.getElementById('summary-total-fare');
    const proceedBtn = document.getElementById('btn-proceed-passengers');
    const badgeEl = document.getElementById('summary-seat-count-badge');

    const count = this.selectedSeats.length;

    if (count === 0) {
      if (badgeEl) badgeEl.textContent = '0 Seats';
      if (pillsContainer) pillsContainer.innerHTML = '<span class="text-xs text-slate-500 italic">No seats selected yet</span>';
      if (seatCountEl) seatCountEl.textContent = '0';
      if (baseFareEl) baseFareEl.textContent = '₹0.00';
      if (taxEl) taxEl.textContent = '₹0.00';
      if (feeEl) feeEl.textContent = '₹0.00';
      if (totalFareEl) totalFareEl.textContent = '₹0.00';

      if (proceedBtn) {
        proceedBtn.disabled = true;
        proceedBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
      return;
    }

    if (pillsContainer) {
      pillsContainer.innerHTML = this.selectedSeats.map(seat => `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-slate-950">
          ${seat}
          <button type="button" onclick="BookingEngine.handleSeatClick('${seat}')" class="hover:text-rose-600">
            <i class="bi bi-x"></i>
          </button>
        </span>
      `).join('');
    }

    const baseFare = count * this.activeBus.fare;
    const tax = Number((baseFare * 0.10).toFixed(2));
    const fee = 30.00; // ₹30 convenience fee
    const total = Number((baseFare + tax + fee).toFixed(2));

    if (seatCountEl) seatCountEl.textContent = count;
    if (badgeEl) badgeEl.textContent = `${count} Seat${count === 1 ? '' : 's'}`;
    if (baseFareEl) baseFareEl.textContent = `₹${baseFare.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₹${tax.toFixed(2)}`;
    if (feeEl) feeEl.textContent = `₹${fee.toFixed(2)}`;
    if (totalFareEl) totalFareEl.textContent = `₹${total.toFixed(2)}`;

    if (proceedBtn) {
      proceedBtn.disabled = false;
      proceedBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  },

  // Open Step 2: Passenger Details Modal
  openPassengerStep() {
    if (this.selectedSeats.length === 0) return;

    const modal = document.getElementById('booking-step-modal');
    if (!modal) return;

    const savedPassengers = BusGoDB.getSavedPassengers();
    const currentUser = BusGoDB.getCurrentUser();

    const passengerFieldsHTML = this.selectedSeats.map((seat, idx) => `
      <div class="glass-card-elevated p-4 rounded-xl border border-slate-800 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h6 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black flex items-center justify-center">${idx + 1}</span>
            Passenger ${idx + 1} • <span class="text-amber-400 font-extrabold">Seat ${seat}</span>
          </h6>
          ${savedPassengers.length > 0 ? `
            <select onchange="BookingEngine.autofillPassenger(${idx}, this.value)" class="form-control-busgo rounded px-2 py-1 text-xs">
              <option value="">Quick Fill from Saved</option>
              ${savedPassengers.map((p, pIdx) => `<option value="${pIdx}">${p.name} (${p.age}, ${p.gender})</option>`).join('')}
            </select>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Full Name *</label>
            <input type="text" id="pass-name-${idx}" required placeholder="e.g. Ramkumar K" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs font-medium" value="${idx === 0 && currentUser ? currentUser.name : ''}">
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Age *</label>
            <input type="number" id="pass-age-${idx}" required min="1" max="100" placeholder="e.g. 29" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs font-medium" value="${idx === 0 ? '29' : '25'}">
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Gender *</label>
            <select id="pass-gender-${idx}" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs font-medium">
              <option value="Male" ${idx === 0 && currentUser && currentUser.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Female" ${idx === 0 && currentUser && currentUser.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    `).join('');

    const modalBody = document.getElementById('booking-modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="p-6 md:p-8">
          
          <!-- Stepper Header -->
          <div class="booking-stepper mb-6">
            <div class="step-item completed">
              <div class="step-bubble"><i class="bi bi-check2"></i></div>
              <span class="text-xs text-slate-300 mt-1 font-semibold">Seat Selection</span>
            </div>
            <div class="step-item active">
              <div class="step-bubble">2</div>
              <span class="text-xs text-amber-400 mt-1 font-semibold">Passengers</span>
            </div>
            <div class="step-item">
              <div class="step-bubble">3</div>
              <span class="text-xs text-slate-400 mt-1 font-semibold">Payment</span>
            </div>
          </div>

          <!-- Route Banner -->
          <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p class="text-xs text-slate-400">Journey Details</p>
              <h5 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                ${this.activeBus.from} <i class="bi bi-arrow-right text-amber-400 route-arrow"></i> ${this.activeBus.to}
              </h5>
              <p class="text-xs text-slate-400 mt-0.5">${this.activeBus.operator} • ${this.activeDate} at ${this.activeBus.departureTime}</p>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-400 block">Boarding Point</span>
              <span class="text-xs font-bold text-amber-400">${this.selectedBoarding}</span>
            </div>
          </div>

          <!-- Passenger Inputs Form -->
          <form id="passenger-details-form" onsubmit="BookingEngine.handlePassengerSubmit(event)">
            <h5 class="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <i class="bi bi-people-fill text-amber-400"></i> Passenger Information
            </h5>

            ${passengerFieldsHTML}

            <!-- Contact Information -->
            <div class="glass-card-elevated p-4 rounded-xl border border-slate-800 mb-6">
              <h6 class="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
                Ticket Delivery Contact Details
              </h6>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-slate-400 block mb-1">Email Address *</label>
                  <input type="email" id="contact-email" required placeholder="ramkumar@rkbus.com" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs font-medium" value="${currentUser ? currentUser.email : ''}">
                </div>
                <div>
                  <label class="text-xs text-slate-400 block mb-1">Mobile Phone (for SMS / WhatsApp Ticket) *</label>
                  <input type="tel" id="contact-phone" required placeholder="+91 98765 00000" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs font-medium" value="${currentUser ? currentUser.phone : ''}">
                </div>
              </div>
            </div>

            <!-- Optional Insurance -->
            <div class="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between gap-4 mb-6">
              <div class="flex items-center gap-3">
                <input type="checkbox" id="travel-insurance-toggle" onchange="BookingEngine.includeInsurance = this.checked" class="w-4 h-4 accent-amber-400 rounded">
                <div>
                  <p class="text-xs font-bold text-slate-100">Add Comprehensive Travel Insurance (+₹25 / passenger)</p>
                  <p class="text-[11px] text-slate-400">Covers medical emergencies, baggage loss, and up to ₹5,000 trip cancellation protection.</p>
                </div>
              </div>
              <span class="text-xs font-extrabold text-amber-400 shrink-0">₹${(this.selectedSeats.length * 25.00).toFixed(2)}</span>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <button type="button" onclick="BusGoUI.closeModal('booking-step-modal')" class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold">
                <i class="bi bi-arrow-left"></i> Change Seats
              </button>
              <button type="submit" class="px-7 py-3 rounded-xl btn-amber text-xs font-bold flex items-center gap-2">
                <span>Proceed to Payment</span>
                <i class="bi bi-credit-card-fill"></i>
              </button>
            </div>

          </form>

        </div>
      `;
    }

    BusGoUI.openModal('booking-step-modal');
  },

  autofillPassenger(passengerIdx, savedIdx) {
    if (savedIdx === "") return;
    const saved = BusGoDB.getSavedPassengers()[savedIdx];
    if (saved) {
      document.getElementById(`pass-name-${passengerIdx}`).value = saved.name;
      document.getElementById(`pass-age-${passengerIdx}`).value = saved.age;
      document.getElementById(`pass-gender-${passengerIdx}`).value = saved.gender;
    }
  },

  handlePassengerSubmit(e) {
    e.preventDefault();

    this.passengers = this.selectedSeats.map((seat, idx) => ({
      name: document.getElementById(`pass-name-${idx}`).value.trim(),
      age: parseInt(document.getElementById(`pass-age-${idx}`).value, 10),
      gender: document.getElementById(`pass-gender-${idx}`).value,
      seat: seat
    }));

    this.contact = {
      email: document.getElementById('contact-email').value.trim(),
      phone: document.getElementById('contact-phone').value.trim()
    };

    this.openPaymentStep();
  },

  // Open Step 3: Payment & Fare Review
  openPaymentStep() {
    const modalBody = document.getElementById('booking-modal-body');
    if (!modalBody) return;

    const count = this.selectedSeats.length;
    const baseFare = count * this.activeBus.fare;
    const tax = Number((baseFare * 0.10).toFixed(2));
    const fee = 30.00;
    const insurance = this.includeInsurance ? (count * 25.00) : 0;
    const discount = this.appliedPromo ? this.appliedPromo.discount : 0;
    const total = Number((baseFare + tax + fee + insurance - discount).toFixed(2));

    modalBody.innerHTML = `
      <div class="p-6 md:p-8">
        
        <!-- Stepper Header -->
        <div class="booking-stepper mb-6">
          <div class="step-item completed">
            <div class="step-bubble"><i class="bi bi-check2"></i></div>
            <span class="text-xs text-slate-300 mt-1 font-semibold">Seat Selection</span>
          </div>
          <div class="step-item completed">
            <div class="step-bubble"><i class="bi bi-check2"></i></div>
            <span class="text-xs text-slate-300 mt-1 font-semibold">Passengers</span>
          </div>
          <div class="step-item active">
            <div class="step-bubble">3</div>
            <span class="text-xs text-amber-400 mt-1 font-semibold">Payment</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Left: Payment Options -->
          <div class="lg:col-span-7">
            <h5 class="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <i class="bi bi-shield-lock-fill text-amber-400"></i> Select Payment Method
            </h5>

            <!-- Payment Tabs -->
            <div class="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-5">
              <button type="button" onclick="BookingEngine.switchPaymentTab('upi')" id="pay-tab-upi" class="flex-1 py-2 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 flex items-center justify-center gap-2">
                <i class="bi bi-qr-code"></i> UPI / QR
              </button>
              <button type="button" onclick="BookingEngine.switchPaymentTab('card')" id="pay-tab-card" class="flex-1 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-100 flex items-center justify-center gap-2">
                <i class="bi bi-credit-card"></i> Card
              </button>
              <button type="button" onclick="BookingEngine.switchPaymentTab('wallet')" id="pay-tab-wallet" class="flex-1 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-100 flex items-center justify-center gap-2">
                <i class="bi bi-wallet2"></i> NetBanking
              </button>
            </div>

            <!-- UPI Payment Content (Default in TN) -->
            <div id="pay-content-upi" class="glass-card-elevated p-6 rounded-2xl border border-slate-800 text-center">
              <p class="text-xs text-slate-300 font-bold mb-3">Scan QR code using GPay, PhonePe, Paytm, or BHIM</p>
              <div class="w-40 h-40 mx-auto bg-white p-2 rounded-xl shadow-lg mb-3">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=busgo.tn@icici&pn=BusGoTamilNadu&am=${total}" alt="UPI QR Code" class="w-full h-full object-contain">
              </div>
              <p class="text-xs text-emerald-400 font-semibold"><i class="bi bi-clock-history"></i> QR code active for 10:00 mins</p>
            </div>

            <!-- Card Payment Content -->
            <div id="pay-content-card" class="hidden glass-card-elevated p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label class="text-xs text-slate-400 block mb-1">Card Number</label>
                <div class="relative">
                  <input type="text" id="pay-card-num" placeholder="4242 •••• •••• 4242" value="4242 8820 9102 4242" class="w-full form-control-busgo rounded-xl px-3 py-2.5 text-xs font-mono">
                  <i class="bi bi-credit-card-2-front absolute right-3 top-2.5 text-slate-400 text-base"></i>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-slate-400 block mb-1">Expiry Date</label>
                  <input type="text" id="pay-card-exp" placeholder="MM/YY" value="08/29" class="w-full form-control-busgo rounded-xl px-3 py-2.5 text-xs font-mono">
                </div>
                <div>
                  <label class="text-xs text-slate-400 block mb-1">CVV / CVC</label>
                  <input type="password" id="pay-card-cvv" placeholder="•••" value="888" maxlength="4" class="w-full form-control-busgo rounded-xl px-3 py-2.5 text-xs font-mono">
                </div>
              </div>
              <div>
                <label class="text-xs text-slate-400 block mb-1">Cardholder Name</label>
                <input type="text" id="pay-card-name" placeholder="Name on card" value="${this.passengers[0].name}" class="w-full form-control-busgo rounded-xl px-3 py-2.5 text-xs">
              </div>
            </div>

            <!-- Wallet Content -->
            <div id="pay-content-wallet" class="hidden glass-card-elevated p-5 rounded-2xl border border-slate-800 space-y-3">
              <label class="flex items-center justify-between p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-400">
                <div class="flex items-center gap-3">
                  <i class="bi bi-bank text-xl text-amber-400"></i>
                  <span class="text-xs font-bold text-slate-200">State Bank of India (SBI)</span>
                </div>
                <input type="radio" name="wallet_opt" checked class="accent-amber-400">
              </label>
              <label class="flex items-center justify-between p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-400">
                <div class="flex items-center gap-3">
                  <i class="bi bi-bank2 text-xl text-sky-400"></i>
                  <span class="text-xs font-bold text-slate-200">HDFC Bank / ICICI NetBanking</span>
                </div>
                <input type="radio" name="wallet_opt" class="accent-amber-400">
              </label>
            </div>

            <div class="flex items-center gap-2 mt-4 text-[11px] text-slate-400">
              <i class="bi bi-lock-fill text-emerald-400"></i> 256-Bit SSL Encrypted Sandbox Gateway. Instant e-ticket generation.
            </div>

          </div>

          <!-- Right: Detailed Bill Summary & Promo Code -->
          <div class="lg:col-span-5 bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h5 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Fare Breakdown</h5>
              
              <!-- Promo Code Input -->
              <div class="flex gap-2 mb-4">
                <input type="text" id="promo-code-input" placeholder="Enter Promo (e.g. FIRST50)" value="${this.appliedPromo ? this.appliedPromo.code : ''}" class="flex-1 form-control-busgo rounded-lg px-3 py-2 text-xs uppercase font-bold">
                <button type="button" onclick="BookingEngine.applyPromoCode()" class="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition">
                  Apply
                </button>
              </div>

              ${this.appliedPromo ? `
                <div class="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center justify-between text-xs text-emerald-400 mb-4">
                  <span><i class="bi bi-tag-fill mr-1"></i> Promo '${this.appliedPromo.code}' applied</span>
                  <button type="button" onclick="BookingEngine.removePromo()" class="text-rose-400 hover:text-rose-300 font-bold">Remove</button>
                </div>
              ` : ''}

              <div class="space-y-2 text-xs text-slate-400">
                <div class="flex justify-between">
                  <span>Base Fare (${count} seats @ ₹${this.activeBus.fare})</span>
                  <span>₹${baseFare.toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Taxes & GST (10%)</span>
                  <span>₹${tax.toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Convenience & Terminal Fee</span>
                  <span>₹${fee.toFixed(2)}</span>
                </div>
                ${insurance > 0 ? `
                  <div class="flex justify-between text-slate-300">
                    <span>Travel Insurance</span>
                    <span>₹${insurance.toFixed(2)}</span>
                  </div>
                ` : ''}
                ${discount > 0 ? `
                  <div class="flex justify-between text-emerald-400 font-bold">
                    <span>Discount (${this.appliedPromo.code})</span>
                    <span>-₹${discount.toFixed(2)}</span>
                  </div>
                ` : ''}
                
                <div class="pt-3 border-t border-slate-800 flex justify-between items-baseline text-base font-black text-slate-100">
                  <span>Total Payable</span>
                  <span class="text-xl text-amber-400" id="final-payable-amount">₹${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Pay Now Button -->
            <div class="mt-6 pt-4 border-t border-slate-800">
              <button type="button" onclick="BookingEngine.executeBooking()" class="w-full py-3.5 rounded-xl btn-amber font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                <i class="bi bi-check-circle-fill"></i>
                <span>Confirm & Pay ₹${total.toFixed(2)}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    `;
  },

  switchPaymentTab(tab) {
    const cardTab = document.getElementById('pay-tab-card');
    const upiTab = document.getElementById('pay-tab-upi');
    const walletTab = document.getElementById('pay-tab-wallet');

    const cardContent = document.getElementById('pay-content-card');
    const upiContent = document.getElementById('pay-content-upi');
    const walletContent = document.getElementById('pay-content-wallet');

    [cardTab, upiTab, walletTab].forEach(t => {
      t.className = 'flex-1 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-100 flex items-center justify-center gap-2';
    });
    [cardContent, upiContent, walletContent].forEach(c => c.classList.add('hidden'));

    if (tab === 'card') {
      cardTab.className = 'flex-1 py-2 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 flex items-center justify-center gap-2';
      cardContent.classList.remove('hidden');
    } else if (tab === 'upi') {
      upiTab.className = 'flex-1 py-2 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 flex items-center justify-center gap-2';
      upiContent.classList.remove('hidden');
    } else if (tab === 'wallet') {
      walletTab.className = 'flex-1 py-2 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 flex items-center justify-center gap-2';
      walletContent.classList.remove('hidden');
    }
  },

  applyPromoCode() {
    const input = document.getElementById('promo-code-input');
    if (!input) return;
    const code = input.value.trim();
    const baseFare = this.selectedSeats.length * this.activeBus.fare;

    const res = BusGoDB.validatePromo(code, baseFare);
    if (!res.valid) {
      BusGoUI.toast(res.message, 'error');
      return;
    }

    this.appliedPromo = res;
    BusGoUI.toast(res.message, 'success');
    this.openPaymentStep();
  },

  removePromo() {
    this.appliedPromo = null;
    BusGoUI.toast('Promo code removed', 'info');
    this.openPaymentStep();
  },

  // Execute and Save Booking in LocalStorage
  executeBooking() {
    const count = this.selectedSeats.length;
    const baseFare = count * this.activeBus.fare;
    const tax = Number((baseFare * 0.10).toFixed(2));
    const fee = 30.00;
    const insurance = this.includeInsurance ? (count * 25.00) : 0;
    const discount = this.appliedPromo ? this.appliedPromo.discount : 0;
    const total = Number((baseFare + tax + fee + insurance - discount).toFixed(2));

    const bookingPayload = {
      busId: this.activeBus.id,
      busName: this.activeBus.busName,
      operator: this.activeBus.operator,
      busType: this.activeBus.busType,
      from: this.activeBus.from,
      to: this.activeBus.to,
      departureDate: this.activeDate,
      departureTime: this.activeBus.departureTime,
      arrivalTime: this.activeBus.arrivalTime,
      duration: this.activeBus.duration,
      boardingPoint: this.selectedBoarding,
      droppingPoint: this.selectedDropping,
      seats: this.selectedSeats,
      passengers: this.passengers,
      contact: this.contact,
      fareBreakdown: {
        baseFare,
        tax,
        convenienceFee: fee,
        insurance,
        discount,
        promoCode: this.appliedPromo ? this.appliedPromo.code : "",
        totalFare: total
      },
      paymentMethod: "UPI / Google Pay"
    };

    const result = BusGoDB.addBooking(bookingPayload);
    if (!result.success) {
      BusGoUI.toast(result.message, 'error', 'Booking Failed');
      return;
    }

    // Success confirmation screen
    this.showConfirmation(result.booking);
  },

  // Step 4: Booking Confirmation Screen
  showConfirmation(booking) {
    const modalBody = document.getElementById('booking-modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6 md:p-10 text-center">
        
        <!-- Animated Success Badge -->
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-emerald-500/30">
          <i class="bi bi-check-lg"></i>
        </div>

        <h3 class="text-2xl font-black text-slate-100 mb-1">Ticket Booked Successfully!</h3>
        <p class="text-xs text-slate-400 mb-6">Your e-ticket has been sent to <span class="text-amber-400 font-bold">${booking.contact?.email || 'your email'}</span> and saved to your traveler dashboard.</p>

        <!-- Printable E-Ticket Card -->
        <div class="mb-8 text-left">
          ${BusGoUI.generateTicketHTML(booking, false)}
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-3 no-print">
          <button type="button" onclick="BusGoUI.printTicket('${booking.pnr}')" class="px-5 py-2.5 rounded-xl btn-amber text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition">
            <i class="bi bi-printer-fill"></i> Print / Download Ticket (1 Page)
          </button>
          <a href="dashboard.html?tab=tickets" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center gap-2 border border-slate-700 transition">
            <i class="bi bi-speedometer2"></i> Go to Traveler Dashboard
          </a>
          <button type="button" onclick="window.location.href='booking.html'" class="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-100 text-xs font-semibold transition">
            Book Another Trip
          </button>
        </div>

      </div>
    `;

    // Re-render buses to update remaining seats and prevent double-booking
    this.renderBuses();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('bus-results-list')) {
    BookingEngine.init();
  }
});
