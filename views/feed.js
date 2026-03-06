function initFeed(user) {
  db.ref("users/" + user.uid).get().then(userSnap => {
    const currBoxId = userSnap.val().currBoxId;
    document.getElementById("header").textContent = "feed";

    db.ref("boxes/" + currBoxId).get().then(boxSnap => {
      const box = boxSnap.val();
      if (box.lastFed) {
        const timeSinceFed = Date.now() - box.lastFed;
        const days = Math.floor(timeSinceFed / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeSinceFed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let text = "Last fed ";
        if (days > 0) text += `${days}d `;
        text += `${hours}h ago`;
        document.getElementById("subheader").textContent = text;
      } else {
        document.getElementById("subheader").textContent = "No feeding recorded yet.";
      }
    });
  });

  document.getElementById("logFeedBtn").onclick = () => {
    db.ref("users/" + user.uid).get().then(userSnap => {
      const currBoxId = userSnap.val().currBoxId;
      return db.ref("boxes/" + currBoxId).update({
        lastFed: firebase.database.ServerValue.TIMESTAMP
      });
    }).then(() => {
      showView("dashboard");
      initDashboard(user);
    }).catch(err => alert(err.message));
  };

  document.getElementById("skipFeedBtn").onclick = () => {
    showView("dashboard");
    initDashboard(user);
  };
}