// =====================================================
// HOSPITAL BUDDY
// MAIN JAVASCRIPT
// Firebase + Authentication + Patients + Bookings
// =====================================================


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

  apiKey: "AIzaSyDxfFRc03z0YLo_q5ynZhEjYR41PzGdiw",

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


// =====================================================
// LOAD FIREBASE APP
// =====================================================

const firebaseAppScript =
  document.createElement("script");

firebaseAppScript.src =
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";

firebaseAppScript.onload = loadFirebaseAuth;

document.head.appendChild(firebaseAppScript);


// =====================================================
// LOAD FIREBASE AUTHENTICATION
// =====================================================

function loadFirebaseAuth() {

  const authScript =
    document.createElement("script");

  authScript.src =
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";

  authScript.onload = loadFirebaseFirestore;

  document.head.appendChild(authScript);

}


// =====================================================
// LOAD FIRESTORE
// =====================================================

function loadFirebaseFirestore() {

  const firestoreScript =
    document.createElement("script");

  firestoreScript.src =
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";

  firestoreScript.onload = initializeFirebase;

  document.head.appendChild(firestoreScript);

}


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

function initializeFirebase() {

  try {

    if (!firebase.apps.length) {

      firebase.initializeApp(firebaseConfig);

    }


    const db =
      firebase.firestore();


    const auth =
      firebase.auth();


    // -------------------------------------------------
    // AUTH STATE
    // -------------------------------------------------

    auth.onAuthStateChanged(
      async function (user) {

        if (user) {

          console.log(
            "Patient logged in:",
            user.uid
          );


          await loadPatientProfile(
            db,
            user
          );


          updatePatientUI(
            user
          );

        } else {

          console.log(
            "No patient currently logged in."
          );


          updatePatientUI(
            null
          );

        }

      }
    );


    // -------------------------------------------------
    // LOAD AVAILABLE BUDDIES
    // -------------------------------------------------

    loadHospitalBuddies(db);


    // -------------------------------------------------
    // SETUP BOOKING
    // -------------------------------------------------

    setupBooking(
      db,
      auth
    );


  } catch (error) {

    console.error(
      "Firebase initialization error:",
      error
    );

  }

}


// =====================================================
// PATIENT AUTHENTICATION UI
// =====================================================

function updatePatientUI(user) {

  const form =
    document.getElementById("form");


  if (!form) {
    return;
  }


  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );


  if (!submitButton) {
    return;
  }


  if (user) {

    submitButton.disabled =
      false;


    submitButton.innerHTML =
      "🤝 Find & Request a Hospital Buddy";


  } else {

    submitButton.disabled =
      false;


    submitButton.innerHTML =
      "🔐 Login Required to Book";

  }

}


// =====================================================
// LOAD / CREATE PATIENT PROFILE
// =====================================================

async function loadPatientProfile(
  db,
  user
) {

  try {

    const patientRef =
      db
        .collection("patients")
        .doc(user.uid);


    const patientDoc =
      await patientRef.get();


    // -------------------------------------------------
    // PATIENT ALREADY EXISTS
    // -------------------------------------------------

    if (patientDoc.exists) {

      console.log(
        "Patient profile found:",
        patientDoc.data()
      );


      return;

    }


    // -------------------------------------------------
    // CREATE PATIENT PROFILE
    // -------------------------------------------------

    await patientRef.set({

      name:
        user.displayName ||
        "Patient",

      email:
        user.email || "",

      phone:
        user.phoneNumber || "",

      role:
        "patient",

      createdAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp()

    });


    console.log(
      "Patient profile created."
    );


  } catch (error) {

    console.error(
      "Patient profile error:",
      error
    );

  }

}


// =====================================================
// LOAD AVAILABLE HOSPITAL BUDDIES
// =====================================================

