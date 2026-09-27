const firebaseConfig = {

  apiKey:
    "AIzaSyDxfFRc03z0YLo_q5ynZhEjYR41PzGdiw",

  authDomain:
    "hospital-buddy-2224d.firebaseapp.com",

  projectId:
    "hospital-buddy-2224d",

  storageBucket:
    "hospital-buddy-2224d.firebasestorage.app",

  messagingSenderId:
    "190919672635",

  appId:
    "1:190919672635:web:8fe14cc8036fd0cb542d1e",

  measurementId:
    "G-7I3TZ2EFFR"

};


// --------------------------------------------------
// LOAD FIREBASE
// --------------------------------------------------

const appScript =
  document.createElement("script");

appScript.src =
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";

document.head.appendChild(appScript);


appScript.onload = () => {

  const authScript =
    document.createElement("script");

  authScript.src =
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";

  document.head.appendChild(authScript);


  authScript.onload = () => {

    const firestoreScript =
      document.createElement("script");

    firestoreScript.src =
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";

    document.head.appendChild(firestoreScript);


    firestoreScript.onload = () => {

      firebase.initializeApp(firebaseConfig);

      window.auth =
        firebase.auth();

      window.db =
        firebase.firestore();


      auth.onAuthStateChanged(user => {

        if (user) {

          showAdminPanel();

        } else {

          showLogin();

        }

      });


      setupLogin();

      setupBuddyForm();

    };

  };

};


// --------------------------------------------------
// LOGIN
// --------------------------------------------------

function setupLogin() {

  document.getElementById(
    "loginForm"
  ).onsubmit = async event => {

    event.preventDefault();


    const email =
      document.getElementById(
        "adminEmail"
      ).value.trim();


    const password =
      document.getElementById(
        "adminPassword"
      ).value;


    const message =
      document.getElementById(
        "loginMessage"
      );


    message.textContent =
      "Logging in...";


    try {

      await auth.signInWithEmailAndPassword(
        email,
        password
      );


      message.textContent = "";

    } catch (error) {

      console.error(error);

      message.textContent =
        "Login failed. Please check your email and password.";

    }

  };

}


// --------------------------------------------------
// SHOW LOGIN
// --------------------------------------------------

function showLogin() {

  document.getElementById(
    "loginSection"
  ).style.display = "block";


  document.getElementById(
    "adminPanel"
  ).style.display = "none";

}


// --------------------------------------------------
// SHOW ADMIN
// --------------------------------------------------

function showAdminPanel() {

  document.getElementById(
    "loginSection"
  ).style.display = "none";


  document.getElementById(
    "adminPanel"
  ).style.display = "block";


  loadBuddies();

  loadBookings();

}


// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

async function logoutAdmin() {

  await auth.signOut();

}


// --------------------------------------------------
// ADD BUDDY
// --------------------------------------------------

function setupBuddyForm() {

  document.getElementById(
    "buddyForm"
  ).onsubmit = async event => {

    event.preventDefault();


    const name =
      document.getElementById(
        "buddyName"
      ).value.trim();


    const phone =
      document.getElementById(
        "buddyPhone"
      ).value.trim();


    const qualification =
      document.getElementById(
        "buddyQualification"
      ).value.trim();


    const languages =
      document.getElementById(
        "buddyLanguages"
      ).value
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);


    try {

      await db
        .collection("health_buddies")
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


      document.getElementById(
        "buddyForm"
      ).reset();


      document.getElementById(
        "buddyMessage"
      ).textContent =
        "Buddy added successfully.";


      loadBuddies();


    } catch (error) {

      console.error(error);

      document.getElementById(
        "buddyMessage"
      ).textContent =
        "Could not add Buddy.";

    }

  };

}


// --------------------------------------------------
// LOAD BUDDIES
// --------------------------------------------------

async function loadBuddies() {

  const table =
    document.getElementById(
      "buddyTable"
    );


  table.innerHTML =
    "<tr><td colspan='6'>Loading...</td></tr>";


  try {

    const snapshot =
      await db
        .collection("health_buddies")
        .get();


    let available = 0;


    if (snapshot.empty) {

      table.innerHTML =
        "<tr><td colspan='6'>No Buddies found.</td></tr>";

      document.getElementById(
        "availableCount"
      ).textContent = "0";

      return;

    }


    table.innerHTML =
      snapshot.docs.map(doc => {

        const b = doc.data();

        const status =
          b.status || "unavailable";


        if (
          status === "available"
        ) {

          available++;

        }


        return `

          <tr>

            <td>
              ${escapeHTML(
                b.name || ""
              )}
            </td>

            <td>
              ${escapeHTML(
                b.phone || ""
              )}
            </td>

            <td>
              ${escapeHTML(
                b.qualification || ""
              )}
            </td>

            <td>
              ${escapeHTML(
                Array.isArray(b.languages)
                  ? b.languages.join(", ")
                  : ""
              )}
            </td>

            <td>

              <span class="statusBadge ${
                status === "available"
                  ? "available"
                  : "unavailable"
              }">

                ${escapeHTML(status)}

              </span>

            </td>

            <td>

              <button
                class="smallBtn ${
                  status === "available"
                    ? "red"
                    : "green"
                }"
                onclick="toggleBuddyStatus(
                  '${doc.id}',
                  '${status}'
                )"
              >

                ${
                  status === "available"
                    ? "Make Unavailable"
                    : "Make Available"
                }

              </button>


              <button
                class="smallBtn red"
                onclick="deleteBuddy(
                  '${doc.id}'
                )"
              >
                Delete
              </button>

            </td>

          </tr>

        `;

      }).join("");


    document.getElementById(
      "availableCount"
    ).textContent =
      available;


  } catch (error) {

    console.error(error);

    table.innerHTML =
      "<tr><td colspan='6'>Could not load Buddies.</td></tr>";

  }

}


