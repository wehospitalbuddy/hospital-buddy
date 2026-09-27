const firebaseConfig = {
  apiKey: "AIzaSyDxfFRc03z0YLo_q5ynZhEjYR41PzGdiw",
  authDomain: "hospital-buddy-2224d.firebaseapp.com",
  projectId: "hospital-buddy-2224d",
  storageBucket: "hospital-buddy-2224d.firebasestorage.app",
  messagingSenderId: "190919672635",
  appId: "1:190919672635:web:8fe14cc8036fd0cb542d1e",
  measurementId: "G-7I3TZ2EFFR"
};


// --------------------------------------------------
// LOAD FIREBASE
// --------------------------------------------------

const firebaseAppScript = document.createElement("script");

firebaseAppScript.src =
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";

document.head.appendChild(firebaseAppScript);


firebaseAppScript.onload = () => {

  const firestoreScript = document.createElement("script");

  firestoreScript.src =
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";

  document.head.appendChild(firestoreScript);


  firestoreScript.onload = () => {

    firebase.initializeApp(firebaseConfig);

    const db = firebase.firestore();

    window.healthBuddyDB = db;

    loadBuddies(db);

    setupBooking(db);

    setMinimumDate();

  };

};


// --------------------------------------------------
// SET TODAY AS MINIMUM DATE
// --------------------------------------------------

function setMinimumDate() {

  const dateInput = document.getElementById("date");

  if (!dateInput) return;

  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  dateInput.min = `${year}-${month}-${day}`;

}


// --------------------------------------------------
// LOAD AVAILABLE BUDDIES
// --------------------------------------------------

async function loadBuddies(db) {

  const container = document.getElementById("buddies");

  if (!container) return;


  try {

    const snapshot = await db
      .collection("health_buddies")
      .where("status", "==", "available")
      .get();


    if (snapshot.empty) {

      container.innerHTML = `

        <article class="buddy">

          <div class="serviceIcon">
            🤝
          </div>

          <h3>
            No Buddy Available
          </h3>

          <p>
            No Buddy is currently available.
            Please try again later.
          </p>

        </article>

      `;

      return;
    }


    container.innerHTML = snapshot.docs.map(doc => {

      const buddy = doc.data();

      return `

        <article class="buddy">

          <div class="serviceIcon">
            🤝
          </div>

          <h3>
            ${escapeHTML(buddy.name || "Health Buddy")}
          </h3>

          <p>
            <b>Qualification:</b>
            ${escapeHTML(
              buddy.qualification || "Not specified"
            )}
          </p>

          <p>
            <b>Languages:</b>
            ${escapeHTML(
              Array.isArray(buddy.languages)
                ? buddy.languages.join(", ")
                : "Not specified"
            )}
          </p>

          <p class="privateText">
            Phone number is hidden until confirmation.
          </p>

          <button
            type="button"
            class="btn"
            onclick="selectBuddy('${escapeHTML(doc.id)}')"
          >
            Request this Buddy
          </button>

        </article>

      `;

    }).join("");


  } catch (error) {

    console.error(
      "Error loading Buddies:",
      error
    );


    container.innerHTML = `

      <article class="buddy">

        <h3>
          Unable to load Buddies
        </h3>

        <p>
          Please try again later.
        </p>

      </article>

    `;

  }

}


// --------------------------------------------------
// SELECT BUDDY
// --------------------------------------------------

function selectBuddy(buddyId) {

  const bookSection =
    document.getElementById("book");

  if (bookSection) {

    bookSection.scrollIntoView({
      behavior: "smooth"
    });

  }

}


// --------------------------------------------------
// BOOKING SYSTEM
// --------------------------------------------------

