const firebaseConfig = {
  apiKey: "AIzaSyBpfr0ZTuVGPOa72tEi1ui3_vqhA63-jGg",
  authDomain: "breadboard-297d4.firebaseapp.com",
  databaseURL: "https://breadboard-297d4-default-rtdb.firebaseio.com",
  projectId: "breadboard-297d4",
  storageBucket: "breadboard-297d4.firebasestorage.app",
  messagingSenderId: "136042113028",
  appId: "1:136042113028:web:43272123e5aebbf7f56d51"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
firebase.auth().onAuthStateChanged(currentUser => {
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
    db.ref("users/" + currentUser.uid).get().then(snap => {
        const data = snap.val();
        const resetTempBtn = document.getElementById("resetTempBtn");
        resetTempBtn.hidden = !data.tempSet;
        if (data.tempSet) {
            document.getElementById("idealTempHeader").textContent = "Your ideal temperature is " + data.idealTemp + "°.";
        } else {
            document.getElementById("idealTempHeader").textContent = "Using default temperature of 80°.";
        }
    });
    ["idealTemp"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("setTempBtn").click();
    })});
    document.getElementById("setTempBtn").onclick = () => {
        const idealTemp = document.getElementById("idealTemp").value;
        db.ref("users/" + currentUser.uid).get().then(snap => {
            const boxId = snap.val().boxId;

            // Then find all users with that boxId
            db.ref("users").orderByChild("boxId").equalTo(boxId).get().then(snapshot => {
            const updates = {};
            snapshot.forEach(child => {
                updates[child.key + "/idealTemp"] = idealTemp;
                updates[child.key + "/tempSet"] = true;
            });
            return db.ref("users").update(updates);
            }).then(() => {
            window.location.href = "index.html";
            }).catch(err => alert(err.message));
        });
    };

    document.getElementById("resetTempBtn").onclick = () => {
        db.ref("users/" + currentUser.uid).get().then(snap => {
            const boxId = snap.val().boxId;

            // Then find all users with that boxId
            db.ref("users").orderByChild("boxId").equalTo(boxId).get().then(snapshot => {
            const updates = {};
            snapshot.forEach(child => {
                updates[child.key + "/idealTemp"] = null;
                updates[child.key + "/tempSet"] = false;
            });
            return db.ref("users").update(updates);
            }).then(() => {
                window.location.href = "index.html";
            }).catch(err => alert(err.message));
        });
    };
    document.getElementById("skipBtn").onclick = () => {
        window.location.href = "index.html";
    };

});