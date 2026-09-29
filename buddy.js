// =====================================================
// HOSPITAL BUDDY — BUDDY.JS
// FINAL VERSION
// =====================================================


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyDxfFRc03z0YLo_q5ynZhEjYR41PzGdiw",
  authDomain: "hospital-buddy-2224d.firebaseapp.com",
  projectId: "hospital-buddy-2224d",
  storageBucket: "hospital-buddy-2224d.firebasestorage.app",
  messagingSenderId: "190919672635",
  appId: "1:190919672635:web:8fe14cc8036fd0cb542d1e",
  measurementId: "G-7I3TZ2EFFR"
};


// =====================================================
// FIREBASE SDK LOADER
// =====================================================

(function loadFirebase() {

  if (window.firebase) {
    initializeBuddyFirebase();
    return;
  }

  const appScript = document.createElement("script");

  appScript.src =
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";

  appScript.onload = function () {

    const authScript = document.createElement("script");

    authScript.src =
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";

    authScript.onload = function () {

      const firestoreScript =
        document.createElement("script");

      firestoreScript.src =
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";

      firestoreScript.onload = function () {
        initializeBuddyFirebase();
      };

      firestoreScript.onerror = function () {
        console.error("Firebase Firestore SDK failed to load.");
      };

      document.head.appendChild(firestoreScript);
    };

    authScript.onerror = function () {
      console.error("Firebase Authentication SDK failed to load.");
    };

    document.head.appendChild(authScript);
  };

  appScript.onerror = function () {
    console.error("Firebase App SDK failed to load.");
  };

  document.head.appendChild(appScript);

})();


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

function initializeBuddyFirebase() {

  try {

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    window.auth = firebase.auth();
    window.db = firebase.firestore();

    startBuddySystem();

  } catch (error) {

    console.error(
      "Firebase initialization error:",
      error
    );

    showMessage(
      "Firebase could not be initialized.",
      true
    );

  }

}


// =====================================================
// START BUDDY SYSTEM
// =====================================================

function startBuddySystem() {

  setupLoginForm();
  setupLogoutButtons();
  setupAvailabilityButtons();
  setupProfileForm();

  auth.onAuthStateChanged(
    async function (user) {

      if (!user) {

        showBuddyLogin();

        return;

      }

      await loadBuddyAccount(user);

    }
  );

}


// =====================================================
// LOGIN FORM
// =====================================================

function setupLoginForm() {

  const forms = [

    document.getElementById("buddyLoginForm"),

    document.getElementById("loginForm")

  ].filter(Boolean);


  forms.forEach(function (form) {

    if (form.dataset.buddyListener === "true") {
      return;
    }

    form.dataset.buddyListener = "true";

    form.addEventListener(
      "submit",
      buddyLogin
    );

  });

}


// =====================================================
// BUDDY LOGIN
// =====================================================

async function buddyLogin(event) {

  event.preventDefault();


  const emailElement =
    document.getElementById("buddyEmail") ||
    document.getElementById("loginEmail") ||
    document.getElementById("email");


  const passwordElement =
    document.getElementById("buddyPassword") ||
    document.getElementById("loginPassword") ||
    document.getElementById("password");


  if (!emailElement || !passwordElement) {

    showMessage(
      "Login fields were not found.",
      true
    );

    return;

  }


  const email =
    emailElement.value
      .trim()
      .toLowerCase();


  const password =
    passwordElement.value;


  if (!email || !password) {

    showMessage(
      "Please enter your email and password.",
      true
    );

    return;

  }


  showMessage(
    "Signing in...",
    false
  );


  try {

    await auth.signInWithEmailAndPassword(
      email,
      password
    );

  } catch (error) {

    console.error(
      "Buddy login error:",
      error
    );


    let message =
      "Unable to sign in.";


    switch (error.code) {

      case "auth/invalid-credential":
        message =
          "Incorrect email or password.";
        break;

      case "auth/user-not-found":
        message =
          "No Hospital Buddy account was found.";
        break;

      case "auth/wrong-password":
        message =
          "Incorrect password.";
        break;

      case "auth/invalid-email":
        message =
          "Please enter a valid email address.";
        break;

      case "auth/too-many-requests":
        message =
          "Too many login attempts. Please try again later.";
        break;

      case "auth/network-request-failed":
        message =
          "Network error. Please check your internet connection.";
        break;

    }


    showMessage(
      message,
      true
    );

  }

}


