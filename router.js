function showView(viewId) {
  document.querySelectorAll("[id^='view-']").forEach(el => {
    el.style.display = "none";
  });
  document.getElementById("view-" + viewId).style.display = "block";
  const hideSubheader = ["switchBox", "addBox", "login", "signup"].includes(viewId);
  document.getElementById("subheader").style.display = hideSubheader ? "none" : "block";
}

function setActiveNav(buttonId) {
  // Remove active from all nav links
  document.querySelectorAll('nav li a').forEach(a => a.classList.remove('active'));
  // Add active to the clicked one
  const btn = document.getElementById(buttonId);
  if (btn) btn.classList.add('active');
}