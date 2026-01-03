import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config/env.js";

const userSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: [true, "Nickname is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Nickname must be at least 3 characters"],
      maxlength: [30, "Nickname cannot exceed 30 characters"],
      match: [
        /^[a-z0-9_]+$/,
        "Nickname can only contain lowercase letters, numbers and underscores",
      ],
      index: true,
    },

    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    passwordResetToken: String,
    passwordResetExpires: Date,

    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ============= ИНДЕКСЫ =============

userSchema.index({ isActive: 1, createdAt: -1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ passwordResetToken: 1, passwordResetExpires: 1 });

// ============= ВИРТУАЛЬНЫЕ ПОЛЯ =============

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ============= MIDDLEWARE (HOOKS) =============

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("save", function (next) {
  const MAX_TOKENS = 5;

  if (this.refreshTokens && this.refreshTokens.length > MAX_TOKENS) {
    this.refreshTokens = this.refreshTokens
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_TOKENS);
  }

  next();
});

// ============= МЕТОДЫ ЭКЗЕМПЛЯРА =============

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (
    this.loginAttempts + 1 >= config.security.maxLoginAttempts &&
    !this.isLocked
  ) {
    updates.$set = { lockUntil: Date.now() + config.security.lockoutDuration };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    nickname: this.nickname,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

userSchema.methods.hasRole = function (...roles) {
  return roles.includes(this.role);
};

// ============= СТАТИЧЕСКИЕ МЕТОДЫ =============

userSchema.statics.findByCredential = function (credential) {
  // Ищем только по nickname (без email)
  return this.findOne({ nickname: credential.toLowerCase() }).select(
    "+password"
  );
};

userSchema.statics.findByPasswordResetToken = function (token) {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model("User", userSchema);

export default User;
