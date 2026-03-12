function initTemp(user) {
  db.ref("users/" + user.uid).get().then(userSnap => {
    const currBoxId = userSnap.val().currBoxId;
    document.getElementById("header").textContent = "temp";

    db.ref("boxes/" + currBoxId).get().then(boxSnap => {
      const box = boxSnap.val();
      document.getElementById("resetTempBtn").hidden = !box.tempSet;

      if (box.tempSet) {
        document.getElementById("subheader").textContent =
          "Your ideal temperature is " + box.idealTemp + "°.";
      } else {
        document.getElementById("subheader").textContent =
          "Using default temperature of 80°.";
      }
    });
  });

  document.getElementById("idealTempInput").onkeydown = (e) => {
    if (e.key === "Enter") document.getElementById("setTempBtn").click();
  };

  document.getElementById("setTempBtn").onclick = () => {
    const idealTemp = document.getElementById("idealTempInput").value;
    db.ref("users/" + user.uid).get().then(userSnap => {
      const currBoxId = userSnap.val().currBoxId;
      return db.ref("boxes/" + currBoxId).update({
        idealTemp: idealTemp,
        tempSet: true
      });
    }).then(() => {
      showView("dashboard");
      initDashboard(user);
    }).catch(err => alert(err.message));
  };

  document.getElementById("resetTempBtn").onclick = () => {
    db.ref("users/" + user.uid).get().then(userSnap => {
      const currBoxId = userSnap.val().currBoxId;
      return db.ref("boxes/" + currBoxId).update({
        idealTemp: null,
        tempSet: false
      });
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