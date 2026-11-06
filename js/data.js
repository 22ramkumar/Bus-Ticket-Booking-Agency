/**
 * BusGo - Bus Ticket Booking Agency
 * LocalStorage Database Engine & Seed Data - Tamil Nadu Edition
 */

const BUSGO_STORAGE_KEYS = {
  USERS: 'busgo_users',
  CURRENT_USER: 'busgo_currentUser',
  BUSES: 'busgo_buses',
  ROUTES: 'busgo_routes',
  BOOKINGS: 'busgo_bookings',
  CANCELLATIONS: 'busgo_cancellations',
  SAVED_PASSENGERS: 'busgo_saved_passengers',
  PROMOS: 'busgo_promos',
  NOTIFICATIONS: 'busgo_notifications',
  BOOKED_SEATS: 'busgo_booked_seats', // Map of busId_date -> [seatNo]
  THEME: 'busgo_theme',
  RTL: 'busgo_rtl',
  ACTIVE_SEARCH: 'busgo_active_search',
  DATA_VERSION: 'busgo_data_version'
};

const DATA_VERSION = 'tn_v3'; // Tamil Nadu edition version flag

// Major Hubs & Locations inside Tamil Nadu
const DEFAULT_CITIES = [
  "Chennai, TN",
  "Coimbatore, TN",
  "Madurai, TN",
  "Tiruchirappalli (Trichy), TN",
  "Salem, TN",
  "Tirunelveli, TN",
  "Ooty (Udhagamandalam), TN",
  "Kodaikanal, TN",
  "Vellore, TN",
  "Erode, TN",
  "Tiruppur, TN",
  "Thanjavur, TN",
  "Rameswaram, TN",
  "Kanyakumari, TN",
  "Nagercoil, TN",
  "Dindigul, TN",
  "Hosur, TN",
  "Puducherry (Pondicherry)",
  "Tuticorin (Thoothukudi), TN",
  "Kumbakonam, TN",
  "Karur, TN",
  "Theni, TN",
  "Tiruvannamalai, TN",
  "Velankanni, TN"
];

const DEFAULT_POPULAR_ROUTES = [
  {
    id: "route-che-cbe",
    from: "Chennai, TN",
    to: "Coimbatore, TN",
    distance: "505 km",
    duration: "8h 15m",
    startingFare: 850,
    dailyBuses: 48,
    busType: "Volvo 9600 Multi-Axle AC Sleeper",
    rating: 4.9,
    reviews: 3240,
    tag: "Most Popular Corridor",
    image: "assets/images/coimbatore-marudhamalai-temple.jpg"
  },
  {
    id: "route-che-mdu",
    from: "Chennai, TN",
    to: "Madurai, TN",
    distance: "460 km",
    duration: "7h 45m",
    startingFare: 750,
    dailyBuses: 42,
    busType: "Mercedes-Benz Luxury Sleeper",
    rating: 4.85,
    reviews: 2890,
    tag: "Temple City Express",
    image: "assets/images/madurai-meenakshi-night.jpg"
  },
  {
    id: "route-cbe-ooty",
    from: "Coimbatore, TN",
    to: "Ooty (Udhagamandalam), TN",
    distance: "86 km",
    duration: "3h 15m",
    startingFare: 280,
    dailyBuses: 28,
    busType: "BharatBenz Panoramic Hill Cruiser",
    rating: 4.95,
    reviews: 4120,
    tag: "Scenic Hill Route",
    image: "assets/images/ooty-toy-train.jpg"
  },
  {
    id: "route-che-try",
    from: "Chennai, TN",
    to: "Tiruchirappalli (Trichy), TN",
    distance: "330 km",
    duration: "5h 30m",
    startingFare: 550,
    dailyBuses: 36,
    busType: "Scania Metrolink Club Class",
    rating: 4.75,
    reviews: 1980,
    tag: "Grand Southern Trunk",
    image: "https://images.unsplash.com/photo-1620619767323-b95a89183081?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "route-che-tnv",
    from: "Chennai, TN",
    to: "Tirunelveli, TN",
    distance: "620 km",
    duration: "10h 30m",
    startingFare: 950,
    dailyBuses: 26,
    busType: "Volvo B11R Grand Sleeper Suite",
    rating: 4.8,
    reviews: 1650,
    tag: "Deep South Express",
    image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "route-che-kny",
    from: "Chennai, TN",
    to: "Kanyakumari, TN",
    distance: "705 km",
    duration: "11h 45m",
    startingFare: 1100,
    dailyBuses: 20,
    busType: "Multi-Axle Luxury AC Sleeper",
    rating: 4.9,
    reviews: 2100,
    tag: "Cape Comorin Special",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
  }
];

