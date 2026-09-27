const firebaseConfig = {
  apiKey: "AIzaSyDxfFRc03z0YLo_q5ynZhEjYR41PzGdiw",
  authDomain: "hospital-buddy-2224d.firebaseapp.com",
  projectId: "hospital-buddy-2224d",
  storageBucket: "hospital-buddy-2224d.firebasestorage.app",
  messagingSenderId: "190919672635",
  appId: "1:190919672635:web:8fe14cc8036fd0cb542d1e",
  measurementId: "G-7I3TZ2EFFR"
};

const script = document.createElement("script");
script.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
document.head.appendChild(script);

script.onload = () => {
  const firestoreScript = document.createElement("script");
  firestoreScript.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";
  document.head.appendChild(firestoreScript);

  firestoreScript.onload = () => {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    loadBuddies(db);
    setupBooking(db);
  };
};

async function loadBuddies(db) {
  const bg = document.getElementById("buddies");

  try {
    const snapshot = await db.collection("health_buddies")
      .where("status", "==", "available")
      .get();

    if (snapshot.empty) {
      bg.innerHTML = `
        <article class="buddy">
          <h3>No Buddy Available</h3>
          <p>No Buddy is currently available.</p>
        </article>
      `;
      return;
    }

    bg.innerHTML = snapshot.docs.map(doc => {
      const b = doc.data();

      return `
        <article class="buddy">
          <div style="font-size:35px">🤝</div>
          <h3>${escapeHTML(b.name || "Health Buddy")}</h3>
          <small>${escapeHTML(doc.id)}</small>
          <p><b>Qualification:</b> ${escapeHTML(b.qualification || "Not specified")}</p>
          <p><b>Phone:</b> Hidden until confirmation</p>
          <button class="btn"
            onclick="document.getElementById('book').scrollIntoView()">
            Request this Buddy
          </button>
        </article>
      `;
    }).join("");

  } catch (error) {
    console.error("Error loading Buddies:", error);

    bg.innerHTML = `
      <article class="buddy">
        <h3>Unable to load Buddies</h3>
        <p>Please try again later.</p>
      </article>
    `;
  }
}

function setupBooking(db) {
  document.getElementById("form").onsubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const language = document.getElementById("lang").value;
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const notes = document.getElementById("notes").value.trim();

    try {
      const buddySnapshot = await db.collection("health_buddies")
        .where("status", "==", "available")
        .get();

      let buddy = null;

      buddySnapshot.forEach(doc => {
        if (!buddy && doc.data().languages &&
            doc.data().languages.includes(language)) {
          buddy = {
            id: doc.id,
            ...doc.data()
          };
        }
      });

      if (!buddy && !buddySnapshot.empty) {
        const doc = buddySnapshot.docs[0];
        buddy = {
          id: doc.id,
          ...doc.data()
        };
      }

      if (!buddy) {
        showResult(`
          <h2>No Buddy Available</h2>
          <p>Sorry, there is currently no available Buddy for this request.</p>
        `);
        return;
      }

      const bookingRef = await db.collection("bookings").add({
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
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      const bookingId = "HB-" + bookingRef.id.substring(0, 7).toUpperCase();

      showResult(`
        <h2>Booking Request</h2>

        <p><b>Booking ID:</b> ${escapeHTML(bookingId)}</p>

        <p>
          We matched your request with
          <b>${escapeHTML(buddy.name || "Health Buddy")}</b>.
        </p>

        <div class="contact">
          <b>Assigned Buddy</b><br>
          ${escapeHTML(buddy.name || "Health Buddy")}<br>
          ID: ${escapeHTML(buddy.id)}<br>
          Qualification: ${escapeHTML(buddy.qualification || "Not specified")}<br>
          <b>Contact: Hidden until confirmation</b>
        </div>

        <p>
          <b>Important:</b>
          Your booking has been submitted successfully.
          The Buddy's phone number will be shared only after confirmation.
        </p>

        <p>
          <b>Service:</b> ${escapeHTML(service)}<br>
          <b>Date:</b> ${escapeHTML(date)}<br>
          <b>Time:</b> ${escapeHTML(time)}
        </p>

        <p>
          <b>Status:</b> Pending confirmation
        </p>
      `);

    } catch (error) {
      console.error("Booking error:", error);

      showResult(`
        <h2>Booking Error</h2>
        <p>We could not submit your booking.</p>
        <p>Please try again.</p>
      `);
    }
  };
}

function showResult(html) {
  document.getElementById("result").innerHTML = html;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
