// =====================================================
// HOSPITAL BUDDY — ADMIN CONTROL SYSTEM
// =====================================================


// =====================================================
// FIREBASE CONFIGURATION
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

const firebaseScript = document.createElement("script");

firebaseScript.src =
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";

document.head.appendChild(firebaseScript);


firebaseScript.onload = () => {

  const firestoreScript = document.createElement("script");

  firestoreScript.src =
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";

  document.head.appendChild(firestoreScript);


  firestoreScript.onload = () => {

    const authScript = document.createElement("script");

    authScript.src =
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";

    document.head.appendChild(authScript);


    authScript.onload = () => {

      firebase.initializeApp(firebaseConfig);

      window.db = firebase.firestore();

      window.auth = firebase.auth();

      startAdmin();

    };

  };

};


// =====================================================
// START ADMIN
// =====================================================

function startAdmin() {

  auth.onAuthStateChanged(async user => {

    if (user) {

      try {

        const adminDoc =
          await db
            .collection("admins")
            .doc(user.uid)
            .get();


        if (!adminDoc.exists) {

          await auth.signOut();

          showLoginMessage(
            "This account is not authorized as an administrator.",
            true
          );

          return;
        }


        document.getElementById("loginSection")
          .style.display = "none";


        document.getElementById("adminPanel")
          .style.display = "block";


        loadDashboard();

        loadBuddies();

        loadBookings();

      } catch (error) {

        console.error(error);

        showLoginMessage(
          "Unable to verify administrator account.",
          true
        );

      }

    } else {

      document.getElementById("loginSection")
        .style.display = "block";


      document.getElementById("adminPanel")
        .style.display = "none";

    }

  };


  setupLogin();

  setupBuddyForm();

}


// =====================================================
// LOGIN
// =====================================================

function setupLogin() {

  document.getElementById("loginForm")
    .addEventListener("submit", async event => {

      event.preventDefault();


      const email =
        document.getElementById("adminEmail")
          .value.trim();


      const password =
        document.getElementById("adminPassword")
          .value;


      showLoginMessage("Logging in...", false);


      try {

        await auth.signInWithEmailAndPassword(
          email,
          password
        );


        showLoginMessage(
          "Login successful.",
          false
        );


      } catch (error) {

        console.error(error);


        let message =
          "Login failed. Please check your email and password.";


        if (
          error.code ===
          "auth/invalid-credential"
        ) {

          message =
            "Invalid email or password.";

        }


        showLoginMessage(
          message,
          true
        );

      }

    });

}


// =====================================================
// LOGIN MESSAGE
// =====================================================

function showLoginMessage(message, error) {

  const element =
    document.getElementById("loginMessage");


  element.textContent = message;


  element.className =
    error
      ? "message dangerText"
      : "message successText";

}


// =====================================================
// LOGOUT
// =====================================================

async function logoutAdmin() {

  try {

    await auth.signOut();

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }

}


// =====================================================
// ADD HOSPITAL BUDDY
// =====================================================

function setupBuddyForm() {

  document.getElementById("buddyForm")
    .addEventListener("submit", async event => {

      event.preventDefault();


      const name =
        document.getElementById("buddyName")
          .value.trim();


      const phone =
        document.getElementById("buddyPhone")
          .value.trim();


      const qualification =
        document.getElementById("buddyQualification")
          .value.trim();


      const languageText =
        document.getElementById("buddyLanguages")
          .value.trim();


      const languages =
        languageText
          .split(",")
          .map(language => language.trim())
          .filter(language => language);


      const message =
        document.getElementById("buddyMessage");


      message.textContent =
        "Adding Hospital Buddy...";


      message.className =
        "message";


      try {

        await db
          .collection("hospital_buddies")
          .add({

            name: name,

            phone: phone,

            qualification: qualification,

            languages: languages,

            status: "available",

            createdAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp()

          });


        message.textContent =
          "Hospital Buddy added successfully.";


        message.className =
          "message successText";


        document.getElementById("buddyForm")
          .reset();


        loadBuddies();

        loadDashboard();


      } catch (error) {

        console.error(
          "Add Buddy error:",
          error
        );


        message.textContent =
          "Unable to add Hospital Buddy.";


        message.className =
          "message dangerText";

      }

    });

}


// =====================================================
// LOAD BUDDIES
// =====================================================

async function loadBuddies() {

  const table =
    document.getElementById("buddyTable");


  table.innerHTML = `
    <tr>
      <td colspan="6">
        Loading Hospital Buddies...
      </td>
    </tr>
  `;


  try {

    const snapshot =
      await db
        .collection("hospital_buddies")
        .get();


    if (snapshot.empty) {

      table.innerHTML = `
        <tr>
          <td colspan="6">
            No Hospital Buddies have been added yet.
          </td>
        </tr>
      `;

      return;
    }


    table.innerHTML =
      snapshot.docs.map(doc => {

        const buddy =
          doc.data();


        const languages =
          Array.isArray(buddy.languages)
            ? buddy.languages.join(", ")
            : "";


        const status =
          buddy.status || "unavailable";


        return `

          <tr>

            <td>
              <b>
                ${escapeHTML(
                  buddy.name || "Hospital Buddy"
                )}
              </b>
            </td>


            <td>
              ${escapeHTML(
                buddy.phone || ""
              )}
            </td>


            <td>
              ${escapeHTML(
                buddy.qualification ||
                "Not specified"
              )}
            </td>


            <td>
              ${escapeHTML(languages)}
            </td>


            <td>

              <span
                class="statusBadge ${
                  status === "available"
                    ? "available"
                    : "unavailable"
                }"
              >
                ${escapeHTML(status)}
              </span>

            </td>


            <td>

              ${
                status === "available"

                  ? `

                    <button
                      class="smallBtn red"
                      onclick="setBuddyStatus(
                        '${doc.id}',
                        'unavailable'
                      )"
                    >
                      Make Unavailable
                    </button>

                  `

                  : `

                    <button
                      class="smallBtn green"
                      onclick="setBuddyStatus(
                        '${doc.id}',
                        'available'
                      )"
                    >
                      Make Available
                    </button>

                  `
              }


              <button
                class="smallBtn red"
                onclick="deleteBuddy('${doc.id}')"
              >
                Delete
              </button>

            </td>

          </tr>

        `;

      }).join("");


  } catch (error) {

    console.error(
      "Load Buddies error:",
      error
    );


    table.innerHTML = `
      <tr>
        <td colspan="6">
          Unable to load Hospital Buddies.
        </td>
      </tr>
    `;

  }

}


