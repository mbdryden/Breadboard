function showView(viewId) {
  document.querySelectorAll("[id^='view-']").forEach(el => {
    el.style.display = "none";
  });
  document.getElementById("view-" + viewId).style.display = "block";
  const hideSubheader = ["switchBox", "addBox", "login", "signup"].includes(viewId);
  document.getElementById("subheader").style.display = hideSubheader ? "none" : "block";
}