// =====================================================
// LOAD BUDDY ACCOUNT
// =====================================================

async function loadBuddyAccount(user) {

  try {

    const buddyRef =
      db
        .collection("hospital_buddies")
        .doc(user.uid);


    const buddySnapshot =
      await buddyRef.get();


    if (!buddySnapshot.exists) {

      await auth.signOut();

      showBuddyLogin();

      showMessage(
        "Your Hospital Buddy profile has not been approved yet.",
        true
      );

      return;

    }


    const buddy =
      buddySnapshot.data();


    window.currentBuddy = {
      id: user.uid,
      uid: user.uid,
      email: user.email || "",
      ...buddy
    };


    /*
     * Pending registrations cannot access
     * the Buddy dashboard.
     */

    if (
      buddy.approved === false ||
      buddy.status === "pending"
    ) {

      await auth.signOut();

      showBuddyLogin();

      showMessage(
        "Your Hospital Buddy registration is awaiting administrator approval.",
        true
      );

      return;

    }


    showBuddyDashboard();


    populateBuddyProfile(
      window.currentBuddy
    );


    loadBuddyBookings(
      user.uid
    );


    updateAvailabilityUI(
      buddy.status
    );


  } catch (error) {

    console.error(
      "Load Buddy account error:",
      error
    );


    showMessage(
      "Unable to load your Buddy account.",
      true
    );

  }

}


// =====================================================
// SHOW LOGIN
// =====================================================

function showBuddyLogin() {

  const loginSections = [

    document.getElementById("buddyLoginSection"),

    document.getElementById("loginSection"),

    document.getElementById("buddyLogin")

  ].filter(Boolean);


  const dashboardSections = [

    document.getElementById("buddyDashboard"),

    document.getElementById("dashboardSection"),

    document.getElementById("buddyPanel")

  ].filter(Boolean);


  loginSections.forEach(function (element) {

    element.style.display = "";

  });


  dashboardSections.forEach(function (element) {

    element.style.display = "none";

  });

}


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showBuddyDashboard() {

  const loginSections = [

    document.getElementById("buddyLoginSection"),

    document.getElementById("loginSection"),

    document.getElementById("buddyLogin")

  ].filter(Boolean);


  const dashboardSections = [

    document.getElementById("buddyDashboard"),

    document.getElementById("dashboardSection"),

    document.getElementById("buddyPanel")

  ].filter(Boolean);


  loginSections.forEach(function (element) {

    element.style.display = "none";

  });


  dashboardSections.forEach(function (element) {

    element.style.display = "";

  });

}


// =====================================================
// LOGOUT
// =====================================================

function setupLogoutButtons() {

  const buttons = [

    document.getElementById("buddyLogout"),

    document.getElementById("logoutBuddy"),

    document.getElementById("logoutButton"),

    document.getElementById("logoutBtn")

  ].filter(Boolean);


  buttons.forEach(function (button) {

    if (button.dataset.buddyListener === "true") {
      return;
    }

    button.dataset.buddyListener = "true";

    button.addEventListener(
      "click",
      logoutBuddy
    );

  });

}


// =====================================================
// LOGOUT FUNCTION
// =====================================================

async function logoutBuddy() {

  try {

    await auth.signOut();

    window.currentBuddy = null;

    showBuddyLogin();

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

    showMessage(
      "Unable to log out.",
      true
    );

  }

}


// =====================================================
// AVAILABILITY SETUP
// =====================================================

