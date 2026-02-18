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

firebase.auth().onAuthStateChanged(currentUser => {
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

    document.getElementById("continueBtn").onclick = () => {
    const name = document.getElementById("boxName").value;
    const db = firebase.database();

        // First get the current user's boxId
        db.ref("users/" + currentUser.uid).get().then(snap => {
            const boxId = snap.val().boxId;

            // Then find all users with that boxId
            db.ref("users").orderByChild("boxId").equalTo(boxId).get().then(snapshot => {
            const updates = {};
            snapshot.forEach(child => {
                updates[child.key + "/boxName"] = name;
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