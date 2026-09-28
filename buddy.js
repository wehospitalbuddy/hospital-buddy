// =====================================================
// HOSPITAL BUDDY — BUDDY DASHBOARD
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
// LOAD FIREBASE
// =====================================================

const firebaseAppScript = document.createElement("script");

firebaseAppScript.src =
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";

document.head.appendChild(firebaseAppScript);

firebaseAppScript.onload = () => {

  const authScript = document.createElement("script");

  authScript.src =
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";

  document.head.appendChild(authScript);

  authScript.onload = () => {

    const firestoreScript = document.createElement("script");

    firestoreScript.src =
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";

    document.head.appendChild(firestoreScript);

    firestoreScript.onload = () => {

      firebase.initializeApp(firebaseConfig);

      window.auth = firebase.auth();
      window.db = firebase.firestore();

      startBuddySystem();

    };

  };

};


// =====================================================
// START SYSTEM
// =====================================================

function startBuddySystem() {

  const loginForm =
    document.getElementById("buddyLoginForm");

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      buddyLogin
    );

  }


  const logoutButton =
    document.getElementById("buddyLogout");

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      buddyLogout
    );

  }


  auth.onAuthStateChanged(
    async user => {

      if (!user) {

        showBuddyLogin();

        return;

      }


      const profile =
        await getBuddyProfile(user.uid);


      if (!profile) {

        await auth.signOut();

        showBuddyLogin();

        showBuddyMessage(
          "Buddy profile was not found.",
          true
        );

        return;

      }


      showBuddyDashboard();

      displayBuddyProfile(
        profile
      );

      loadBuddyBookings(
        user.uid
      );

    }
  );

}


// =====================================================
// BUDDY LOGIN
// =====================================================

async function buddyLogin(event) {

  event.preventDefault();


  const email =
    document
      .getElementById("buddyLoginEmail")
      ?.value
      .trim();


  const password =
    document
      .getElementById("buddyLoginPassword")
      ?.value;


  if (!email || !password) {

    showBuddyMessage(
      "Please enter your email and password.",
      true
    );

    return;

  }


  showBuddyMessage(
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


    if (
      error.code ===
      "auth/invalid-credential"
    ) {

      message =
        "Incorrect email or password.";

    }


    else if (
      error.code ===
      "auth/user-not-found"
    ) {

      message =
        "No Buddy account was found with this email.";

    }


    else if (
      error.code ===
      "auth/wrong-password"
    ) {

      message =
        "Incorrect password.";

    }


    else if (
      error.code ===
      "auth/invalid-email"
    ) {

      message =
        "Please enter a valid email address.";

    }


    showBuddyMessage(
      message,
      true
    );

  }

}


// =====================================================
// GET BUDDY PROFILE
// =====================================================

async function getBuddyProfile(
  uid
) {

  try {

    const snapshot =
      await db
        .collection("hospital_buddies")
        .doc(uid)
        .get();


    if (!snapshot.exists) {

      return null;

    }


    return {

      id:
        snapshot.id,

      ...snapshot.data()

    };


  } catch (error) {

    console.error(
      "Get Buddy profile error:",
      error
    );


    return null;

  }

}


// =====================================================
// LOGOUT
// =====================================================

async function buddyLogout() {

  try {

    await auth.signOut();

  } catch (error) {

    console.error(
      "Buddy logout error:",
      error
    );

  }

}


// =====================================================
// SHOW LOGIN
// =====================================================

function showBuddyLogin() {

  const login =
    document.getElementById(
      "buddyLoginSection"
    );


  const dashboard =
    document.getElementById(
      "buddyDashboard"
    );


  if (login) {

    login.style.display =
      "block";

  }


  if (dashboard) {

    dashboard.style.display =
      "none";

  }

}


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showBuddyDashboard() {

  const login =
    document.getElementById(
      "buddyLoginSection"
    );


  const dashboard =
    document.getElementById(
      "buddyDashboard"
    );


  if (login) {

    login.style.display =
      "none";

  }


  if (dashboard) {

    dashboard.style.display =
      "block";

  }

}


// =====================================================
// LOGIN MESSAGE
// =====================================================

function showBuddyMessage(
  message,
  error
) {

  const element =
    document.getElementById(
      "buddyLoginMessage"
    );


  if (!element) {

    return;

  }


  element.textContent =
    message;


  element.style.color =
    error
      ? "#b00020"
      : "#176b32";

}