const DEFAULT_BUSES = [
  // 1. Chennai to Coimbatore Buses
  {
    id: "bus-101",
    operator: "YBM Travels Luxury",
    operatorLogo: "bi-shield-check",
    busName: "Volvo 9600 Multi-Axle Luxury Sleeper (2+1)",
    busType: "AC Sleeper (2+1)",
    category: "sleeper",
    rating: 4.9,
    totalRatings: 680,
    from: "Chennai, TN",
    to: "Coimbatore, TN",
    departureTime: "09:30 PM",
    arrivalTime: "05:45 AM",
    duration: "8h 15m",
    fare: 950,
    totalSeats: 30,
    boardingPoints: [
      { name: "Kilambakkam Bus Terminus (KCBT Gate 4)", time: "09:30 PM" },
      { name: "Tambaram Sanatorium (MEPZ Flyover)", time: "09:50 PM" },
      { name: "Perungalathur (Near Kamarajar Statue)", time: "10:05 PM" },
      { name: "Koyambedu Omni Bus Stand (Opp. Rohini)", time: "08:45 PM" },
      { name: "Guindy (Kathipara Junction)", time: "09:15 PM" }
    ],
    droppingPoints: [
      { name: "KMCH Avinashi Road", time: "05:15 AM" },
      { name: "Hopes College Peelamedu", time: "05:30 AM" },
      { name: "Gandhipuram Central Omni Bus Stand", time: "05:45 AM" },
      { name: "Singanallur Bus Stand", time: "06:05 AM" }
    ],
    amenities: ["WiFi", "AC", "USB Port", "Mineral Water", "Blanket & Pillow", "Live GPS", "Emergency SOS"],
    layout: "sleeper",
    seatsAvailable: 14
  },
  {
    id: "bus-102",
    operator: "KPN Travels Express",
    operatorLogo: "bi-lightning-charge",
    busName: "Mercedes-Benz Tourismo High-Deck",
    busType: "AC Seater (2+2)",
    category: "seater",
    rating: 4.75,
    totalRatings: 840,
    from: "Chennai, TN",
    to: "Coimbatore, TN",
    departureTime: "06:00 AM",
    arrivalTime: "02:20 PM",
    duration: "8h 20m",
    fare: 820,
    totalSeats: 40,
    boardingPoints: [
      { name: "Koyambedu Omni Bus Stand", time: "06:00 AM" },
      { name: "Ashok Pillar (100 Feet Road)", time: "06:15 AM" },
      { name: "Kilambakkam KCBT Terminus", time: "06:45 AM" }
    ],
    droppingPoints: [
      { name: "Hopes College Peelamedu", time: "02:00 PM" },
      { name: "Gandhipuram Central Omni Bus Stand", time: "02:20 PM" }
    ],
    amenities: ["WiFi", "AC", "USB Port", "Reading Light", "Reclining Seats", "Snack Pack"],
    layout: "seater",
    seatsAvailable: 22
  },
  {
    id: "bus-103",
    operator: "Parveen Travels Club Class",
    operatorLogo: "bi-star-fill",
    busName: "Scania Metrolink Multi-Axle Diamond Class",
    busType: "AC Sleeper & Seater",
    category: "sleeper",
    rating: 4.88,
    totalRatings: 520,
    from: "Chennai, TN",
    to: "Coimbatore, TN",
    departureTime: "10:15 PM",
    arrivalTime: "06:30 AM",
    duration: "8h 15m",
    fare: 1050,
    totalSeats: 30,
    boardingPoints: [
      { name: "Sholinganallur (OMR IT Corridor)", time: "09:15 PM" },
      { name: "Kilambakkam Bus Terminus (KCBT Gate 5)", time: "10:15 PM" },
      { name: "Perungalathur Bypass", time: "10:30 PM" }
    ],
    droppingPoints: [
      { name: "KMCH Avinashi Road", time: "06:00 AM" },
      { name: "Gandhipuram Central Omni Bus Stand", time: "06:30 AM" }
    ],
    amenities: ["WiFi", "AC", "USB Port", "Blanket", "Water Bottle", "Movies On Demand"],
    layout: "sleeper",
    seatsAvailable: 11
  },
  {
    id: "bus-104",
    operator: "SETC Ultra Deluxe Airavat",
    operatorLogo: "bi-bus-front",
    busName: "Volvo B11R Grand Sleeper Suite",
    busType: "Ultra Luxury AC Sleeper",
    category: "sleeper",
    rating: 4.7,
    totalRatings: 910,
    from: "Chennai, TN",
    to: "Coimbatore, TN",
    departureTime: "11:00 PM",
    arrivalTime: "07:15 AM",
    duration: "8h 15m",
    fare: 890,
    totalSeats: 30,
    boardingPoints: [
      { name: "Kilambakkam Bus Terminus (KCBT)", time: "11:00 PM" }
    ],
    droppingPoints: [
      { name: "Gandhipuram Central Omni Bus Stand", time: "07:15 AM" }
    ],
    amenities: ["WiFi", "AC", "USB Port", "Clean Linen", "Water Bottle", "Live GPS"],
    layout: "sleeper",
    seatsAvailable: 8
  },

  // 2. Chennai to Madurai Buses
  {
    id: "bus-201",
    operator: "SRM Transports Executive",
    operatorLogo: "bi-shield-check",
    busName: "Mercedes-Benz Tourismo Multi-Axle Sleeper",
    busType: "AC Sleeper (2+1)",
    category: "sleeper",
    rating: 4.9,
    totalRatings: 740,
    from: "Chennai, TN",
    to: "Madurai, TN",
    departureTime: "10:00 PM",
    arrivalTime: "05:45 AM",
    duration: "7h 45m",
    fare: 850,
    totalSeats: 30,
    boardingPoints: [
      { name: "Koyambedu Omni Bus Stand", time: "09:00 PM" },
      { name: "Kilambakkam Bus Terminus (KCBT Gate 2)", time: "10:00 PM" },
      { name: "Perungalathur Bypass", time: "10:15 PM" }
    ],
    droppingPoints: [
      { name: "Fathima College Bypass", time: "05:15 AM" },
      { name: "Mattuthavani MGR Integrated Bus Stand", time: "05:45 AM" },
      { name: "Periyar Bus Stand", time: "06:10 AM" }
    ],
    amenities: ["WiFi", "AC", "USB Port", "Water Bottle", "Blanket", "Live Tracking"],
    layout: "sleeper",
    seatsAvailable: 15
  },
  {
    id: "bus-202",
    operator: "IntrCity SmartBus Tamil Nadu",
    operatorLogo: "bi-lightning-charge",
    busName: "Volvo 9600 Grand AC Club Seater",
    busType: "AC Seater (2+2)",
    category: "seater",
    rating: 4.82,
    totalRatings: 610,
    from: "Chennai, TN",
    to: "Madurai, TN",
    departureTime: "07:30 AM",
    arrivalTime: "03:15 PM",
    duration: "7h 45m",
    fare: 720,
    totalSeats: 40,
    boardingPoints: [
      { name: "Kilambakkam Bus Terminus (KCBT)", time: "07:30 AM" },
      { name: "Tambaram Sanatorium", time: "07:50 AM" }
    ],
    droppingPoints: [
      { name: "Mattuthavani MGR Bus Stand", time: "03:15 PM" }
    ],
    amenities: ["WiFi", "AC", "USB Port", "Reclining Seats", "Snack Pack"],
    layout: "seater",
    seatsAvailable: 25
  },

  // 3. Coimbatore to Ooty (Hill Station)
  {
    id: "bus-301",
    operator: "Nilgiris Express Liners",
    operatorLogo: "bi-sun",
    busName: "BharatBenz Premium Panoramic Hill Coach",
    busType: "AC Seater (2+2)",
    category: "seater",
    rating: 4.95,
    totalRatings: 1120,
    from: "Coimbatore, TN",
    to: "Ooty (Udhagamandalam), TN",
    departureTime: "07:15 AM",
    arrivalTime: "10:30 AM",
    duration: "3h 15m",
    fare: 280,
    totalSeats: 40,
    boardingPoints: [
      { name: "Gandhipuram Central Omni Bus Stand", time: "07:15 AM" },
      { name: "Mettupalayam Road Bus Stand", time: "07:45 AM" }
    ],
    droppingPoints: [
      { name: "Coonoor Bus Stand", time: "09:45 AM" },
      { name: "Charing Cross Ooty", time: "10:20 AM" },
      { name: "Ooty Central Bus Stand (ATC)", time: "10:30 AM" }
    ],
    amenities: ["AC", "Panoramic Windows", "USB Charging", "Music System", "Mountain Guide Audio"],
    layout: "seater",
    seatsAvailable: 19
  },

  // 4. Chennai to Trichy
  {
    id: "bus-401",
    operator: "City Travels Express",
    operatorLogo: "bi-building",
    busName: "Scania Metrolink High-Deck Luxury",
    busType: "AC Seater (2+2)",
    category: "seater",
    rating: 4.78,
    totalRatings: 540,
    from: "Chennai, TN",
    to: "Tiruchirappalli (Trichy), TN",
    departureTime: "06:30 AM",
    arrivalTime: "12:00 PM",
    duration: "5h 30m",
    fare: 550,
    totalSeats: 40,
    boardingPoints: [
      { name: "Kilambakkam Bus Terminus (KCBT)", time: "06:30 AM" },
      { name: "Tambaram Sanatorium", time: "06:50 AM" }
    ],
    droppingPoints: [
      { name: "Samayapuram Toll Plaza", time: "11:20 AM" },
      { name: "Central Bus Stand (Rockfort)", time: "11:50 AM" },
      { name: "Mannarpuram Toll", time: "12:00 PM" }
    ],
    amenities: ["WiFi", "AC", "USB Port", "Reclining Seats", "Mineral Water"],
    layout: "seater",
    seatsAvailable: 21
  },

  // 5. Chennai to Tirunelveli
  {
    id: "bus-501",
    operator: "Starline Night Cruiser",
    operatorLogo: "bi-moon-stars",
    busName: "Volvo B11R Grand Sleeper Suite",
    busType: "AC Sleeper (2+1)",
    category: "sleeper",
    rating: 4.88,
    totalRatings: 490,
    from: "Chennai, TN",
    to: "Tirunelveli, TN",
    departureTime: "08:30 PM",
    arrivalTime: "07:00 AM",
    duration: "10h 30m",
    fare: 980,
    totalSeats: 30,
    boardingPoints: [
      { name: "Koyambedu Omni Bus Stand", time: "07:30 PM" },
      { name: "Kilambakkam Bus Terminus (KCBT)", time: "08:30 PM" },
      { name: "Perungalathur Bypass", time: "08:45 PM" }
    ],
    droppingPoints: [
      { name: "Kayathar Toll Plaza", time: "06:15 AM" },
      { name: "Vannarpettai Roundana", time: "06:45 AM" },
      { name: "Vaeinthaankulam New Bus Stand", time: "07:00 AM" }
    ],
    amenities: ["WiFi", "AC", "USB Port", "Blanket & Pillow", "Water Bottle", "Live GPS"],
    layout: "sleeper",
    seatsAvailable: 13
  },

  // 6. Madurai to Rameswaram
  {
    id: "bus-601",
    operator: "Pamban Coast Express",
    operatorLogo: "bi-water",
    busName: "BharatBenz Coastal Cruiser AC",
    busType: "AC Seater (2+2)",
    category: "seater",
    rating: 4.8,
    totalRatings: 380,
    from: "Madurai, TN",
    to: "Rameswaram, TN",
    departureTime: "07:00 AM",
    arrivalTime: "10:30 AM",
    duration: "3h 30m",
    fare: 320,
    totalSeats: 40,
    boardingPoints: [
      { name: "Mattuthavani MGR Bus Stand", time: "07:00 AM" },
      { name: "Periyar Bus Stand", time: "07:20 AM" }
    ],
    droppingPoints: [
      { name: "Pamban Bridge Viewpoint", time: "10:05 AM" },
      { name: "Rameswaram Temple Bus Stand", time: "10:30 AM" }
    ],
    amenities: ["AC", "Large Windows", "USB Charging", "Music System"],
    layout: "seater",
    seatsAvailable: 26
  }
];

