document.addEventListener("DOMContentLoaded", () => {
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

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const dashboard = document.getElementById("dashboard");

  document.getElementById("showSignupBtn").onclick = () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  };
  document.getElementById("backToLoginBtn").onclick = () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  };

  ["email", "password"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("loginBtn").click();
    });
  });

  document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(err => alert(err.message));
  };

  ["newBoxId", "newEmail", "newPassword", "confirmPassword"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("signupBtn").click();
    });
  });

  document.getElementById("signupBtn").onclick = () => {
    const boxId = document.getElementById("newBoxId").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const password = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    if (password !== confirm) { alert("Passwords do not match"); return; }

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;

        return db.ref("boxes/" + boxId).get().then(snapshot => {
          const boxWrite = snapshot.exists()
            ? Promise.resolve()
            : db.ref("boxes/" + boxId).set({
                boxId: boxId,
                tempSet: false,
                cycleInProgress: false,
                lastFed: null,
                boxName: null,
                timeLeftInCycle: null
              });

          return boxWrite.then(() => {
            return db.ref("users/" + user.uid).set({
              currBoxId: boxId,
              email: email,
              boxIds: [boxId]
            });
          });
        });
      })
      .then(() => {
        window.location.href = "name.html";
      })
      .catch(err => alert(err.message));
  };

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      loginForm.style.display = "none";
      signupForm.style.display = "none";
      dashboard.style.display = "block";

      db.ref("users/" + user.uid).get().then(userSnap => {
        const currBoxId = userSnap.val().currBoxId;

        db.ref("boxes/" + currBoxId).get().then(boxSnap => {
          const box = boxSnap.val();
          const currCycle = box.cycleInProgress;
          const name = box.boxName;
          const temp = box.tempSet;

          document.getElementById("changeNameBtn").textContent = name
            ? "Change Name"
            : "Set Starter Name";

          document.getElementById("idealTempBtn").textContent = temp
            ? "Change Ideal Temp"
            : "Set Ideal Temp";

          if (currCycle) {
            startDash(user, currBoxId);
          } else {
            startDashNoCycle(user, currBoxId);
          }
        });
      });
    } else {
      dashboard.style.display = "none";
      loginForm.style.display = "block";
    }
  });

  function startDashNoCycle(user, currBoxId) {
    document.getElementById("changeNameBtn").onclick = () => {
      window.location.href = "name.html";
    };
    document.getElementById("idealTempBtn").onclick = () => {
      window.location.href = "temp.html";
    };
    document.getElementById("timeLeftHeader").textContent = "You do not currently have a cycle in progress.";
    document.getElementById("timeLeftHeader").style.display = "block";

    document.getElementById("startCycleBtn").style.display = "block";
    document.getElementById("feedBtn").style.display = "block";

    document.getElementById("startCycleBtn").onclick = () => {
      db.ref("boxes/" + currBoxId).update({
        cycleInProgress: true,
        timeLeftInCycle: 30
      }).then(() => {
        startDash(user, currBoxId);
      }).catch(err => alert(err.message));
    };

    document.getElementById("feedBtn").onclick = () => {
      window.location.href = "feed.html";
    };
    document.getElementById("switchBoxBtn").onclick = () => {
      window.location.href = "switchBox.html";
    };
    document.getElementById("logoutBtn").onclick = () => {
      document.getElementById("timeLeftHeader").style.display = "none";
      firebase.auth().signOut();
    };
  }

  function startDash(user, currBoxId) {
    db.ref("boxes/" + currBoxId).on("value", snap => {
      const box = snap.val();
      const name = box.boxName;
      const timeLeftInCycle = box.timeLeftInCycle;
      const hours = Math.floor(timeLeftInCycle / 3600);
      const minutes = Math.floor((timeLeftInCycle % 3600) / 60);
      const seconds = timeLeftInCycle % 60;
      const text = `${hours}h ${minutes}m ${seconds}s`;

      if (timeLeftInCycle > 0) {
        document.getElementById("timeLeftHeader").textContent = "Time left until " + name + " peaks: " + text;
      } else {
        document.getElementById("timeLeftHeader").textContent = name + " has peaked!";
      }
    });

    document.getElementById("timeLeftHeader").style.display = "block";
    document.getElementById("startCycleBtn").style.display = "none";
    document.getElementById("feedBtn").style.display = "none";

    document.getElementById("changeNameBtn").onclick = () => {
      window.location.href = "name.html";
    };
    document.getElementById("idealTempBtn").onclick = () => {
      window.location.href = "temp.html";
    };
    document.getElementById("logoutBtn").onclick = () => {
      db.ref("boxes/" + currBoxId).off();
      document.getElementById("timeLeftHeader").style.display = "none";
      firebase.auth().signOut();
    };
  }
});