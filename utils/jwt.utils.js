const jwt = require("jsonwebtoken");

// verify jwt
const verifyJWT = async (token) => {
    try {
        const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

        return { payload: decoded, expired: false };
    } catch (error) {
        console.log({error: true, message: error.message });
        return { payload: null, expired: error.message === "jwt expired" };
    }
}

module.exports = verifyJWT;