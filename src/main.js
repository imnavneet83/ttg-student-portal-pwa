import "./style.css";
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true
});

const LOGO_URL = "/logo.png";
const BANNER_URL = "/banner.png";
const API_URL = "https://script.google.com/macros/s/AKfycbx73z-O6LOeh4Lph5aADRZXjf6ZIRsSzvNmVsS9xcSsv_ikNJbSCZTw29GNdarm6S7Y/exec";

document.querySelector("#app").innerHTML = `
  <div class="container">

    <div class="header">
      <img src="${LOGO_URL}" class="logo" />

      <h1>The Toppers Gurukul</h1>
      <p>Student Portal</p>
    </div>

    <img src="${BANNER_URL}" class="banner" />

    <div class="login-card">
      <input type="text" id="studentId" placeholder="Student ID" />
      <input type="password" id="password" placeholder="Password" />

      <button id="loginBtn">Login</button>

      <div id="message"></div>
    </div>

  </div>
`;
document.getElementById("loginBtn").addEventListener("click", login);

async function login() {

  const studentId =
    document.getElementById("studentId").value.trim();

  const password =
    document.getElementById("password").value.trim();

  const message =
    document.getElementById("message");

  message.innerHTML = "Checking...";

  try {

    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "login",
        studentId,
        password
      })
    });

    const data = await response.json();

    if (data.success) {

  localStorage.setItem("ttgStudentData", JSON.stringify(data));

  showDashboard(data);

  console.log(data);

} else {

      message.style.color = "red";
      message.innerHTML =
        data.message;
    }

  } catch (error) {

    message.style.color = "red";
    message.innerHTML =
      "Server connection failed";
  }
}
function showDashboard(data) {
  const s = data.student;

  let html = `
    <div class="container">
      <div class="header">
        <img src="${LOGO_URL}" class="logo" />
        <h1>The Toppers Gurukul</h1>
        <h2>Welcome, ${s.name}</h2>
        <div class="subtitle">Student Academic Dashboard</div>
      </div>

      <div class="profile-card">
        <div class="profile-details">
          <h2>${s.name}</h2>
          <p><b>Class:</b> ${s.className}</p>
          <p><b>Student ID:</b> ${s.id}</p>
          <p><b>Mobile:</b> ${s.mobile}</p>
        </div>

        <div class="profile-photo-wrap">
          <img src="${s.photoUrl}" class="student-photo">
        </div>
      </div>

      <div class="summary">
        <div class="summary-box" style="background:#006b8f;">
          📚<br>Class<br>${s.className}
        </div>

        <div class="summary-box" style="background:#28a745;">
          ✅<br>Attendance<br>${s.attendance}
        </div>

        <div class="summary-box" style="background:${s.feeStatus.toLowerCase() === 'paid' ? '#17a2b8' : '#dc3545'};">
          💰<br>Fee Status<br>${s.feeStatus}
        </div>

        <div class="summary-box" style="background:#ff9800;">
          🏆<br>Monthly Rank<br>${data.scores.monthlyRank}
        </div>
      </div>

      ${s.feeStatus.toLowerCase() !== 'paid' ? `
        <div class="card" style="border-left:5px solid #dc3545;">
          <h3>💰 Fee Due Reminder</h3>
          <p style="font-size:18px;">
            Outstanding Amount: <b>₹${s.feeDueAmount}</b>
          </p>
        </div>
      ` : ''}

      <div class="performance-row">
        <div class="card">
          <h3>🏆 Monthly Performance</h3>

          <p><b>Total Marks This Month:</b>
          ${data.scores.monthlyTotal} / ${data.scores.monthlyMax}</p>

          <p><b>Monthly Overall Rank:</b>
          ${data.scores.monthlyRank}</p>

          <p style="font-weight:bold;color:#006b8f;margin-top:12px;border-top:1px solid #ddd;padding-top:10px;">
            ${
              data.scores.monthlyRank == 1
                ? '🏆 Scholarship Status: Congrats! You have got the 50% scholarship.'
                : '🏆 Scholarship Status: Need ' + (data.scores.marksNeededForRank1 || 0) + ' more marks to reach Rank 1.'
            }
          </p>
        </div>

        <div class="card">
          <h3>🏆 Monthly Top 3</h3>
          ${
            data.scores.leaderboard.map(item => `
              <p><b>${item.rank}.</b> ${item.name} - ${item.total} marks</p>
            `).join("")
          }
        </div>
      </div>

      <div class="card">
        <h3>📊 Score Card</h3>
        <table>
          <tr>
            <th>Date</th>
            <th>Subject</th>
            <th>Test</th>
            <th>Marks</th>
            <th>Rank</th>
          </tr>
  `;

  data.scores.tests.forEach(t => {
    html += `
      <tr>
        <td>${t.date}</td>
        <td>${t.subject}</td>
        <td>${t.testName}</td>
        <td>${t.marks}/${t.totalMarks}</td>
        <td>${t.rank}</td>
      </tr>
    `;
  });

  html += `</table></div>`;

  html += `<div class="card"><h3>📚 Notes</h3>`;
  data.notes.forEach(n => {
    html += `<p>${n.subject}: <a href="${n.link}" target="_blank">${n.title}</a></p>`;
  });
  html += `</div>`;

  html += `<div class="card"><h3>📢 Notices</h3>`;
  data.notices.forEach(n => {
    html += `<p><b>${n.date}:</b> ${n.notice}</p>`;
  });
  html += `</div>`;

  html += `
      <div class="card">
        <h3>🔐 Change Password</h3>

        <input type="password" id="currentPassword" placeholder="Current Password">
        <input type="password" id="newPassword" placeholder="New Password">

        <button id="changePasswordBtn">Change Password</button>

        <p id="passwordMessage"></p>
      </div>

      <button id="logoutBtn">Logout</button>

      <div class="footer">
        The Toppers Gurukul<br>
        Katahari Bagh Road, In Front of Vaibhaw Palace, Chapra<br>
        Contact: 9204506080
      </div>
    </div>
  `;

  document.querySelector("#app").innerHTML = html;

  document
    .getElementById("changePasswordBtn")
    .addEventListener("click", () => changeMyPassword(s.id));
    document
  .getElementById("logoutBtn")
  .addEventListener("click", () => {
    localStorage.removeItem("ttgStudentData");
    location.reload();
  });
}
const savedStudentData = localStorage.getItem("ttgStudentData");

if (savedStudentData) {
  showDashboard(JSON.parse(savedStudentData));
}