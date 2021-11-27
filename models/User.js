const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, default: null},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date_naissance: { type: Date },
    sexe: { type: String, required: true },
    token: { type: String },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
