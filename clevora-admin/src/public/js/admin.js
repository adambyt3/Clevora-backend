document.addEventListener("DOMContentLoaded", () => {
  // 1. Sidebar toggler for mobile screens
  const sidebarCollapse = document.getElementById("sidebarCollapse");
  const sidebar = document.querySelector(".sidebar");

  if (sidebarCollapse && sidebar) {
    sidebarCollapse.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 991.98 && sidebar && sidebar.classList.contains("active")) {
      if (!sidebar.contains(e.target) && e.target !== sidebarCollapse && !sidebarCollapse.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    }
  });

  // 2. Auto-fade flash messages after 4 seconds
  const alerts = document.querySelectorAll(".alert-dismissible");
  alerts.forEach((alert) => {
    setTimeout(() => {
      // Use bootstrap fade effect
      alert.classList.add("fade");
      setTimeout(() => {
        alert.remove();
      }, 150);
    }, 4000);
  });
});
