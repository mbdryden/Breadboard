const peakTimes = [ // in seconds
//  [64-68], [68-72], [72-75], [75-79], [79-82]
    [25200, 21600, 18000, 14400, 10800], // 1:1:1
    [28800, 25200, 18000, 14400, 14400], // 1:2:2
    [39600, 36000, 32400, 28800, 25200], // 1:5:5
    [57600, 50400, 43200, 39600, 36000], // 1:20:20
]


function initCycle(user) {
  document.getElementById("header").textContent = "start cycle";
  subheader.innerHTML = "Set ratio!" + "<br>(Starter:Flour:Water)";

  const startWithTime = (ratio) => {
    db.ref("users/" + user.uid).get().then(userSnap => {
        const currBoxId = userSnap.val().currBoxId;
        return db.ref("boxes/" + currBoxId).get();
    }).then(boxSnap => {
        const box = boxSnap.val();
        const tempSet = box.tempSet;
        let temp = 80;
        if (tempSet) {
            temp = box.idealTemp;
        }
        let seconds = 1;
        if (temp >= 64 && temp < 68) {
            seconds = peakTimes[ratio][0];
        } else if (temp >= 68 && temp < 72) {
            seconds = peakTimes[ratio][1];
        } else if (temp >= 72 && temp < 75) {
            seconds = peakTimes[ratio][2];
        } else if (temp >= 75 && temp < 79) {
            seconds = peakTimes[ratio][3];
        } else if (temp >= 79 && temp <= 82) {
            seconds = peakTimes[ratio][4];
        }
        return db.ref("boxes/" + boxSnap.key).update({
            timeLeftInCycle: seconds,
            cycleInProgress: true,
            startCycle: true
        });
    }).then(() => {
        showView("dashboard");
        initDashboard(user);
    }).catch(err => alert(err.message));
};

  document.getElementById("ratio1Btn").onclick = () => startWithTime(0);
  document.getElementById("ratio2Btn").onclick = () => startWithTime(1);
  document.getElementById("ratio5Btn").onclick = () => startWithTime(2);
  document.getElementById("ratio20Btn").onclick = () => startWithTime(3);


  document.getElementById("stopCycleBtn").onclick = () => {
    db.ref("users/" + user.uid).get().then(userSnap => {
        const currBoxId = userSnap.val().currBoxId;
        return db.ref("boxes/" + currBoxId).update({
            cycleInProgress: false,
            timeLeftInCycle: null,
            startCycle: false
        });
    }).then(() => {
        showView("dashboard");
        initDashboard(user);
    }).catch(err => alert(err.message));
};

  document.getElementById("cancelCycleBtn").onclick = () => {
    showView("dashboard");
    setActiveNav('homeBtn');
    initDashboard(user);
  };

  document.getElementById("homeBtn").onclick = () => {
    showView("dashboard");
    setActiveNav('homeBtn');
    initDashboard(user);
  };
}