function setupBooking(db) {

  const form =
    document.getElementById("form");

  if (!form) return;


  form.onsubmit = async (event) => {

    event.preventDefault();


    const submitButton =
      document.getElementById("submitButton");


    submitButton.disabled = true;

    submitButton.textContent =
      "Finding a Buddy...";


    const name =
      document.getElementById("name").value.trim();

    const phone =
      document.getElementById("phone").value.trim();

    const language =
      document.getElementById("lang").value;

    const service =
      document.getElementById("service").value;

    const date =
      document.getElementById("date").value;

    const time =
      document.getElementById("time").value;

    const notes =
      document.getElementById("notes").value.trim();


    try {

      // --------------------------------------------
      // FIND AVAILABLE BUDDY
      // --------------------------------------------

      const buddySnapshot = await db
        .collection("health_buddies")
        .where("status", "==", "available")
        .get();


      let buddy = null;


      buddySnapshot.forEach(doc => {

        const data = doc.data();


        if (
          !buddy &&
          Array.isArray(data.languages) &&
          data.languages.includes(language)
        ) {

          buddy = {

            id: doc.id,

            ...data

          };

        }

      });


      // If there is no language-specific match,
      // use any available Buddy.

      if (
        !buddy &&
        !buddySnapshot.empty
      ) {

        const doc =
          buddySnapshot.docs[0];

        buddy = {

          id: doc.id,

          ...doc.data()

        };

      }


      // --------------------------------------------
      // NO BUDDY
      // --------------------------------------------

      if (!buddy) {

        showResult(`

          <div class="resultIcon">
            🤝
          </div>

          <h2>
            No Buddy Available
          </h2>

          <p>
            Sorry, there is currently no available
            Buddy for this request.
          </p>

          <button
            class="btn"
            onclick="closeModal()"
          >
            Close
          </button>

        `);

        return;

      }


      // --------------------------------------------
      // CREATE BOOKING
      // --------------------------------------------

      const bookingRef = await db
        .collection("bookings")
        .add({

          name: name,

          phone: phone,

          language: language,

          service: service,

          date: date,

          time: time,

          requirement: notes,

          buddyId: buddy.id,

          buddyName: buddy.name || "",

          status: "pending",

          createdAt:
            firebase.firestore.FieldValue
              .serverTimestamp()

        });


      const bookingId =
        "HB-" +
        bookingRef.id
          .substring(0, 7)
          .toUpperCase();


      // --------------------------------------------
      // SUCCESS
      // --------------------------------------------

      showResult(`

        <div class="resultIcon">
          ✅
        </div>

        <h2>
          Booking Request Submitted
        </h2>

        <div class="bookingId">
          ${escapeHTML(bookingId)}
        </div>

        <p>
          Your request has been submitted
          successfully.
        </p>


        <div class="contact">

          <b>Assigned Buddy</b>

          <br>

          ${escapeHTML(
            buddy.name || "Health Buddy"
          )}

          <br>

          Qualification:
          ${escapeHTML(
            buddy.qualification ||
            "Not specified"
          )}

          <br><br>

          <b>
            Contact:
          </b>

          Hidden until confirmation.

        </div>


        <p>

          <b>Service:</b>
          ${escapeHTML(service)}

          <br>

          <b>Date:</b>
          ${escapeHTML(date)}

          <br>

          <b>Time:</b>
          ${escapeHTML(time)}

        </p>


        <p>

          <b>Status:</b>
          Pending confirmation

        </p>


        <p class="note">

          Please keep your Booking ID:
          <b>${escapeHTML(bookingId)}</b>

        </p>


        <button
          class="btn"
          onclick="closeModal()"
        >
          Done
        </button>

      `);


      form.reset();

      setMinimumDate();


    } catch (error) {

      console.error(
        "Booking error:",
        error
      );


      showResult(`

        <div class="resultIcon">
          ⚠️
        </div>

        <h2>
          Booking Error
        </h2>

        <p>
          We could not submit your booking.
        </p>

        <p>
          Please try again.
        </p>

        <button
          class="btn"
          onclick="closeModal()"
        >
          Close
        </button>

      `);

    } finally {

      submitButton.disabled = false;

      submitButton.textContent =
        "Find & Request a Buddy";

    }

  };

}


// --------------------------------------------------
// MODAL
// --------------------------------------------------

function showResult(html) {

  document.getElementById(
    "result"
  ).innerHTML = html;


  document.getElementById(
    "modal"
  ).classList.remove("hidden");

}


function closeModal() {

  document.getElementById(
    "modal"
  ).classList.add("hidden");

}


// --------------------------------------------------
// SECURITY: ESCAPE HTML
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
