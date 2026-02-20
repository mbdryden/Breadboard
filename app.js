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
    const boxId = document.getElementById("newBoxId").value;
    const email = document.getElementById("newEmail").value.trim();
    const password = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    if (password !== confirm) { alert("Passwords do not match"); return; }
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        return firebase.database().ref("users/" + user.uid).set({
          boxId: boxId,
          email: email,
          tempSet: false,
          cycleInProgress: false
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
    document.getElementById("startCycleBtn").style.display = "none";
    document.getElementById("changeNameBtn").onclick = () => {
        window.location.href = "name.html";
    };
    document.getElementById("logoutBtn").onclick = () => firebase.auth().signOut();
  }
});