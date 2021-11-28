const mongoose = require("mongoose");

const TokensSchema = new mongoose.Schema(
  {
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }
);

module.exports = mongoose.model("Tokens", TokensSchema);
