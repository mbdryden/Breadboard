function initName(user) {
  db.ref("users/" + user.uid).get().then(userSnap => {
    const currBoxId = userSnap.val().currBoxId;
    document.getElementById("header").textContent = "name";

    db.ref("boxes/" + currBoxId).get().then(boxSnap => {
      const box = boxSnap.val();
      if (box.boxName) {
        document.getElementById("subheader").innerHTML =
          "Your starter's name is " + box.boxName + "!<br>Change name below:";
      } else {
        document.getElementById("subheader").textContent = "Set starter's name below!";
      }
    });
  });

  document.getElementById("nameInput").onkeydown = (e) => {
    if (e.key === "Enter") document.getElementById("continueBtn").click();
  };

  document.getElementById("continueBtn").onclick = () => {
    const name = document.getElementById("nameInput").value;
    db.ref("users/" + user.uid).get().then(userSnap => {
      const currBoxId = userSnap.val().currBoxId;
      return db.ref("boxes/" + currBoxId).update({ boxName: name });
    }).then(() => {
      showView("dashboard");
      initDashboard(user);
    }).catch(err => alert(err.message));
  };

  document.getElementById("homeBtn").onclick = () => {
    showView("dashboard");
    setActiveNav('homeBtn');
    initDashboard(user);
  };
}