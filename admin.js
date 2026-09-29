// =====================================================
// HOSPITAL BUDDY — ADMIN CONTROL PANEL
// Complete admin.js
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyDxfRCo3z0YLo_q5yrhnZHejYR41PzGDiw",
  authDomain: "hospital-buddy-2224d.firebaseapp.com",
  projectId: "hospital-buddy-2224d",
  storageBucket: "hospital-buddy-2224d.firebasestorage.app",
  messagingSenderId: "190919672635",
  appId: "1:190919672635:web:8fe14cc8036fd0cb542d1e",
  measurementId: "G-Z13TZ2EFFR"
};


// =====================================================
// FIREBASE INITIALIZATION
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

      startAdminSystem();

    };

  };

};


// =====================================================
// START ADMIN SYSTEM
// =====================================================

function startAdminSystem() {

  const loginForm =
    document.getElementById("loginForm");

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      loginAdmin
    );

  }


  auth.onAuthStateChanged(
    async user => {

      if (!user) {

        showLogin();

        return;

      }


      const allowed =
        await verifyAdmin(user);


      if (!allowed) {

        await auth.signOut();

        showLogin();

        showLoginMessage(
          "This account does not have administrator access.",
          true
        );

        return;

      }


      showAdminPanel();

      await loadDashboard();
      await loadBuddies();
      await loadBookings();

    }
  );

}


// =====================================================
// ADMIN LOGIN
// =====================================================

async function loginAdmin(event) {

  event.preventDefault();

  const email =
    document
      .getElementById("adminEmail")
      .value
      .trim();


  const password =
    document
      .getElementById("adminPassword")
      .value;


  showLoginMessage(
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
      "Login error:",
      error
    );


    let message =
      "Unable to sign in.";


    if (
      error.code === "auth/invalid-credential"
    ) {

      message =
        "Incorrect email or password.";

    }

    else if (
      error.code === "auth/user-not-found"
    ) {

      message =
        "No account found with this email.";

    }

    else if (
      error.code === "auth/wrong-password"
    ) {

      message =
        "Incorrect password.";

    }

    else if (
      error.code === "auth/invalid-email"
    ) {

      message =
        "Please enter a valid email address.";

    }


    showLoginMessage(
      message,
      true
    );

  }

}


// =====================================================
// VERIFY ADMIN
// =====================================================

