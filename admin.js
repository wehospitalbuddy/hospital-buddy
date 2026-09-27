const firebaseConfig = {
  apiKey: "AIzaSyDxfFRc03z0YLo_q5ynZhEjYR41PzGdiw",
  authDomain: "hospital-buddy-2224d.firebaseapp.com",
  projectId: "hospital-buddy-2224d",
  storageBucket: "hospital-buddy-2224d.firebasestorage.app",
  messagingSenderId: "190919672635",
  appId: "1:190919672635:web:8fe14cc8036fd0cb542d1e",
  measurementId: "G-7I3TZ2EFFR"
};


// -----------------------------------------
// LOAD FIREBASE
// -----------------------------------------

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

      checkAdminLogin();

    };

  };

};


// -----------------------------------------
// CHECK ADMIN LOGIN
// -----------------------------------------

function checkAdminLogin() {

  auth.onAuthStateChanged(async (user) => {

    if (!user) {

      showLogin();

      return;

    }


    try {

      const adminDoc =
        await db
          .collection("admins")
          .doc(user.uid)
          .get();


      if (
        adminDoc.exists &&
        adminDoc.data().role === "admin"
      ) {

        showAdminPanel();

        loadDashboard();

        loadBuddies();

        loadBookings();

        setupBuddyForm();

      } else {

        await auth.signOut();

        showLogin();

        document.getElementById("loginMessage").textContent =
          "This account is not authorized as an administrator.";

      }

    } catch (error) {

      console.error("Admin verification error:", error);

      document.getElementById("loginMessage").textContent =
        "Unable to verify administrator access.";

    }

  });

}


// -----------------------------------------
// LOGIN
// -----------------------------------------

document.addEventListener("submit", function(event) {

  if (event.target.id !== "loginForm") {
    return;
  }


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
    "Logging in...";


  auth
    .signInWithEmailAndPassword(
      email,
      password
    )
    .then(() => {

      message.textContent = "";

    })
    .catch((error) => {

      console.error(error);

      message.textContent =
        "Login failed. Please check your email and password.";

    });

});


// -----------------------------------------
// SHOW / HIDE PANELS
// -----------------------------------------

function showLogin() {

  document.getElementById("loginSection")
    .style.display = "block";


  document.getElementById("adminPanel")
    .style.display = "none";

}


function showAdminPanel() {

  document.getElementById("loginSection")
    .style.display = "none";


  document.getElementById("adminPanel")
    .style.display = "block";

}


// -----------------------------------------
// LOGOUT
// -----------------------------------------

async function logoutAdmin() {

  await auth.signOut();

  showLogin();

}


// -----------------------------------------
// DASHBOARD
// -----------------------------------------

