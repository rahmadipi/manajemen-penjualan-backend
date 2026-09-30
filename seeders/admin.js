const bcrypt = require("bcryptjs");
const config = require("../config/env");
const { User } = require("../models");

// Membuat akun admin awal bila belum ada. Password disimpan dalam bentuk hash bcrypt.
module.exports = async function ensureAdmin() {
  const { username, password } = config.admin;
  const [user, created] = await User.findOrCreate({
    where: { username },
    defaults: { password: await bcrypt.hash(password, 10) },
  });
  if (created) console.log(`Akun admin dibuat (username: ${username})`);
  return user;
};
