class ChatService {
  constructor() {
    this.rooms = {
      general: {
        roomId: "general",
        users: [],
        messages: [],
      },
    };
  }

  retrieveRoomInfo(roomId) {
    return this.rooms[roomId];
  }

  getTotalUsersInRoom(roomId) {
    return this.rooms[roomId].users.length;
  }

  joinRoom(user, roomId) {
    const exist = this.#existRoom(roomId);
    if (!exist) {
      const room = this.createRoom(user);

      return room;
    }

    this.rooms[roomId] = {
      ...this.rooms[roomId],
      users: [...this.rooms[roomId].users, user],
    };

    return this.rooms[roomId];
  }

  userInRoom(userId, roomId) {
    const room = this.rooms[roomId];

    const isIn = room.users.some((u) => u.userId === userId);

    if (!isIn) return false;

    return true;
  }

  exitRoom(user, roomId) {
    const room = this.rooms[roomId];

    if (!room) {
      return false;
    }

    const filterRoom = {
      ...room,
      users: room.users.filter((u) => u.userId !== user.userId),
    };

    this.rooms[roomId] = filterRoom;
    return true;
  }

  createRoom(data) {
    const id = crypto.randomUUID();

    const obj = {
      roomId: id,
      users: [data.user],
      messages: [],
    };

    this.rooms[id] = obj;

    return this.rooms[id];
  }

  #existRoom(roomId) {
    return this.rooms[roomId];
  }

  sendMessage(data) {
    const { roomId, userId, username, content } = data;

    const room = this.rooms[roomId];

    if (!room) return false;

    const inside = room.users.some((u) => u.userId === userId);
    if (!inside) return false;

    const message = {
      date: new Date().toDateString(),
      userId: data.userId,
      content: content,
      username: username,
    };

    const info = {
      ...room,
      messages: [...room.messages, message],
    };

    this.rooms[data.roomId] = info;

    return this.rooms[data.roomId];
  }
}

module.exports = ChatService;