async function verifyAdmin(user) {

  try {

    const adminDoc =
      await db
        .collection("admins")
        .doc(user.uid)
        .get();


    return adminDoc.exists;

  } catch (error) {

    console.error(
      "Admin verification error:",
      error
    );

    return false;

  }

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
// SHOW LOGIN
// =====================================================

function showLogin() {

  const loginSection =
    document.getElementById("loginSection");


  const adminPanel =
    document.getElementById("adminPanel");


  if (loginSection) {

    loginSection.style.display =
      "block";

  }


  if (adminPanel) {

    adminPanel.style.display =
      "none";

  }

}


// =====================================================
// SHOW ADMIN PANEL
// =====================================================

function showAdminPanel() {

  const loginSection =
    document.getElementById("loginSection");


  const adminPanel =
    document.getElementById("adminPanel");


  if (loginSection) {

    loginSection.style.display =
      "none";

  }


  if (adminPanel) {

    adminPanel.style.display =
      "block";

  }

}


// =====================================================
// LOGIN MESSAGE
// =====================================================

function showLoginMessage(
  message,
  error
) {

  const element =
    document.getElementById("loginMessage");


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
// DASHBOARD
// =====================================================

async function loadDashboard() {

  try {

    const buddySnapshot =
      await db
        .collection("hospital_buddies")
        .get();


    const bookingSnapshot =
      await db
        .collection("bookings")
        .get();


    let available = 0;
    let pending = 0;
    let confirmed = 0;
    let completed = 0;


    buddySnapshot.forEach(
      doc => {

        const data =
          doc.data();


        if (
          data.status === "available"
        ) {

          available++;

        }

      }
    );


    bookingSnapshot.forEach(
      doc => {

        const data =
          doc.data();


        if (
          data.status === "pending"
        ) {

          pending++;

        }

        else if (
          data.status === "confirmed"
        ) {

          confirmed++;

        }

        else if (
          data.status === "completed"
        ) {

          completed++;

        }

      }
    );


    setText(
      "availableCount",
      available
    );


    setText(
      "pendingCount",
      pending
    );


    setText(
      "confirmedCount",
      confirmed
    );


    setText(
      "completedCount",
      completed
    );


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


// =====================================================
// LOAD BUDDIES
// =====================================================

async function loadBuddies() {

  const table =
    document.getElementById("buddyTable");


  if (!table) {
    return;
  }


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
            No Hospital Buddies found.
          </td>
        </tr>
      `;

      return;

    }


    let html = "";


    snapshot.forEach(
      doc => {

        const buddy =
          doc.data();


        const languages =
          Array.isArray(buddy.languages)
            ? buddy.languages.join(", ")
            : "";


        const status =
          buddy.status || "pending";


        let statusClass =
          "pending";


        if (status === "available") {
          statusClass = "available";
        }

        else if (status === "unavailable") {
          statusClass = "unavailable";
        }

        else if (status === "approved") {
          statusClass = "available";
        }


        let actionButtons = "";


        if (status === "pending") {

          actionButtons += `
            <button
              class="smallBtn green"
              type="button"
              onclick="approveBuddy('${escapeJS(doc.id)}')"
            >
              Approve
            </button>
          `;

        }

        else if (status === "available") {

          actionButtons += `
            <button
              class="smallBtn blue"
              type="button"
              onclick="toggleBuddyStatus(
                '${escapeJS(doc.id)}',
                'available'
              )"
            >
              Set Unavailable
            </button>
          `;

        }

        else if (status === "unavailable") {

          actionButtons += `
            <button
              class="smallBtn blue"
              type="button"
              onclick="toggleBuddyStatus(
                '${escapeJS(doc.id)}',
                'unavailable'
              )"
            >
              Set Available
            </button>
          `;

        }


        actionButtons += `
          <button
            class="smallBtn red"
            type="button"
            onclick="deleteBuddy('${escapeJS(doc.id)}')"
          >
            Delete
          </button>
        `;


        html += `

          <tr>

            <td>
              <strong>
                ${escapeHTML(
                  buddy.name ||
                  "Hospital Buddy"
                )}
              </strong>

              ${
                buddy.email
                  ? `
                    <br>
                    <small>
                      ${escapeHTML(
                        buddy.email
                      )}
                    </small>
                  `
                  : ""
              }

            </td>


            <td>
              ${escapeHTML(
                buddy.phone ||
                "Not provided"
              )}
            </td>


            <td>
              ${escapeHTML(
                buddy.qualification ||
                "Not specified"
              )}
            </td>


            <td>
              ${escapeHTML(
                languages ||
                "Not specified"
              )}
            </td>


            <td>

              <span
                class="statusBadge ${statusClass}"
              >
                ${escapeHTML(status)}
              </span>

            </td>


            <td>

              ${actionButtons}

            </td>

          </tr>

        `;

      }
    );


    table.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Load buddies error:",
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
// APPROVE BUDDY
// =====================================================

async function approveBuddy(
  buddyId
) {

  const confirmed =
    confirm(
      "Approve this Hospital Buddy registration?"
    );


  if (!confirmed) {
    return;
  }


  try {

    await db
      .collection("hospital_buddies")
      .doc(buddyId)
      .update({

        status:
          "available",

        approved:
          true,

        approvedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp(),

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      });


    await loadBuddies();
    await loadDashboard();


  } catch (error) {

    console.error(
      "Approve Buddy error:",
      error
    );


    alert(
      "Unable to approve this Buddy."
    );

  }

}


// =====================================================
// TOGGLE BUDDY STATUS
// =====================================================

async function toggleBuddyStatus(
  buddyId,
  currentStatus
) {

  const newStatus =
    currentStatus === "available"
      ? "unavailable"
      : "available";


  try {

    await db
      .collection("hospital_buddies")
      .doc(buddyId)
      .update({

        status:
          newStatus,

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      });


    await loadBuddies();
    await loadDashboard();


  } catch (error) {

    console.error(
      "Buddy status error:",
      error
    );


    alert(
      "Unable to change Buddy status."
    );

  }

}


// =====================================================
// DELETE BUDDY
// =====================================================

async function deleteBuddy(
  buddyId
) {

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


    await loadBuddies();
    await loadDashboard();


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


  if (!table) {
    return;
  }


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
            No booking requests found.
          </td>
        </tr>
      `;

      return;

    }


    const buddies =
      await getBuddyList();


    const docs =
      snapshot.docs.slice();


    docs.sort(
      (a, b) => {

        const aTime =
          getTimestampMillis(
            a.data().createdAt
          );


        const bTime =
          getTimestampMillis(
            b.data().createdAt
          );


        return bTime - aTime;

      }
    );


    let html = "";


    docs.forEach(
      doc => {

        html +=
          renderBookingRow(
            doc.id,
            doc.data(),
            buddies
          );

      }
    );


    table.innerHTML =
      html;


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
// RENDER BOOKING ROW
// =====================================================

function renderBookingRow(
  bookingId,
  booking,
  buddies
) {

  const status =
    booking.status || "pending";


  const statusClass =
    getStatusClass(status);


  const displayBookingId =
    booking.bookingId ||
    (
      "HB-" +
      bookingId
        .substring(0, 7)
        .toUpperCase()
    );


  const assignedBuddy =
    booking.buddyName ||
    "Not assigned";


  const dateTime =
    [
      booking.date || "",
      booking.time || ""
    ]
      .filter(Boolean)
      .join(" • ");


  let actions = "";


  if (status === "pending") {

    actions += `

      <button
        class="smallBtn green"
        type="button"
        onclick="confirmBooking(
          '${escapeJS(bookingId)}'
        )"
      >
        Confirm
      </button>


      <button
        class="smallBtn red"
        type="button"
        onclick="rejectBooking(
          '${escapeJS(bookingId)}'
        )"
      >
        Reject
      </button>

    `;

  }


  if (status === "confirmed") {

    actions += `

      <button
        class="smallBtn blue"
        type="button"
        onclick="completeBooking(
          '${escapeJS(bookingId)}'
        )"
      >
        Complete
      </button>


      <button
        class="smallBtn red"
        type="button"
        onclick="cancelBooking(
          '${escapeJS(bookingId)}'
        )"
      >
        Cancel
      </button>

    `;

  }


  if (
    status === "pending" ||
    status === "confirmed"
  ) {

    actions += `

      <br>

      <select
        onchange="reassignBooking(
          '${escapeJS(bookingId)}',
          this.value
        )"
        style="
          margin-top:6px;
          padding:7px;
          border-radius:7px;
          border:1px solid #ccc;
        "
      >

        <option value="">
          ${
            booking.buddyId
              ? "Reassign Buddy"
              : "Assign Buddy"
          }
        </option>

        ${buddies
          .filter(
            buddy =>
              buddy.status === "available" ||
              buddy.id === booking.buddyId
          )
          .map(
            buddy => `

              <option
                value="${escapeHTML(buddy.id)}"
                ${
                  booking.buddyId === buddy.id
                    ? "selected"
                    : ""
                }
              >
                ${escapeHTML(
                  buddy.name ||
                  "Hospital Buddy"
                )}
              </option>

            `
          )
          .join("")}

      </select>

    `;

  }


  return `

    <tr>

      <td>

        <strong>
          ${escapeHTML(
            displayBookingId
          )}
        </strong>

      </td>


      <td>

        <strong>
          ${escapeHTML(
            booking.name ||
            "Not provided"
          )}
        </strong>

        ${
          booking.email
            ? `
              <br>
              <small>
                ${escapeHTML(
                  booking.email
                )}
              </small>
            `
            : ""
        }

      </td>


      <td>

        ${
          status === "confirmed" ||
          status === "completed"

            ? escapeHTML(
                booking.phone ||
                "Not provided"
              )

            : `
              <span class="privateText">
                Hidden until confirmation
              </span>
            `
        }

      </td>


      <td>

        ${escapeHTML(
          booking.service ||
          "Not specified"
        )}

        ${
          booking.language
            ? `
              <br>
              <small>
                Language:
                ${escapeHTML(
                  booking.language
                )}
              </small>
            `
            : ""
        }

      </td>


      <td>

        ${escapeHTML(
          dateTime ||
          "Not specified"
        )}

        ${
          booking.requirement
            ? `
              <br><br>
              <small>
                <b>Requirement:</b>
                ${escapeHTML(
                  booking.requirement
                )}
              </small>
            `
            : ""
        }

      </td>


      <td>

        <strong>
          ${escapeHTML(
            assignedBuddy
          )}
        </strong>


        ${
          booking.buddyId
            ? `
              <br>
              <small>
                ID:
                ${escapeHTML(
                  booking.buddyId
                )}
              </small>
            `
            : ""
        }


        ${
          (
            status === "confirmed" ||
            status === "completed"
          ) &&
          booking.buddyPhone

            ? `
              <br>
              <small>
                📞
                ${escapeHTML(
                  booking.buddyPhone
                )}
              </small>
            `

            : ""
        }

      </td>


      <td>

        <span
          class="statusBadge ${statusClass}"
        >
          ${escapeHTML(status)}
        </span>

      </td>


      <td>

        ${actions}

      </td>

    </tr>

  `;

}


// =====================================================
// GET BUDDY LIST
// =====================================================

async function getBuddyList() {

  const snapshot =
    await db
      .collection("hospital_buddies")
      .get();


  return snapshot.docs.map(
    doc => ({

      id:
        doc.id,

      ...doc.data()

    })
  );

}


// =====================================================
// REASSIGN / ASSIGN BOOKING
// =====================================================

async function reassignBooking(
  bookingId,
  buddyId
) {

  if (!buddyId) {
    return;
  }


  try {

    const bookingRef =
      db
        .collection("bookings")
        .doc(bookingId);


    const bookingSnapshot =
      await bookingRef.get();


    if (!bookingSnapshot.exists) {

      alert(
        "Booking not found."
      );

      return;

    }


    const booking =
      bookingSnapshot.data();


    const buddySnapshot =
      await db
        .collection("hospital_buddies")
        .doc(buddyId)
        .get();


    if (!buddySnapshot.exists) {

      alert(
        "Hospital Buddy not found."
      );

      return;

    }


    const buddy =
      buddySnapshot.data();


    // If another Buddy was previously assigned
    // and booking is confirmed, release them.
    if (
      booking.buddyId &&
      booking.buddyId !== buddyId &&
      booking.status === "confirmed"
    ) {

      try {

        await db
          .collection("hospital_buddies")
          .doc(booking.buddyId)
          .update({

            status:
              "available",

            updatedAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp()

          });

      } catch (releaseError) {

        console.error(
          "Unable to release previous Buddy:",
          releaseError
        );

      }

    }


    await bookingRef.update({

      buddyId:
        buddySnapshot.id,

      buddyName:
        buddy.name || "",

      buddyPhone:
        buddy.phone || "",

      updatedAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp()

    });


    // A confirmed booking occupies the Buddy.
    if (
      booking.status === "confirmed"
    ) {

      await db
        .collection("hospital_buddies")
        .doc(buddySnapshot.id)
        .update({

          status:
            "unavailable",

          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()

        });

    }


    await loadBookings();
    await loadBuddies();
    await loadDashboard();


  } catch (error) {

    console.error(
      "Reassign booking error:",
      error
    );


    alert(
      "Unable to assign Hospital Buddy."
    );

  }

}


// =====================================================
// CONFIRM BOOKING
// =====================================================

async function confirmBooking(
  bookingId
) {

  try {

    const bookingRef =
      db
        .collection("bookings")
        .doc(bookingId);


    const bookingSnapshot =
      await bookingRef.get();


    if (!bookingSnapshot.exists) {

      alert(
        "Booking no longer exists."
      );

      return;

    }


    const booking =
      bookingSnapshot.data();


    if (!booking.buddyId) {

      alert(
        "Please assign a Hospital Buddy before confirming."
      );

      return;

    }


    const buddySnapshot =
      await db
        .collection("hospital_buddies")
        .doc(booking.buddyId)
        .get();


    if (!buddySnapshot.exists) {

      alert(
        "Assigned Hospital Buddy was not found."
      );

      return;

    }


    const buddy =
      buddySnapshot.data();


    if (
      buddy.status !== "available"
    ) {

      alert(
        "The assigned Hospital Buddy is not available."
      );

      return;

    }


    await bookingRef.update({

      status:
        "confirmed",

      buddyName:
        buddy.name || "",

      buddyPhone:
        buddy.phone || "",

      confirmedAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp(),

      updatedAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp()

    });


    await db
      .collection("hospital_buddies")
      .doc(booking.buddyId)
      .update({

        status:
          "unavailable",

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      });


    await loadBookings();
    await loadBuddies();
    await loadDashboard();


  } catch (error) {

    console.error(
      "Confirm booking error:",
      error
    );


    alert(
      "Unable to confirm booking."
    );

  }

}


// =====================================================
// REJECT BOOKING
// =====================================================

async function rejectBooking(
  bookingId
) {

  const confirmed =
    confirm(
      "Reject this booking request?"
    );


  if (!confirmed) {
    return;
  }


  try {

    await db
      .collection("bookings")
      .doc(bookingId)
      .update({

        status:
          "rejected",

        rejectedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp(),

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      });


    await loadBookings();
    await loadDashboard();


  } catch (error) {

    console.error(
      "Reject booking error:",
      error
    );


    alert(
      "Unable to reject booking."
    );

  }

}


// =====================================================
// COMPLETE BOOKING
// =====================================================

async function completeBooking(
  bookingId
) {

  const confirmed =
    confirm(
      "Mark this booking as completed?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const bookingRef =
      db
        .collection("bookings")
        .doc(bookingId);


    const bookingSnapshot =
      await bookingRef.get();


    if (!bookingSnapshot.exists) {

      alert(
        "Booking not found."
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


    if (booking.buddyId) {

      await db
        .collection("hospital_buddies")
        .doc(booking.buddyId)
        .update({

          status:
            "available",

          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()

        });

    }


    await loadBookings();
    await loadBuddies();
    await loadDashboard();


  } catch (error) {

    console.error(
      "Complete booking error:",
      error
    );


    alert(
      "Unable to complete booking."
    );

  }

}


// =====================================================
// CANCEL BOOKING
// =====================================================

async function cancelBooking(
  bookingId
) {

  const confirmed =
    confirm(
      "Cancel this confirmed booking?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const bookingRef =
      db
        .collection("bookings")
        .doc(bookingId);


    const bookingSnapshot =
      await bookingRef.get();


    if (!bookingSnapshot.exists) {

      alert(
        "Booking not found."
      );

      return;

    }


    const booking =
      bookingSnapshot.data();


    await bookingRef.update({

      status:
        "cancelled",

      cancelledAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp(),

      updatedAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp()

    });


    if (booking.buddyId) {

      await db
        .collection("hospital_buddies")
        .doc(booking.buddyId)
        .update({

          status:
            "available",

          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()

        });

    }


    await loadBookings();
    await loadBuddies();
    await loadDashboard();


  } catch (error) {

    console.error(
      "Cancel booking error:",
      error
    );


    alert(
      "Unable to cancel booking."
    );

  }

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
// SET TEXT
// =====================================================

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

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
// JAVASCRIPT STRING SECURITY
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


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.loginAdmin =
  loginAdmin;

window.logoutAdmin =
  logoutAdmin;

window.approveBuddy =
  approveBuddy;

window.toggleBuddyStatus =
  toggleBuddyStatus;

window.deleteBuddy =
  deleteBuddy;

window.confirmBooking =
  confirmBooking;

window.rejectBooking =
  rejectBooking;

window.reassignBooking =
  reassignBooking;

window.completeBooking =
  completeBooking;

window.cancelBooking =
  cancelBooking;
