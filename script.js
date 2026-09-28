// =====================================================
// HOSPITAL BUDDY — MAIN WEBSITE SCRIPT
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
// FIREBASE LOADER
// =====================================================

function loadFirebaseScripts() {

  if (typeof firebase !== "undefined") {
    initializeHospitalBuddy();
    return;
  }

  const appScript =
    document.createElement("script");

  appScript.src =
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";

  appScript.onload = function () {

    const firestoreScript =
      document.createElement("script");

    firestoreScript.src =
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";

    firestoreScript.onload = function () {

      const authScript =
        document.createElement("script");

      authScript.src =
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";

      authScript.onload =
        initializeHospitalBuddy;

      document.head.appendChild(
        authScript
      );

    };

    document.head.appendChild(
      firestoreScript
    );

  };

  document.head.appendChild(
    appScript
  );
}


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

let hospitalBuddyDB = null;
let hospitalBuddyAuth = null;

function initializeHospitalBuddy() {

  if (
    typeof firebase === "undefined"
  ) {
    console.error(
      "Firebase could not be loaded."
    );
    return;
  }

  if (!firebase.apps.length) {

    firebase.initializeApp(
      firebaseConfig
    );

  }

  hospitalBuddyDB =
    firebase.firestore();

  hospitalBuddyAuth =
    firebase.auth();

  initializeWebsite();

}


// =====================================================
// WEBSITE INITIALIZATION
// =====================================================

function initializeWebsite() {

  loadApprovedBuddies();

  initializeBookingForm();

  setMinimumBookingDate();

}


// =====================================================
// LOAD APPROVED / AVAILABLE BUDDIES
// =====================================================

async function loadApprovedBuddies() {

  const buddyList =
    document.getElementById(
      "buddyList"
    );

  if (!buddyList) {
    return;
  }

  try {

    const snapshot =
      await hospitalBuddyDB
        .collection(
          "hospital_buddies"
        )
        .where(
          "status",
          "==",
          "available"
        )
        .get();


    if (snapshot.empty) {

      buddyList.innerHTML = `

        <article class="buddy">

          <div class="serviceIcon">
            🤝
          </div>

          <h3>
            Hospital Buddies
          </h3>

          <p>
            Buddy profiles will appear here
            once approved and available.
          </p>

          <p class="privateText">
            Profiles are reviewed before
            becoming available for booking.
          </p>

        </article>

      `;

      return;

    }


    let html = "";


    snapshot.forEach(
      doc => {

        const buddy =
          doc.data();


        const languages =
          Array.isArray(
            buddy.languages
          )
            ? buddy.languages.join(", ")
            : "Not specified";


        const services =
          Array.isArray(
            buddy.services
          )
            ? buddy.services.join(", ")
            : "Practical assistance";


        html += `

          <article class="buddy">

            <div class="serviceIcon">
              🤝
            </div>

            <h3>
              ${escapeHTML(
                buddy.name ||
                "Hospital Buddy"
              )}
            </h3>

            <p>

              <strong>
                Hospital:
              </strong>

              ${escapeHTML(
                buddy.hospital ||
                "Not specified"
              )}

            </p>

            <p>

              <strong>
                Languages:
              </strong>

              ${escapeHTML(
                languages
              )}

            </p>

            <p>

              <strong>
                Services:
              </strong>

              ${escapeHTML(
                services
              )}

            </p>

            <button
              type="button"
              class="btn"
              onclick="scrollToBooking()"
            >
              Request a Buddy
            </button>

          </article>

        `;

      }
    );


    buddyList.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Unable to load buddies:",
      error
    );

    buddyList.innerHTML = `

      <article class="buddy">

        <div class="serviceIcon">
          🤝
        </div>

        <h3>
          Hospital Buddies
        </h3>

        <p>
          Buddy profiles are currently
          being prepared.
        </p>

      </article>

    `;

  }

}


// =====================================================
// BOOKING FORM
// =====================================================

