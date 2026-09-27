const firebaseConfig = {
  apiKey: "AIzaSyDxfFRc03z0YLo_q5ynZhEjYR41PzGdiw",
  authDomain: "hospital-buddy-2224d.firebaseapp.com",
  projectId: "hospital-buddy-2224d",
  storageBucket: "hospital-buddy-2224d.firebasestorage.app",
  messagingSenderId: "190919672635",
  appId: "1:190919672635:web:8fe14cc8036fd0cb542d1e",
  measurementId: "G-7I3TZ2EFFR"
};


// Load Firebase
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

    firebase.initializeApp(firebaseConfig);

    const db = firebase.firestore();

    loadHospitalBuddies(db);

    setupBooking(db);

  };

};


// -----------------------------------------
// LOAD AVAILABLE HOSPITAL BUDDIES
// -----------------------------------------

async function loadHospitalBuddies(db) {

  const buddyList =
    document.getElementById("buddyList");


  try {

    const snapshot = await db
      .collection("hospital_buddies")
      .where("status", "==", "available")
      .get();


    if (snapshot.empty) {

      buddyList.innerHTML = `
        <article class="buddy">

          <h3>No Hospital Buddy Available</h3>

          <p>
            No Hospital Buddy is currently available.
            Please try again later.
          </p>

        </article>
      `;

      return;
    }


    buddyList.innerHTML = snapshot.docs
      .map(doc => {

        const buddy = doc.data();


        return `
          <article class="buddy">

            <div style="font-size:35px">
              🤝
            </div>

            <h3>
              ${escapeHTML(
                buddy.name || "Hospital Buddy"
              )}
            </h3>

            <p>
              <b>Qualification:</b>
              ${escapeHTML(
                buddy.qualification ||
                "Not specified"
              )}
            </p>

            <p>
              <b>Language:</b>
              ${escapeHTML(
                Array.isArray(buddy.languages)
                  ? buddy.languages.join(", ")
                  : "Available on request"
              )}
            </p>

            <p>
              <b>Phone:</b>
              Hidden until confirmation
            </p>

            <button
              class="btn"
              type="button"
              onclick="document.getElementById('book').scrollIntoView({behavior:'smooth'})"
            >
              Request This Buddy
            </button>

          </article>
        `;

      })
      .join("");


  } catch (error) {

    console.error(
      "Error loading Hospital Buddies:",
      error
    );


    buddyList.innerHTML = `
      <article class="buddy">

        <h3>
          Unable to Load Hospital Buddies
        </h3>

        <p>
          Please try again later.
        </p>

      </article>
    `;

  }

}



// -----------------------------------------
// BOOKING SYSTEM
// -----------------------------------------

function setupBooking(db) {

  document.getElementById("form").onsubmit =
    async (event) => {

      event.preventDefault();


      const name =
        document.getElementById("name")
          .value.trim();


      const phone =
        document.getElementById("phone")
          .value.trim();


      const language =
        document.getElementById("lang")
          .value;


      const service =
        document.getElementById("service")
          .value;


      const date =
        document.getElementById("date")
          .value;


      const time =
        document.getElementById("time")
          .value;


      const notes =
        document.getElementById("notes")
          .value.trim();


      try {

        // Find available Hospital Buddies

        const buddySnapshot =
          await db
            .collection("hospital_buddies")
            .where("status", "==", "available")
            .get();


        let selectedBuddy = null;


        // First try to match language

        buddySnapshot.forEach(doc => {

          const data = doc.data();


          if (
            !selectedBuddy &&
            Array.isArray(data.languages) &&
            data.languages.includes(language)
          ) {

            selectedBuddy = {
              id: doc.id,
              ...data
            };

          }

        });


        // If no language match,
        // use first available Buddy

        if (
          !selectedBuddy &&
          !buddySnapshot.empty
        ) {

          const doc =
            buddySnapshot.docs[0];


          selectedBuddy = {
            id: doc.id,
            ...doc.data()
          };

        }


        // No Buddy available

        if (!selectedBuddy) {

          showResult(`

            <h2>
              No Hospital Buddy Available
            </h2>

            <p>
              Sorry, there is currently no
              available Hospital Buddy for
              this request.
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


        // Create booking

        const bookingRef =
          await db
            .collection("bookings")
            .add({

              name: name,

              phone: phone,

              language: language,

              service: service,

              date: date,

              time: time,

              requirement: notes,

              buddyId:
                selectedBuddy.id,

              buddyName:
                selectedBuddy.name || "",

              status: "pending",

              createdAt:
                firebase.firestore
                  .FieldValue
                  .serverTimestamp()

            });


        const bookingId =
          "HB-" +
          bookingRef.id
            .substring(0, 7)
            .toUpperCase();


        // Show confirmation

        showResult(`

          <h2>
            Booking Request Submitted
          </h2>


          <p>
            <b>Booking ID:</b>
            ${escapeHTML(bookingId)}
          </p>


          <p>
            Your request has been matched
            with:
          </p>


          <div class="contact">

            <b>Hospital Buddy</b>

            <br>

            ${escapeHTML(
              selectedBuddy.name ||
              "Hospital Buddy"
            )}

            <br>

            <b>Qualification:</b>
            ${escapeHTML(
              selectedBuddy.qualification ||
              "Not specified"
            )}

            <br>

            <b>Buddy ID:</b>
            ${escapeHTML(
              selectedBuddy.id
            )}

            <br>

            <b>Contact:</b>
            Hidden until confirmation

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

            <br>

            <b>Language:</b>
            ${escapeHTML(language)}

          </p>


          <p>

            <b>Status:</b>
            Pending confirmation

          </p>


          <p>

            The Hospital Buddy's phone number
            will be shared only after the request
            is confirmed.

          </p>


          <button
            class="btn"
            onclick="closeModal()"
          >
            Done
          </button>

        `);


        // Clear form

        document.getElementById("form")
          .reset();


      } catch (error) {

        console.error(
          "Booking error:",
          error
        );


        showResult(`

          <h2>
            Booking Error
          </h2>

          <p>
            We could not submit your
            booking request.
          </p>

          <p>
            Please try again later.
          </p>

          <button
            class="btn"
            onclick="closeModal()"
          >
            Close
          </button>

        `);

      }

    };

}



// -----------------------------------------
// MODAL
// -----------------------------------------

function showResult(html) {

  document.getElementById("result")
    .innerHTML = html;


  document.getElementById("modal")
    .classList.remove("hidden");

}


function closeModal() {

  document.getElementById("modal")
    .classList.add("hidden");

}



// -----------------------------------------
// SECURITY
// -----------------------------------------

function escapeHTML(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}
