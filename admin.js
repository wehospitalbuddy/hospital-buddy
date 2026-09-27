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

      window.db = firebase.firestore();
      window.auth = firebase.auth();

      setupAuthentication();

    };

  };

};


// =====================================================
// AUTHENTICATION
// =====================================================

function setupAuthentication() {

  const loginForm =
    document.getElementById("loginForm");

  if (!loginForm) return;


  loginForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const email =
        document.getElementById("adminEmail")
          .value.trim();


      const password =
        document.getElementById("adminPassword")
          .value;


      const message =
        document.getElementById("loginMessage");


      message.textContent =
        "Checking login...";


      try {

        const credential =
          await auth.signInWithEmailAndPassword(
            email,
            password
          );


        const uid =
          credential.user.uid;


        const adminDoc =
          await db
            .collection("admins")
            .doc(uid)
            .get();


        if (!adminDoc.exists) {

          await auth.signOut();

          message.textContent =
            "This account is not authorized as an administrator.";

          return;

        }


        message.textContent = "";

        showAdminPanel();

        loadDashboard();

      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        message.textContent =
          "Login failed. Please check your email and password.";

      }

    }
  );


  auth.onAuthStateChanged(
    async (user) => {

      if (!user) return;


      try {

        const adminDoc =
          await db
            .collection("admins")
            .doc(user.uid)
            .get();


        if (adminDoc.exists) {

          showAdminPanel();

          loadDashboard();

        }

      } catch (error) {

        console.error(error);

      }

    }
  );

}


// =====================================================
// SHOW ADMIN PANEL
// =====================================================

function showAdminPanel() {

  document.getElementById("loginSection")
    .style.display = "none";


  document.getElementById("adminPanel")
    .style.display = "block";

}


// =====================================================
// LOGOUT
// =====================================================

async function logoutAdmin() {

  await auth.signOut();

  document.getElementById("adminPanel")
    .style.display = "none";


  document.getElementById("loginSection")
    .style.display = "block";

}


window.logoutAdmin = logoutAdmin;


// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard() {

  loadHospitalBuddies();

  loadBookings();

}


// =====================================================
// HOSPITAL BUDDIES
// =====================================================

async function loadHospitalBuddies() {

  try {

    const snapshot =
      await db
        .collection("hospital_buddies")
        .get();


    let available = 0;


    const table =
      document.getElementById("buddyTable");


    table.innerHTML = "";


    snapshot.forEach(doc => {

      const buddy = doc.data();


      if (buddy.status === "available") {

        available++;

      }


      const languages =
        Array.isArray(buddy.languages)
          ? buddy.languages.join(", ")
          : "";


      const statusClass =
        buddy.status === "available"
          ? "available"
          : "unavailable";


      const actionText =
        buddy.status === "available"
          ? "Set Unavailable"
          : "Set Available";


      const nextStatus =
        buddy.status === "available"
          ? "unavailable"
          : "available";


      const row =
        document.createElement("tr");


      row.innerHTML = `

        <td>
          ${escapeHTML(buddy.name || "")}
        </td>

        <td>
          ${escapeHTML(buddy.phone || "")}
        </td>

        <td>
          ${escapeHTML(
            buddy.qualification || ""
          )}
        </td>

        <td>
          ${escapeHTML(languages)}
        </td>

        <td>

          <span class="statusBadge ${statusClass}">
            ${escapeHTML(
              buddy.status || "unknown"
            )}
          </span>

        </td>

        <td>

          <button
            class="smallBtn blue"
            onclick="changeBuddyStatus(
              '${doc.id}',
              '${nextStatus}'
            )"
          >
            ${actionText}
          </button>

          <button
            class="smallBtn red"
            onclick="deleteBuddy('${doc.id}')"
          >
            Delete
          </button>

        </td>

      `;


      table.appendChild(row);

    });


    document.getElementById("availableCount")
      .textContent = available;


  } catch (error) {

    console.error(
      "Error loading Hospital Buddies:",
      error
    );

  }

}


