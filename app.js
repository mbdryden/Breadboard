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
  document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(err => alert(err.message));
  };
  document.getElementById("signupBtn").onclick = () => {
    const boxId = document.getElementById("newBoxId").value;
    const email = document.getElementById("newEmail").value.trim();
    const password = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    if (password !== confirm) { alert("Passwords do not match"); return; }
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        // Write user to database
        firebase.database().ref("users/" + user.uid).set({
          boxId: boxId,
          email: email,
          tempSet: false,
          cycleInProgress: false
        });
        window.location.href = "name.html"
      })
      .catch(err => alert(err.message));
  };

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      loginForm.style.display = "none";
      signupForm.style.display = "none";
      dashboard.style.display = "block";
      startHome();
    } else {
      dashboard.style.display = "none";
      loginForm.style.display = "block";
    }
  });

  function startHome() {
    document.getElementById("changeNameBtn").onclick = () => {
        window.location.href = "name.html";
    };
    document.getElementById("logoutBtn").onclick = () => firebase.auth().signOut();
  }
});