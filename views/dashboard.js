let onHomeDash = false;
let countdownInterval = null;

async function initDashboard(user) {
  const userSnap = await db.ref("users/" + user.uid).get();
  const userData = userSnap.val();
  const currBoxId = userData.currBoxId;
  const idealTemp = userData.idealTemp ?? 75;

  document.getElementById("header").textContent = "welcome!";

  const snap = await db.ref("logs")
    .orderByChild("boxID")
    .equalTo(Number(currBoxId))
    .once("value");

  const log = snap.val() ? Object.values(snap.val()) : [];
  renderChart(log, idealTemp, 50);

  const boxSnap = await db.ref("boxes/" + currBoxId).get();
  const box = boxSnap.val();
  if (box.cycleInProgress) {
    startDash(user, currBoxId);
  } else {
    startDashNoCycle(user, currBoxId);
  }
}

function startDashNoCycle(user, currBoxId) {
  document.getElementById("header").textContent = "welcome!";
  document.getElementById("subheader").textContent = "You do not currently have a cycle in progress.";
  document.getElementById("subheader").style.display = "block";
  document.getElementById("navbar").style.display = "block";
  document.getElementById("startCycleBtn").style.display = "block";
  document.getElementById("stopCycleBtn").style.display = "none";
  document.getElementById("temp-chart-container").style.display = "none";
  setActiveNav('homeBtn');
  onHomeDash = true;

  document.getElementById("changeNameBtn").onclick = () => {
    showView("name");
    setActiveNav('changeNameBtn');
    onHomeDash = false;
    initName(user);
  };
  document.getElementById("idealTempBtn").onclick = () => {
    showView("temp");
    setActiveNav('idealTempBtn');
    onHomeDash = false;
    initTemp(user);
  };
  document.getElementById("startCycleBtn").onclick = () => {
    showView("startCycle");
    onHomeDash = false;
    initCycle(user);
    db.ref("boxes/" + currBoxId).on("value", snap => {
  const box = snap.val();
  console.log("READ cycleEndTime:", box.cycleEndTime)});
  };
  document.getElementById("feedBtn").onclick = () => {
    showView("feed");
    setActiveNav('feedBtn');
    onHomeDash = false;
    initFeed(user);
  };
  document.getElementById("switchBoxBtn").onclick = () => {
    showView("switchBox");
    setActiveNav('switchBoxBtn');
    onHomeDash = false;
    initSwitchBox(user);
  };
  document.getElementById("logoutBtn").onclick = () => {
    document.getElementById("subheader").style.display = "none";
    document.getElementById("navbar").style.display = "none";
    setActiveNav(null);
    firebase.auth().signOut();
  };
}

function startDash(user, currBoxId) {
  document.getElementById("startCycleBtn").style.display = "none";
  document.getElementById("subheader").style.display = "block";
  document.getElementById("navbar").style.display = "block";
  document.getElementById("stopCycleBtn").style.display = "block";
  const chartContainer = document.getElementById("temp-chart-container");
  if (chartContainer) chartContainer.style.display = "block";
  onHomeDash = true;
  setActiveNav('homeBtn');

  if (countdownInterval) clearInterval(countdownInterval);

  db.ref("boxes/" + currBoxId).on("value", snap => {
    const box = snap.val();
    const name = box.boxName;
    const cycleEndTime = box.cycleEndTime;

    if (countdownInterval) clearInterval(countdownInterval);

    function updateDisplay() {
      if (!onHomeDash) return;
      const timeLeft = Math.max(0, Math.floor((cycleEndTime - Date.now()) / 1000));
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;
      if (timeLeft > 0) {
        document.getElementById("subheader").textContent =
          `Time left until ${name} peaks: ${hours}h ${minutes}m ${seconds}s`;
      } else {
        document.getElementById("subheader").textContent = `${name} has peaked!`;
        clearInterval(countdownInterval);

      }
    }

    updateDisplay();
    countdownInterval = setInterval(updateDisplay, 1000);
  });

  document.getElementById("changeNameBtn").onclick = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById("temp-chart-container").style.display = "none";
    showView("name");
    setActiveNav('changeNameBtn');
    onHomeDash = false;
    initName(user);
  };
  document.getElementById("feedBtn").onclick = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById("temp-chart-container").style.display = "none";
    showView("feed");
    setActiveNav('feedBtn');
    onHomeDash = false;
    initFeed(user);
  };
  document.getElementById("idealTempBtn").onclick = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById("temp-chart-container").style.display = "none";
    showView("temp");
    setActiveNav('idealTempBtn');
    onHomeDash = false;
    initTemp(user);
  };
  document.getElementById("switchBoxBtn").onclick = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    db.ref("boxes/" + currBoxId).off();
    document.getElementById("temp-chart-container").style.display = "none";
    showView("switchBox");
    setActiveNav('switchBoxBtn');
    onHomeDash = false;
    initSwitchBox(user);
  };
  document.getElementById("stopCycleBtn").onclick = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    db.ref("users/" + user.uid).get().then(userSnap => {
      const currBoxId = userSnap.val().currBoxId;
      return db.ref("boxes/" + currBoxId).update({
        cycleInProgress: false,
        cycleEndTime: null,
        startCycle: false
      });
    }).then(() => {
      document.getElementById("temp-chart-container").style.display = "none";
      showView("dashboard");
      startDashNoCycle(user, currBoxId);
    }).catch(err => alert(err.message));
  };
  document.getElementById("logoutBtn").onclick = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    db.ref("boxes/" + currBoxId).off();
    document.getElementById("temp-chart-container").style.display = "none";
    document.getElementById("subheader").style.display = "none";
    document.getElementById("navbar").style.display = "none";
    setActiveNav(null);
    firebase.auth().signOut();
  };
}