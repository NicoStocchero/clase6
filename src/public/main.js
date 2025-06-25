const socket = io(); // Conexión al servidor WebSocket

// Obtener nombre de usuario
let username = prompt("Ingrese su nombre de usuario")?.trim();
if (!username) username = "Anónimo";

// Emitir evento de login
socket.emit("login", username);

// Elementos del DOM
const inputMessage = document.getElementById("message");
const sendMessageButton = document.getElementById("send-message");
const messagesBox = document.getElementById("messages-box");

// Estilos separados
const getContainerStyle = (isMe) => `
  display: flex;
  justify-content: ${isMe ? "flex-end" : "flex-start"};
  padding: 2px 8px;
`;

const getBubbleStyle = (isMe) => `
  max-width: 70%;
  min-width: 120px;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  background-color: ${isMe ? "#4f46e5" : "#f1f5f9"};
  color: ${isMe ? "white" : "#1f2937"};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
`;

const getUserStyle = (isMe) => `
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 4px;
  color: ${isMe ? "#c7d2fe" : "#4f46e5"};
`;

const dateStyle = `
  text-align: right;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
`;

// Mostrar mensaje cuando se conecta un nuevo usuario
socket.on("new-user", (newUsername) => {
  const notice = document.createElement("p");
  notice.textContent = `🔔 ${newUsername} se ha conectado`;
  notice.style.color = "#888";
  notice.style.fontStyle = "italic";
  messagesBox.appendChild(notice);
  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// Renderizar mensajes agrupados por usuario
socket.on("all-messages", (data) => {
  if (!Array.isArray(data)) return;

  let lastUser = null;

  const tagHTML = data.length
    ? data.reduce((acc, doc) => {
        const isMe = doc.user === username;
        const showUser = doc.user !== lastUser;
        lastUser = doc.user;

        const userTag = showUser
          ? `<div style="${getUserStyle(isMe)}">${doc.user}</div>`
          : "";

        return (
          acc +
          `
          <div style="${getContainerStyle(isMe)}">
            <div style="${getBubbleStyle(isMe)}">
              ${userTag}
              <div>${doc.message}</div>
              <div style="${dateStyle}">${doc.date}</div>
            </div>
          </div>
          `
        );
      }, "")
    : `<p style="color: #888; font-style: italic;">No hay mensajes aún.</p>`;

  messagesBox.innerHTML = tagHTML;
  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// Enviar mensaje con botón
sendMessageButton.addEventListener("click", (e) => {
  e.preventDefault();

  const message = inputMessage.value.trim();
  if (!message) return;

  const date = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const data = {
    user: username,
    message,
    date,
  };

  socket.emit("new-message", data);
  inputMessage.value = "";
});

// Enviar con Enter
inputMessage.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessageButton.click();
  }
});
