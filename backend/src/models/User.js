import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config/env.js";

const userSchema = new mongoose.Schema(
  {
    // Nickname - уникальный идентификатор
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

    // Email - опциональный
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

    // Пароль - всегда хешированный
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Не возвращаем по умолчанию
    },

    // Роль
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
      index: true,
    },

    // Активность
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Email подтвержден
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Refresh токены
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 60 * 60 * 24 * 7, // 7 дней
        },
      },
    ],

    // Сброс пароля
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Security - защита от брутфорса
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    // Последний логин
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

// Хеширование пароля перед сохранением
userSchema.pre("save", async function (next) {
  // Хешируем только если пароль изменился
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

// ============= МЕТОДЫ ЭКЗЕМПЛЯРА =============

/**
 * Проверить пароль
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

/**
 * Увеличить счетчик неудачных попыток входа
 */
userSchema.methods.incLoginAttempts = async function () {
  // Если есть блокировка и она истекла - сбросить
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Если достигнут лимит - заблокировать
  if (
    this.loginAttempts + 1 >= config.security.maxLoginAttempts &&
    !this.isLocked
  ) {
    updates.$set = { lockUntil: Date.now() + config.security.lockoutDuration };
  }

  return this.updateOne(updates);
};

/**
 * Сбросить счетчик попыток входа
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Получить публичный профиль
 */
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

/**
 * Проверить роль
 */
userSchema.methods.hasRole = function (...roles) {
  return roles.includes(this.role);
};

// ============= СТАТИЧЕСКИЕ МЕТОДЫ =============

/**
 * Найти пользователя по nickname или email
 */
userSchema.statics.findByCredential = function (credential) {
  const query = credential.includes("@")
    ? { email: credential.toLowerCase() }
    : { nickname: credential.toLowerCase() };

  return this.findOne(query).select("+password");
};

/**
 * Найти по токену сброса пароля
 */
userSchema.statics.findByPasswordResetToken = function (token) {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
};

const User = mongoose.model("User", userSchema);

export default User;
