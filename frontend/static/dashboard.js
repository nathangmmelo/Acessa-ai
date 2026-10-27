const content = document.querySelector("#account-content");
const logoutLink = document.querySelector("#logout-link");

async function loadAccount() {
  try {
    const response = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!response.ok) {
      window.location.replace("/");
      return;
    }
    const data = await response.json();
    content.replaceChildren();

    const greeting = document.createElement("h2");
    greeting.textContent = `Olá, ${data.user.name}!`;
    greeting.style.textAlign = "center";
    greeting.style.fontSize = "20px";

    const email = document.createElement("p");
    email.textContent = `Você está conectado como ${data.user.email}.`;
    email.style.textAlign = "center";
    email.style.fontSize = "13px";

    content.append(greeting, email);
  } catch {
    content.textContent = "Não foi possível verificar sua sessão.";
  }
}

logoutLink.addEventListener("click", async (event) => {
  event.preventDefault();
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin"
  });
  window.location.replace("/");
});

loadAccount();
