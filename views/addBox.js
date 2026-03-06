function initAddBox(user) {
  document.getElementById("newBoxIdInput").onkeydown = (e) => {
    if (e.key === "Enter") document.getElementById("saveNewBoxBtn").click();
  };

  document.getElementById("header").textContent = "add box";

  document.getElementById("saveNewBoxBtn").onclick = () => {
    const newBoxId = document.getElementById("newBoxIdInput").value.trim();
    if (!newBoxId) return;

    db.ref("boxes/" + newBoxId).get().then(snapshot => {
      const boxWrite = snapshot.exists()
        ? Promise.resolve()
        : db.ref("boxes/" + newBoxId).set({
            boxId: newBoxId,
            tempSet: false,
            cycleInProgress: false,
            lastFed: null,
            boxName: null,
            timeLeftInCycle: null
          });

      return boxWrite.then(() => {
        return db.ref("users/" + user.uid).get().then(userSnap => {
          const boxIds = userSnap.val().boxIds || [];
          if (!boxIds.includes(newBoxId)) boxIds.push(newBoxId);
          return db.ref("users/" + user.uid).update({
            boxIds: boxIds,
            currBoxId: newBoxId
          });
        });
      });
    }).then(() => {
      showView("dashboard");
      initDashboard(user);
    }).catch(err => alert(err.message));
  };

  document.getElementById("cancelAddBtn").onclick = () => {
    showView("switchBox");
    initSwitchBox(user);
  };
}