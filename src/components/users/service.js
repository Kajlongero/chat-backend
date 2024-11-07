const crypto = require("crypto");

class UsersService {
  constructor() {
    this.users = new Map();
  }

  registerUser(data) {
    const id = crypto.randomUUID();

    const obj = {
      userId: id,
      username: data.username,
    };

    this.users.set(id, obj);

    return this.users.get(id);
  }

  hasUser(userId) {
    return this.users.has(userId);
  }

  disconnectUser(userId) {
    if (this.hasUser(userId)) {
      this.users.delete(userId);
    }

    return null;
  }
}

module.exports = UsersService;
