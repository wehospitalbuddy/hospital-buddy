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

      const auth = firebase.auth();
      const db = firebase.firestore();

      startAdmin(auth, db);

    };

  };

};


// =====================================================
// START ADMIN
// =====================================================

function startAdmin(auth, db) {

  const loginForm =
    document.getElementById("loginForm");

  if (!loginForm) {
    console.error("Login form not found.");
    return;
  }


  loginForm.onsubmit = async (event) => {

    event.preventDefault();

    const email =
      document.getElementById("adminEmail")
        .value.trim();

    const password =
      document.getElementById("adminPassword")
        .value;

    const message =
      document.getElementById("loginMessage");

    message.textContent = "Logging in...";
    message.style.color = "";


    try {

      await auth.signInWithEmailAndPassword(
        email,
        password
      );

    } catch (error) {

      console.error("Firebase Login Error:", error);

      message.textContent =
        "Login failed: " +
        getAuthErrorMessage(error);

      message.style.color = "#8d1d1d";

    }

  };


  // Check authentication state

  auth.onAuthStateChanged(async (user) => {

    if (user) {

      await checkAdmin(
        auth,
        db,
        user
      );

    } else {

      showLogin();

    }

  });

}


// =====================================================
// CHECK ADMIN
// =====================================================

async function checkAdmin(
  auth,
  db,
  user
) {

  try {

    const adminDoc =
      await db
        .collection("admins")
        .doc(user.uid)
        .get();


    if (!adminDoc.exists) {

      document.getElementById(
        "loginMessage"
      ).textContent =
        "This account is not authorized as an administrator.";

      await auth.signOut();

      return;
    }


    showAdminPanel();

    loadDashboard(db);

    loadHospitalBuddies(db);

    loadBookings(db);


  } catch (error) {

    console.error(
      "Admin verification error:",
      error
    );

    document.getElementById(
      "loginMessage"
    ).textContent =
      "Unable to verify administrator access.";

  }

}


// =====================================================
// SHOW LOGIN
// =====================================================

function showLogin() {

  document.getElementById(
    "loginSection"
  ).style.display = "block";

  document.getElementById(
    "adminPanel"
  ).style.display = "none";

}


// =====================================================
// SHOW ADMIN PANEL
// =====================================================

function showAdminPanel() {

  document.getElementById(
    "loginSection"
  ).style.display = "none";

  document.getElementById(
    "adminPanel"
  ).style.display = "block";

}


// =====================================================
// LOGOUT
// =====================================================

function logoutAdmin() {

  firebase.auth().signOut();

}


// =====================================================
// ADD HOSPITAL BUDDY
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const buddyForm =
      document.getElementById("buddyForm");

    if (!buddyForm) {
      return;
    }


    buddyForm.onsubmit =
      async (event) => {

        event.preventDefault();

        const name =
          document.getElementById("buddyName")
            .value.trim();

        const phone =
          document.getElementById("buddyPhone")
            .value.trim();

        const qualification =
          document.getElementById(
            "buddyQualification"
          ).value.trim();

        const languagesText =
          document.getElementById(
            "buddyLanguages"
          ).value.trim();

        const languages =
          languagesText
            .split(",")
            .map(language => language.trim())
            .filter(language => language);

        const message =
          document.getElementById(
            "buddyMessage"
          );


        try {

          await firebase
            .firestore()
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

          message.style.color =
            "#176b32";

          buddyForm.reset();


          loadHospitalBuddies(
            firebase.firestore()
          );

          loadDashboard(
            firebase.firestore()
          );


        } catch (error) {

          console.error(
            "Add Hospital Buddy error:",
            error
          );

          message.textContent =
            "Unable to add Hospital Buddy.";

          message.style.color =
            "#8d1d1d";

        }

      };

  }
);


// =====================================================
// LOAD HOSPITAL BUDDIES
// =====================================================