const DEFAULT_PROMOS = [
  {
    code: "FIRST50",
    title: "First Booking Mega Deal",
    description: "Get 50% discount (up to ₹250) on your very first intercity bus journey across Tamil Nadu.",
    discountPercent: 50,
    maxDiscount: 250,
    minFare: 300,
    validUntil: "2026-12-31",
    category: "new_user",
    terms: "Valid once per traveler account. Applicable on all AC Sleeper and Seater routes inside Tamil Nadu."
  },
  {
    code: "WEEKEND25",
    title: "Weekend Getaway Pass",
    description: "Take 25% off (up to ₹200) on Friday through Sunday trips to Ooty, Kodaikanal, and Madurai.",
    discountPercent: 25,
    maxDiscount: 200,
    minFare: 400,
    validUntil: "2026-12-31",
    category: "weekend",
    terms: "Applies to Friday, Saturday, and Sunday departure dates. Maximum savings ₹200."
  },
  {
    code: "BUSGO15",
    title: "Anytime Express Saver",
    description: "Enjoy 15% instant savings on any bus operator across Tamil Nadu network.",
    discountPercent: 15,
    maxDiscount: 150,
    minFare: 250,
    validUntil: "2026-12-31",
    category: "all",
    terms: "No minimum trip distance required. Valid on all intra-Tamil Nadu routes."
  },
  {
    code: "STUDENT100",
    title: "College & Student Discount",
    description: "Flat ₹100 off when booking any interstate or intra-TN coach over ₹500.",
    flatDiscount: 100,
    minFare: 500,
    validUntil: "2026-12-31",
    category: "student",
    terms: "Valid student ID may be requested during QR boarding. Max 1 coupon per ticket."
  },
  {
    code: "ROUNDTRIP20",
    title: "Return Trip Special",
    description: "Save 20% off (up to ₹250) when booking return bus tickets with BusGo.",
    discountPercent: 20,
    maxDiscount: 250,
    minFare: 600,
    validUntil: "2026-12-31",
    category: "round_trip",
    terms: "Applicable on premium Volvo multi-axle sleeper coaches."
  }
];