// =====================================================
// DISPLAY PROFILE
// =====================================================

function displayBuddyProfile(
  buddy
) {

  setText(
    "buddyProfileName",
    buddy.name || "Hospital Buddy"
  );


  setText(
    "buddyProfilePhone",
    buddy.phone || "Not provided"
  );


  setText(
    "buddyProfileEmail",
    buddy.email || "Not provided"
  );


  setText(
    "buddyProfileGender",
    buddy.gender || "Not provided"
  );


  setText(
    "buddyProfileDistrict",
    buddy.district || "Not provided"
  );


  setText(
    "buddyProfileHospital",
    buddy.hospital || "Not provided"
  );


  setText(
    "buddyProfileQualification",
    buddy.qualification || "Not provided"
  );


  setText(
    "buddyProfileAvailability",
    buddy.availability || "Not provided"
  );


  setText(
    "buddyProfileAbout",
    buddy.about || "No introduction provided."
  );


  setText(
    "buddyProfileStatus",
    buddy.status || "pending"
  );


  const languages =
    Array.isArray(buddy.languages)
      ? buddy.languages.join(", ")
      : "Not provided";


  setText(
    "buddyProfileLanguages",
    languages
  );


  const services =
    Array.isArray(buddy.services)
      ? buddy.services.join(", ")
      : "Not provided";


  setText(
    "buddyProfileServices",
    services
  );


  const statusElement =
    document.getElementById(
      "buddyProfileStatus"
    );


  if (statusElement) {

    statusElement.className =
      "statusBadge " +
      getStatusClass(
        buddy.status
      );

  }


  if (
    buddy.status !==
    "approved"
  ) {

    showBuddyApprovalNotice(
      buddy.status
    );

  }


  else {

    hideBuddyApprovalNotice();

  }

}


// =====================================================
// APPROVAL NOTICE
// =====================================================

function showBuddyApprovalNotice(
  status
) {

  const notice =
    document.getElementById(
      "buddyApprovalNotice"
    );


  if (!notice) {

    return;

  }


  notice.style.display =
    "block";


  if (
    status === "pending"
  ) {

    notice.innerHTML = `
      <strong>Registration under review</strong>
      <p>
        Your Buddy registration is waiting for
        administrator approval. You will be able
        to receive assignments after approval.
      </p>
    `;

  }


  else if (
    status === "rejected"
  ) {

    notice.innerHTML = `
      <strong>Registration not approved</strong>
      <p>
        Your Buddy registration has not been approved
        by the administrator.
      </p>
    `;

  }


  else {

    notice.innerHTML = `
      <strong>Buddy account status</strong>
      <p>
        Your account is currently not available
        for assignments.
      </p>
    `;

  }

}


function hideBuddyApprovalNotice() {

  const notice =
    document.getElementById(
      "buddyApprovalNotice"
    );


  if (notice) {

    notice.style.display =
      "none";

  }

}


// =====================================================
// LOAD BOOKINGS
// =====================================================

async function loadBuddyBookings(
  uid
) {

  const table =
    document.getElementById(
      "buddyBookingTable"
    );


  if (!table) {

    return;

  }


  table.innerHTML = `
    <tr>
      <td colspan="7">
        Loading assignments...
      </td>
    </tr>
  `;


  try {

    const snapshot =
      await db
        .collection("bookings")
        .where(
          "buddyId",
          "==",
          uid
        )
        .get();


    if (snapshot.empty) {

      table.innerHTML = `
        <tr>
          <td colspan="7">
            No assignments found.
          </td>
        </tr>
      `;

      updateBuddyCounts([]);

      return;

    }


    const bookings =
      snapshot.docs.map(
        doc => ({

          id:
            doc.id,

          ...doc.data()

        })
      );


    bookings.sort(
      (a, b) => {

        return (
          getTimestampMillis(
            b.createdAt
          ) -
          getTimestampMillis(
            a.createdAt
          )
        );

      }
    );


    let html = "";


    bookings.forEach(
      booking => {

        html +=
          renderBuddyBooking(
            booking
          );

      }
    );


    table.innerHTML =
      html;


    updateBuddyCounts(
      bookings
    );


  } catch (error) {

    console.error(
      "Load Buddy bookings error:",
      error
    );


    table.innerHTML = `
      <tr>
        <td colspan="7">
          Unable to load assignments.
        </td>
      </tr>
    `;

  }

}


