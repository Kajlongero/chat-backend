const app = document.getElementById("app");

const socket = io({
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  timeout: 30000,
});

let username = prompt("Write your username", "Pablito");

let user = {};

socket.on("connect", () => {
  socket.emit("joining-app", username);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err);
});

socket.on("app-join-success", (data) => {
  user = {
    ...data.user,
  };

  document.getElementById("username").innerHTML += ` ${user.username}`;
});
