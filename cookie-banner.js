document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("rinawarp-cookie-banner");
  const dismissBtn = document.getElementById("rinawarp-cookie-dismiss");

  if (!localStorage.getItem("rinawarp-cookie-accepted")) {
    banner.style.display = "block";
  }

  dismissBtn.addEventListener("click", () => {
    banner.style.display = "none";
    localStorage.setItem("rinawarp-cookie-accepted", "true");
  });
});