function setupAvailabilityButtons() {

  const availableButton =
    document.getElementById(
      "setAvailableBtn"
    );


  const unavailableButton =
    document.getElementById(
      "setUnavailableBtn"
    );


  if (availableButton) {

    availableButton.addEventListener(
      "click",
      function () {
        changeAvailability("available");
      }
    );

  }


  if (unavailableButton) {

    unavailableButton.addEventListener(
      "click",
      function () {
        changeAvailability("unavailable");
      }
    );

  }

}


// =====================================================
// CHANGE AVAILABILITY
// =====================================================

async function changeAvailability(
  newStatus
) {

  if (!auth.currentUser) {

    showMessage(
      "Please log in first.",
      true
    );

    return;

  }


  const allowedStatuses = [
    "available",
    "unavailable"
  ];


  if (
    !allowedStatuses.includes(
      newStatus
    )
  ) {

    return;

  }


  try {

    await db
      .collection("hospital_buddies")
      .doc(auth.currentUser.uid)
      .update({

        status:
          newStatus,

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      });


    if (window.currentBuddy) {

      window.currentBuddy.status =
        newStatus;

    }


    updateAvailabilityUI(
      newStatus
    );


    showMessage(
      newStatus === "available"
        ? "You are now available for bookings."
        : "You are now unavailable for bookings.",
      false
    );


  } catch (error) {

    console.error(
      "Availability error:",
      error
    );


    showMessage(
      "Unable to update your availability.",
      true
    );

  }

}


// =====================================================
// AVAILABILITY UI
// =====================================================

function updateAvailabilityUI(
  status
) {

  const statusElements = [

    document.getElementById(
      "buddyAvailability"
    ),

    document.getElementById(
      "availabilityStatus"
    ),

    document.getElementById(
      "buddyStatus"
    )

  ].filter(Boolean);


  statusElements.forEach(function (element) {

    element.textContent =
      status === "available"
        ? "Available"
        : "Unavailable";

    element.classList.remove(
      "available",
      "unavailable"
    );

    element.classList.add(
      status === "available"
        ? "available"
        : "unavailable"
    );

  });


  const availableButton =
    document.getElementById(
      "setAvailableBtn"
    );


  const unavailableButton =
    document.getElementById(
      "setUnavailableBtn"
    );


  if (availableButton) {

    availableButton.disabled =
      status === "available";

  }


  if (unavailableButton) {

    unavailableButton.disabled =
      status === "unavailable";

  }

}


// =====================================================
// PROFILE DISPLAY
// =====================================================

function populateBuddyProfile(
  buddy
) {

  setElementText(
    "buddyDisplayName",
    buddy.name || "Hospital Buddy"
  );


  setElementText(
    "buddyNameDisplay",
    buddy.name || "Hospital Buddy"
  );


  setElementText(
    "buddyPhoneDisplay",
    buddy.phone || "Not provided"
  );


  setElementText(
    "buddyEmailDisplay",
    buddy.email || "Not provided"
  );


  setElementText(
    "buddyQualificationDisplay",
    buddy.qualification || "Not specified"
  );


  setElementText(
    "buddyLanguagesDisplay",
    Array.isArray(buddy.languages)
      ? buddy.languages.join(", ")
      : buddy.languages || "Not specified"
  );


  const nameInput =
    document.getElementById(
      "buddyName"
    );


  const phoneInput =
    document.getElementById(
      "buddyPhone"
    );


  const qualificationInput =
    document.getElementById(
      "buddyQualification"
    );


  const languagesInput =
    document.getElementById(
      "buddyLanguages"
    );


  if (
    nameInput &&
    !nameInput.value
  ) {

    nameInput.value =
      buddy.name || "";

  }


  if (
    phoneInput &&
    !phoneInput.value
  ) {

    phoneInput.value =
      buddy.phone || "";

  }


  if (
    qualificationInput &&
    !qualificationInput.value
  ) {

    qualificationInput.value =
      buddy.qualification || "";

  }


  if (
    languagesInput &&
    !languagesInput.value
  ) {

    languagesInput.value =
      Array.isArray(buddy.languages)
        ? buddy.languages.join(", ")
        : buddy.languages || "";

  }

}