async function loadDashboard() {

  try {

    const buddies =
      await db
        .collection("hospital_buddies")
        .get();


    const bookings =
      await db
        .collection("bookings")
        .get();


    let available = 0;
    let pending = 0;
    let confirmed = 0;
    let completed = 0;


    buddies.forEach(doc => {

      if (
        doc.data().status === "available"
      ) {

        available++;

      }

    });


    bookings.forEach(doc => {

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


    document.getElementById("availableCount")
      .textContent = available;


    document.getElementById("pendingCount")
      .textContent = pending;


    document.getElementById("confirmedCount")
      .textContent = confirmed;


    document.getElementById("completedCount")
      .textContent = completed;

  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


// -----------------------------------------
// ADD HOSPITAL BUDDY
// -----------------------------------------

function setupBuddyForm() {

  const form =
    document.getElementById("buddyForm");


  if (!form) {
    return;
  }


  form.onsubmit = async (event) => {

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


    const languages =
      document.getElementById("buddyLanguages")
        .value
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);


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


      document.getElementById("buddyMessage")
        .textContent =
        "Hospital Buddy added successfully.";


      form.reset();


      loadBuddies();

      loadDashboard();

    } catch (error) {

      console.error(error);

      document.getElementById("buddyMessage")
        .textContent =
        "Unable to add Hospital Buddy.";

    }

  };

}


// -----------------------------------------
// LOAD BUDDIES
// -----------------------------------------

async function loadBuddies() {

  const table =
    document.getElementById("buddyTable");


  table.innerHTML =
    "<tr><td colspan='6'>Loading...</td></tr>";


  try {

    const snapshot =
      await db
        .collection("hospital_buddies")
        .get();


    if (snapshot.empty) {

      table.innerHTML =
        "<tr><td colspan='6'>No Hospital Buddies found.</td></tr>";

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


        return `

          <tr>

            <td>
              ${escapeHTML(buddy.name || "")}
            </td>

            <td>
              ${escapeHTML(buddy.phone || "")}
            </td>

            <td>
              ${escapeHTML(buddy.qualification || "")}
            </td>

            <td>
              ${escapeHTML(languages)}
            </td>

            <td>

              <span class="statusBadge ${
                buddy.status === "available"
                  ? "available"
                  : "unavailable"
              }">

                ${escapeHTML(
                  buddy.status || "unavailable"
                )}

              </span>

            </td>

            <td>

              ${
                buddy.status === "available"

                ? `
                  <button
                    class="smallBtn red"
                    onclick="setBuddyStatus('${doc.id}','unavailable')"
                  >
                    Disable
                  </button>
                `

                : `
                  <button
                    class="smallBtn green"
                    onclick="setBuddyStatus('${doc.id}','available')"
                  >
                    Make Available
                  </button>
                `
              }

            </td>

          </tr>

        `;

      }).join("");

  } catch (error) {

    console.error(error);

    table.innerHTML =
      "<tr><td colspan='6'>Unable to load Hospital Buddies.</td></tr>";

  }

}


// -----------------------------------------
// CHANGE BUDDY STATUS
// -----------------------------------------

async function setBuddyStatus(id, status) {

  try {

    await db
      .collection("hospital_buddies")
      .doc(id)
      .update({

        status: status

      });


    loadBuddies();

    loadDashboard();

  } catch (error) {

    console.error(error);

    alert(
      "Unable to update Hospital Buddy status."
    );

  }

}


// -----------------------------------------
// LOAD BOOKINGS
// -----------------------------------------

async function loadBookings() {

  const table =
    document.getElementById("bookingTable");


  table.innerHTML =
    "<tr><td colspan='8'>Loading...</td></tr>";


  try {

    const snapshot =
      await db
        .collection("bookings")
        .get();


    if (snapshot.empty) {

      table.innerHTML =
        "<tr><td colspan='8'>No booking requests.</td></tr>";

      return;

    }


    table.innerHTML =
      snapshot.docs.map(doc => {

        const booking =
          doc.data();


        const bookingId =
          "HB-" +
          doc.id
            .substring(0, 7)
            .toUpperCase();


        return `

          <tr>

            <td>
              <b>${escapeHTML(bookingId)}</b>
            </td>

            <td>
              ${escapeHTML(booking.name || "")}
            </td>

            <td>
              ${escapeHTML(booking.phone || "")}
            </td>

            <td>
              ${escapeHTML(booking.service || "")}
            </td>

            <td>

              ${escapeHTML(booking.date || "")}

              <br>

              ${escapeHTML(booking.time || "")}

            </td>

            <td>
              ${escapeHTML(
                booking.buddyName || "Not assigned"
              )}
            </td>

            <td>

              <span class="statusBadge ${
                booking.status || "pending"
              }">

                ${escapeHTML(
                  booking.status || "pending"
                )}

              </span>

            </td>

            <td>

              ${
                booking.status === "pending"

                ? `

                  <button
                    class="smallBtn green"
                    onclick="updateBooking('${doc.id}','confirmed')"
                  >
                    Confirm
                  </button>

                  <button
                    class="smallBtn red"
                    onclick="updateBooking('${doc.id}','rejected')"
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
                    onclick="updateBooking('${doc.id}','completed')"
                  >
                    Complete
                  </button>

                `

                : ""

              }

            </td>

          </tr>

        `;

      }).join("");

  } catch (error) {

    console.error(error);

    table.innerHTML =
      "<tr><td colspan='8'>Unable to load bookings.</td></tr>";

  }

}


// -----------------------------------------
// UPDATE BOOKING
// -----------------------------------------

async function updateBooking(id, status) {

  try {

    await db
      .collection("bookings")
      .doc(id)
      .update({

        status: status

      });


    loadBookings();

    loadDashboard();

  } catch (error) {

    console.error(error);

    alert(
      "Unable to update booking."
    );

  }

}


// -----------------------------------------
// ESCAPE HTML
// -----------------------------------------

function escapeHTML(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}
