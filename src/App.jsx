import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PackagesPage from "./pages/Packages";
import AdminPanel from "./pages/AdminPanel";
import TicketRequest from "./pages/TicketRequest";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookieConsent from "./components/CookieConsent";
import { getPackages } from "./api";
import "./styles/styles.css";

const translations = {
  en: {
    navHome: "Home",
    navPackages: "Packages",
    navTickets: "Ticket Request",
    navAdmin: "Admin",
    switchTo: "EL",
    heroEyebrow: "Curated journeys. Seamless planning.",
    heroTitle: "Your next unforgettable trip starts here.",
    heroText:
      "Discover premium travel packages designed for comfort, adventure, and stress-free experiences.",
    heroExplore: "Explore Packages",
    heroTicket: "Request Ticket",
    heroAbout: "About Us",
    aboutEyebrow: "About us",
    aboutTitle: "A local business for long-distance travel.",
    aboutBody1:
      "Stella's Travel began as a small local business for everyone who wants tickets, routes, and paperwork handled with ease—not stress. A quarter-century beside airlines, ferries, and coach operators means we already know who delivers on the ground, at sea, and in the air, and we still push for the best outcome on every request.",
    aboutBody2:
      "You will not disappear into the anonymity of a giant call centre here. We care: you get direct answers, honest guidance, and the warm, personal service that only comes from people who remember why they opened their doors in the first place.",
    aboutProfileAlt: "Stella Sachpatzidou, founder of Stella's Travel Agency",
    aboutProfileCaption: "Stella Sachpatzidou",
    partnersEyebrow: "Our network",
    partnersTitle: "Partner travel agencies",
    partnersIntro:
      "We work with trusted partner agencies. When a website is available, you can open it from the partner name.",
    locationTitle: "Find Us",
    locationSubtitle: "Visit Stella's Travel Agency in Ptolemaida.",
    googleReviewsTitle: "Google Reviews",
    googleReviewsCta: "Read all reviews on Google",
    reviewOneName: "Maria K.",
    reviewOneText: "Great service and very helpful staff. Everything was organized perfectly.",
    reviewTwoName: "Nikos P.",
    reviewTwoText: "Excellent experience from start to finish. Strongly recommended.",
    reviewThreeName: "Eleni T.",
    reviewThreeText: "Very professional agency and clear communication for every travel detail.",
    packagesEyebrow: "Tailored for every traveler",
    packagesTitle: "Our Travel Packages",
    packagesText: "Filter by destination, budget, or trip duration to find your perfect match.",
    country: "Country",
    price: "Price",
    duration: "Duration (in days)",
    enterCountry: "Enter country",
    minPrice: "Min €",
    maxPrice: "Max €",
    enterDuration: "Enter duration",
    to: "to",
    days: "days",
    currencySymbol: "€",
    viewDetails: "View Details",
    requestPackageInfo: "Request information",
    packageInquiryEyebrow: "Package inquiry",
    packageInquiryTitle: "Request information",
    packageInquirySubtitle: "Leave your details and we will contact you about this package.",
    email: "Email",
    emailOptional: "Email (optional)",
    preferredTravelDate: "Preferred travel date (optional)",
    submitPackageInquiry: "Send request",
    packageInquirySuccess: "Your request has been sent. We will contact you soon.",
    packageInquiryError: "Failed to send request. Please try again.",
    close: "Close",
    noPackages: "No packages found that match your criteria.",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    packageDescriptionFallback: "No extra information yet.",
    adminTitle: "Admin Panel",
    adminSubtitle: "Create and update travel packages shown to users.",
    adminPackageNameRequired: "Please enter a package name.",
    adminName: "Package name",
    adminCountry: "Country",
    adminPrice: "Price (€)",
    adminDuration: "Duration (days)",
    adminUploadCoverImage: "Upload cover image",
    adminUploadPdf: "Upload PDF file",
    adminPdfOnly: "Only PDF files can be uploaded here.",
    adminImageOnly: "Only image files can be uploaded for the cover.",
    packagePdfPlaceholder: "No PDF yet",
    adminDescription: "Description",
    adminCreate: "Add Package",
    adminUpdate: "Update Package",
    adminCancel: "Cancel Edit",
    adminManageTitle: "Existing Packages",
    adminEdit: "Edit",
    adminDelete: "Delete",
    adminDeleteConfirm: "Are you sure you want to delete this package?",
    adminLoginTitle: "Admin Login",
    adminUsername: "Username",
    adminPassword: "Password",
    adminLoginButton: "Sign In",
    adminLogout: "Sign Out",
    adminLogoutConfirm: "Are you sure you want to sign out?",
    adminNavAddPackage: "Add Package",
    adminNavTicketRequests: "Ticket Request",
    adminNavPackageInquiries: "Package Inquiries",
    adminNavPendingCount: "Pending count",
    uploadingFile: "Uploading file...",
    uploadSuccess: "File uploaded successfully.",
    adminInvalidCredentials: "Invalid credentials.",
    loadingPackages: "Loading packages...",
    packagesLoadError: "Unable to load packages right now.",
    ticketEyebrow: "Custom travel needs",
    ticketTitle: "Request a Specific Ticket",
    ticketSubtitle: "Tell us your details and travel needs, and our team will contact you.",
    firstName: "First Name",
    lastName: "Last Name",
    mobile: "Mobile",
    mobileCode: "Country Code",
    mobileNumber: "Mobile Number",
    dateOfBirth: "Date of Birth",
    travelDate: "Travel Date",
    returnDate: "Return Date",
    fromDestination: "From",
    toDestination: "To",
    returnTicket: "I need a return ticket",
    transportType: "Transport Type",
    chooseTransportFirst: "Choose airplane or boat below to add routes, passengers, and notes.",
    airplane: "Airplane",
    boat: "Boat",
    fromPlaceholderAir: "Type city or airport",
    toPlaceholderAir: "Type city or airport",
    fromPlaceholderBoat: "Type departure port",
    toPlaceholderBoat: "Type arrival port",
    howManyPeople: "How many people",
    adults: "Adults",
    children: "Children",
    babies: "Babies",
    passengers: "Passengers",
    notesDetails: "Notes / Details",
    withSuitcase: "Include suitcase",
    withCar: "I have a car",
    submitTicketRequest: "Submit Ticket Request",
    ticketSuccess: "Your request has been submitted successfully.",
    ticketError: "Failed to submit request. Please try again.",
    adminTicketRequests: "Ticket Requests",
    adminSectionPackages: "Packages",
    adminSectionTickets: "Ticket Requests",
    adminSectionPackageInquiries: "Package inquiries",
    adminPackageInquiries: "Package inquiries",
    adminStatsPackages: "Total Packages",
    adminStatsTickets: "Total Tickets",
    adminStatsPackageInquiries: "Package inquiries",
    adminStatsPending: "Pending Tickets",
    adminStatsPendingInquiries: "Pending inquiries",
    adminSearchPackageInquiries: "Search package inquiries",
    packageInquiryDeleteConfirm: "Are you sure you want to delete this package inquiry?",
    noPackageInquiries: "No package inquiries yet.",
    inquiryPackageLabel: "Package",
    adminSearchTickets: "Search tickets",
    adminFilterStatus: "Filter status",
    all: "All",
    adminRequestedAt: "Requested at",
    status: "Status",
    ticketChecked: "Checked",
    ticketPending: "Pending",
    ticketOverdue: "Overdue",
    markChecked: "Mark Checked",
    markUnchecked: "Uncheck",
    ticketDeleteConfirm: "Are you sure you want to delete this ticket request?",
    noTicketRequests: "No ticket requests yet.",
    adminTicketsNoneInCategory: "No requests in this category.",
    adminTicketsCategoryOther: "Other",
    yes: "Yes",
    no: "No",
    footerAbout:
      "We craft curated travel experiences for couples, families, and explorers who want every detail handled with care.",
    footerGeneral: "General Information",
    weeklyHoursTitle: "Weekly Hours",
    footerFollow: "Follow Us",
    addressLabel: "Address",
    phoneLabel: "Phone",
    footerTelLabel: "Tel.:",
    footerMobLabel: "Mob.:",
    footerEmailLabel: "Email:",
    hoursLabel: "Hours",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    closed: "Closed",
    holidayNote: "Note: Holiday schedules may differ.",
    rights: "All rights reserved.",
    footerPrivacy: "Privacy & cookies",
    cookieBannerText: "We use essential cookies and local storage to remember your choices and run the site. See our",
    privacyPolicyLink: "Privacy & Cookie Policy",
    cookieAccept: "Accept",
    privacyEyebrow: "Legal",
    privacyTitle: "Privacy & Cookie Policy",
    privacyLastUpdated: "Last updated: May 2026",
    privacyTocLabel: "Table of contents",
    privacyBackHome: "Back to home",
  },
  el: {
    navHome: "Αρχική",
    navPackages: "Πακέτα",
    navTickets: "Αίτημα Εισιτηρίου",
    navAdmin: "Διαχείριση",
    switchTo: "EN",
    heroEyebrow: "Προσεγμένα ταξίδια. Εύκολος σχεδιασμός.",
    heroTitle: "Το επόμενο αξέχαστο ταξίδι σας ξεκινά εδώ.",
    heroText:
      "Ανακαλύψτε premium ταξιδιωτικά πακέτα σχεδιασμένα για άνεση, περιπέτεια και εμπειρία χωρίς άγχος.",
    heroExplore: "Δείτε τα Πακέτα",
    heroTicket: "Αίτημα Εισιτηρίου",
    heroAbout: "Σχετικά με εμάς",
    aboutEyebrow: "Σχετικά με εμάς",
    aboutTitle: "Τοπικό γραφείο για ταξίδια σε μεγάλες αποστάσεις.",
    aboutBody1:
      "Το Stella's Travel ξεκίνησε ως μικρή τοπική επιχείρηση για όσους θέλουν εισιτήρια, δρομολόγια και χαρτιά να οργανώνονται με άνεση—χωρίς άγχος. Είκοσι πέντε χρόνια δίπλα σε αεροπορικές γραμμές, πλοία και λεωφορεία σημαίνει ότι ξέρουμε ποιοι συνεργάτες είναι οι καλύτεροι στην πράξη και εξακολουθούμε να διεκδικούμε το καλύτερο αποτέλεσμα για κάθε αίτημα.",
    aboutBody2:
      "Δεν θα «χαθείτε» στην ανωνυμία ενός μεγάλου τηλεφωνικού κέντρου. Μας νοιάζει: παίρνετε άμεσες απαντήσεις, ειλικρινή καθοδήγηση και προσωπική εξυπηρέτηση από ανθρώπους που θυμούνται γιατί άνοιξαν την πόρτα τους από την πρώτη μέρα.",
    aboutProfileAlt: "Η Στέλλα Σαχπατζίδου, ιδρύτρια του Stella's Travel Agency",
    aboutProfileCaption: "Στέλλα Σαχπατζίδου",
    partnersEyebrow: "Το δίκτυό μας",
    partnersTitle: "Συνεργαζόμενα ταξιδιωτικά γραφεία",
    partnersIntro:
      "Συνεργαζόμαστε με αξιόπιστα συνεργαζόμενα γραφεία. Όταν υπάρχει ιστότοπος, μπορείτε να τον ανοίξετε από το όνομα του συνεργάτη.",
    locationTitle: "Θα μας βρείτε εδώ",
    locationSubtitle: "Επισκεφθείτε το Stella's Travel Agency στην Πτολεμαΐδα.",
    googleReviewsTitle: "Κριτικές Google",
    googleReviewsCta: "Δείτε όλες τις κριτικές στο Google",
    reviewOneName: "Maria K.",
    reviewOneText: "Εξαιρετική εξυπηρέτηση και πολύ πρόθυμο προσωπικό. Όλα ήταν άψογα οργανωμένα.",
    reviewTwoName: "Nikos P.",
    reviewTwoText: "Άριστη εμπειρία από την αρχή μέχρι το τέλος. Το προτείνω ανεπιφύλακτα.",
    reviewThreeName: "Eleni T.",
    reviewThreeText: "Πολύ επαγγελματικό γραφείο και ξεκάθαρη ενημέρωση για κάθε λεπτομέρεια.",
    packagesEyebrow: "Σχεδιασμένα για κάθε ταξιδιώτη",
    packagesTitle: "Τα Ταξιδιωτικά μας Πακέτα",
    packagesText: "Φιλτράρετε με προορισμό, budget ή διάρκεια για να βρείτε το ιδανικό πακέτο.",
    country: "Χώρα",
    price: "Τιμή",
    duration: "Διάρκεια (σε ημέρες)",
    enterCountry: "Εισάγετε χώρα",
    minPrice: "Ελάχιστο €",
    maxPrice: "Μέγιστο €",
    enterDuration: "Εισάγετε διάρκεια",
    to: "έως",
    days: "ημέρες",
    currencySymbol: "€",
    viewDetails: "Προβολή Λεπτομερειών",
    requestPackageInfo: "Αίτημα πληροφοριών",
    packageInquiryEyebrow: "Αίτημα πακέτου",
    packageInquiryTitle: "Αίτημα πληροφοριών",
    packageInquirySubtitle: "Αφήστε τα στοιχεία σας και θα επικοινήσουμε μαζί σας για αυτό το πακέτο.",
    email: "Email",
    emailOptional: "Email (προαιρετικό)",
    preferredTravelDate: "Προτιμώμενη ημερομηνία ταξιδιού (προαιρετικό)",
    submitPackageInquiry: "Αποστολή αιτήματος",
    packageInquirySuccess: "Το αίτημά σας στάλθηκε. Θα επικοινήσουμε μαζί σας σύντομα.",
    packageInquiryError: "Αποτυχία αποστολής. Προσπαθήστε ξανά.",
    close: "Κλείσιμο",
    noPackages: "Δεν βρέθηκαν πακέτα με αυτά τα κριτήρια.",
    previous: "Προηγούμενη",
    next: "Επόμενη",
    page: "Σελίδα",
    of: "από",
    packageDescriptionFallback: "Δεν υπάρχουν επιπλέον πληροφορίες ακόμη.",
    adminTitle: "Πίνακας Διαχείρισης",
    adminSubtitle: "Δημιουργήστε και ενημερώστε τα ταξιδιωτικά πακέτα που βλέπουν οι χρήστες.",
    adminPackageNameRequired: "Παρακαλώ εισάγετε όνομα πακέτου.",
    adminName: "Όνομα πακέτου",
    adminCountry: "Χώρα",
    adminPrice: "Τιμή (€)",
    adminDuration: "Διάρκεια (ημέρες)",
    adminUploadCoverImage: "Ανέβασμα εικόνας εξωφύλλου",
    adminUploadPdf: "Ανέβασμα αρχείου PDF",
    adminPdfOnly: "Επιτρέπονται μόνο αρχεία PDF.",
    adminImageOnly: "Για το εξώφυλλο επιτρέπονται μόνο αρχεία εικόνας.",
    packagePdfPlaceholder: "Δεν υπάρχει PDF ακόμη",
    adminDescription: "Περιγραφή",
    adminCreate: "Προσθήκη Πακέτου",
    adminUpdate: "Ενημέρωση Πακέτου",
    adminCancel: "Ακύρωση Επεξεργασίας",
    adminManageTitle: "Υπάρχοντα Πακέτα",
    adminEdit: "Επεξεργασία",
    adminDelete: "Διαγραφή",
    adminDeleteConfirm: "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το πακέτο;",
    adminLoginTitle: "Σύνδεση Διαχειριστή",
    adminUsername: "Όνομα χρήστη",
    adminPassword: "Κωδικός",
    adminLoginButton: "Σύνδεση",
    adminLogout: "Αποσύνδεση",
    adminLogoutConfirm: "Είστε σίγουροι ότι θέλετε να αποσυνδεθείτε;",
    adminNavAddPackage: "Προσθήκη Πακέτου",
    adminNavTicketRequests: "Αίτημα Εισιτηρίου",
    adminNavPackageInquiries: "Αιτήματα Πακέτων",
    adminNavPendingCount: "Αριθμός σε αναμονή",
    uploadingFile: "Μεταφόρτωση αρχείου...",
    uploadSuccess: "Το αρχείο ανέβηκε επιτυχώς.",
    adminInvalidCredentials: "Μη έγκυρα στοιχεία σύνδεσης.",
    loadingPackages: "Φόρτωση πακέτων...",
    packagesLoadError: "Δεν είναι δυνατή η φόρτωση πακέτων αυτή τη στιγμή.",
    ticketEyebrow: "Ειδικές ταξιδιωτικές ανάγκες",
    ticketTitle: "Αίτημα για Συγκεκριμένο Εισιτήριο",
    ticketSubtitle: "Συμπληρώστε τα στοιχεία και τις ανάγκες σας και η ομάδα μας θα επικοινωνήσει μαζί σας.",
    firstName: "Όνομα",
    lastName: "Επώνυμο",
    mobile: "Κινητό",
    mobileCode: "Κωδικός Χώρας",
    mobileNumber: "Αριθμός Κινητού",
    dateOfBirth: "Ημερομηνία Γέννησης",
    travelDate: "Ημερομηνία Αναχώρησης",
    returnDate: "Ημερομηνία Επιστροφής",
    fromDestination: "Από",
    toDestination: "Προς",
    returnTicket: "Θέλω εισιτήριο με επιστροφή",
    transportType: "Μέσο Μεταφοράς",
    chooseTransportFirst: "Επιλέξτε αεροπλάνο ή πλοίο παρακάτω για διαδρομές, επιβάτες και σημειώσεις.",
    airplane: "Αεροπλάνο",
    boat: "Πλοίο",
    fromPlaceholderAir: "Πληκτρολογήστε πόλη ή αεροδρόμιο",
    toPlaceholderAir: "Πληκτρολογήστε πόλη ή αεροδρόμιο",
    fromPlaceholderBoat: "Πληκτρολογήστε λιμάνι αναχώρησης",
    toPlaceholderBoat: "Πληκτρολογήστε λιμάνι άφιξης",
    howManyPeople: "Πόσα άτομα",
    adults: "Ενήλικες",
    children: "Παιδιά",
    babies: "Βρέφη",
    passengers: "Επιβάτες",
    notesDetails: "Σημειώσεις / Λεπτομέρειες",
    withSuitcase: "Με βαλίτσα",
    withCar: "Έχω αυτοκίνητο",
    submitTicketRequest: "Αποστολή Αιτήματος",
    ticketSuccess: "Το αίτημά σας καταχωρήθηκε επιτυχώς.",
    ticketError: "Αποτυχία καταχώρησης. Προσπαθήστε ξανά.",
    adminTicketRequests: "Αιτήματα Εισιτηρίων",
    adminSectionPackages: "Πακέτα",
    adminSectionTickets: "Αιτήματα Εισιτηρίων",
    adminSectionPackageInquiries: "Αιτήματα πακέτων",
    adminPackageInquiries: "Αιτήματα πακέτων",
    adminStatsPackages: "Σύνολο Πακέτων",
    adminStatsTickets: "Σύνολο Αιτημάτων",
    adminStatsPackageInquiries: "Αιτήματα πακέτων",
    adminStatsPending: "Αιτήματα σε αναμονή",
    adminStatsPendingInquiries: "Αιτήματα πακέτων σε αναμονή",
    adminSearchPackageInquiries: "Αναζήτηση αιτημάτων πακέτων",
    packageInquiryDeleteConfirm: "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το αίτημα πακέτου;",
    noPackageInquiries: "Δεν υπάρχουν αιτήματα πακέτων ακόμη.",
    inquiryPackageLabel: "Πακέτο",
    adminSearchTickets: "Αναζήτηση αιτημάτων",
    adminFilterStatus: "Φίλτρο κατάστασης",
    all: "Όλα",
    adminRequestedAt: "Ημερομηνία αιτήματος",
    status: "Κατάσταση",
    ticketChecked: "Ελεγμένο",
    ticketPending: "Σε αναμονή",
    ticketOverdue: "Εκπρόθεσμο",
    markChecked: "Σήμανση ως ελεγμένο",
    markUnchecked: "Αφαίρεση σήμανσης",
    ticketDeleteConfirm: "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το αίτημα εισιτηρίου;",
    noTicketRequests: "Δεν υπάρχουν αιτήματα εισιτηρίων ακόμη.",
    adminTicketsNoneInCategory: "Δεν υπάρχουν αιτήματα σε αυτή την κατηγορία.",
    adminTicketsCategoryOther: "Άλλα",
    yes: "Ναι",
    no: "Όχι",
    footerAbout:
      "Δημιουργούμε προσεγμένες ταξιδιωτικές εμπειρίες για ζευγάρια, οικογένειες και ταξιδιώτες που θέλουν όλα να είναι οργανωμένα σωστά.",
    footerGeneral: "Γενικές Πληροφορίες",
    weeklyHoursTitle: "Εβδομαδιαίο Ωράριο",
    footerFollow: "Ακολουθήστε μας",
    addressLabel: "Διεύθυνση",
    phoneLabel: "Τηλέφωνο",
    footerTelLabel: "Τηλ.:",
    footerMobLabel: "Κινητό:",
    footerEmailLabel: "Email:",
    hoursLabel: "Ώρες",
    monday: "Δευτέρα",
    tuesday: "Τρίτη",
    wednesday: "Τετάρτη",
    thursday: "Πέμπτη",
    friday: "Παρασκευή",
    saturday: "Σάββατο",
    sunday: "Κυριακή",
    closed: "Κλειστά",
    holidayNote: "Σημείωση: Το ωράριο ενδέχεται να διαφέρει τις αργίες.",
    rights: "Με επιφύλαξη παντός δικαιώματος.",
    footerPrivacy: "Απόρρητο & cookies",
    cookieBannerText: "Χρησιμοποιούμε απαραίτητα cookies και local storage για τις επιλογές σας και τη λειτουργία του ιστότοπου. Δείτε την",
    privacyPolicyLink: "Πολιτική Απορρήτου & Cookies",
    cookieAccept: "Αποδοχή",
    privacyEyebrow: "Νομικά",
    privacyTitle: "Πολιτική Απορρήτου & Cookies",
    privacyLastUpdated: "Τελευταία ενημέρωση: Μάιος 2026",
    privacyTocLabel: "Πίνακας περιεχομένου",
    privacyBackHome: "Επιστροφή στην αρχική",
  },
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const [lang, setLang] = useState("en");
  const [allPackages, setAllPackages] = useState([]);
  const [packagesError, setPackagesError] = useState("");
  const t = translations[lang];
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const rows = await getPackages();
        setAllPackages(rows);
        setPackagesError("");
      } catch (_err) {
        setPackagesError(t.packagesLoadError);
      }
    };
    loadPackages();
  }, [t.packagesLoadError]);

  return (
    <div className="app-shell">
      {isAdminRoute ? (
        <button
          type="button"
          className="global-lang-switch"
          onClick={() => setLang(lang === "en" ? "el" : "en")}
        >
          <span aria-hidden="true">{lang === "en" ? "🇬🇷" : "🇬🇧"}</span> {t.switchTo}
        </button>
      ) : (
        <Navbar
          t={t}
          currentLang={lang}
          onToggleLanguage={() => setLang(lang === "en" ? "el" : "en")}
        />
      )}
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home t={t} />} />
          <Route
            path="/packages"
            element={<PackagesPage t={t} packages={allPackages} packagesError={packagesError} />}
          />
          <Route path="/tickets" element={<TicketRequest t={t} lang={lang} />} />
          <Route path="/privacy" element={<PrivacyPolicy t={t} lang={lang} />} />
          <Route
            path="/admin"
            element={
              <AdminPanel
                t={t}
                packages={allPackages}
                setPackages={setAllPackages}
                onPackagesError={setPackagesError}
              />
            }
          />
        </Routes>
      </main>
      <Footer t={t} />
      {!isAdminRoute ? <CookieConsent t={t} /> : null}
    </div>
  );
};

export default App;
