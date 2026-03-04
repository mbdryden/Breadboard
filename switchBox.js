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
    const boxIds = userSnap.val().boxIds || [];
    const currBoxId = userSnap.val().currBoxId;
    const boxList = document.getElementById("boxList");

    boxIds.filter(boxId => boxId !== currBoxId).forEach(boxId => {
    db.ref("boxes/" + boxId).get().then(boxSnap => {
        const box = boxSnap.val();
        const name = box.boxName ? box.boxName : boxId;

        const container = document.createElement("div");
        container.className = "box-row";

        const btn = document.createElement("button");
        btn.textContent = name;
        btn.onclick = () => {
        db.ref("users/" + currentUser.uid).update({ currBoxId: boxId })
            .then(() => window.location.href = "index.html")
            .catch(err => alert(err.message));
        };

        const removeBtn = document.createElement("button");
        removeBtn.className = "removeBtn";
        removeBtn.textContent = "🗑";
        removeBtn.onclick = () => {
        const updatedBoxIds = boxIds.filter(id => id !== boxId);
        db.ref("users/" + currentUser.uid).update({ boxIds: updatedBoxIds })
            .then(() => container.remove())
            .catch(err => alert(err.message));
        };

        container.appendChild(btn);
        container.appendChild(removeBtn);
        boxList.appendChild(container);
        });
    });
  });

  document.getElementById("addBoxBtn").onclick = () => {
    window.location.href = "addBox.html";
  };

  document.getElementById("skipBtn").onclick = () => {
    window.location.href = "index.html";
  };
});