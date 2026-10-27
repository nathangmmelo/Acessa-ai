const form = document.querySelector("#auth-form");
const nameGroup = document.querySelector("#name-group");
const nameInput = document.querySelector("#nome");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#senha");
const passwordHint = document.querySelector("#password-hint");
const message = document.querySelector("#form-message");
const submitButton = document.querySelector("#submit-button");
const submitLabel = document.querySelector("#submit-label");
const switchMode = document.querySelector("#switch-mode");
const switchPrompt = document.querySelector("#switch-prompt");
const subtitle = document.querySelector("#subtitle");
const passwordToggle = document.querySelector(".toggle-password");

let mode = "login";

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `form-message ${type}`;
}

function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === "register";
  nameGroup.hidden = !registering;
  nameInput.required = registering;
  passwordHint.hidden = !registering;
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  submitLabel.textContent = registering ? "Criar conta" : "Entrar";
  subtitle.textContent = registering ? "Crie sua conta" : "Acesse sua conta";
  switchPrompt.textContent = registering ? "Já tem uma conta?" : "Não tem uma conta?";
  switchMode.textContent = registering ? "Entrar" : "Criar conta";
  setMessage("");
}

switchMode.addEventListener("click", (event) => {
  event.preventDefault();
  setMode(mode === "login" ? "register" : "login");
});

passwordToggle.addEventListener("click", () => {
  const reveal = passwordInput.type === "password";
  passwordInput.type = reveal ? "text" : "password";
  passwordToggle.setAttribute("aria-label", reveal ? "Ocultar senha" : "Mostrar senha");
  passwordToggle.title = reveal ? "Ocultar senha" : "Mostrar senha";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value
  };
  if (mode === "register") payload.name = nameInput.value.trim();

  submitButton.disabled = true;
  submitLabel.textContent = mode === "register" ? "Criando..." : "Entrando...";

  try {
    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      const detail = Array.isArray(data.detail)
        ? data.detail.map(item => item.msg).join(" ")
        : (data.detail || "Não foi possível concluir a solicitação.");
      setMessage(detail, "error");
      return;
    }

    setMessage(data.message || "Tudo certo!", "success");
    window.location.assign("/dashboard.html");
  } catch (error) {
    setMessage("Não foi possível conectar ao servidor. Confira se a API está em execução.", "error");
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = mode === "register" ? "Criar conta" : "Entrar";
  }
});
