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

  ["newBoxId"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("saveNewBoxBtn").click();
    });
  });
  document.getElementById("saveNewBoxBtn").onclick = () => {
    const newBoxId = document.getElementById("newBoxId").value.trim();

    db.ref("boxes/" + newBoxId).get().then(snapshot => {
      const boxWrite = snapshot.exists()
        ? Promise.resolve()
        : db.ref("boxes/" + newBoxId).set({
            boxId: newBoxId,
            tempSet: false,
            cycleInProgress: false,
            lastFed: null,
            boxName: null,
            timeLeftInCycle: null
          });

      return boxWrite.then(() => {
        return db.ref("users/" + currentUser.uid).get().then(userSnap => {
          const boxIds = userSnap.val().boxIds || [];
          if (!boxIds.includes(newBoxId)) boxIds.push(newBoxId);
          return db.ref("users/" + currentUser.uid).update({
            boxIds: boxIds,
            currBoxId: newBoxId
          });
        });
      });
    }).then(() => {
      window.location.href = "switchBox.html";
    }).catch(err => alert(err.message));
  };

  document.getElementById("skipBtn").onclick = () => {
    window.location.href = "switchBox.html";
  };
});