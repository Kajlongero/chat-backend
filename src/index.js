const express = require("express");
const path = require("path");
const app = express();
const ChatService = require("./components/chats/service");
const UsersService = require("./components/users/service");

const usersInstance = new UsersService();
const chatsInstance = new ChatService();

const { createServer } = require("http");
const { Server } = require("socket.io");

const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

io.on("connection", (socket) => {
  socket.on("joining-app", (username) => {
    const data = usersInstance.registerUser({ username });

    socket.userId = data.userId;

    socket.emit("app-join-success", {
      message: "Welcome",
      rooms: Object.values(chatsInstance.rooms),
      user: data,
    });
  });

  socket.on("join-room", async (data) => {
    const userId = socket.userId;

    if (!usersInstance.hasUser(userId))
      return socket.emit("chat-join-fail", {
        message: "Reload the app",
        error: true,
      });

    const room = chatsInstance.joinRoom();

    await socket.join(room.roomId);
    socket.roomId = room.roomId;

    socket.emit("chat-join-success", room);

    io.in(room.roomId).emit("chat-user-joined", {
      user: usersInstance.users.get(socket.userId),
    });
  });

  socket.on("leave-room", async (data) => {
    const roomId = socket.roomId;

    socket.to(roomId).emit("chat-leave-user", {
      user: usersInstance.users.get(socket.userId),
    });

    chatsInstance.exitRoom({ userId: socket.userId }, roomId);

    await socket.leave(roomId);
  });

  socket.on("send-message", async (content) => {
    const userId = socket.userId;

    if (!usersInstance.hasUser(userId))
      return socket.emit("chat-message-fail", {
        message: "Reload the app",
        error: true,
      });

    const roomId = socket.roomId ?? "";

    if (!chatsInstance.userInRoom(userId, roomId))
      return socket.emit("chat-message-fail", {
        message: "Re-enter the chat again",
        error: true,
      });

    const user = usersInstance.users.get(userId);

    await chatsInstance.sendMessage({
      username: user.username,
      userId,
      roomId,
      content,
    });

    socket.to(socket.roomId).emit("receive-message", {
      userId: user.userId,
      message: content,
      username: user.username,
    });
  });

  socket.on("disconnect", async () => {
    const userId = socket.userId;
    const roomId = socket.roomId;

    socket.to(roomId).emit("chat-leave-user", {
      user: usersInstance.users.get(socket.userId),
    });

    chatsInstance.exitRoom({ userId }, roomId);
    usersInstance.disconnectUser(userId);

    await socket.leave(roomId);
  });
});

server.listen(3000);
