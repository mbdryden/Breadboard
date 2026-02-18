const firebaseConfig = {
  apiKey: "AIzaSyBpfr0ZTuVGPOa72tEi1ui3_vqhA63-jGg",
  authDomain: "breadboard-297d4.firebaseapp.com",
  databaseURL: "https://breadboard-297d4-default-rtdb.firebaseio.com",
  projectId: "breadboard-297d4",
  storageBucket: "breadboard-297d4.firebasestorage.app",
  messagingSenderId: "136042113028",
  appId: "1:136042113028:web:43272123e5aebbf7f56d51"
};

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // Not logged in, send back to login
    window.location.href = "index.html";
    return;
  }
  document.getElementById("welcomeMsg").textContent =
    `Welcome, ${user.email}! Your account has been created.`;
});

document.getElementById("continueBtn").onclick = () => {
  window.location.href = "index.html";
};