// =====================================================
// ADD HOSPITAL BUDDY
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const form =
      document.getElementById("buddyForm");


    if (!form) return;


    form.addEventListener(
      "submit",
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
            .filter(Boolean);


        const message =
          document.getElementById(
            "buddyMessage"
          );


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


          form.reset();

          loadHospitalBuddies();


        } catch (error) {

          console.error(
            "Error adding Hospital Buddy:",
            error
          );


          message.textContent =
            "Unable to add Hospital Buddy.";

        }

      }
    );

  }
);


// =====================================================
// CHANGE BUDDY STATUS
// =====================================================

async function changeBuddyStatus(
  buddyId,
  newStatus
) {

  try {

    await db
      .collection("hospital_buddies")
      .doc(buddyId)
      .update({

        status: newStatus

      });


    loadHospitalBuddies();


  } catch (error) {

    console.error(
      "Status update error:",
      error
    );

    alert(
      "Unable to update Buddy status."
    );

  }

}


window.changeBuddyStatus =
  changeBuddyStatus;


// =====================================================
// DELETE BUDDY
// =====================================================

async function deleteBuddy(buddyId) {

  if (
    !confirm(
      "Delete this Hospital Buddy?"
    )
  ) {

    return;

  }


  try {

    await db
      .collection("hospital_buddies")
      .doc(buddyId)
      .delete();


    loadHospitalBuddies();


  } catch (error) {

    console.error(
      "Delete error:",
      error
    );

    alert(
      "Unable to delete Hospital Buddy."
    );

  }

}


window.deleteBuddy =
  deleteBuddy;


// =====================================================
// BOOKINGS
// =====================================================

async function loadBookings() {

  try {

    const snapshot =
      await db
        .collection("bookings")
        .get();


    const table =
      document.getElementById(
        "bookingTable"
      );


    table.innerHTML = "";


    let pending = 0;
    let confirmed = 0;
    let completed = 0;


    snapshot.forEach(doc => {

      const booking = doc.data();


      if (booking.status === "pending")
        pending++;


      if (booking.status === "confirmed")
        confirmed++;


      if (booking.status === "completed")
        completed++;


      const row =
        document.createElement("tr");


      const bookingId =
        "HB-" +
        doc.id
          .substring(0, 7)
          .toUpperCase();


      row.innerHTML = `

        <td>
          <b>${escapeHTML(bookingId)}</b>
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
            "Not assigned"
          )}
        </td>

        <td>

          <span class="statusBadge ${escapeHTML(
            booking.status || ""
          )}">

            ${escapeHTML(
              booking.status || "unknown"
            )}

          </span>

        </td>

        <td>

          ${
            booking.status === "pending"
              ? `
                <button
                  class="smallBtn green"
                  onclick="updateBooking(
                    '${doc.id}',
                    'confirmed'
                  )"
                >
                  Confirm
                </button>

                <button
                  class="smallBtn red"
                  onclick="updateBooking(
                    '${doc.id}',
                    'rejected'
                  )"
                >
                  Reject
                </button>
              `
              : ""
          }

          ${
            booking.status === "confirmed"
              ? `
                <button
                  class="smallBtn blue"
                  onclick="updateBooking(
                    '${doc.id}',
                    'completed'
                  )"
                >
                  Complete
                </button>

                <button
                  class="smallBtn red"
                  onclick="updateBooking(
                    '${doc.id}',
                    'cancelled'
                  )"
                >
                  Cancel
                </button>
              `
              : ""
          }

        </td>

      `;


      table.appendChild(row);

    });


    document.getElementById("pendingCount")
      .textContent = pending;


    document.getElementById("confirmedCount")
      .textContent = confirmed;


    document.getElementById("completedCount")
      .textContent = completed;


  } catch (error) {

    console.error(
      "Error loading bookings:",
      error
    );

  }

}


// =====================================================
// UPDATE BOOKING
// =====================================================

async function updateBooking(
  bookingId,
  status
) {

  try {

    await db
      .collection("bookings")
      .doc(bookingId)
      .update({

        status: status

      });


    loadBookings();


  } catch (error) {

    console.error(
      "Booking update error:",
      error
    );


    alert(
      "Unable to update booking."
    );

  }

}


window.updateBooking =
  updateBooking;


// =====================================================
// SECURITY / HTML ESCAPING
// =====================================================

function escapeHTML(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}
