const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }
);

module.exports = mongoose.model("Tokens", TokenSchema);