// --------------------------------------------------
// CHANGE BUDDY STATUS
// --------------------------------------------------

async function toggleBuddyStatus(
  id,
  currentStatus
) {

  const newStatus =
    currentStatus === "available"
      ? "unavailable"
      : "available";


  try {

    await db
      .collection("health_buddies")
      .doc(id)
      .update({

        status: newStatus

      });


    loadBuddies();


  } catch (error) {

    console.error(error);

    alert(
      "Could not change Buddy status."
    );

  }

}


// --------------------------------------------------
// DELETE BUDDY
// --------------------------------------------------

async function deleteBuddy(id) {

  const confirmDelete =
    confirm(
      "Delete this Buddy permanently?"
    );


  if (!confirmDelete) return;


  try {

    await db
      .collection("health_buddies")
      .doc(id)
      .delete();


    loadBuddies();


  } catch (error) {

    console.error(error);

    alert(
      "Could not delete Buddy."
    );

  }

}


// --------------------------------------------------
// LOAD BOOKINGS
// --------------------------------------------------

async function loadBookings() {

  const table =
    document.getElementById(
      "bookingTable"
    );


  table.innerHTML =
    "<tr><td colspan='8'>Loading...</td></tr>";


  try {

    const snapshot =
      await db
        .collection("bookings")
        .orderBy(
          "createdAt",
          "desc"
        )
        .get();


    let pending = 0;

    let confirmed = 0;

    let completed = 0;


    if (snapshot.empty) {

      table.innerHTML =
        "<tr><td colspan='8'>No bookings yet.</td></tr>";

      updateBookingCounts(
        0,
        0,
        0
      );

      return;

    }


    table.innerHTML =
      snapshot.docs.map(doc => {

        const b =
          doc.data();


        const status =
          b.status || "pending";


        if (
          status === "pending"
        ) pending++;


        if (
          status === "confirmed"
        ) confirmed++;


        if (
          status === "completed"
        ) completed++;


        const bookingId =
          "HB-" +
          doc.id
            .substring(0, 7)
            .toUpperCase();


        return `

          <tr>

            <td>
              <b>
                ${bookingId}
              </b>
            </td>


            <td>
              ${escapeHTML(
                b.name || ""
              )}
              <br>
              <small>
                ${escapeHTML(
                  b.language || ""
                )}
              </small>
            </td>


            <td>
              ${escapeHTML(
                b.phone || ""
              )}
            </td>


            <td>
              ${escapeHTML(
                b.service || ""
              )}
            </td>


            <td>
              ${escapeHTML(
                b.date || ""
              )}
              <br>
              ${escapeHTML(
                b.time || ""
              )}
            </td>


            <td>
              ${escapeHTML(
                b.buddyName || ""
              )}
            </td>


            <td>

              <span class="statusBadge ${status}">

                ${escapeHTML(status)}

              </span>

            </td>


            <td>

              ${
                status === "pending"
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
                status === "confirmed"
                ? `

                  <button
                    class="smallBtn blue"
                    onclick="updateBooking(
                      '${doc.id}',
                      'completed'
                    )"
                  >
                    Completed
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

          </tr>

        `;

      }).join("");


    updateBookingCounts(
      pending,
      confirmed,
      completed
    );


  } catch (error) {

    console.error(error);

    table.innerHTML =
      "<tr><td colspan='8'>Could not load bookings.</td></tr>";

  }

}


// --------------------------------------------------
// UPDATE BOOKING
// --------------------------------------------------

async function updateBooking(
  bookingId,
  newStatus
) {

  try {

    await db
      .collection("bookings")
      .doc(bookingId)
      .update({

        status: newStatus,

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      });


    loadBookings();


  } catch (error) {

    console.error(error);

    alert(
      "Could not update booking."
    );

  }

}


// --------------------------------------------------
// COUNTS
// --------------------------------------------------

function updateBookingCounts(
  pending,
  confirmed,
  completed
) {

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

}


// --------------------------------------------------
// ESCAPE HTML
// --------------------------------------------------

function escapeHTML(value) {

  return String(value)

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
