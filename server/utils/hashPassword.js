const bcrypt = require("bcryptjs");

const HASH_ROUNDS = 10;

const normalizePassword = (value = "") => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
};

const hashPassword = async (password = "") =>
  bcrypt.hash(normalizePassword(password), HASH_ROUNDS);

module.exports = hashPassword;