const DEFAULT_USER = {
  id: "user-1001",
  name: "Ramkumar R.",
  email: "ramkumar@rkbus.com",
  password: "Travel@123", // Demo traveler
  phone: "+91 98765 43210",
  city: "Chennai, TN",
  gender: "Male",
  avatar: "assets/images/avatar-ramkumar.jpg",
  memberSince: "January 2024",
  stats: {
    totalTrips: 12,
    upcomingTrips: 1,
    cancelledTrips: 1,
    totalSpent: 9850
  }
};

const DEFAULT_SAVED_PASSENGERS = [
  {
    id: "pass-1",
    name: "Ramkumar R.",
    age: 29,
    gender: "Male",
    idType: "Aadhaar Card",
    idNumber: "UID-***4892",
    isPrimary: true
  },
  {
    id: "pass-2",
    name: "Anitha Ramkumar",
    age: 27,
    gender: "Female",
    idType: "Driver License",
    idNumber: "TN-***8210",
    isPrimary: false
  },
  {
    id: "pass-3",
    name: "Karthik Subramanian",
    age: 31,
    gender: "Male",
    idType: "Aadhaar Card",
    idNumber: "UID-***1039",
    isPrimary: false
  }
];

// Helper to compute dates relative to today
function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const DEFAULT_BOOKINGS = [
  {
    pnr: "BG-784291",
    busId: "bus-101",
    busName: "Volvo 9600 Multi-Axle Luxury Sleeper (2+1)",
    operator: "YBM Travels Luxury",
    busType: "AC Sleeper (2+1)",
    from: "Chennai, TN",
    to: "Coimbatore, TN",
    departureDate: getFormattedDate(1), // Tomorrow
    departureTime: "09:30 PM",
    arrivalTime: "05:45 AM",
    duration: "8h 15m",
    boardingPoint: "Kilambakkam Bus Terminus (KCBT Gate 4)",
    droppingPoint: "Gandhipuram Central Omni Bus Stand",
    seats: ["L12", "L13"],
    passengers: [
      { name: "Ramkumar R.", age: 29, gender: "Male", seat: "L12" },
      { name: "Anitha Ramkumar", age: 27, gender: "Female", seat: "L13" }
    ],
    fareBreakdown: {
      baseFare: 1900.00,
      tax: 190.00,
      convenienceFee: 40.00,
      discount: 200.00,
      promoCode: "WEEKEND25",
      totalFare: 1930.00
    },
    paymentMethod: "UPI / Google Pay",
    bookedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "Upcoming", // Upcoming | Completed | Cancelled
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BG-784291-BUSGO-CONFIRMED"
  },
  {
    pnr: "BG-612048",
    busId: "bus-401",
    busName: "Scania Metrolink High-Deck Luxury",
    operator: "City Travels Express",
    busType: "AC Seater (2+2)",
    from: "Tiruchirappalli (Trichy), TN",
    to: "Chennai, TN",
    departureDate: getFormattedDate(-7), // 7 days ago
    departureTime: "06:30 AM",
    arrivalTime: "12:00 PM",
    duration: "5h 30m",
    boardingPoint: "Central Bus Stand (Rockfort)",
    droppingPoint: "Kilambakkam Bus Terminus (KCBT)",
    seats: ["S14"],
    passengers: [
      { name: "Ramkumar R.", age: 29, gender: "Male", seat: "S14" }
    ],
    fareBreakdown: {
      baseFare: 550.00,
      tax: 55.00,
      convenienceFee: 25.00,
      discount: 0.00,
      promoCode: "",
      totalFare: 630.00
    },
    paymentMethod: "Credit Card (ending 4242)",
    bookedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: "Completed",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BG-612048-BUSGO-COMPLETED"
  },
  {
    pnr: "BG-491720",
    busId: "bus-201",
    busName: "Mercedes-Benz Tourismo Multi-Axle Sleeper",
    operator: "SRM Transports Executive",
    busType: "AC Sleeper (2+1)",
    from: "Chennai, TN",
    to: "Madurai, TN",
    departureDate: getFormattedDate(-3),
    departureTime: "10:00 PM",
    arrivalTime: "05:45 AM",
    duration: "7h 45m",
    boardingPoint: "Kilambakkam Bus Terminus (KCBT)",
    droppingPoint: "Mattuthavani MGR Bus Stand",
    seats: ["L05"],
    passengers: [
      { name: "Ramkumar R.", age: 29, gender: "Male", seat: "L05" }
    ],
    fareBreakdown: {
      baseFare: 850.00,
      tax: 85.00,
      convenienceFee: 25.00,
      discount: 0.00,
      promoCode: "",
      totalFare: 960.00
    },
    paymentMethod: "Credit Card (ending 4242)",
    bookedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    status: "Cancelled",
    cancellationInfo: {
      cancelledAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      reason: "Emergency meeting rescheduled in Chennai",
      refundRate: 90,
      refundAmount: 864.00,
      refundStatus: "Refunded",
      refundTxnId: "RF-8829104"
    },
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BG-491720-BUSGO-CANCELLED"
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Trip Departure Alert",
    message: "Your bus to Coimbatore departs tomorrow at 09:30 PM from Kilambakkam Bus Terminus (KCBT Gate 4). Safe travels!",
    date: "1 hour ago",
    read: false,
    icon: "bi-bell",
    type: "info"
  },
  {
    id: "notif-2",
    title: "Refund Processed Successfully",
    message: "Refund of ₹864.00 for cancelled Madurai ticket BG-491720 has been credited to your UPI account.",
    date: "3 days ago",
    read: true,
    icon: "bi-check-circle",
    type: "success"
  },
  {
    id: "notif-3",
    title: "Exclusive Tamil Nadu Deal Unlocked",
    message: "Get 25% off weekend hill station trips to Ooty & Kodaikanal with code WEEKEND25! Check our offers page.",
    date: "5 days ago",
    read: true,
    icon: "bi-tag",
    type: "promo"
  }
];

