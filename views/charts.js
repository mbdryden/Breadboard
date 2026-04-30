let tempChartInstance = null;
let humidChartInstance = null;

function renderChart(tempLog, idealTemp, idealHumidity) {
  const labels = tempLog.map(e =>
    new Date(e.logTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })
  );
  const temps  = tempLog.map(e => e.temp);
  const humids = tempLog.map(e => e.humdi);

  const tempColors  = temps.map(t => {
    const diff = Math.abs(t - idealTemp);
    if (diff <= 1) return '#5C633E';
    if (diff <= 3) return '#D39932';
    return '#AE5228';
  });

  const humidColors = humids.map(h => {
    const diff = Math.abs(h - idealHumidity);
    if (diff <= 10)  return '#5C633E';
    if (diff <= 20)  return '#D39932';
    return '#AE5228';
  });

  if (tempChartInstance) tempChartInstance.destroy();
  tempChartInstance = new Chart(document.getElementById('tempChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Temperature (°F)', data: temps, backgroundColor: tempColors, borderRadius: 4, borderSkipped: false }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}°F  (ideal: ${idealTemp}°F)` } } },
      scales: {
        y: { ticks: { callback: v => v + '°F', color: '#996633', font: { family: 'Canela' } }, grid: { color: '#CAB592' } },
        x: { ticks: { autoSkip: true, maxTicksLimit: 8, maxRotation: 0, color: '#996633', font: { family: 'Canela' } }, grid: { display: false } }
      }
    }
  });

  if (humidChartInstance) humidChartInstance.destroy();
  humidChartInstance = new Chart(document.getElementById('humidityChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Humidity (%)', data: humids, backgroundColor: humidColors, borderRadius: 4, borderSkipped: false }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}%  (ideal: ${idealHumidity}%)` } } },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%', color: '#996633', font: { family: 'Canela' } }, grid: { color: '#CAB592' } },
        x: { ticks: { autoSkip: true, maxTicksLimit: 8, maxRotation: 0, color: '#996633', font: { family: 'Canela' } }, grid: { display: false } }
      }
    }
  });
}