function initializeBookingForm() {

  const form =
    document.getElementById(
      "form"
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
    document.getElementById(
      "form"
    );

  const submitButton =
    document.getElementById(
      "submitBtn"
    );


  const name =
    document
      .getElementById("name")
      .value
      .trim();


  const phone =
    document
      .getElementById("phone")
      .value
      .trim();


  const language =
    document
      .getElementById("lang")
      .value;


  const service =
    document
      .getElementById("service")
      .value;


  const date =
    document
      .getElementById("date")
      .value;


  const time =
    document
      .getElementById("time")
      .value;


  const notes =
    document
      .getElementById("notes")
      .value
      .trim();


  if (
    !name ||
    !phone ||
    !language ||
    !service ||
    !date ||
    !time
  ) {

    alert(
      "Please complete all required fields."
    );

    return;

  }


  submitButton.disabled =
    true;

  submitButton.textContent =
    "Submitting Request...";


  try {

    // =================================================
    // FIND AVAILABLE BUDDY
    // =================================================

    let matchedBuddy =
      null;


    const buddySnapshot =
      await hospitalBuddyDB
        .collection(
          "hospital_buddies"
        )
        .where(
          "status",
          "==",
          "available"
        )
        .get();


    const availableBuddies =
      buddySnapshot.docs.map(
        doc => ({

          id: doc.id,

          ...doc.data()

        })
      );


    // =================================================
    // LANGUAGE MATCH
    // =================================================

    matchedBuddy =
      availableBuddies.find(
        buddy => {

          if (
            !Array.isArray(
              buddy.languages
            )
          ) {

            return false;

          }

          return buddy.languages
            .includes(language);

        }
      );


    // =================================================
    // FALLBACK TO FIRST AVAILABLE
    // =================================================

    if (!matchedBuddy) {

      matchedBuddy =
        availableBuddies.length > 0
          ? availableBuddies[0]
          : null;

    }


    // =================================================
    // BOOKING ID
    // =================================================

    const bookingRef =
      hospitalBuddyDB
        .collection(
          "bookings"
        )
        .doc();


    const bookingId =
      "HB-" +
      bookingRef.id
        .substring(0, 7)
        .toUpperCase();


    // =================================================
    // CURRENT PATIENT
    // =================================================

    let patientId =
      null;


    if (
      hospitalBuddyAuth &&
      hospitalBuddyAuth.currentUser
    ) {

      patientId =
        hospitalBuddyAuth
          .currentUser
          .uid;

    }


    // =================================================
    // BOOKING DATA
    // =================================================

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

        patientId &&
        hospitalBuddyAuth.currentUser
          ? hospitalBuddyAuth.currentUser.email || ""
          : "",

      language:

        language,

      service:

        service,

      date:

        date,

      time:

        time,

      requirement:

        notes,

      hospital:

        matchedBuddy
          ? matchedBuddy.hospital || ""
          : "",

      district:

        matchedBuddy
          ? matchedBuddy.district || ""
          : "",

      buddyId:

        matchedBuddy
          ? matchedBuddy.id
          : "",

      buddyName:

        matchedBuddy
          ? matchedBuddy.name || ""
          : "",

      buddyPhone:

        "",

      status:

        "pending",

      createdAt:

        firebase.firestore
          .FieldValue
          .serverTimestamp(),

      updatedAt:

        firebase.firestore
          .FieldValue
          .serverTimestamp()

    };


    // =================================================
    // SAVE BOOKING
    // =================================================

    await bookingRef.set(
      bookingData
    );


    // =================================================
    // SUCCESS MODAL
    // =================================================

    showBookingResult({

      bookingId:
        bookingId,

      name:
        name,

      language:
        language,

      service:
        service,

      date:
        date,

      time:
        time,

      buddy:
        matchedBuddy

    });


    // =================================================
    // RESET
    // =================================================

    form.reset();


    setMinimumBookingDate();


  } catch (error) {

    console.error(
      "Booking error:",
      error
    );


    alert(
      getBookingErrorMessage(
        error
      )
    );

  } finally {

    submitButton.disabled =
      false;

    submitButton.textContent =
      "🤝 Request a Buddy";

  }

}


// =====================================================
// BOOKING RESULT
// =====================================================

function showBookingResult(
  data
) {

  const modal =
    document.getElementById(
      "modal"
    );

  const result =
    document.getElementById(
      "result"
    );


  if (!modal || !result) {
    return;
  }


  const buddyName =
    data.buddy &&
    data.buddy.name
      ? data.buddy.name
      : "Hospital Buddy";


  const buddyStatus =
    data.buddy
      ? "A Buddy has been matched and your request is now awaiting administrator confirmation."
      : "Your request has been submitted and the administrator will assign an available Hospital Buddy.";


  result.innerHTML = `

    <div class="resultIcon">
      ✅
    </div>

    <h2>
      Booking Request Submitted
    </h2>

    <p>
      Your request has been successfully
      submitted to Hospital Buddy.
    </p>

    <div class="contact">

      <p>
        <b>Booking ID:</b><br>
        ${escapeHTML(
          data.bookingId
        )}
      </p>

      <p>
        <b>Name:</b><br>
        ${escapeHTML(
          data.name
        )}
      </p>

      <p>
        <b>Service:</b><br>
        ${escapeHTML(
          data.service
        )}
      </p>

      <p>
        <b>Date:</b><br>
        ${escapeHTML(
          data.date
        )}
      </p>

      <p>
        <b>Preferred Time:</b><br>
        ${escapeHTML(
          data.time
        )}
      </p>

      <p>
        <b>Language:</b><br>
        ${escapeHTML(
          data.language
        )}
      </p>

      <p>
        <b>Buddy:</b><br>
        ${escapeHTML(
          buddyName
        )}
      </p>

      <p>
        <b>Status:</b><br>
        Pending Administrator Confirmation
      </p>

    </div>

    <p class="privateText">
      ${escapeHTML(
        buddyStatus
      )}
    </p>

    <button
      type="button"
      class="btn primaryBtn"
      onclick="closeModal()"
    >
      Done
    </button>

  `;


  modal.classList.remove(
    "hidden"
  );

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal() {

  const modal =
    document.getElementById(
      "modal"
    );


  if (modal) {

    modal.classList.add(
      "hidden"
    );

  }

}


// =====================================================
// SCROLL TO BOOKING
// =====================================================

function scrollToBooking() {

  const bookingSection =
    document.getElementById(
      "book"
    );


  if (bookingSection) {

    bookingSection.scrollIntoView({
      behavior: "smooth"
    });

  }

}


// =====================================================
// MINIMUM BOOKING DATE
// =====================================================

function setMinimumBookingDate() {

  const dateInput =
    document.getElementById(
      "date"
    );


  if (!dateInput) {
    return;
  }


  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );


  dateInput.min =
    `${year}-${month}-${day}`;

}


// =====================================================
// ERROR MESSAGE
// =====================================================

function getBookingErrorMessage(
  error
) {

  if (
    error &&
    error.code ===
      "permission-denied"
  ) {

    return (
      "Your booking could not be submitted because Firebase denied the request. Please check the Firestore Security Rules."
    );

  }


  if (
    error &&
    error.code ===
      "unavailable"
  ) {

    return (
      "Firebase is temporarily unavailable. Please check your internet connection and try again."
    );

  }


  if (
    error &&
    error.message
  ) {

    return (
      "Unable to submit your booking.\n\n" +
      error.message
    );

  }


  return (
    "Unable to submit your booking. Please try again."
  );

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
// START
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  loadFirebaseScripts
);
