import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    password: {
      type: String,
      // required: true,
    },
    pfp: {
      type: String,
    },
    uploadedFile: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Upload",
      },
    ],

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next;
  this.password = await bcrypt.hash(this.password, 12);
  return next;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },

    process.env.ACCESS_TOKEN_SECRET,

    {
      expiresIn: "15m",
    },
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },

    process.env.REFRESH_TOKEN_SECRET,

    {
      expiresIn: "7d",
    },
  );
};

const User = mongoose.model("User", userSchema);

export default User;
