const bcrypt = require("bcrypt")

const hashPassword = (plain, saltRounds = 10) =>
    bcrypt.hash(plain, saltRounds);

const comparePassword = (plain, hashed) =>
    bcrypt.compare(plain, hashed);

module.exports = {
    hashPassword,
    comparePassword,
};