// =====================================================
// RENDER BOOKING
// =====================================================

function renderBuddyBooking(
  booking
) {

  const status =
    booking.status ||
    "pending";


  const bookingId =
    booking.bookingId ||
    (
      "HB-" +
      booking.id
        .substring(0, 7)
        .toUpperCase()
    );


  const dateTime =
    [
      booking.date || "",
      booking.time || ""
    ]
      .filter(Boolean)
      .join(" • ");


  let action = "";


  if (
    status === "confirmed"
  ) {

    action = `
      <button
        type="button"
        class="smallBtn green"
        onclick="buddyCompleteBooking(
          '${escapeJS(booking.id)}'
        )"
      >
        Complete
      </button>
    `;

  }


  return `

    <tr>

      <td>
        <strong>
          ${escapeHTML(
            bookingId
          )}
        </strong>
      </td>


      <td>
        ${escapeHTML(
          booking.name ||
          "Patient"
        )}
      </td>


      <td>
        ${escapeHTML(
          booking.service ||
          "Not specified"
        )}
      </td>


      <td>
        ${escapeHTML(
          booking.language ||
          "Not specified"
        )}
      </td>


      <td>
        ${escapeHTML(
          dateTime ||
          "Not specified"
        )}
      </td>


      <td>

        ${
          booking.requirement
            ? escapeHTML(
                booking.requirement
              )
            : "No additional requirement"
        }

      </td>


      <td>

        <span
          class="statusBadge ${getStatusClass(
            status
          )}"
        >
          ${escapeHTML(
            status
          )}
        </span>

        <br><br>

        ${action}

      </td>

    </tr>

  `;

}


// =====================================================
// COMPLETE ASSIGNMENT
// =====================================================

async function buddyCompleteBooking(
  bookingId
) {

  const confirmed =
    confirm(
      "Mark this assignment as completed?"
    );


  if (!confirmed) {

    return;

  }


  try {

    const bookingRef =
      db
        .collection("bookings")
        .doc(
          bookingId
        );


    const bookingSnapshot =
      await bookingRef.get();


    if (!bookingSnapshot.exists) {

      alert(
        "Booking was not found."
      );

      return;

    }


    const booking =
      bookingSnapshot.data();


    await bookingRef.update({

      status:
        "completed",

      completedAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp(),

      updatedAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp()

    });


    if (
      booking.buddyId
    ) {

      await db
        .collection(
          "hospital_buddies"
        )
        .doc(
          booking.buddyId
        )
        .update({

          status:
            "available",

          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()

        });

    }


    loadBuddyBookings(
      auth.currentUser.uid
    );


    alert(
      "Assignment marked as completed."
    );


  } catch (error) {

    console.error(
      "Complete assignment error:",
      error
    );


    alert(
      "Unable to complete assignment."
    );

  }

}


// =====================================================
// BUDDY COUNTS
// =====================================================

function updateBuddyCounts(
  bookings
) {

  let pending =
    0;

  let confirmed =
    0;

  let completed =
    0;


  bookings.forEach(
    booking => {

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

    }
  );


  setText(
    "buddyPendingCount",
    pending
  );


  setText(
    "buddyConfirmedCount",
    confirmed
  );


  setText(
    "buddyCompletedCount",
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

    case "approved":
      return "confirmed";

    case "confirmed":
      return "confirmed";

    case "completed":
      return "completed";

    case "rejected":
      return "rejected";

    case "cancelled":
      return "cancelled";

    case "available":
      return "available";

    default:
      return "unavailable";

  }

}


// =====================================================
// SET TEXT
// =====================================================

function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value;

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
    timestamp.seconds
  ) {

    return (
      timestamp.seconds *
      1000
    );

  }


  return 0;

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
// JAVASCRIPT SECURITY
// =====================================================

function escapeJS(
  value
) {

  return String(
    value ?? ""
  )

    .replace(
      /\\/g,
      "\\\\"
    )

    .replace(
      /'/g,
      "\\'"
    )

    .replace(
      /\n/g,
      "\\n"
    )

    .replace(
      /\r/g,
      "\\r"
    );

}