async function loadHospitalBuddies(db) {

  const table =
    document.getElementById(
      "buddyTable"
    );

  if (!table) {
    return;
  }


  try {

    const snapshot =
      await db
        .collection("hospital_buddies")
        .get();


    if (snapshot.empty) {

      table.innerHTML = `
        <tr>
          <td colspan="6">
            No Hospital Buddies found.
          </td>
        </tr>
      `;

      return;
    }


    table.innerHTML =
      snapshot.docs
        .map(doc => {

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
                    buddy.name ||
                    "Hospital Buddy"
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
                <span class="statusBadge ${escapeHTML(status)}">
                  ${escapeHTML(status)}
                </span>
              </td>

              <td>

                ${
                  status === "available"
                    ? `
                      <button
                        class="smallBtn red"
                        onclick="changeBuddyStatus('${doc.id}', 'unavailable')"
                      >
                        Make Unavailable
                      </button>
                    `
                    : `
                      <button
                        class="smallBtn green"
                        onclick="changeBuddyStatus('${doc.id}', 'available')"
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

        })
        .join("");


  } catch (error) {

    console.error(
      "Load Hospital Buddies error:",
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

async function changeBuddyStatus(
  buddyId,
  newStatus
) {

  try {

    await firebase
      .firestore()
      .collection("hospital_buddies")
      .doc(buddyId)
      .update({
        status: newStatus
      });


    loadHospitalBuddies(
      firebase.firestore()
    );

    loadDashboard(
      firebase.firestore()
    );


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
// DELETE HOSPITAL BUDDY
// =====================================================

async function deleteBuddy(
  buddyId
) {

  const confirmDelete =
    confirm(
      "Are you sure you want to delete this Hospital Buddy?"
    );

  if (!confirmDelete) {
    return;
  }


  try {

    await firebase
      .firestore()
      .collection("hospital_buddies")
      .doc(buddyId)
      .delete();


    loadHospitalBuddies(
      firebase.firestore()
    );

    loadDashboard(
      firebase.firestore()
    );


  } catch (error) {

    console.error(
      "Delete Hospital Buddy error:",
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

async function loadBookings(db) {

  const table =
    document.getElementById(
      "bookingTable"
    );

  if (!table) {
    return;
  }


  try {

    const snapshot =
      await db
        .collection("bookings")
        .orderBy(
          "createdAt",
          "desc"
        )
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


    table.innerHTML =
      snapshot.docs
        .map(doc => {

          const booking =
            doc.data();

          const status =
            booking.status ||
            "pending";

          const bookingId =
            "HB-" +
            doc.id
              .substring(0, 7)
              .toUpperCase();


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
                <span class="statusBadge ${escapeHTML(status)}">
                  ${escapeHTML(status)}
                </span>
              </td>

              <td>

                ${
                  status === "pending"
                    ? `
                      <button
                        class="smallBtn green"
                        onclick="changeBookingStatus('${doc.id}', 'confirmed')"
                      >
                        Confirm
                      </button>

                      <button
                        class="smallBtn red"
                        onclick="changeBookingStatus('${doc.id}', 'rejected')"
                      >
                        Reject
                      </button>
                    `
                    : ""
                }

                ${
                  status === "confirmed"
                    ? `
                      <button
                        class="smallBtn blue"
                        onclick="changeBookingStatus('${doc.id}', 'completed')"
                      >
                        Completed
                      </button>

                      <button
                        class="smallBtn red"
                        onclick="changeBookingStatus('${doc.id}', 'cancelled')"
                      >
                        Cancel
                      </button>
                    `
                    : ""
                }

              </td>

            </tr>
          `;

        })
        .join("");


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
// CHANGE BOOKING STATUS
// =====================================================

async function changeBookingStatus(
  bookingId,
  newStatus
) {

  try {

    await firebase
      .firestore()
      .collection("bookings")
      .doc(bookingId)
      .update({
        status: newStatus
      });


    loadBookings(
      firebase.firestore()
    );

    loadDashboard(
      firebase.firestore()
    );


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

async function loadDashboard(db) {

  try {

    const buddySnapshot =
      await db
        .collection("hospital_buddies")
        .where(
          "status",
          "==",
          "available"
        )
        .get();


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
      "availableCount"
    ).textContent =
      buddySnapshot.size;

    document.getElementById(
      "pendingCount"
    ).textContent =
      pending;

    document.getElementById(
      "confirmedCount"
    ).textContent =
      confirmed;

    document.getElementById(
      "completedCount"
    ).textContent =
      completed;


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


// =====================================================
// AUTH ERROR MESSAGE
// =====================================================

function getAuthErrorMessage(error) {

  switch (error.code) {

    case "auth/invalid-email":
      return "Invalid email address.";

    case "auth/user-not-found":
      return "Administrator account not found.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/user-disabled":
      return "This administrator account is disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled in Firebase.";

    default:
      return error.message ||
        "Unable to login. Please try again.";

  }

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
