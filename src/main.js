import "./style.css";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  }
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
async function openFeePopup(studentId) {
  const popup = document.createElement("div");
  popup.id = "feePopup";
  popup.className = "attendance-popup-overlay";

  popup.innerHTML = `
    <div class="attendance-popup">
      <h2>💰 Fee Details</h2>
      <p>Loading fee details...</p>
    </div>
  `;

  document.body.appendChild(popup);
  document.body.style.overflow = "hidden";

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.remove();
      document.body.style.overflow = "";
    }
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getFeeSummary",
        studentId: studentId
      })
    });

    const data = await response.json();

    if (data.success && data.fee) {
      const f = data.fee;

      document.querySelector("#feePopup .attendance-popup").innerHTML = `
        <h2>💰 Fee Details</h2>

        <div class="fee-detail-box">
  <p><b>Status:</b> ${f.status}</p>
  <p><b>${f.status === "Advance" ? "Advance Balance" : "Payable Amount"}:</b> ₹${f.displayAmount}</p>
</div>

<div class="fee-statement-box">
  <h3>Fee Statement</h3>

  <div class="fee-statement-table">
    <div class="fee-row fee-header">
      <div>Date</div>
      <div>Details</div>
      <div>+</div>
      <div>-</div>
      <div>Bal.</div>
</div>

    ${f.statement.map(row => `
      <div class="fee-row">
        <div>${row.date}</div>
        <div>${row.description}</div>
        <div>${row.charges ? row.charges : "-"}</div>
        <div>${row.payments ? row.payments : "-"}</div>
        <div>${row.balance}</div>
      </div>
    `).join("")}
  </div>
</div>
<div style="
margin-top:10px;
font-size:12px;
color:#666;
text-align:center;">
+ = Charges &nbsp;&nbsp;&nbsp; − = Payments &nbsp;&nbsp;&nbsp; Amounts in ₹
</div>
        <button id="closeFeePopup" class="close-popup-btn">Close</button>
      `;

    } else {
      document.querySelector("#feePopup .attendance-popup").innerHTML = `
        <h2>💰 Fee Details</h2>
        <p>Fee details not available.</p>
        <button id="closeFeePopup" class="close-popup-btn">Close</button>
      `;
    }

    document
      .getElementById("closeFeePopup")
      .addEventListener("click", () => {
        popup.remove();
        document.body.style.overflow = "";
      });

  } catch (error) {
    document.querySelector("#feePopup .attendance-popup").innerHTML = `
      <h2>💰 Fee Details</h2>
      <p>Could not load fee details.</p>
      <button id="closeFeePopup" class="close-popup-btn">Close</button>
    `;

    document
      .getElementById("closeFeePopup")
      .addEventListener("click", () => {
        popup.remove();
        document.body.style.overflow = "";
      });
  }
}
async function loadFeeSummary(studentId) {
  const feeBox = document.getElementById("feeStatusText");

  if (!feeBox) return;

  if (!studentId) {
    feeBox.innerHTML = "--";
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getFeeSummary",
        studentId: studentId
      })
    });

    const data = await response.json();

    if (data.success && data.fee) {
      if (data.fee.status === "Paid") {
        feeBox.innerHTML = "Paid";
        document.getElementById("feeCard").style.background = "#17a2b8";
      } else if (data.fee.status === "Advance") {
        feeBox.innerHTML = "Advance ₹" + data.fee.displayAmount;
        document.getElementById("feeCard").style.background = "#28a745";
      } else {
        feeBox.innerHTML =
          data.fee.status + " ₹" + data.fee.displayAmount;
        document.getElementById("feeCard").style.background =
          data.fee.status === "Overdue" ? "#dc3545" : "#ff9800";
      }
    } else {
      feeBox.innerHTML = "--";
    }

  } catch (err) {
    feeBox.innerHTML = "--";
  }
}
async function loadAttendanceSummary(studentId) {
  const attendanceBox = document.getElementById("attendancePercent");

  if (!attendanceBox) return;

  if (!studentId) {
    attendanceBox.innerHTML = "--";
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getAttendanceSummary",
        studentId: studentId
      })
    });

    const data = await response.json();

    if (data.success && data.attendance) {
      attendanceBox.innerHTML = data.attendance.percentage + "%";
    } else {
      attendanceBox.innerHTML = "--";
    }
  } catch (err) {
    attendanceBox.innerHTML = "--";
  }
}
async function openAttendancePopup(studentId) {
  const popup = document.createElement("div");
  popup.id = "attendancePopup";
  popup.className = "attendance-popup-overlay";

  popup.innerHTML = `
    <div class="attendance-popup">
      <h2>📅 Attendance</h2>
      <p>Loading months...</p>
    </div>
  `;

  document.body.appendChild(popup);
  document.body.style.overflow = "hidden";

  const escHandler = (e) => {
    if (e.key === "Escape") {
      popup.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", escHandler);
    }
  };

  document.addEventListener("keydown", escHandler);

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", escHandler);
    }
  });

  const allMonths = [
    { display: "July 2026", value: "Jul-2026", date: new Date(2026, 6, 1) },
    { display: "August 2026", value: "Aug-2026", date: new Date(2026, 7, 1) },
    { display: "September 2026", value: "Sep-2026", date: new Date(2026, 8, 1) },
    { display: "October 2026", value: "Oct-2026", date: new Date(2026, 9, 1) },
    { display: "November 2026", value: "Nov-2026", date: new Date(2026, 10, 1) },
    { display: "December 2026", value: "Dec-2026", date: new Date(2026, 11, 1) },
    { display: "January 2027", value: "Jan-2027", date: new Date(2027, 0, 1) },
    { display: "February 2027", value: "Feb-2027", date: new Date(2027, 1, 1) },
    { display: "March 2027", value: "Mar-2027", date: new Date(2027, 2, 1) }
  ];

  const today = new Date();

  let months = allMonths.filter(month => month.date <= today);

  if (months.length === 0) {
    months = [allMonths[0]];
  }

  let monthButtons = months.map(month => `
    <button class="month-btn" data-month="${month.value}">
      📅 ${month.display}
    </button>
  `).join("");

  document.querySelector(".attendance-popup").innerHTML = `
    <h2>📅 Attendance</h2>
    <p>Select Month</p>

    <div class="month-list">
      ${monthButtons}
    </div>

    <button id="closeAttendancePopup" class="close-popup-btn">
      Close
    </button>
  `;

  document
    .getElementById("closeAttendancePopup")
    .addEventListener("click", () => {
      popup.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", escHandler);
    });

  document.querySelectorAll(".month-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const month = btn.getAttribute("data-month");
      loadMonthlyAttendance(studentId, month);
    });
  });
}
async function loadMonthlyAttendance(studentId, month) {
  const popupBox = document.querySelector(".attendance-popup");

  popupBox.innerHTML = `
    <h2>📅 Attendance</h2>
    <p>Loading ${month}...</p>
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getMonthlyAttendance",
        studentId: studentId,
        month: month
      })
    });

    const data = await response.json();

    if (data.success) {
      showAttendanceCalendar(studentId, data);
    } else {
      popupBox.innerHTML = `
        <h2>📅 Attendance</h2>
        <p>${data.message}</p>
        <button class="close-popup-btn" onclick="document.getElementById('attendancePopup').remove()">Close</button>
      `;
    }

  } catch (err) {
    popupBox.innerHTML = `
      <h2>📅 Attendance</h2>
      <p>Could not load attendance.</p>
      <button class="close-popup-btn" onclick="document.getElementById('attendancePopup').remove()">Close</button>
    `;
  }
}
function showAttendanceCalendar(studentId, data) {
  const popupBox = document.querySelector(".attendance-popup");

  const monthMap = {
    "Jul-2026": { name: "July 2026", monthIndex: 6, year: 2026, days: 31 },
    "Aug-2026": { name: "August 2026", monthIndex: 7, year: 2026, days: 31 },
    "Sep-2026": { name: "September 2026", monthIndex: 8, year: 2026, days: 30 },
    "Oct-2026": { name: "October 2026", monthIndex: 9, year: 2026, days: 31 },
    "Nov-2026": { name: "November 2026", monthIndex: 10, year: 2026, days: 30 },
    "Dec-2026": { name: "December 2026", monthIndex: 11, year: 2026, days: 31 },
    "Jan-2027": { name: "January 2027", monthIndex: 0, year: 2027, days: 31 },
    "Feb-2027": { name: "February 2027", monthIndex: 1, year: 2027, days: 28 },
    "Mar-2027": { name: "March 2027", monthIndex: 2, year: 2027, days: 31 }
  };

  const monthInfo = monthMap[data.month];

  const firstDay = new Date(
    monthInfo.year,
    monthInfo.monthIndex,
    1
  ).getDay();

  let calendarCells = "";

  for (let i = 0; i < firstDay; i++) {
    calendarCells += `<div class="calendar-cell empty"></div>`;
  }

  for (let day = 1; day <= monthInfo.days; day++) {
    const dayData = data.days.find(d => d.day === day);
    const status = dayData ? dayData.status : "";

    let statusClass = "blank";
    let statusText = "-";

    if (status === "P") {
      statusClass = "present";
      statusText = "P";
    } else if (status === "A") {
      statusClass = "absent";
      statusText = "A";
    } else if (status === "L") {
      statusClass = "leave";
      statusText = "L";
    } else if (status === "H") {
      statusClass = "holiday";
      statusText = "H";
    }

    calendarCells += `
      <div class="calendar-cell ${statusClass}">
        <div class="day-number">${day}</div>
        <div class="status-text">${statusText}</div>
      </div>
    `;
  }

  popupBox.innerHTML = `
    <h2>📅 ${monthInfo.name}</h2>

    <div class="calendar-weekdays">
      <div>Sun</div>
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
    </div>

    <div class="attendance-calendar">
      ${calendarCells}
    </div>

    <div class="attendance-legend">
      <span class="legend present-dot">P</span> Present
      <span class="legend absent-dot">A</span> Absent
      <span class="legend leave-dot">L</span> Leave
      <span class="legend holiday-dot">H</span> Holiday
    </div>

    <button class="month-btn" id="backToMonths">Back to Months</button>
    <button class="close-popup-btn" onclick="document.getElementById('attendancePopup').remove()">Close</button>
  `;

  document
    .getElementById("backToMonths")
    .addEventListener("click", () => {
      document.getElementById("attendancePopup").remove();
      openAttendancePopup(studentId);
    });
}
function showDashboard(data) {
  const s = data.student;
  const studentIdForAttendance =
  s.id || s.studentId || s.StudentID || s.StudentId;

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

       <div class="summary-box"
     id="attendanceCard"
     style="background:#28a745;cursor:pointer;">
  📅<br>Attendance<br>
  <span id="attendancePercent">Loading...</span>
</div>

        <div class="summary-box"
     id="feeCard"
     style="background:#17a2b8;cursor:pointer;">
  💰<br>Fee Status<br>
  <span id="feeStatusText">Loading...</span>
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
  console.log("Student object:", s);
console.log("Student ID sent to attendance:", s.id || s.studentId || s.StudentID);

loadAttendanceSummary(studentIdForAttendance);
loadFeeSummary(studentIdForAttendance);
document
  .getElementById("feeCard")
  .addEventListener("click", () => {
    openFeePopup(studentIdForAttendance);
  });
document
  .getElementById("attendanceCard")
  .addEventListener("click", () => {
  openAttendancePopup(studentIdForAttendance);
  });
}
const savedStudentData = localStorage.getItem("ttgStudentData");

if (savedStudentData) {
  showDashboard(JSON.parse(savedStudentData));
}