function initSwitchBox(user) {
  const boxList = document.getElementById("boxList");
  boxList.innerHTML = "";

  db.ref("users/" + user.uid).get().then(userSnap => {
    const boxIds = userSnap.val().boxIds || [];
    const currBoxId = userSnap.val().currBoxId;
    document.getElementById("header").textContent = "switch boxes";

    boxIds.filter(boxId => boxId !== currBoxId).forEach(boxId => {
      db.ref("boxes/" + boxId).get().then(boxSnap => {
        const box = boxSnap.val();
        const name = box.boxName && box.boxName !== "No Box Name" ? box.boxName : boxId;

        const container = document.createElement("div");
        container.className = "box-row";

        const btn = document.createElement("button");
        btn.textContent = name;
        btn.onclick = () => {
          db.ref("users/" + user.uid).update({ currBoxId: boxId })
            .then(() => {
              showView("dashboard");
              initDashboard(user);
            })
            .catch(err => alert(err.message));
        };

        const removeBtn = document.createElement("button");
        removeBtn.className = "removeBtn";
        removeBtn.textContent = "✕";
        removeBtn.onclick = () => {
          const updatedBoxIds = boxIds.filter(id => id !== boxId);
          db.ref("users/" + user.uid).update({ boxIds: updatedBoxIds })
            .then(() => container.remove())
            .catch(err => alert(err.message));
        };

        container.appendChild(btn);
        container.appendChild(removeBtn);
        boxList.appendChild(container);
      });
    });
  });

  document.getElementById("addBoxBtn").onclick = () => {
    showView("addBox");
    initAddBox(user);
  };

  document.getElementById("homeBtn").onclick = () => {
    showView("dashboard");
    setActiveNav('homeBtn');
    initDashboard(user);
  };
}