// Pre-seeded occupied seats map: busId_date -> Array of seat numbers
const DEFAULT_PREBOOKED_SEATS = {
  [`bus-101_${getFormattedDate(1)}`]: ["L01", "L02", "L08", "L12", "L13", "U03", "U07", "U11", "U15"],
  [`bus-102_${getFormattedDate(1)}`]: ["S01", "S02", "S05", "S06", "S11", "S12", "S19", "S20"],
  [`bus-103_${getFormattedDate(1)}`]: ["L04", "L05", "L09", "U02", "U06"],
  [`bus-201_${getFormattedDate(1)}`]: ["L01", "L03", "L07", "U01", "U05"],
};

// Female-reserved seats for default buses (matches Image 2 pink berths)
const LADIES_RESERVED_SEATS = ["L04", "L10", "U01", "U02", "U03", "U04", "U14", "U15", "S03", "S04"];

// BusGoDB Singleton
const BusGoDB = {
  init() {
    const currentVersion = localStorage.getItem(BUSGO_STORAGE_KEYS.DATA_VERSION);
    if (currentVersion !== DATA_VERSION) {
      // Automatic upgrade to Tamil Nadu edition
      this.resetDemoData();
      localStorage.setItem(BUSGO_STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
      return;
    }

    // Ensure any previously cached user name with Alex Morgan or old avatar is updated to Ramkumar R. and authentic Indian profile
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      let needsUpdate = false;
      if (currentUser.name === 'Alex Morgan' || currentUser.name.includes('Morgan')) {
        currentUser.name = 'Ramkumar R.';
        currentUser.email = 'ramkumar@rkbus.com';
        needsUpdate = true;
      }
      if (!currentUser.avatar || currentUser.avatar.includes('photo-1507003211169') || currentUser.avatar.includes('photo-1535713875002')) {
        currentUser.avatar = 'assets/images/avatar-ramkumar.jpg';
        needsUpdate = true;
      }
      if (needsUpdate) {
        this.updateCurrentUser(currentUser);
      }
    }

    if (!localStorage.getItem(BUSGO_STORAGE_KEYS.ROUTES)) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.ROUTES, JSON.stringify(DEFAULT_POPULAR_ROUTES));
    }
    if (!localStorage.getItem(BUSGO_STORAGE_KEYS.BUSES)) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.BUSES, JSON.stringify(DEFAULT_BUSES));
    }
    if (!localStorage.getItem(BUSGO_STORAGE_KEYS.PROMOS)) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.PROMOS, JSON.stringify(DEFAULT_PROMOS));
    }
    if (!localStorage.getItem(BUSGO_STORAGE_KEYS.USERS)) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_USER]));
    }
    if (!localStorage.getItem(BUSGO_STORAGE_KEYS.SAVED_PASSENGERS)) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.SAVED_PASSENGERS, JSON.stringify(DEFAULT_SAVED_PASSENGERS));
    }
    if (!localStorage.getItem(BUSGO_STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem(BUSGO_STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    if (!localStorage.getItem(BUSGO_STORAGE_KEYS.BOOKED_SEATS)) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.BOOKED_SEATS, JSON.stringify(DEFAULT_PREBOOKED_SEATS));
    }
    if (!localStorage.getItem(BUSGO_STORAGE_KEYS.THEME)) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.THEME, 'dark');
    }
  },

  // Reset to factory Tamil Nadu demo data
  resetDemoData() {
    localStorage.setItem(BUSGO_STORAGE_KEYS.ROUTES, JSON.stringify(DEFAULT_POPULAR_ROUTES));
    localStorage.setItem(BUSGO_STORAGE_KEYS.BUSES, JSON.stringify(DEFAULT_BUSES));
    localStorage.setItem(BUSGO_STORAGE_KEYS.PROMOS, JSON.stringify(DEFAULT_PROMOS));
    localStorage.setItem(BUSGO_STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_USER]));
    localStorage.setItem(BUSGO_STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
    localStorage.setItem(BUSGO_STORAGE_KEYS.SAVED_PASSENGERS, JSON.stringify(DEFAULT_SAVED_PASSENGERS));
    localStorage.setItem(BUSGO_STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    localStorage.setItem(BUSGO_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(BUSGO_STORAGE_KEYS.BOOKED_SEATS, JSON.stringify(DEFAULT_PREBOOKED_SEATS));
    localStorage.setItem(BUSGO_STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
    return true;
  },

  // Routes
  getRoutes() {
    return JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.ROUTES)) || DEFAULT_POPULAR_ROUTES;
  },

  getCities() {
    return DEFAULT_CITIES;
  },

  // Buses
  getBuses(from = "", to = "") {
    const buses = JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.BUSES)) || DEFAULT_BUSES;
    if (!from && !to) return buses;
    return buses.filter(b => {
      const matchFrom = !from || b.from.toLowerCase().includes(from.toLowerCase().split(',')[0].trim());
      const matchTo = !to || b.to.toLowerCase().includes(to.toLowerCase().split(',')[0].trim());
      return matchFrom && matchTo;
    });
  },

  getBusById(busId) {
    const buses = JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.BUSES)) || DEFAULT_BUSES;
    return buses.find(b => b.id === busId) || null;
  },

  // Booked Seats
  getBookedSeats(busId, travelDate) {
    const seatMap = JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.BOOKED_SEATS)) || {};
    const key = `${busId}_${travelDate}`;
    if (seatMap[key] && seatMap[key].length > 0) {
      return seatMap[key];
    }
    // Pre-seeded occupied seats matching Image 2
    return ["L01", "L02", "L03", "L04", "L05", "L06", "L08", "L09", "L10", "L11", "L12", "L15", "U01", "U02", "U03", "U04", "U05", "U06", "U07", "U10", "U13", "U14", "U15"];
  },

  isSeatLadiesReserved(seatNo) {
    return LADIES_RESERVED_SEATS.includes(seatNo);
  },

  reserveSeats(busId, travelDate, seatNumbers) {
    const seatMap = JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.BOOKED_SEATS)) || {};
    const key = `${busId}_${travelDate}`;
    if (!seatMap[key]) {
      seatMap[key] = [];
    }
    // Check if any seat is already booked
    const alreadyBooked = seatNumbers.some(seat => seatMap[key].includes(seat));
    if (alreadyBooked) {
      return { success: false, message: "One or more selected seats have already been booked by another passenger. Please choose different seats." };
    }
    seatMap[key] = [...seatMap[key], ...seatNumbers];
    localStorage.setItem(BUSGO_STORAGE_KEYS.BOOKED_SEATS, JSON.stringify(seatMap));
    return { success: true };
  },

  releaseSeats(busId, travelDate, seatNumbers) {
    const seatMap = JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.BOOKED_SEATS)) || {};
    const key = `${busId}_${travelDate}`;
    if (seatMap[key]) {
      seatMap[key] = seatMap[key].filter(s => !seatNumbers.includes(s));
      localStorage.setItem(BUSGO_STORAGE_KEYS.BOOKED_SEATS, JSON.stringify(seatMap));
    }
  },

  // Bookings
  getBookings() {
    return JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.BOOKINGS)) || [];
  },

  getBookingByPnr(pnr) {
    const bookings = this.getBookings();
    return bookings.find(b => b.pnr.toLowerCase() === pnr.toLowerCase()) || null;
  },

  addBooking(bookingData) {
    // Generate PNR
    const pnr = "BG-" + Math.floor(100000 + Math.random() * 900000);
    const newBooking = {
      ...bookingData,
      pnr,
      bookedAt: new Date().toISOString(),
      status: "Upcoming",
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${pnr}-BUSGO-CONFIRMED`
    };

    // Save booked seats in seatMap
    const reserveResult = this.reserveSeats(newBooking.busId, newBooking.departureDate, newBooking.seats);
    if (!reserveResult.success) {
      return reserveResult;
    }

    const bookings = this.getBookings();
    bookings.unshift(newBooking);
    localStorage.setItem(BUSGO_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Update user stats
    const user = this.getCurrentUser();
    if (user) {
      user.stats.totalTrips = (user.stats.totalTrips || 0) + 1;
      user.stats.upcomingTrips = (user.stats.upcomingTrips || 0) + 1;
      user.stats.totalSpent = (user.stats.totalSpent || 0) + Number(newBooking.fareBreakdown.totalFare);
      this.updateCurrentUser(user);
    }

    // Add notification
    this.addNotification({
      title: "Booking Confirmed! 🎉",
      message: `Your trip to ${newBooking.to} is confirmed. PNR: ${pnr}. E-Ticket generated.`,
      icon: "bi-check-circle-fill",
      type: "success"
    });

    return { success: true, booking: newBooking };
  },

  // Cancel Booking with Dynamic Refund calculation
  // Rules:
  // > 24 hours before departure: 90% refund
  // 12 to 24 hours before departure: 50% refund
  // < 12 hours before departure: 0% refund
  calculateRefund(booking) {
    if (!booking) return { refundRate: 0, refundAmount: 0, hoursRemaining: 0 };
    
    // Parse departure timestamp
    const [hoursStr, minsWithAmPm] = booking.departureTime.split(':');
    const [mins, ampm] = minsWithAmPm.split(' ');
    let hours = parseInt(hoursStr, 10);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const departureDateTime = new Date(`${booking.departureDate}T${String(hours).padStart(2, '0')}:${mins}:00`);
    const now = new Date();
    const diffMs = departureDateTime - now;
    const hoursRemaining = diffMs / (1000 * 60 * 60);

    let refundRate = 0;
    if (hoursRemaining >= 24) {
      refundRate = 90;
    } else if (hoursRemaining >= 12) {
      refundRate = 50;
    } else {
      refundRate = 0;
    }

    const totalFare = Number(booking.fareBreakdown?.totalFare || 0);
    const refundAmount = Number(((totalFare * refundRate) / 100).toFixed(2));
    const cancellationFee = Number((totalFare - refundAmount).toFixed(2));

    return {
      hoursRemaining: Math.max(0, Math.round(hoursRemaining)),
      refundRate,
      refundAmount,
      cancellationFee,
      totalFare
    };
  },

  cancelBooking(pnr, reason = "Personal reasons") {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.pnr === pnr);
    if (index === -1) {
      return { success: false, message: "Booking not found." };
    }

    const booking = bookings[index];
    if (booking.status === "Cancelled") {
      return { success: false, message: "This booking has already been cancelled." };
    }

    const refundCalc = this.calculateRefund(booking);

    // Release seats
    this.releaseSeats(booking.busId, booking.departureDate, booking.seats);

    // Update booking object
    booking.status = "Cancelled";
    booking.cancellationInfo = {
      cancelledAt: new Date().toISOString(),
      reason,
      refundRate: refundCalc.refundRate,
      refundAmount: refundCalc.refundAmount,
      cancellationFee: refundCalc.cancellationFee,
      refundStatus: refundCalc.refundAmount > 0 ? "Refunded" : "No Refund",
      refundTxnId: "RF-" + Math.floor(1000000 + Math.random() * 9000000)
    };

    bookings[index] = booking;
    localStorage.setItem(BUSGO_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Update user stats
    const user = this.getCurrentUser();
    if (user) {
      user.stats.upcomingTrips = Math.max(0, (user.stats.upcomingTrips || 1) - 1);
      user.stats.cancelledTrips = (user.stats.cancelledTrips || 0) + 1;
      this.updateCurrentUser(user);
    }

    // Add notification
    this.addNotification({
      title: "Booking Cancelled",
      message: `PNR ${pnr} cancelled. Refund of ₹${refundCalc.refundAmount.toFixed(2)} (${refundCalc.refundRate}%) is processed.`,
      icon: "bi-arrow-counterclockwise",
      type: "warning"
    });

    return {
      success: true,
      booking,
      refund: refundCalc
    };
  },

  // Saved Passengers
  getSavedPassengers() {
    return JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.SAVED_PASSENGERS)) || [];
  },

  addSavedPassenger(passenger) {
    const list = this.getSavedPassengers();
    const newPassenger = {
      id: "pass-" + Date.now(),
      ...passenger
    };
    list.push(newPassenger);
    localStorage.setItem(BUSGO_STORAGE_KEYS.SAVED_PASSENGERS, JSON.stringify(list));
    return newPassenger;
  },

  updateSavedPassenger(id, data) {
    const list = this.getSavedPassengers();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      localStorage.setItem(BUSGO_STORAGE_KEYS.SAVED_PASSENGERS, JSON.stringify(list));
      return list[idx];
    }
    return null;
  },

  deleteSavedPassenger(id) {
    let list = this.getSavedPassengers();
    list = list.filter(p => p.id !== id);
    localStorage.setItem(BUSGO_STORAGE_KEYS.SAVED_PASSENGERS, JSON.stringify(list));
    return true;
  },

  // Promo Codes
  getPromos() {
    return JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.PROMOS)) || DEFAULT_PROMOS;
  },

  validatePromo(code, subtotal) {
    if (!code) return { valid: false, message: "Please enter a promo code." };
    const promos = this.getPromos();
    const promo = promos.find(p => p.code.toUpperCase() === code.trim().toUpperCase());
    
    if (!promo) {
      return { valid: false, message: "Invalid promo code. Please check and try again." };
    }

    if (promo.minFare && subtotal < promo.minFare) {
      return { valid: false, message: `This code requires a minimum booking fare of ₹${promo.minFare}.` };
    }

    let discount = 0;
    if (promo.discountPercent) {
      discount = (subtotal * promo.discountPercent) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else if (promo.flatDiscount) {
      discount = promo.flatDiscount;
    }

    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      code: promo.code,
      title: promo.title,
      discount: Number(discount.toFixed(2)),
      message: `Coupon '${promo.code}' applied! You saved ₹${discount.toFixed(2)}.`
    };
  },

  // Auth & Session
  getCurrentUser() {
    const u = localStorage.getItem(BUSGO_STORAGE_KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  },

  login(email, password) {
    const users = JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.USERS)) || [DEFAULT_USER];
    const cleanEmail = email.toLowerCase().trim();
    const user = users.find(u => {
      const uEmail = u.email.toLowerCase();
      const match = (uEmail === cleanEmail) || 
                    (cleanEmail === 'ramkumar@rkbus.com' && (uEmail === 'ramkumar@rkbus.com' || uEmail === 'traveler@rkbus.com' || uEmail === 'traveler@tamilbus.com' || uEmail === 'traveler@busgo.com')) ||
                    (cleanEmail === 'traveler@rkbus.com' && (uEmail === 'ramkumar@rkbus.com' || uEmail === 'traveler@tamilbus.com' || uEmail === 'traveler@busgo.com')) ||
                    (cleanEmail === 'traveler@tamilbus.com' && (uEmail === 'ramkumar@rkbus.com' || uEmail === 'traveler@rkbus.com' || uEmail === 'traveler@busgo.com')) ||
                    (cleanEmail === 'traveler@busgo.com' && (uEmail === 'ramkumar@rkbus.com' || uEmail === 'traveler@rkbus.com' || uEmail === 'traveler@tamilbus.com'));
      return match && u.password === password;
    });
    if (user) {
      localStorage.setItem(BUSGO_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: "Invalid email or password. Use demo login: ramkumar@rkbus.com / Travel@123" };
  },

  register(userData) {
    const users = JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.USERS)) || [DEFAULT_USER];
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: "An account with this email already exists." };
    }
    const newUser = {
      id: "user-" + Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || "+91 98765 00000",
      city: userData.city || "Chennai, TN",
      gender: userData.gender || "Other",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      memberSince: "November 2026",
      stats: {
        totalTrips: 0,
        upcomingTrips: 0,
        cancelledTrips: 0,
        totalSpent: 0
      }
    };
    users.push(newUser);
    localStorage.setItem(BUSGO_STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(BUSGO_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  logout() {
    localStorage.removeItem(BUSGO_STORAGE_KEYS.CURRENT_USER);
    return true;
  },

  updateCurrentUser(user) {
    localStorage.setItem(BUSGO_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    // Also update in users list
    const users = JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.USERS)) || [];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem(BUSGO_STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  // Notifications
  getNotifications() {
    return JSON.parse(localStorage.getItem(BUSGO_STORAGE_KEYS.NOTIFICATIONS)) || [];
  },

  addNotification(notif) {
    const list = this.getNotifications();
    list.unshift({
      id: "notif-" + Date.now(),
      date: "Just now",
      read: false,
      ...notif
    });
    localStorage.setItem(BUSGO_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  markNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(BUSGO_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  // Active Search state
  setActiveSearch(searchParams) {
    localStorage.setItem(BUSGO_STORAGE_KEYS.ACTIVE_SEARCH, JSON.stringify(searchParams));
  },

  getActiveSearch() {
    const s = localStorage.getItem(BUSGO_STORAGE_KEYS.ACTIVE_SEARCH);
    return s ? JSON.parse(s) : null;
  }
};

// Initialize on script load
BusGoDB.init();
