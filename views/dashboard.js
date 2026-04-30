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
    if (box.seenResults) {
      startDashNoCycle(user, currBoxId);
    } else {
      startDashResults(user, currBoxId);
    }
  }
}

function startDashNoCycle(user, currBoxId) {
  document.getElementById("header").textContent = "welcome!";
  document.getElementById("subheader").textContent = "You do not currently have a cycle in progress.";
  document.getElementById("subheader").style.display = "block";
  document.getElementById("navbar").style.display = "block";
  document.getElementById("startCycleBtn").style.display = "block";
  document.getElementById("stopCycleBtn").style.display = "none";
  document.getElementById("downloadBtn").style.display = "none";
  document.getElementById("ackBtn").style.display = "none";
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
  document.getElementById("stopCycleBtn").onclick = null;
  document.getElementById("downloadBtn").onclick = null;
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
  document.getElementById("downloadBtn").style.display = "none";
  document.getElementById("ackBtn").style.display = "none";
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
        db.ref("users/" + user.uid).get().then(userSnap => {
          const currBoxId = userSnap.val().currBoxId;
          return db.ref("boxes/" + currBoxId).update({
            seenResults: false,
            cycleInProgress: false
          });
        }).then(() => {
          clearInterval(countdownInterval);
          initDashboard(user); // ✅ fixed: pass user
        });
      }
    }

    updateDisplay();
    countdownInterval = setInterval(updateDisplay, 1000);
  });

  // ✅ fixed: button handlers inside startDash
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
        startCycle: false,
        seenResults: true
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

function startDashResults(user, currBoxId) {
  document.getElementById("startCycleBtn").style.display = "none";
  document.getElementById("subheader").style.display = "block";
  document.getElementById("navbar").style.display = "block";
  document.getElementById("stopCycleBtn").style.display = "none";
  document.getElementById("downloadBtn").style.display = "block";
  document.getElementById("ackBtn").style.display = "block";
  const chartContainer = document.getElementById("temp-chart-container");
  if (chartContainer) chartContainer.style.display = "block";
  onHomeDash = true;
  setActiveNav('homeBtn');
  if (countdownInterval) clearInterval(countdownInterval);

  const subheader = document.getElementById("subheader"); // ✅ define it once here

  db.ref("boxes/" + currBoxId).on("value", snap => {
    const box = snap.val();
    const name = box.boxName;

    document.getElementById("header").textContent = "results";

    db.ref("logs")
      .orderByChild("boxID")
      .equalTo(Number(currBoxId))
      .once("value")
      .then(logSnap => {
        const logs = logSnap.val() ? Object.values(logSnap.val()) : [];

        const avgTemp = logs.length
          ? (logs.reduce((sum, l) => sum + l.temp, 0) / logs.length).toFixed(1)
          : "N/A";

        const avgHum = logs.length
          ? (logs.reduce((sum, l) => sum + l.humdi, 0) / logs.length).toFixed(1)
          : "N/A";

        subheader.innerHTML = name ? name + " has peaked!" : "Your starter has peaked!";
        subheader.innerHTML +=
          `<br>Avg Temp: ${avgTemp}°F &nbsp;|&nbsp; Avg Humidity: ${avgHum}%`;
      });
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
  document.getElementById("ackBtn").onclick = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    db.ref("boxes/" + currBoxId).off(); // ✅ stop listener before navigating
    db.ref("users/" + user.uid).get().then(userSnap => {
      const currBoxId = userSnap.val().currBoxId;
      return db.ref("boxes/" + currBoxId).update({
        seenResults: true
      });
    }).then(() => {
      document.getElementById("temp-chart-container").style.display = "none";
      showView("dashboard");
      startDashNoCycle(user, currBoxId);
    }).catch(err => alert(err.message));
  };

  document.getElementById("downloadBtn").onclick = () => {
    const chartCanvases = document.querySelectorAll("#temp-chart-container canvas");

    const padding = 20;
    const gap = 24;
    const textHeight = 40;

    const totalHeight = textHeight +
      Array.from(chartCanvases).reduce((sum, c) => sum + c.height + gap, 0);

    const maxWidth = Math.max(...Array.from(chartCanvases).map(c => c.width));

    const combined = document.createElement("canvas");
    combined.width = maxWidth + padding * 2;
    combined.height = totalHeight + padding * 2;

    const ctx = combined.getContext("2d");

    ctx.fillStyle = "#E3D8C6";
    ctx.fillRect(0, 0, combined.width, combined.height);

    ctx.fillStyle = "#996633";
    ctx.font = "18px canela";
    ctx.textAlign = "center";
    ctx.fillText(subheader.textContent, combined.width / 2, padding + 20); // ✅ uses same subheader var

    let y = padding + textHeight;
    chartCanvases.forEach(canvas => {
      ctx.drawImage(canvas, padding, y);
      y += canvas.height + gap;
    });

    const link = document.createElement("a");
    link.download = "results.png";
    link.href = combined.toDataURL("image/png");
    link.click();
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