// =====================================================
// CHANGE BUDDY STATUS
// =====================================================

async function setBuddyStatus(
  buddyId,
  status
) {

  try {

    await db
      .collection("hospital_buddies")
      .doc(buddyId)
      .update({

        status: status

      });


    loadBuddies();

    loadDashboard();


  } catch (error) {

    console.error(
      "Status update error:",
      error
    );

    alert(
      "Unable to change Hospital Buddy status."
    );

  }

}


// =====================================================
// DELETE BUDDY
// =====================================================

async function deleteBuddy(buddyId) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this Hospital Buddy?"
    );


  if (!confirmed) {

    return;

  }


  try {

    await db
      .collection("hospital_buddies")
      .doc(buddyId)
      .delete();


    loadBuddies();

    loadDashboard();


  } catch (error) {

    console.error(
      "Delete Buddy error:",
      error
    );


    alert(
      "Unable to delete Hospital Buddy."
    );

  }

}


// =====================================================
// LOAD BOOKINGS
// =====================================================

async function loadBookings() {

  const table =
    document.getElementById("bookingTable");


  table.innerHTML = `
    <tr>
      <td colspan="8">
        Loading booking requests...
      </td>
    </tr>
  `;


  try {

    const snapshot =
      await db
        .collection("bookings")
        .get();


    if (snapshot.empty) {

      table.innerHTML = `
        <tr>
          <td colspan="8">
            No booking requests yet.
          </td>
        </tr>
      `;

      return;
    }


    const bookings =
      snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

      }));


    bookings.sort((a, b) => {

      const aTime =
        a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : 0;


      const bTime =
        b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : 0;


      return bTime - aTime;

    });


    table.innerHTML =
      bookings.map(booking => {

        const bookingId =
          "HB-" +
          booking.id
            .substring(0, 7)
            .toUpperCase();


        const status =
          booking.status || "pending";


        return `

          <tr>

            <td>
              <b>
                ${escapeHTML(bookingId)}
              </b>
            </td>


            <td>

              ${escapeHTML(
                booking.name || ""
              )}

            </td>


            <td>

              ${escapeHTML(
                booking.phone || ""
              )}

            </td>


            <td>

              ${escapeHTML(
                booking.service || ""
              )}

            </td>


            <td>

              ${escapeHTML(
                booking.date || ""
              )}

              <br>

              ${escapeHTML(
                booking.time || ""
              )}

            </td>


            <td>

              ${escapeHTML(
                booking.buddyName ||
                "Hospital Buddy"
              )}

            </td>


            <td>

              <span
                class="statusBadge ${getStatusClass(status)}"
              >
                ${escapeHTML(status)}
              </span>

            </td>


            <td>

              ${getBookingButtons(
                booking.id,
                status
              )}

            </td>

          </tr>

        `;

      }).join("");


  } catch (error) {

    console.error(
      "Load bookings error:",
      error
    );


    table.innerHTML = `
      <tr>
        <td colspan="8">
          Unable to load booking requests.
        </td>
      </tr>
    `;

  }

}


