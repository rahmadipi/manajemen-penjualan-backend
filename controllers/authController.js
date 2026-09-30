const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const { User } = require("../models");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { validateLogin } = require("../utils/validators");

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = validateLogin(req.body);
  const user = await User.findOne({ where: { username } });
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) throw new HttpError(401, "Username atau password salah");

  const token = jwt.sign(
    { id: user.id, username: user.username },
    config.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: config.jwtExpiresIn,
    },
  );
  res.json({ token, user: { id: user.id, username: user.username } });
});