// =====================================================
// PROFILE FORM
// =====================================================

function setupProfileForm() {

  const form =
    document.getElementById(
      "buddyProfileForm"
    );


  if (!form) {
    return;
  }


  if (
    form.dataset.buddyListener ===
    "true"
  ) {

    return;

  }


  form.dataset.buddyListener =
    "true";


  form.addEventListener(
    "submit",
    saveBuddyProfile
  );

}


// =====================================================
// SAVE PROFILE
// =====================================================

async function saveBuddyProfile(
  event
) {

  event.preventDefault();


  if (!auth.currentUser) {

    showMessage(
      "Please log in first.",
      true
    );

    return;

  }


  const nameInput =
    document.getElementById(
      "buddyName"
    );


  const phoneInput =
    document.getElementById(
      "buddyPhone"
    );


  const qualificationInput =
    document.getElementById(
      "buddyQualification"
    );


  const languagesInput =
    document.getElementById(
      "buddyLanguages"
    );


  const name =
    nameInput
      ? nameInput.value.trim()
      : "";


  const phone =
    phoneInput
      ? phoneInput.value.trim()
      : "";


  const qualification =
    qualificationInput
      ? qualificationInput.value.trim()
      : "";


  const languagesText =
    languagesInput
      ? languagesInput.value.trim()
      : "";


  const languages =
    languagesText
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(function (item) {
        return item.length > 0;
      });


  try {

    await db
      .collection("hospital_buddies")
      .doc(auth.currentUser.uid)
      .update({

        name:
          name,

        phone:
          phone,

        qualification:
          qualification,

        languages:
          languages,

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      });


    if (window.currentBuddy) {

      window.currentBuddy.name =
        name;

      window.currentBuddy.phone =
        phone;

      window.currentBuddy.qualification =
        qualification;

      window.currentBuddy.languages =
        languages;

    }


    populateBuddyProfile(
      window.currentBuddy
    );


    showMessage(
      "Profile updated successfully.",
      false
    );


  } catch (error) {

    console.error(
      "Profile update error:",
      error
    );


    showMessage(
      "Unable to update your profile.",
      true
    );

  }

}


// =====================================================
// LOAD BOOKINGS
// =====================================================

async function loadBuddyBookings(
  buddyId
) {

  const container =
    document.getElementById(
      "buddyBookings"
    );


  const table =
    document.getElementById(
      "buddyBookingTable"
    );


  const target =
    container ||
    table;


  if (!target) {
    return;
  }


  target.innerHTML =
    "<p>Loading booking requests...</p>";


  try {

    const snapshot =
      await db
        .collection("bookings")
        .where(
          "buddyId",
          "==",
          buddyId
        )
        .get();


    if (snapshot.empty) {

      target.innerHTML =
        "<p>No assigned booking requests.</p>";

      updateBookingCounts([]);

      return;

    }


    const bookings =
      snapshot.docs.map(function (doc) {

        return {
          id: doc.id,
          ...doc.data()
        };

      });


    bookings.sort(function (a, b) {

      return (
        getTimestampMillis(
          b.createdAt
        ) -
        getTimestampMillis(
          a.createdAt
        )
      );

    });


    renderBuddyBookings(
      target,
      bookings
    );


    updateBookingCounts(
      bookings
    );


  } catch (error) {

    console.error(
      "Load Buddy bookings error:",
      error
    );


    /*
     * Firestore rules may not allow
     * direct query access in some setups.
     */

    target.innerHTML =
      "<p>Unable to load assigned requests.</p>";

  }

}


// =====================================================
// RENDER BOOKINGS
// =====================================================