// =====================================================
// BOOKING ACTION BUTTONS
// =====================================================

function getBookingButtons(
  bookingId,
  status
) {

  if (status === "pending") {

    return `

      <button
        class="smallBtn green"
        onclick="updateBookingStatus(
          '${bookingId}',
          'confirmed'
        )"
      >
        Confirm
      </button>


      <button
        class="smallBtn red"
        onclick="updateBookingStatus(
          '${bookingId}',
          'rejected'
        )"
      >
        Reject
      </button>

    `;

  }


  if (status === "confirmed") {

    return `

      <button
        class="smallBtn blue"
        onclick="updateBookingStatus(
          '${bookingId}',
          'completed'
        )"
      >
        Completed
      </button>


      <button
        class="smallBtn red"
        onclick="updateBookingStatus(
          '${bookingId}',
          'cancelled'
        )"
      >
        Cancel

      </button>

    `;

  }


  return `
    <span>
      No action
    </span>
  `;

}


// =====================================================
// UPDATE BOOKING STATUS
// =====================================================

async function updateBookingStatus(
  bookingId,
  status
) {

  try {

    await db
      .collection("bookings")
      .doc(bookingId)
      .update({

        status: status,

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      });


    loadBookings();

    loadDashboard();


  } catch (error) {

    console.error(
      "Booking status error:",
      error
    );


    alert(
      "Unable to update booking status."
    );

  }

}


// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard() {

  try {

    const buddySnapshot =
      await db
        .collection("hospital_buddies")
        .get();


    let available = 0;


    buddySnapshot.forEach(doc => {

      if (
        doc.data().status ===
        "available"
      ) {

        available++;

      }

    });


    document.getElementById(
      "availableCount"
    ).textContent = available;


    const bookingSnapshot =
      await db
        .collection("bookings")
        .get();


    let pending = 0;

    let confirmed = 0;

    let completed = 0;


    bookingSnapshot.forEach(doc => {

      const status =
        doc.data().status;


      if (status === "pending") {

        pending++;

      }


      if (status === "confirmed") {

        confirmed++;

      }


      if (status === "completed") {

        completed++;

      }

    });


    document.getElementById(
      "pendingCount"
    ).textContent = pending;


    document.getElementById(
      "confirmedCount"
    ).textContent = confirmed;


    document.getElementById(
      "completedCount"
    ).textContent = completed;


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


// =====================================================
// STATUS CSS CLASS
// =====================================================

function getStatusClass(status) {

  const allowed = [
    "pending",
    "confirmed",
    "rejected",
    "cancelled",
    "completed"
  ];


  if (
    allowed.includes(status)
  ) {

    return status;

  }


  return "pending";

}


// =====================================================
// HTML SECURITY
// =====================================================

function escapeHTML(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}
