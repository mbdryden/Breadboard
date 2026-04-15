function initAuth() {
  ["email", "password"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("loginBtn").click();
    });
  });
  ["newBoxId", "newEmail", "newPassword", "confirmPassword"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("signupBtn").click();
    });
  });

  document.getElementById("showSignupBtn").onclick = () => showView("signup");
  document.getElementById("backToLoginBtn").onclick = () => showView("login");

  document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(err => alert(err.message));
  };

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
                boxName: "No Box Name",
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
        showView("dashboard");
        initName(firebase.auth().currentUser);
      })
      .catch(err => alert(err.message));
  };

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      showView("dashboard");
      initDashboard(user);
    } else {
      showView("login");
    }
  });
}