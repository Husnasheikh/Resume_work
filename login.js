async function login(role) {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    document.getElementById("errorMsg").textContent = "Please enter username and password.";
    return;
  }

  const res = await fetch("http://localhost:5000/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("errorMsg").textContent = data.error || "Login failed";
  }
}

document.getElementById("adminBtn").addEventListener("click", () => login("admin"));
document.getElementById("viewerBtn").addEventListener("click", () => login("viewer"));