function renderBuddyBookings(
  target,
  bookings
) {

  let html = "";


  bookings.forEach(function (booking) {

    const status =
      booking.status ||
      "pending";


    const date =
      booking.date ||
      "Date not specified";


    const time =
      booking.time ||
      "Time not specified";


    const service =
      booking.service ||
      "Service not specified";


    const patientName =
      booking.name ||
      "Patient";


    html += `

      <div class="buddyBookingCard">

        <div class="buddyBookingHeader">

          <strong>
            ${escapeHTML(
              booking.bookingId ||
              (
                "HB-" +
                booking.id
                  .substring(0, 7)
                  .toUpperCase()
              )
            )}
          </strong>

          <span class="statusBadge ${escapeHTML(
            getStatusClass(status)
          )}">
            ${escapeHTML(status)}
          </span>

        </div>


        <div class="buddyBookingBody">

          <p>
            <strong>Patient:</strong>
            ${escapeHTML(patientName)}
          </p>

          <p>
            <strong>Service:</strong>
            ${escapeHTML(service)}
          </p>

          <p>
            <strong>Date:</strong>
            ${escapeHTML(date)}
          </p>

          <p>
            <strong>Time:</strong>
            ${escapeHTML(time)}
          </p>

          ${
            booking.language
              ? `
                <p>
                  <strong>Language:</strong>
                  ${escapeHTML(
                    booking.language
                  )}
                </p>
              `
              : ""
          }

          ${
            booking.requirement
              ? `
                <p>
                  <strong>Requirement:</strong>
                  ${escapeHTML(
                    booking.requirement
                  )}
                </p>
              `
              : ""
          }

        </div>

      </div>

    `;

  });


  target.innerHTML =
    html;

}


// =====================================================
// BOOKING COUNTS
// =====================================================

function updateBookingCounts(
  bookings
) {

  let pending = 0;
  let confirmed = 0;
  let completed = 0;


  bookings.forEach(function (booking) {

    if (
      booking.status ===
      "pending"
    ) {

      pending++;

    }


    if (
      booking.status ===
      "confirmed"
    ) {

      confirmed++;

    }


    if (
      booking.status ===
      "completed"
    ) {

      completed++;

    }

  });


  setElementText(
    "buddyPendingCount",
    pending
  );


  setElementText(
    "buddyConfirmedCount",
    confirmed
  );


  setElementText(
    "buddyCompletedCount",
    completed
  );


  setElementText(
    "pendingCount",
    pending
  );


  setElementText(
    "confirmedCount",
    confirmed
  );


  setElementText(
    "completedCount",
    completed
  );

}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(
  status
) {

  switch (status) {

    case "pending":
      return "pending";

    case "confirmed":
      return "confirmed";

    case "rejected":
      return "rejected";

    case "cancelled":
      return "cancelled";

    case "completed":
      return "completed";

    case "available":
      return "available";

    case "unavailable":
      return "unavailable";

    default:
      return "unavailable";

  }

}


// =====================================================
// TIMESTAMP
// =====================================================

function getTimestampMillis(
  timestamp
) {

  if (!timestamp) {
    return 0;
  }


  if (
    typeof timestamp.toMillis ===
    "function"
  ) {

    return timestamp.toMillis();

  }


  if (
    typeof timestamp.seconds ===
    "number"
  ) {

    return (
      timestamp.seconds *
      1000
    );

  }


  return 0;

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
  message,
  isError
) {

  const elements = [

    document.getElementById(
      "buddyLoginMessage"
    ),

    document.getElementById(
      "loginMessage"
    ),

    document.getElementById(
      "buddyMessage"
    ),

    document.getElementById(
      "profileMessage"
    )

  ].filter(Boolean);


  if (!elements.length) {
    return;
  }


  elements.forEach(function (element) {

    element.textContent =
      message;


    element.style.color =
      isError
        ? "#b00020"
        : "#176b32";

  });

}


// =====================================================
// SET ELEMENT TEXT
// =====================================================

function setElementText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value ?? "";

  }

}


// =====================================================
// HTML SECURITY
// =====================================================

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.buddyLogin =
  buddyLogin;

window.logoutBuddy =
  logoutBuddy;

window.changeAvailability =
  changeAvailability;

window.loadBuddyBookings =
  loadBuddyBookings;

window.saveBuddyProfile =
  saveBuddyProfile;
