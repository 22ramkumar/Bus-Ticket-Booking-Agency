/**
 * BusGo - Traveler Dashboard Controller
 * Overview stats, ticket management, dynamic cancellation refund calculator, saved passengers
 */

const Dashboard = {
  currentTab: 'overview',
  activeTicketFilter: 'all',
  cancellingBooking: null,

  getUser() {
    return BusGoDB.getCurrentUser() || DEFAULT_USER;
  },

  isLoggedIn() {
    return Boolean(BusGoDB.getCurrentUser());
  },

  init() {
    this.checkAuth();
    this.initTabRouting();
    this.renderSidebarProfile();
    this.renderCurrentTab();
  },

  checkAuth() {
    // Allow viewing dashboard without forced login
    this.updateAuthControls();
  },

  updateAuthControls() {
    const loggedIn = this.isLoggedIn();
    const authActionBtn = document.getElementById('dashboard-auth-action');
    const mobileAuthActionBtn = document.getElementById('mobile-dashboard-auth-action');
    const headerAuthContainer = document.getElementById('dashboard-header-auth');

    const authHtml = loggedIn ? `
      <button type="button" onclick="BusGoUI.handleLogout()" class="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition">
        <i class="bi bi-box-arrow-right"></i> Sign Out
      </button>
    ` : `
      <a href="login.html" class="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-400/10 transition">
        <i class="bi bi-box-arrow-in-right"></i> Sign In to Account
      </a>
    `;

    if (authActionBtn) authActionBtn.innerHTML = authHtml;
    if (mobileAuthActionBtn) mobileAuthActionBtn.innerHTML = authHtml;

    if (headerAuthContainer) {
      if (!loggedIn) {
        headerAuthContainer.innerHTML = `
          <a href="login.html" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400/30 text-amber-400 hover:bg-amber-400/10 font-bold text-xs transition">
            <i class="bi bi-box-arrow-in-right"></i> Sign In
          </a>
        `;
      } else {
        headerAuthContainer.innerHTML = '';
      }
    }
  },

  // 1. Tab Routing
  initTabRouting() {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['overview', 'tickets', 'cancellations', 'offers', 'profile'].includes(tabParam)) {
      this.currentTab = tabParam;
    }

    const sidebarLinks = document.querySelectorAll('.dashboard-nav-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    const url = new URL(window.location);
    url.searchParams.set('tab', tabName);
    window.history.pushState({}, '', url);

    // Update active class on nav links
    document.querySelectorAll('.dashboard-nav-link').forEach(link => {
      const isTarget = link.getAttribute('data-tab') === tabName;
      if (isTarget) {
        link.className = 'dashboard-nav-link active flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition';
      } else {
        link.className = 'dashboard-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-semibold text-sm transition';
      }
    });

    this.renderCurrentTab();
  },

  renderSidebarProfile() {
    const user = this.getUser();
    if (!user) return;

    const nameEls = document.querySelectorAll('.user-display-name');
    const emailEls = document.querySelectorAll('.user-display-email');
    const avatarEls = document.querySelectorAll('.user-display-avatar');

    nameEls.forEach(el => el.textContent = user.name);
    emailEls.forEach(el => el.textContent = user.email);
    avatarEls.forEach(el => el.src = user.avatar);
  },

  renderCurrentTab() {
    const contentArea = document.getElementById('dashboard-main-content');
    if (!contentArea) return;

    switch (this.currentTab) {
      case 'overview':
        this.renderOverviewTab(contentArea);
        break;
      case 'tickets':
        this.renderTicketsTab(contentArea);
        break;
      case 'cancellations':
        this.renderCancellationsTab(contentArea);
        break;
      case 'offers':
        this.renderOffersTab(contentArea);
        break;
      case 'profile':
        this.renderProfileTab(contentArea);
        break;
      default:
        this.renderOverviewTab(contentArea);
    }
  },

  // 2. Overview Tab
  renderOverviewTab(container) {
    const user = this.getUser();
    const bookings = BusGoDB.getBookings();
    const upcomingTrips = bookings.filter(b => b.status === 'Upcoming');
    const completedTrips = bookings.filter(b => b.status === 'Completed');
    const cancelledTrips = bookings.filter(b => b.status === 'Cancelled');

    // Next upcoming trip
    const nextTrip = upcomingTrips[0] || null;

    container.innerHTML = `
      <div class="space-y-8">
        
        <!-- Welcome Hero Banner -->
        <div class="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                <i class="bi bi-patch-check-fill"></i> Verified Traveler
              </span>
              <h2 class="text-2xl md:text-3xl font-black text-slate-100">Welcome Back, ${user.name}!</h2>
              <p class="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
                Ready for your next journey? Track your upcoming bus schedules, manage your digital e-tickets, and book verified intercity coaches.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <a href="booking.html" class="px-5 py-3 rounded-xl btn-amber font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20">
                <i class="bi bi-search"></i> Book New Trip
              </a>
            </div>
          </div>
        </div>

        <!-- 4 Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-card p-5 rounded-2xl">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs text-slate-400 font-semibold">Total Trips</span>
              <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg">
                <i class="bi bi-compass"></i>
              </div>
            </div>
            <h3 class="text-2xl font-black text-slate-100">${user.stats.totalTrips || bookings.length}</h3>
            <span class="text-[11px] text-slate-400 mt-1 block">Intercity journeys</span>
          </div>

          <div class="glass-card p-5 rounded-2xl">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs text-slate-400 font-semibold">Upcoming</span>
              <div class="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center text-lg">
                <i class="bi bi-calendar-event"></i>
              </div>
            </div>
            <h3 class="text-2xl font-black text-sky-400">${upcomingTrips.length}</h3>
            <span class="text-[11px] text-slate-400 mt-1 block">Active departures</span>
          </div>

          <div class="glass-card p-5 rounded-2xl">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs text-slate-400 font-semibold">Cancelled</span>
              <div class="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-lg">
                <i class="bi bi-x-circle"></i>
              </div>
            </div>
            <h3 class="text-2xl font-black text-rose-400">${cancelledTrips.length}</h3>
            <span class="text-[11px] text-slate-400 mt-1 block">Refunds recorded</span>
          </div>

          <div class="glass-card p-5 rounded-2xl">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs text-slate-400 font-semibold">Total Spent</span>
              <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
                <i class="bi bi-wallet2"></i>
              </div>
            </div>
            <h3 class="text-2xl font-black text-emerald-400">₹${(user.stats.totalSpent || 9850).toFixed(2)}</h3>
            <span class="text-[11px] text-slate-400 mt-1 block">Lifetime travel spend</span>
          </div>
        </div>

        <!-- Next Upcoming Trip Card (if any) -->
        ${nextTrip ? `
          <div class="glass-card rounded-2xl p-6 border-l-4 border-l-amber-400 relative">
            <div class="flex items-center justify-between flex-wrap gap-4 mb-4 pb-4 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl">
                  <i class="bi bi-bus-front-fill"></i>
                </div>
                <div>
                  <span class="text-[10px] text-amber-400 font-bold uppercase tracking-widest">NEXT DEPARTURE</span>
                  <h4 class="text-lg font-bold text-slate-100">${nextTrip.from} <i class="bi bi-arrow-right text-amber-400 mx-1 route-arrow"></i> ${nextTrip.to}</h4>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800 text-amber-400 border border-slate-700">
                  PNR: ${nextTrip.pnr}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 text-xs">
              <div>
                <span class="text-slate-400 block mb-0.5">Date & Time</span>
                <span class="font-bold text-slate-100">${nextTrip.departureDate} at ${nextTrip.departureTime}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Operator & Bus</span>
                <span class="font-bold text-slate-100">${nextTrip.operator}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Boarding Point</span>
                <span class="font-bold text-slate-100">${nextTrip.boardingPoint}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Seat(s)</span>
                <span class="font-bold text-amber-400 text-sm">${nextTrip.seats.join(', ')}</span>
              </div>
            </div>

            <div class="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-800">
              <span class="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Confirmed & Ready to Board
              </span>
              <div class="flex items-center gap-2">
                <button type="button" onclick="Dashboard.openTicketModal('${nextTrip.pnr}')" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold transition flex items-center gap-1.5">
                  <i class="bi bi-eye"></i> View E-Ticket
                </button>
                <button type="button" onclick="BusGoUI.printTicket('${nextTrip.pnr}')" class="px-4 py-2 rounded-lg btn-amber text-slate-950 text-xs font-bold transition flex items-center gap-1.5">
                  <i class="bi bi-printer-fill"></i> Print / Download
                </button>
                <button type="button" onclick="Dashboard.openCancellationModal('${nextTrip.pnr}')" class="px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition flex items-center gap-1.5">
                  <i class="bi bi-x-circle"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        ` : `
          <div class="glass-card rounded-2xl p-6 text-center text-slate-400">
            <i class="bi bi-calendar-x text-3xl text-slate-500 mb-2 block"></i>
            <p class="text-sm">No upcoming trips scheduled. Plan a new getaway!</p>
            <a href="booking.html" class="inline-block mt-3 px-4 py-2 rounded-xl btn-amber text-xs font-bold">Search Buses</a>
          </div>
        `}

        <!-- Recent Bookings Table -->
        <div class="glass-card rounded-2xl p-6">
          <div class="flex items-center justify-between mb-5">
            <h4 class="text-base font-bold text-slate-100 flex items-center gap-2">
              <i class="bi bi-clock-history text-amber-400"></i> Recent Booking Activity
            </h4>
            <button type="button" onclick="Dashboard.switchTab('tickets')" class="text-xs font-bold text-amber-400 hover:text-amber-300">
              View All Tickets (${bookings.length}) →
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 font-semibold">
                  <th class="pb-3">PNR</th>
                  <th class="pb-3">Route</th>
                  <th class="pb-3">Travel Date</th>
                  <th class="pb-3">Seats</th>
                  <th class="pb-3">Fare</th>
                  <th class="pb-3">Status</th>
                  <th class="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${bookings.slice(0, 5).map(b => {
                  let statusBadge = '';
                  if (b.status === 'Upcoming') {
                    statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Upcoming</span>';
                  } else if (b.status === 'Completed') {
                    statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>';
                  } else {
                    statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Cancelled</span>';
                  }

                  return `
                    <tr class="hover:bg-slate-800/30 transition">
                      <td class="py-3 font-mono font-bold text-slate-200">${b.pnr}</td>
                      <td class="py-3 font-semibold text-slate-100">${b.from} → ${b.to}</td>
                      <td class="py-3 text-slate-400">${b.departureDate}</td>
                      <td class="py-3 font-bold text-amber-400">${b.seats.join(', ')}</td>
                      <td class="py-3 font-bold text-slate-200">₹${b.fareBreakdown.totalFare.toFixed(2)}</td>
                      <td class="py-3">${statusBadge}</td>
                      <td class="py-3 text-right">
                        <button type="button" onclick="Dashboard.openTicketModal('${b.pnr}')" class="text-amber-400 hover:text-amber-300 font-bold">
                          View
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  // 3. My Tickets Tab
  renderTicketsTab(container) {
    const bookings = BusGoDB.getBookings();
    let filtered = bookings;

    if (this.activeTicketFilter !== 'all') {
      filtered = bookings.filter(b => b.status.toLowerCase() === this.activeTicketFilter.toLowerCase());
    }

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Header & Tabs -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-slate-100">My Travel Tickets</h3>
            <p class="text-xs text-slate-400">View your verified e-tickets, download PDFs, or request cancellation.</p>
          </div>

          <div class="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button type="button" onclick="Dashboard.filterTickets('all')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold ${this.activeTicketFilter === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-100'}">
              All (${bookings.length})
            </button>
            <button type="button" onclick="Dashboard.filterTickets('upcoming')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold ${this.activeTicketFilter === 'upcoming' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-100'}">
              Upcoming (${bookings.filter(b => b.status === 'Upcoming').length})
            </button>
            <button type="button" onclick="Dashboard.filterTickets('completed')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold ${this.activeTicketFilter === 'completed' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-100'}">
              Completed (${bookings.filter(b => b.status === 'Completed').length})
            </button>
            <button type="button" onclick="Dashboard.filterTickets('cancelled')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold ${this.activeTicketFilter === 'cancelled' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-100'}">
              Cancelled (${bookings.filter(b => b.status === 'Cancelled').length})
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative max-w-md">
          <input type="text" id="ticket-search-input" oninput="Dashboard.handleTicketSearch(this.value)" placeholder="Search by PNR, city, or operator..." class="w-full form-control-busgo rounded-xl pl-9 pr-4 py-2.5 text-xs">
          <i class="bi bi-search absolute left-3 top-3 text-slate-400 text-xs"></i>
        </div>

        <!-- Ticket Cards Container -->
        <div id="tickets-list-container" class="space-y-4">
          ${this.renderTicketCardsHTML(filtered)}
        </div>

      </div>
    `;
  },

  filterTickets(filter) {
    this.activeTicketFilter = filter;
    this.renderTicketsTab(document.getElementById('dashboard-main-content'));
  },

  handleTicketSearch(query) {
    const bookings = BusGoDB.getBookings();
    const q = query.toLowerCase().trim();
    const filtered = bookings.filter(b => {
      return b.pnr.toLowerCase().includes(q) ||
        b.from.toLowerCase().includes(q) ||
        b.to.toLowerCase().includes(q) ||
        b.operator.toLowerCase().includes(q);
    });
    const container = document.getElementById('tickets-list-container');
    if (container) {
      container.innerHTML = this.renderTicketCardsHTML(filtered);
    }
  },

  renderTicketCardsHTML(tickets) {
    if (tickets.length === 0) {
      return `
        <div class="glass-card rounded-2xl p-12 text-center text-slate-400">
          <i class="bi bi-ticket-detailed text-4xl text-slate-500 mb-3 block"></i>
          <h5 class="text-base font-bold text-slate-200">No tickets found</h5>
          <p class="text-xs text-slate-400 mt-1">There are no tickets matching your current filter.</p>
        </div>
      `;
    }

    return tickets.map(ticket => {
      const isUpcoming = ticket.status === 'Upcoming';
      let statusBadge = '';
      if (ticket.status === 'Upcoming') {
        statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Upcoming Journey</span>';
      } else if (ticket.status === 'Completed') {
        statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>';
      } else {
        statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Cancelled</span>';
      }

      return `
        <div class="glass-card rounded-2xl p-6 transition-all hover:border-slate-700">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <!-- Route & Info -->
            <div class="space-y-3 flex-1">
              <div class="flex items-center gap-3 flex-wrap">
                <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  PNR: ${ticket.pnr}
                </span>
                ${statusBadge}
                <span class="text-xs text-slate-400">• Booked on ${new Date(ticket.bookedAt).toLocaleDateString()}</span>
              </div>

              <div class="flex items-center gap-4">
                <div>
                  <h4 class="text-lg font-bold text-slate-100">${ticket.from}</h4>
                  <p class="text-xs text-amber-400 font-semibold">${ticket.departureTime}</p>
                </div>
                <div class="flex flex-col items-center px-2">
                  <span class="text-[10px] text-slate-400 font-semibold">${ticket.duration}</span>
                  <i class="bi bi-arrow-right text-slate-500 text-lg route-arrow"></i>
                </div>
                <div>
                  <h4 class="text-lg font-bold text-slate-100">${ticket.to}</h4>
                  <p class="text-xs text-slate-300 font-semibold">${ticket.arrivalTime}</p>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span><strong class="text-slate-300">Date:</strong> ${ticket.departureDate}</span>
                <span><strong class="text-slate-300">Operator:</strong> ${ticket.operator}</span>
                <span><strong class="text-slate-300">Seats:</strong> <span class="text-amber-400 font-bold">${ticket.seats.join(', ')}</span></span>
                <span><strong class="text-slate-300">Boarding:</strong> ${ticket.boardingPoint.split('(')[0]}</span>
              </div>
            </div>

            <!-- Price & Actions -->
            <div class="lg:border-l lg:border-slate-800 lg:pl-6 flex flex-row lg:flex-col justify-between items-center lg:items-end gap-4">
              <div class="text-left lg:text-right">
                <span class="text-xs text-slate-400 block">Total Fare</span>
                <span class="text-2xl font-black text-slate-100">₹${ticket.fareBreakdown.totalFare.toFixed(2)}</span>
              </div>

              <div class="flex items-center gap-2">
                <button type="button" onclick="Dashboard.openTicketModal('${ticket.pnr}')" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5">
                  <i class="bi bi-ticket-perforated"></i> View Pass
                </button>
                <button type="button" onclick="BusGoUI.printTicket('${ticket.pnr}')" class="px-3.5 py-2 rounded-xl border border-amber-400/40 text-amber-400 hover:bg-amber-400/10 text-xs font-bold transition flex items-center gap-1.5" title="Print or Download 1-Page E-Ticket">
                  <i class="bi bi-printer-fill"></i> Download / Print
                </button>
                ${isUpcoming ? `
                  <button type="button" onclick="Dashboard.openCancellationModal('${ticket.pnr}')" class="px-3.5 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition flex items-center gap-1.5">
                    <i class="bi bi-x-circle"></i> Cancel
                  </button>
                ` : ''}
              </div>
            </div>

          </div>
        </div>
      `;
    }).join('');
  },

  // 4. Cancellations & Dynamic Refund Calculator Tab
  renderCancellationsTab(container) {
    const bookings = BusGoDB.getBookings();
    const cancelled = bookings.filter(b => b.status === 'Cancelled');

    container.innerHTML = `
      <div class="space-y-6">
        
        <div>
          <h3 class="text-xl font-bold text-slate-100">Manage Cancellations & Refunds</h3>
          <p class="text-xs text-slate-400">Transparent instant refunds credited directly to your original payment method.</p>
        </div>

        <!-- Refund Policy Explainer Banner -->
        <div class="glass-card rounded-2xl p-6 bg-gradient-to-r from-slate-900 to-amber-950/20 border border-slate-800">
          <h4 class="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <i class="bi bi-shield-check text-amber-400"></i> BusGo Transparent Refund Policy
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span class="font-extrabold text-emerald-400 text-base block mb-1">90% Refund</span>
              <p class="font-bold text-slate-200">24+ Hours Before Departure</p>
              <p class="text-slate-400 mt-1">10% standard processing fee deducted.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span class="font-extrabold text-amber-400 text-base block mb-1">50% Refund</span>
              <p class="font-bold text-slate-200">12 to 24 Hours Before</p>
              <p class="text-slate-400 mt-1">50% cancellation deduction applies.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span class="font-extrabold text-rose-400 text-base block mb-1">0% Refund</span>
              <p class="font-bold text-slate-200">Under 12 Hours</p>
              <p class="text-slate-400 mt-1">No refund for last-minute cancellations.</p>
            </div>
          </div>
        </div>

        <!-- Cancellation Records -->
        <div class="glass-card rounded-2xl p-6">
          <h4 class="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <i class="bi bi-clock-history text-amber-400"></i> Cancellation History (${cancelled.length})
          </h4>

          ${cancelled.length === 0 ? `
            <p class="text-xs text-slate-400 py-6 text-center">No cancelled bookings. Your journeys are in great shape!</p>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-800 text-slate-400 font-semibold">
                    <th class="pb-3">PNR</th>
                    <th class="pb-3">Route</th>
                    <th class="pb-3">Reason</th>
                    <th class="pb-3">Refund Rate</th>
                    <th class="pb-3">Refund Amount</th>
                    <th class="pb-3">Refund Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  ${cancelled.map(c => `
                    <tr class="hover:bg-slate-800/30">
                      <td class="py-3 font-mono font-bold text-slate-200">${c.pnr}</td>
                      <td class="py-3 font-medium text-slate-300">${c.from} → ${c.to}</td>
                      <td class="py-3 text-slate-400 max-w-[200px] truncate">${c.cancellationInfo?.reason || 'Personal reasons'}</td>
                      <td class="py-3 font-bold text-amber-400">${c.cancellationInfo?.refundRate || 0}%</td>
                      <td class="py-3 font-black text-emerald-400">₹${(c.cancellationInfo?.refundAmount || 0).toFixed(2)}</td>
                      <td class="py-3">
                        <span class="px-2.5 py-0.5 rounded text-[11px] font-bold ${c.cancellationInfo?.refundStatus === 'Refunded' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                          ${c.cancellationInfo?.refundStatus || 'Processing'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

      </div>
    `;
  },

  // Interactive Cancellation Modal with Live Refund Calculator
  openCancellationModal(pnr) {
    const booking = BusGoDB.getBookingByPnr(pnr);
    if (!booking) return;

    this.cancellingBooking = booking;
    const calc = BusGoDB.calculateRefund(booking);

    const modalBody = document.getElementById('cancel-modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6 md:p-8">
        <div class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto mb-4">
          <i class="bi bi-exclamation-triangle"></i>
        </div>

        <h3 class="text-xl font-bold text-slate-100 text-center mb-1">Confirm Cancellation</h3>
        <p class="text-xs text-slate-400 text-center mb-6">You are requesting to cancel booking <strong class="text-amber-400 font-mono">${booking.pnr}</strong>.</p>

        <!-- Route Details Card -->
        <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs mb-5 space-y-1.5">
          <div class="flex justify-between">
            <span class="text-slate-400">Route:</span>
            <span class="font-bold text-slate-200">${booking.from} → ${booking.to}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Departure Time:</span>
            <span class="font-bold text-slate-200">${booking.departureDate} at ${booking.departureTime}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Seats:</span>
            <span class="font-bold text-amber-400">${booking.seats.join(', ')}</span>
          </div>
        </div>

        <!-- Dynamic Refund Calculation Box -->
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs mb-5 space-y-2">
          <h6 class="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
            <i class="bi bi-calculator"></i> Refund Calculation Breakdown
          </h6>
          <div class="flex justify-between text-slate-300">
            <span>Time Until Departure:</span>
            <span class="font-bold text-slate-100">${calc.hoursRemaining} Hours</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Ticket Fare Paid:</span>
            <span class="font-bold text-slate-100">₹${calc.totalFare.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Refund Percentage Applied:</span>
            <span class="font-black text-amber-400">${calc.refundRate}%</span>
          </div>
          <div class="flex justify-between text-rose-400">
            <span>Cancellation Fee:</span>
            <span>-₹${calc.cancellationFee.toFixed(2)}</span>
          </div>
          <div class="pt-2 border-t border-amber-500/20 flex justify-between items-baseline font-black text-sm text-slate-100">
            <span>Refund Payable:</span>
            <span class="text-base text-emerald-400">₹${calc.refundAmount.toFixed(2)}</span>
          </div>
        </div>

        <!-- Cancellation Reason -->
        <div class="mb-6">
          <label class="text-xs font-bold text-slate-300 block mb-1">Reason for Cancellation *</label>
          <select id="cancel-reason-select" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs">
            <option value="Change of travel plans">Change of travel plans</option>
            <option value="Emergency business meeting">Emergency business meeting</option>
            <option value="Found alternate transportation">Found alternate transportation</option>
            <option value="Personal / Medical emergency">Personal / Medical emergency</option>
            <option value="Booked wrong date or route">Booked wrong date or route</option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button type="button" onclick="BusGoUI.closeModal('cancel-modal')" class="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold">
            Keep Booking
          </button>
          <button type="button" onclick="Dashboard.confirmCancellation()" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5">
            <i class="bi bi-check2"></i> Confirm Cancellation
          </button>
        </div>

      </div>
    `;

    BusGoUI.openModal('cancel-modal');
  },

  confirmCancellation() {
    if (!this.cancellingBooking) return;
    const reason = document.getElementById('cancel-reason-select')?.value || "Personal reason";

    const res = BusGoDB.cancelBooking(this.cancellingBooking.pnr, reason);
    BusGoUI.closeModal('cancel-modal');

    if (res.success) {
      BusGoUI.toast(`PNR ${this.cancellingBooking.pnr} cancelled. Refund of ₹${res.refund.refundAmount.toFixed(2)} initiated.`, 'warning', 'Cancellation Complete');
      this.renderCurrentTab();
      this.renderSidebarProfile();
    } else {
      BusGoUI.toast(res.message, 'error');
    }
  },

  // 5. Digital E-Ticket View Modal
  openTicketModal(pnr) {
    const booking = BusGoDB.getBookingByPnr(pnr);
    if (!booking) return;

    const modalBody = document.getElementById('view-ticket-modal-body');
    if (!modalBody) return;

    // Prime the single-sheet print container immediately
    const printContainer = document.getElementById('rk-print-container') || (() => {
      const el = document.createElement('div');
      el.id = 'rk-print-container';
      document.body.appendChild(el);
      return el;
    })();
    printContainer.innerHTML = BusGoUI.generateTicketHTML(booking, true);

    modalBody.innerHTML = `
      <div class="p-4 md:p-6">
        
        <!-- Header Controls -->
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-bold text-slate-200">Verified Boarding Pass Preview</span>
          </div>
          <span class="text-[11px] font-mono text-amber-400 font-bold">PNR: ${booking.pnr}</span>
        </div>

        ${BusGoUI.generateTicketHTML(booking, false)}

        <div class="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-800 no-print">
          <button type="button" onclick="BusGoUI.closeModal('view-ticket-modal')" class="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition">
            Close
          </button>
          <button type="button" onclick="BusGoUI.printTicket('${booking.pnr}')" class="px-5 py-2.5 rounded-xl btn-amber text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition">
            <i class="bi bi-printer-fill text-sm"></i> Print / Download Ticket (1 Page)
          </button>
        </div>

      </div>
    `;

    BusGoUI.openModal('view-ticket-modal');
  },

  // 6. Offers Tab
  renderOffersTab(container) {
    const promos = BusGoDB.getPromos();

    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h3 class="text-xl font-bold text-slate-100">Exclusive Travel Vouchers & Promos</h3>
          <p class="text-xs text-slate-400">Copy any promo code to apply instant discounts when booking your bus seats.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${promos.map(promo => `
            <div class="glass-card rounded-2xl p-5 border-l-4 border-l-amber-400 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    ${promo.category}
                  </span>
                  <span class="text-[11px] text-slate-400">Valid until ${promo.validUntil}</span>
                </div>
                <h4 class="text-base font-bold text-slate-100 mb-1">${promo.title}</h4>
                <p class="text-xs text-slate-400 leading-relaxed">${promo.description}</p>
                <p class="text-[11px] text-slate-500 mt-2 italic">${promo.terms}</p>
              </div>

              <div class="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
                <span class="font-mono text-xs font-black px-3 py-1.5 rounded-lg bg-slate-900 text-amber-400 border border-slate-700">
                  ${promo.code}
                </span>
                <div class="flex items-center gap-2">
                  <button type="button" data-code="${promo.code}" class="btn-copy-code px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5">
                    <i class="bi bi-clipboard"></i> Copy
                  </button>
                  <a href="booking.html?promo=${promo.code}" class="px-3.5 py-1.5 rounded-lg btn-amber text-xs font-bold transition flex items-center gap-1">
                    Book Now
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    BusGoUI.initCopyButtons();
  },

  // 7. Profile & Saved Passengers Tab
  renderProfileTab(container) {
    const user = this.getUser();
    const savedPassengers = BusGoDB.getSavedPassengers();

    container.innerHTML = `
      <div class="space-y-8">
        
        <!-- Profile Details Form -->
        <div class="glass-card rounded-2xl p-6">
          <h4 class="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <i class="bi bi-person-circle text-amber-400"></i> Personal Information
          </h4>

          <form id="profile-edit-form" onsubmit="Dashboard.handleProfileSave(event)" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="font-bold text-slate-300 block mb-1">Full Name</label>
                <input type="text" id="prof-name" value="${user.name}" required class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs">
              </div>
              <div>
                <label class="font-bold text-slate-300 block mb-1">Email Address</label>
                <input type="email" id="prof-email" value="${user.email}" required class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs">
              </div>
              <div>
                <label class="font-bold text-slate-300 block mb-1">Phone Number</label>
                <input type="tel" id="prof-phone" value="${user.phone || ''}" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs">
              </div>
              <div>
                <label class="font-bold text-slate-300 block mb-1">Home City</label>
                <input type="text" id="prof-city" value="${user.city || 'Chennai, TN'}" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs">
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex justify-end">
              <button type="submit" class="px-5 py-2.5 rounded-xl btn-amber font-bold text-xs flex items-center gap-1.5">
                <i class="bi bi-check2"></i> Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        <!-- Saved Passengers Manager -->
        <div class="glass-card rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-base font-bold text-slate-100 flex items-center gap-2">
                <i class="bi bi-people-fill text-amber-400"></i> Saved Co-Travelers
              </h4>
              <p class="text-xs text-slate-400">Save frequent travelers to autofill ticket forms in 1 click.</p>
            </div>
            <button type="button" onclick="Dashboard.openAddPassengerModal()" class="px-4 py-2 rounded-xl btn-amber text-xs font-bold flex items-center gap-1.5">
              <i class="bi bi-plus-lg"></i> Add Passenger
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${savedPassengers.map(p => `
              <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-slate-100 text-sm">${p.name}</span>
                    ${p.isPrimary ? '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Self</span>' : ''}
                  </div>
                  <p class="text-xs text-slate-400">${p.gender} • ${p.age} years old</p>
                  <p class="text-[11px] text-slate-500 mt-1">${p.idType || 'Govt ID'}: ${p.idNumber || 'Verified'}</p>
                </div>

                <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                  <button type="button" onclick="Dashboard.deletePassenger('${p.id}')" class="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Demo Reset Options -->
        <div class="glass-card rounded-2xl p-6 border-dashed border-slate-700">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h5 class="text-sm font-bold text-slate-100">Reset Template Demo Data</h5>
              <p class="text-xs text-slate-400">Restore factory sample bookings, routes, and seed passengers.</p>
            </div>
            <button type="button" onclick="Dashboard.handleResetData()" class="px-4 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition">
              <i class="bi bi-arrow-counterclockwise"></i> Reset Demo Data
            </button>
          </div>
        </div>

      </div>
    `;
  },

  handleProfileSave(e) {
    e.preventDefault();
    const user = this.getUser();
    user.name = document.getElementById('prof-name').value.trim();
    user.email = document.getElementById('prof-email').value.trim();
    user.phone = document.getElementById('prof-phone').value.trim();
    user.city = document.getElementById('prof-city').value.trim();

    BusGoDB.updateCurrentUser(user);
    this.renderSidebarProfile();
    this.updateAuthControls();
    BusGoUI.toast('Profile updated successfully!', 'success');
  },

  openAddPassengerModal() {
    const modalBody = document.getElementById('passenger-modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6">
        <h4 class="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <i class="bi bi-person-plus-fill text-amber-400"></i> Add New Passenger
        </h4>

        <form id="add-passenger-form" onsubmit="Dashboard.handleAddPassengerSubmit(event)" class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-300 block mb-1">Full Name *</label>
            <input type="text" id="new-pass-name" required placeholder="e.g. Eleanor Vance" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-300 block mb-1">Age *</label>
              <input type="number" id="new-pass-age" required min="1" max="100" placeholder="28" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs">
            </div>
            <div>
              <label class="font-bold text-slate-300 block mb-1">Gender *</label>
              <select id="new-pass-gender" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label class="font-bold text-slate-300 block mb-1">ID Document Type</label>
            <select id="new-pass-idtype" class="w-full form-control-busgo rounded-lg px-3 py-2 text-xs">
              <option value="State Driver License">State Driver License</option>
              <option value="Passport">Passport</option>
              <option value="National Identity Card">National Identity Card</option>
              <option value="Student ID">Student ID</option>
            </select>
          </div>

          <div class="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button type="button" onclick="BusGoUI.closeModal('passenger-modal')" class="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold">
              Cancel
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl btn-amber text-xs font-bold">
              Save Passenger
            </button>
          </div>
        </form>
      </div>
    `;

    BusGoUI.openModal('passenger-modal');
  },

  handleAddPassengerSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-pass-name').value.trim();
    const age = parseInt(document.getElementById('new-pass-age').value, 10);
    const gender = document.getElementById('new-pass-gender').value;
    const idType = document.getElementById('new-pass-idtype').value;

    BusGoDB.addSavedPassenger({
      name,
      age,
      gender,
      idType,
      idNumber: 'ID-***' + Math.floor(1000 + Math.random() * 9000),
      isPrimary: false
    });

    BusGoUI.closeModal('passenger-modal');
    BusGoUI.toast(`Passenger ${name} saved!`, 'success');
    this.renderCurrentTab();
  },

  deletePassenger(id) {
    if (confirm('Are you sure you want to remove this saved passenger?')) {
      BusGoDB.deleteSavedPassenger(id);
      BusGoUI.toast('Passenger removed', 'info');
      this.renderCurrentTab();
    }
  },

  handleResetData() {
    if (confirm('Reset all demo data back to factory defaults? This will restore original tickets and sample routes.')) {
      BusGoDB.resetDemoData();
      BusGoUI.toast('Demo data restored successfully!', 'success');
      setTimeout(() => window.location.reload(), 500);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard-main-content')) {
    Dashboard.init();
  }
});
