const API_URL = "http://localhost:5000/students";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.href = "login.html";

// Show Add Student only for admin
if (role === "admin") {
  document.getElementById("adminControls").style.display = "block";
}

let currentPage = 1;
const studentsPerPage = 5;
let allStudents = [];
let editingId = null;
let deletingId = null;

// ================================
// NOTIFICATION
// ================================
function showNotification(message, success = true) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.background = success ? "#4caf50" : "#e04444";
  notification.classList.add("show");
  setTimeout(() => notification.classList.remove("show"), 2500);
}

// ================================
// FETCH STUDENTS
// ================================
async function fetchStudents() {
  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    allStudents = Array.isArray(data) ? data : [];
    currentPage = 1;
    displayStudents(allStudents);
  } catch (err) {
    showNotification("Failed to fetch students", false);
  }
}

// ================================
// DISPLAY STUDENTS
// ================================
function displayStudents(students) {
  const container = document.getElementById("students");
  const emptyState = document.getElementById("emptyState");
  container.innerHTML = "";

  emptyState.style.display = students.length === 0 ? "block" : "none";

  const start = (currentPage - 1) * studentsPerPage;
  const paginated = students.slice(start, start + studentsPerPage);

  paginated.forEach(s => {
    const card = document.createElement("div");
    card.className = "student-card";

    // ✅ Edit and Delete only for ADMIN
    const adminActions = role === "admin" ? `
      <div class="student-actions">
        <button class="btn-edit" onclick="openEdit('${s._id}','${s.name}','${s.roll}','${s.course}')">Edit</button>
        <button class="btn-delete" onclick="openDeleteModal('${s._id}')">Delete</button>
      </div>
    ` : "";

    card.innerHTML = `
      <div class="student-info">
        <strong>${s.name}</strong>
        <p>Roll: ${s.roll} &nbsp;|&nbsp; Course: ${s.course}</p>
      </div>
      ${adminActions}
    `;

    container.appendChild(card);
  });

  renderPagination(students.length);
}

// ================================
// PAGINATION
// ================================
function renderPagination(total) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pages = Math.ceil(total / studentsPerPage);
  if (pages <= 1) return;

  const prev = document.createElement("button");
  prev.textContent = "Prev";
  prev.disabled = currentPage === 1;
  prev.onclick = () => { currentPage--; displayStudents(allStudents); };
  pagination.appendChild(prev);

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => { currentPage = i; displayStudents(allStudents); };
    pagination.appendChild(btn);
  }

  const next = document.createElement("button");
  next.textContent = "Next";
  next.disabled = currentPage === pages;
  next.onclick = () => { currentPage++; displayStudents(allStudents); };
  pagination.appendChild(next);
}

// ================================
// SEARCH
// ================================
function filterStudents() {
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.course.toLowerCase().includes(query)
  );
  currentPage = 1;
  displayStudents(filtered);
}

// ================================
// SORT
// ================================
function sortStudents() {
  const value = document.getElementById("sort").value;
  let sorted = [...allStudents];
  if (value === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (value === "name-desc") sorted.sort((a, b) => b.name.localeCompare(a.name));
  else if (value === "roll-asc") sorted.sort((a, b) => Number(a.roll) - Number(b.roll));
  currentPage = 1;
  displayStudents(sorted);
}

// ================================
// ADD STUDENT (admin only)
// ================================
async function addStudent() {
  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const course = document.getElementById("course").value.trim();

  if (!name || !roll || !course) {
    alert("All fields are required!");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name, roll, course })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    document.getElementById("name").value = "";
    document.getElementById("roll").value = "";
    document.getElementById("course").value = "";
    fetchStudents();
    showNotification("Student added successfully!");
  } catch (err) {
    showNotification(err.message || "Failed to add student", false);
  }
}

// ================================
// EDIT STUDENT (admin only)
// ================================
function openEdit(id, name, roll, course) {
  editingId = id;
  document.getElementById("editName").value = name;
  document.getElementById("editRoll").value = roll;
  document.getElementById("editCourse").value = course;
  document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

async function saveEdit() {
  const name = document.getElementById("editName").value.trim();
  const roll = document.getElementById("editRoll").value.trim();
  const course = document.getElementById("editCourse").value.trim();

  try {
    const res = await fetch(`${API_URL}/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name, roll, course })
    });

    if (!res.ok) throw new Error();
    closeModal();
    fetchStudents();
    showNotification("Student updated successfully!");
  } catch {
    showNotification("Failed to update student", false);
  }
}

// ================================
// DELETE STUDENT (admin only)
// ================================
function openDeleteModal(id) {
  deletingId = id;
  document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
}

document.getElementById("confirmDeleteBtn").onclick = async () => {
  try {
    const res = await fetch(`${API_URL}/${deletingId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });
    if (!res.ok) throw new Error();
    closeDeleteModal();
    fetchStudents();
    showNotification("Student deleted successfully!");
  } catch {
    showNotification("Failed to delete student", false);
  }
};

// ================================
// LOGOUT
// ================================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// ================================
// INIT
// ================================
fetchStudents();