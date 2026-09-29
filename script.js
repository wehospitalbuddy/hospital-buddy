// =====================================================
// HOSPITAL BUDDY — MAIN SCRIPT.JS
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
// FIREBASE LOAD
// =====================================================

(function loadFirebase() {

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

        initializeHospitalBuddy();

      };

      document.head.appendChild(
        firestoreScript
      );

    };

    document.head.appendChild(
      authScript
    );

  };

  document.head.appendChild(
    appScript
  );

})();


// =====================================================
// INITIALIZE
// =====================================================

function initializeHospitalBuddy() {

  if (!firebase.apps.length) {

    firebase.initializeApp(
      firebaseConfig
    );

  }

  window.hbAuth =
    firebase.auth();

  window.hbDB =
    firebase.firestore();

  setupBookingForm();

  setupNavigation();

}


// =====================================================
// BOOKING FORM
// =====================================================

function setupBookingForm() {

  const form =
    document.getElementById(
      "bookingForm"
    );

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    submitBooking
  );

}


// =====================================================
// SUBMIT BOOKING
// =====================================================

async function submitBooking(event) {

  event.preventDefault();

  const form =
    event.target;

  const button =
    form.querySelector(
      'button[type="submit"]'
    );

  const message =
    document.getElementById(
      "bookingMessage"
    );


  const name =
    getValue(
      form,
      [
        "name",
        "patientName"
      ]
    );


  const phone =
    getValue(
      form,
      [
        "phone",
        "patientPhone"
      ]
    );


  const email =
    getValue(
      form,
      [
        "email",
        "patientEmail"
      ]
    );


  const hospital =
    getValue(
      form,
      [
        "hospital"
      ]
    );


  const district =
    getValue(
      form,
      [
        "district"
      ]
    );


  const service =
    getValue(
      form,
      [
        "service"
      ]
    );


  const language =
    getValue(
      form,
      [
        "language"
      ]
    );


  const date =
    getValue(
      form,
      [
        "date"
      ]
    );


  const time =
    getValue(
      form,
      [
        "time"
      ]
    );


  const requirement =
    getValue(
      form,
      [
        "requirement",
        "notes",
        "message"
      ]
    );


  if (
    !name ||
    !phone ||
    !hospital ||
    !district ||
    !service ||
    !date ||
    !time
  ) {

    showBookingMessage(
      message,
      "Please complete all required fields.",
      true
    );

    return;

  }


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "Submitting...";

  }


  try {

    const user =
      hbAuth.currentUser;


    let patientId =
      null;


    if (user) {

      patientId =
        user.uid;

    }


    const bookingRef =
      hbDB
        .collection(
          "bookings"
        )
        .doc();


    const bookingId =
      "HB-" +
      bookingRef.id
        .substring(0, 7)
        .toUpperCase();


    // -----------------------------------------------
    // FIND AVAILABLE BUDDY
    // -----------------------------------------------

    const buddySnapshot =
      await hbDB
        .collection(
          "hospital_buddies"
        )
        .where(
          "status",
          "==",
          "available"
        )
        .get();


    let matchedBuddy =
      null;


    if (!buddySnapshot.empty) {

      const buddies =
        buddySnapshot.docs.map(
          doc => ({

            id:
              doc.id,

            ...doc.data()

          })
        );


      // Try language matching first

      matchedBuddy =
        buddies.find(
          buddy => {

            if (
              !Array.isArray(
                buddy.languages
              )
            ) {

              return false;

            }


            return buddy.languages.some(
              buddyLanguage =>
                String(
                  buddyLanguage
                )
                  .toLowerCase()
                  .trim() ===
                String(
                  language
                )
                  .toLowerCase()
                  .trim()
            );

          }
        );


      // Otherwise first available buddy

      if (!matchedBuddy) {

        matchedBuddy =
          buddies[0];

      }

    }


    // -----------------------------------------------
    // SAVE BOOKING
    // -----------------------------------------------

    const bookingData = {

      bookingId:
        bookingId,

      patientId:
        patientId,

      name:
        name,

      phone:
        phone,

      email:
        email,

      hospital:
        hospital,

      district:
        district,

      service:
        service,

      language:
        language,

      date:
        date,

      time:
        time,

      requirement:
        requirement,

      status:
        "pending",

      buddyId:
        matchedBuddy
          ? matchedBuddy.id
          : null,

      buddyName:
        matchedBuddy
          ? matchedBuddy.name || ""
          : "",

      createdAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp(),

      updatedAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp()

    };


    await bookingRef.set(
      bookingData
    );


    // -----------------------------------------------
    // SUCCESS
    // -----------------------------------------------

    showBookingMessage(
      message,
      "Request submitted successfully. Booking ID: " +
        bookingId,
      false
    );


    form.reset();


    // -----------------------------------------------
    // OPTIONAL REDIRECT
    // -----------------------------------------------

    setTimeout(
      function () {

        window.location.href =
          "patient.html";

      },
      1800
    );


  } catch (error) {

    console.error(
      "Booking submission error:",
      error
    );


    showBookingMessage(
      message,
      getFriendlyFirebaseError(
        error
      ),
      true
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "Request a Hospital Buddy";

    }

  }

}


// =====================================================
// GET FORM VALUE
// =====================================================

function getValue(
  form,
  ids
) {

  for (
    let i = 0;
    i < ids.length;
    i++
  ) {

    const element =
      form.querySelector(
        "#" + ids[i]
      );


    if (
      element &&
      element.value !== undefined
    ) {

      return String(
        element.value
      ).trim();

    }

  }


  return "";

}


// =====================================================
// MESSAGE
// =====================================================

function showBookingMessage(
  element,
  text,
  error
) {

  if (!element) {
    return;
  }


  element.textContent =
    text;


  element.style.display =
    "block";


  element.style.color =
    error
      ? "#b00020"
      : "#176b32";


  element.style.background =
    error
      ? "#fff1f2"
      : "#ecfdf3";


  element.style.padding =
    "12px 15px";


  element.style.borderRadius =
    "10px";


  element.style.marginTop =
    "15px";

}


// =====================================================
// FRIENDLY FIREBASE ERROR
// =====================================================

function getFriendlyFirebaseError(
  error
) {

  if (!error) {

    return "Something went wrong. Please try again.";

  }


  switch (
    error.code
  ) {

    case "permission-denied":

      return "The request could not be submitted because database permission is denied.";

    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":

      return "Firebase configuration error. Please check the Firebase API key.";

    case "unavailable":

      return "Firebase is temporarily unavailable. Please try again.";

    default:

      return (
        "Unable to submit the request. Please try again."
      );

  }

}


// =====================================================
// NAVIGATION
// =====================================================

function setupNavigation() {

  const menuButton =
    document.querySelector(
      ".menu-toggle"
    );


  const nav =
    document.querySelector(
      "nav"
    );


  if (
    menuButton &&
    nav
  ) {

    menuButton.addEventListener(
      "click",
      function () {

        nav.classList.toggle(
          "open"
        );

      }
    );

  }

}


// =====================================================
// ESCAPE HTML
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
