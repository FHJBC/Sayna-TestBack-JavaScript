const jwt = require("jsonwebtoken");

// verify jwt
const verifyJWT = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        return { payload: decoded, expired: false };
    } catch (error) {
        return { payload: null, expired: error.message.include("jwt expired") };
    }
}

module.exports = verifyJWT;