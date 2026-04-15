function showView(viewId) {
  document.querySelectorAll("[id^='view-']").forEach(el => {
    el.style.display = "none";
  });

  const el = document.getElementById("view-" + viewId);
  if (el) el.style.display = "block";
  else console.warn(`showView: missing element "view-${viewId}"`);

  const hideSubheader = ["switchBox", "addBox", "login", "signup"].includes(viewId);
  const subheader = document.getElementById("subheader");
  if (subheader) subheader.style.display = hideSubheader ? "none" : "block";

  const chartContainer = document.getElementById("temp-chart-container");
  if (chartContainer) chartContainer.style.display = "none";
}

function setActiveNav(buttonId) {
  // Remove active from all nav links
  document.querySelectorAll('nav li a').forEach(a => a.classList.remove('active'));
  // Add active to the clicked one
  const btn = document.getElementById(buttonId);
  if (btn) btn.classList.add('active');
}