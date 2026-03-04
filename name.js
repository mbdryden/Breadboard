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

  db.ref("users/" + currentUser.uid).get().then(userSnap => {
    const currBoxId = userSnap.val().currBoxId;

    db.ref("boxes/" + currBoxId).get().then(boxSnap => {
      const box = boxSnap.val();
      if (box.boxName && box.boxName !== "No Box Name") {
        document.getElementById("nameHeader").innerHTML = "Your starter's name is " + box.boxName + "!<br>Change name below:";
        document.getElementById("skipBtn").textContent = "Cancel";
      } else {
        document.getElementById("nameHeader").textContent = "Set starter's name below!";
        document.getElementById("skipBtn").textContent = "Skip for Now";
      }
    });
  });

  ["boxName"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("continueBtn").click();
    });
  });

  document.getElementById("continueBtn").onclick = () => {
    const name = document.getElementById("boxName").value;
    db.ref("users/" + currentUser.uid).get().then(userSnap => {
      const currBoxId = userSnap.val().currBoxId;
      return db.ref("boxes/" + currBoxId).update({ boxName: name });
    }).then(() => {
      window.location.href = "index.html";
    }).catch(err => alert(err.message));
  };

  document.getElementById("skipBtn").onclick = () => {
    window.location.href = "index.html";
  };
});