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
        const db = firebase.database();

        let sharedData = {
          tempSet: false,
          cycleInProgress: false,
          lastFed: null,
          boxName: null,
          timeLeftInCycle: null
        }

        // Check if anyone else has this boxId
        return db.ref("users").orderByChild("boxId").equalTo(boxId).get().then(snapshot => {
          console.log("snapshot exists:", snapshot.exists());
          console.log("snapshot size:", snapshot.size);
          snapshot.forEach(child => console.log("found:", child.val()));

          // If another user has this boxId, copy their values
          if (snapshot.exists()) {
            snapshot.forEach(child => {
              if (child.key === user.uid) return;
              const data = child.val();
              sharedData = {
                tempSet: data.tempSet ?? false,
                cycleInProgress: data.cycleInProgress ?? false,
                lastFed: data.lastFed ?? null,
                boxName: data.boxName ?? null,
                timeLeftInCycle: data.timeLeftInCycle ?? null
              };
            });
          }

          return db.ref("users/" + user.uid).set({
            boxId: boxId,
            email: email,
            ...sharedData
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
      db.ref("users/" + user.uid).get().then(snap => {
        const currCycle = snap.val().cycleInProgress;
        const name = snap.val().boxName;
        const temp = snap.val().tempSet;
        if(name) {
          document.getElementById("changeNameBtn").textContent = "Change Name";
        } else {
          document.getElementById("changeNameBtn").textContent = "Set Starter Name";
        }

        if(temp) {
          document.getElementById("idealTempBtn").textContent = "Change Ideal Temp";
        } else {
          document.getElementById("idealTempBtn").textContent = "Set Ideal Temp";
        }

        if (currCycle) {
          startDash(user);
        } else {
          startDashNoCycle(user);
        }
      });
    } else {
      dashboard.style.display = "none";
      loginForm.style.display = "block";
    }
  });

  function startDashNoCycle(user) {
    document.getElementById("changeNameBtn").onclick = () => {
        window.location.href = "name.html";
    };
    document.getElementById("idealTempBtn").onclick = () => {
        window.location.href = "temp.html";
    };
    document.getElementById("timeLeftHeader").textContent = "You do not currently have a cycle in progress.";
    document.getElementById("startCycleBtn").onclick = () => {
      db.ref("users/" + user.uid).get().then(snap => {
        const boxId = snap.val().boxId;
        db.ref("users").orderByChild("boxId").equalTo(boxId).get().then(snapshot => {
          const updates = {};
          snapshot.forEach(child => {
            updates[child.key + "/cycleInProgress"] = true;
            updates[child.key + "/timeLeftInCycle"] = 30;
          });
          db.ref("users").update(updates).then(() => {
            startDash(user);  // only called after update completes
          }).catch(err => alert(err.message));
        }).catch(err => alert(err.message));
      }).catch(err => alert(err.message));
    };
    document.getElementById("feedBtn").onclick = () => {
        window.location.href = "feed.html";
    };
    document.getElementById("logoutBtn").onclick = () => firebase.auth().signOut();
  }

  function startDash(user) {
    db.ref("users/" + user.uid).on("value", snap => {
        const timeLeftInCycle = snap.val().timeLeftInCycle;
        const hours = Math.floor(timeLeftInCycle / 3600);
        const minutes = Math.floor((timeLeftInCycle % 3600) / 60);
        const seconds = timeLeftInCycle % 60;
        let text = `${hours}h ${minutes}m ${seconds}s`;
        if(timeLeftInCycle > 0) {
          document.getElementById("timeLeftHeader").textContent = "Time left in current cycle: " + text;
        } else {
          document.getElementById("timeLeftHeader").textContent = "Starter has peaked!";
        }
    });
    document.getElementById("startCycleBtn").style.display = "none";
    document.getElementById("feedBtn").style.display = "none";
    document.getElementById("changeNameBtn").onclick = () => {
        window.location.href = "name.html";
    };
    document.getElementById("idealTempBtn").onclick = () => {
        window.location.href = "temp.html";
    };
    document.getElementById("logoutBtn").onclick = () => firebase.auth().signOut();
  }
});