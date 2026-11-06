# BusGo - Modern Bus Ticket Booking Agency HTML Template

**BusGo** is a modern, high-conversion, production-ready HTML5 template for intercity bus ticket booking agencies, luxury coach fleet operators, and multi-operator travel businesses.

Crafted with Tailwind CSS, Vanilla JavaScript (ES6+), CSS3 animations, and a rich client-side LocalStorage database engine.

---

## 🚀 Key Highlights & Features

1. **Interactive Booking Flow**:
   - **Hero Route Search Widget**: Origin, Destination, Animated City Swap button, Date picker, and quick route tags.
   - **Visual Seat Selection**: Real-time Lower Deck & Upper Deck sleeper layout (berths) and 2+2 luxury recliner seater layout.
   - **Seat States**: Available, Selected, Booked (with double-booking protection), and Ladies-Only reserved berths.
   - **Boarding & Dropping Points**: Dynamic selection with scheduled pickup timestamps.
   - **Multi-Step Checkout**:
     - Step 1: Bus & Seat Selection
     - Step 2: Passenger details per seat with 1-click autofill from saved travelers
     - Step 3: Payment methods (Credit Card, UPI with active QR code, Wallets) and working Promo Code validator (`FIRST50`, `WEEKEND25`, `BUSGO15`)
     - Step 4: Instant booking confirmation with generated PNR, QR code, and Printable/Downloadable e-ticket.

2. **Traveler Dashboard**:
   - **Overview Tab**: Live countdown to next upcoming departure, 4 dynamic stat cards (Total Trips, Upcoming Trips, Cancelled Bookings, Total Spent), recent booking activity.
   - **My Tickets**: Tab filters (All, Upcoming, Completed, Cancelled), search by PNR/city, printable electronic boarding pass with QR code & barcode.
   - **Manage Cancellations & Transparent Refund Calculator**:
     - 24+ hours before departure: **90% refund** (10% processing fee)
     - 12 to 24 hours before departure: **50% refund**
     - Under 12 hours before departure: **0% refund**
     - Immediate seat release back into the pool upon cancellation.
   - **Saved Passengers**: Add, edit, and delete frequent travelers to speed up booking.
   - **Profile & Account Management**: Edit contact info, change password, reset template demo data.

3. **Themes & Internationalization**:
   - **Default Theme**: Deep Midnight Slate (`#090D16`, `#0F172A`, `#1E293B`) with vibrant Amber (`#F59E0B`) & Emerald accents.
   - **Crisp Light Mode**: High-contrast, clean slate styling.
   - **Full RTL Support**: Native Arabic/Hebrew layout with flipped route arrows, seat orientation, and sidebar mirroring.
   - Preferences saved in `localStorage`.

---

## 📂 File & Directory Structure

```text
Bus Ticket Booking Agency/
├── index.html               # Main Home Page (Hero search, popular routes, promo deals, FAQs)
├── routes.html              # Routes & Fares Directory (Filters, sort, desktop table & mobile cards)
├── booking.html             # Search Results, Visual Seat Layout, Passenger Form & Payment
├── offers.html              # Promo Deals & Coupon Codes with 1-click copy & apply
├── login.html               # Authentication Portal (Sign in, register, forgot password, 1-click demo login)
├── dashboard.html           # Traveler Portal (Overview, tickets, cancellations, refunds, passengers)
├── contact.html             # Customer Support, 24/7 Helpline, and Terminal locations
├── terms.html               # Terms of Service & Detailed Cancellation Refund Tiers
├── 404.html                 # Bus-themed 404 Error page
├── css/
│   └── styles.css           # Custom variables, glassmorphism, seat styles, print stylesheet, RTL
├── js/
│   ├── data.js              # Database seed data, LocalStorage API, refund calculator, bookings store
│   ├── app.js               # Global UI controller: theme toggle, RTL, auth pills, toasts, modals
│   ├── search-booking.js    # Search results, seat selection generator, checkout & payment engine
│   └── dashboard.js         # Traveler dashboard controller, ticket viewer, cancellation modal
└── README.md                # Documentation & customization guide
```

---

## 🔑 Demo Account Credentials

For effortless testing, use the pre-seeded traveler account:

* **Email:** `traveler@busgo.com`
* **Password:** `Travel@123`

You can also click the **"1-Click Login"** button on `login.html` to enter the dashboard immediately.

---

## 🏷️ Working Promo Codes

Test these promo codes at the payment step:

* `FIRST50`: 50% discount (up to $25) on your first booking
* `WEEKEND25`: 25% discount (up to $20) on weekend trips
* `BUSGO15`: 15% discount across all routes
* `STUDENT10`: Flat $10 off on fares over $35

---

## 🎨 Customization Guide

### Changing the Accent Colors
In `css/styles.css`, update the brand variables:

```css
:root {
  --brand-amber: #F59E0B;        /* Primary accent */
  --brand-amber-hover: #D97706;  /* Primary hover */
  --bg-body: #090D16;            /* Main dark background */
}
```

### Resetting Demo Data
Go to **Traveler Dashboard → Profile & Passengers → Reset Demo Data**, or run `BusGoDB.resetDemoData()` in the browser developer console.