async function loadHospitalBuddies(db) {

  const buddyList =
    document.getElementById(
      "buddyList"
    );


  if (!buddyList) {
    return;
  }


  try {

    const snapshot =
      await db
        .collection(
          "hospital_buddies"
        )
        .where(
          "status",
          "==",
          "available"
        )
        .get();


    // -------------------------------------------------
    // NO BUDDIES
    // -------------------------------------------------

    if (snapshot.empty) {

      buddyList.innerHTML = `

        <article class="buddy">

          <div class="resultIcon">
            🤝
          </div>

          <h3>
            No Hospital Buddy Available
          </h3>

          <p>
            No Hospital Buddy is currently
            available. Please try again later.
          </p>

        </article>

      `;

      return;

    }


    // -------------------------------------------------
    // DISPLAY BUDDIES
    // -------------------------------------------------

    buddyList.innerHTML =
      snapshot.docs
        .map(function (doc) {

          const buddy =
            doc.data();


          const languages =
            Array.isArray(
              buddy.languages
            )
              ? buddy.languages.join(", ")
              : "Available on request";


          return `

            <article class="buddy">

              <div class="resultIcon">
                🤝
              </div>

              <h3>
                ${escapeHTML(
                  buddy.name ||
                  "Hospital Buddy"
                )}
              </h3>

              <p>

                <b>
                  Qualification:
                </b>

                ${escapeHTML(
                  buddy.qualification ||
                  "Not specified"
                )}

              </p>


              <p>

                <b>
                  Languages:
                </b>

                ${escapeHTML(
                  languages
                )}

              </p>


              <p class="privateText">

                <b>
                  Phone:
                </b>

                Hidden until confirmation

              </p>


              <button
                class="btn"
                type="button"
                onclick="document.getElementById('book').scrollIntoView({behavior:'smooth'})"
              >

                Request This Hospital Buddy

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

        <div class="resultIcon">
          ⚠️
        </div>

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


// =====================================================
// BOOKING SYSTEM
// =====================================================

function setupBooking(
  db,
  auth
) {

  const form =
    document.getElementById(
      "form"
    );


  if (!form) {
    return;
  }


  form.onsubmit =
    async function (event) {

      event.preventDefault();


      // -------------------------------------------------
      // CHECK PATIENT LOGIN
      // -------------------------------------------------

      const user =
        auth.currentUser;


      if (!user) {

        showResult(`

          <div class="resultIcon">
            🔐
          </div>

          <h2>
            Patient Login Required
          </h2>

          <p>
            Please login to your Hospital Buddy
            patient account before submitting
            a booking request.
          </p>

          <button
            class="btn"
            type="button"
            onclick="closeModal()"
          >
            Close
          </button>

        `);

        return;

      }


      // -------------------------------------------------
      // GET FORM VALUES
      // -------------------------------------------------

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


      const state =
        document
          .getElementById("state")
          .value;


      const district =
        document
          .getElementById("district")
          .value;


      const hospital =
        document
          .getElementById("hospital")
          .value;


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


      // -------------------------------------------------
      // BASIC VALIDATION
      // -------------------------------------------------

      if (
        !name ||
        !phone ||
        !state ||
        !district ||
        !hospital ||
        !language ||
        !service ||
        !date ||
        !time
      ) {

        showResult(`

          <div class="resultIcon">
            ⚠️
          </div>

          <h2>
            Missing Information
          </h2>

          <p>
            Please complete all required
            fields before submitting.
          </p>

          <button
            class="btn"
            type="button"
            onclick="closeModal()"
          >
            Close
          </button>

        `);

        return;

      }


      // -------------------------------------------------
      // DISABLE BUTTON
      // -------------------------------------------------

      const submitButton =
        form.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.innerHTML =
          "⏳ Finding a Hospital Buddy...";

      }


      try {

        // =================================================
        // FIND AVAILABLE BUDDIES
        // =================================================

        const buddySnapshot =
          await db
            .collection(
              "hospital_buddies"
            )
            .where(
              "status",
              "==",
              "available"
            )
            .get();


        let selectedBuddy =
          null;


        // =================================================
        // FIRST TRY LANGUAGE MATCH
        // =================================================

        buddySnapshot.forEach(
          function (doc) {

            const data =
              doc.data();


            if (
              !selectedBuddy &&
              Array.isArray(
                data.languages
              ) &&
              data.languages.includes(
                language
              )
            ) {

              selectedBuddy = {

                id:
                  doc.id,

                ...data

              };

            }

          }
        );


        // =================================================
        // IF NO LANGUAGE MATCH
        // USE FIRST AVAILABLE BUDDY
        // =================================================

        if (
          !selectedBuddy &&
          !buddySnapshot.empty
        ) {

          const doc =
            buddySnapshot.docs[0];


          selectedBuddy = {

            id:
              doc.id,

            ...doc.data()

          };

        }


        // =================================================
        // NO BUDDY AVAILABLE
        // =================================================

        if (!selectedBuddy) {

          showResult(`

            <div class="resultIcon">
              🤝
            </div>

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
              type="button"
              onclick="closeModal()"
            >
              Close
            </button>

          `);


          resetSubmitButton(
            submitButton
          );


          return;

        }


        // =================================================
        // CREATE BOOKING
        // =================================================

        const bookingRef =
          await db
            .collection("bookings")
            .add({

              // -------------------------------------------
              // PATIENT INFORMATION
              // -------------------------------------------

              patientId:
                user.uid,

              patientEmail:
                user.email || "",

              name:
                name,

              phone:
                phone,


              // -------------------------------------------
              // LOCATION
              // -------------------------------------------

              state:
                state,

              district:
                district,

              hospital:
                hospital,


              // -------------------------------------------
              // REQUEST
              // -------------------------------------------

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


              // -------------------------------------------
              // ASSIGNED BUDDY
              // -------------------------------------------

              buddyId:
                selectedBuddy.id,

              buddyName:
                selectedBuddy.name || "",


              // -------------------------------------------
              // BOOKING STATUS
              // -------------------------------------------

              status:
                "pending",

              createdAt:
                firebase.firestore
                  .FieldValue
                  .serverTimestamp()

            });


        // =================================================
        // BOOKING ID
        // =================================================

        const bookingId =
          "HB-" +
          bookingRef.id
            .substring(0, 7)
            .toUpperCase();


        // =================================================
        // SAVE DISPLAY BOOKING ID
        // =================================================

        await bookingRef.update({

          bookingId:
            bookingId

        });


        // =================================================
        // SHOW SUCCESS
        // =================================================

        showResult(`

          <div class="resultIcon">
            ✅
          </div>

          <h2>
            Booking Request Submitted
          </h2>


          <div class="bookingId">

            Booking ID:
            ${escapeHTML(
              bookingId
            )}

          </div>


          <p>
            Your request has been matched with:
          </p>


          <div class="contact">

            <b>
              Hospital Buddy
            </b>

            <br><br>


            <b>
              Name:
            </b>

            ${escapeHTML(
              selectedBuddy.name ||
              "Hospital Buddy"
            )}

            <br>


            <b>
              Qualification:
            </b>

            ${escapeHTML(
              selectedBuddy.qualification ||
              "Not specified"
            )}

            <br>


            <b>
              Buddy ID:
            </b>

            ${escapeHTML(
              selectedBuddy.id
            )}

            <br>


            <b>
              Contact:
            </b>

            Hidden until confirmation

          </div>


          <p>

            <b>
              Hospital:
            </b>

            ${escapeHTML(
              hospital
            )}

            <br>


            <b>
              Service:
            </b>

            ${escapeHTML(
              service
            )}

            <br>


            <b>
              Date:
            </b>

            ${escapeHTML(
              date
            )}

            <br>


            <b>
              Time:
            </b>

            ${escapeHTML(
              time
            )}

            <br>


            <b>
              Language:
            </b>

            ${escapeHTML(
              language
            )}

          </p>


          <p>

            <b>
              Status:
            </b>

            Pending confirmation

          </p>


          <p class="privateText">

            The Hospital Buddy's phone number
            will be shared only after the request
            is confirmed.

          </p>


          <button
            class="btn"
            type="button"
            onclick="closeModal()"
          >

            Done

          </button>

        `);


        // =================================================
        // RESET FORM
        // =================================================

        form.reset();


        // Reset district and hospital
        const districtSelect =
          document.getElementById(
            "district"
          );

        const hospitalSelect =
          document.getElementById(
            "hospital"
          );


        if (districtSelect) {

          districtSelect.innerHTML =
            '<option value="">Select District</option>';

          districtSelect.disabled =
            true;

        }


        if (hospitalSelect) {

          hospitalSelect.innerHTML =
            '<option value="">Select Hospital</option>';

          hospitalSelect.disabled =
            true;

        }


      } catch (error) {

        console.error(
          "Booking error:",
          error
        );


        let errorMessage =
          "We could not submit your booking request.";


        // -------------------------------------------------
        // FIRESTORE PERMISSION ERROR
        // -------------------------------------------------

        if (
          error.code ===
          "permission-denied"
        ) {

          errorMessage =
            "Your account does not currently have permission to create a booking.";

        }


        // -------------------------------------------------
        // AUTH ERROR
        // -------------------------------------------------

        if (
          error.code ===
          "auth/user-not-found"
        ) {

          errorMessage =
            "Patient account not found.";

        }


        showResult(`

          <div class="resultIcon">
            ⚠️
          </div>

          <h2>
            Booking Error
          </h2>

          <p>
            ${escapeHTML(
              errorMessage
            )}
          </p>

          <button
            class="btn"
            type="button"
            onclick="closeModal()"
          >
            Close
          </button>

        `);

      } finally {

        resetSubmitButton(
          submitButton
        );

      }

    };

}


// =====================================================
// RESET SUBMIT BUTTON
// =====================================================

function resetSubmitButton(
  button
) {

  if (!button) {
    return;
  }


  button.disabled =
    false;


  button.innerHTML =
    "🤝 Find & Request a Hospital Buddy";

}


// =====================================================
// SHOW MODAL
// =====================================================

function showResult(html) {

  const result =
    document.getElementById(
      "result"
    );


  const modal =
    document.getElementById(
      "modal"
    );


  if (
    !result ||
    !modal
  ) {

    return;

  }


  result.innerHTML =
    html;


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


  if (!modal) {
    return;
  }


  modal.classList.add(
    "hidden"
  );

}


// =====================================================
// HTML SECURITY
// =====================================================

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
