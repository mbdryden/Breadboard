function initDashboard(user) {
  db.ref("users/" + user.uid).get().then(userSnap => {
    const currBoxId = userSnap.val().currBoxId;
    document.getElementById("header").textContent = "welcome!";

    db.ref("boxes/" + currBoxId).get().then(boxSnap => {
      const box = boxSnap.val();

      document.getElementById("changeNameBtn").textContent =
        box.boxName && box.boxName !== "No Box Name" ? "Change Name" : "Set Starter Name";
      document.getElementById("idealTempBtn").textContent =
        box.tempSet ? "Change Ideal Temp" : "Set Ideal Temp";

      if (box.cycleInProgress) {
        startDash(user, currBoxId);
      } else {
        startDashNoCycle(user, currBoxId);
      }
    });
  });
}

function startDashNoCycle(user, currBoxId) {
    document.getElementById("header").textContent = "welcome!";
  document.getElementById("subheader").textContent = "You do not currently have a cycle in progress.";
  document.getElementById("subheader").style.display = "block";
  document.getElementById("startCycleBtn").style.display = "block";
  document.getElementById("feedBtn").style.display = "block";

  document.getElementById("changeNameBtn").onclick = () => {
    showView("name");
    initName(user);
  };
  document.getElementById("idealTempBtn").onclick = () => {
    showView("temp");
    initTemp(user);
  };
  document.getElementById("startCycleBtn").onclick = () => {
    db.ref("boxes/" + currBoxId).update({
      cycleInProgress: true,
      timeLeftInCycle: 25
    }).then(() => {
      startDash(user, currBoxId);
    }).catch(err => alert(err.message));
  };
  document.getElementById("feedBtn").onclick = () => {
    showView("feed");
    initFeed(user);
  };
  document.getElementById("switchBoxBtn").onclick = () => {
    showView("switchBox");
    initSwitchBox(user);
  };
  document.getElementById("logoutBtn").onclick = () => {
    document.getElementById("subheader").style.display = "none";
    firebase.auth().signOut();
  };
}

function startDash(user, currBoxId) {
  document.getElementById("startCycleBtn").style.display = "none";
  document.getElementById("feedBtn").style.display = "none";
  document.getElementById("subheader").style.display = "block";

  db.ref("boxes/" + currBoxId).on("value", snap => {
    const box = snap.val();
    const name = box.boxName;
    const timeLeftInCycle = box.timeLeftInCycle;
    const hours = Math.floor(timeLeftInCycle / 3600);
    const minutes = Math.floor((timeLeftInCycle % 3600) / 60);
    const seconds = timeLeftInCycle % 60;
    const text = `${hours}h ${minutes}m ${seconds}s`;

    if (timeLeftInCycle > 0) {
      document.getElementById("subheader").textContent = "Time left until " + name + " peaks: " + text;
    } else {
      document.getElementById("subheader").textContent = name + " has peaked!";
    }
  });

  document.getElementById("changeNameBtn").onclick = () => {
    showView("name");
    initName(user);
  };
  document.getElementById("idealTempBtn").onclick = () => {
    showView("temp");
    initTemp(user);
  };
  document.getElementById("switchBoxBtn").onclick = () => {  // add this
    db.ref("boxes/" + currBoxId).off();
    showView("switchBox");
    initSwitchBox(user);
  };
  document.getElementById("logoutBtn").onclick = () => {
    db.ref("boxes/" + currBoxId).off();
    document.getElementById("subheader").style.display = "none";
    firebase.auth().signOut();
  };
}