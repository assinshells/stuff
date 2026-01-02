import mongoose from "mongoose";

/**
 * Модель пользователя
 *
 * Особенности:
 * - Индексы для быстрого поиска
 * - Автоматические timestamps
 * - Виртуальные поля
 * - Хуки для обработки данных
 * - Методы экземпляра и статические методы
 */

const userSchema = new mongoose.Schema(
  {
    // Имя пользователя
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    // Email - уникальный идентификатор
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    // Возраст (опциональный)
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [150, "Age must be realistic"],
    },

    // Роль пользователя
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Активность аккаунта
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Автоматически добавляет createdAt и updatedAt
    timestamps: true,

    // Настройки toJSON для скрытия внутренних полей
    toJSON: {
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

// Индекс для быстрого поиска по email (уже есть unique)
// Составные индексы для частых запросов
userSchema.index({ isActive: 1, createdAt: -1 });

// ============= ВИРТУАЛЬНЫЕ ПОЛЯ =============

// Виртуальное поле - не хранится в БД
userSchema.virtual("ageGroup").get(function () {
  if (!this.age) return "Unknown";
  if (this.age < 18) return "Minor";
  if (this.age < 60) return "Adult";
  return "Senior";
});

// ============= ХУКИ (MIDDLEWARE) =============

// Pre-save hook - выполняется перед сохранением
userSchema.pre("save", function (next) {
  // Можно добавить логику, например хеширование пароля
  console.log("Saving user:", this.email);
  next();
});

// Post-save hook - после сохранения
userSchema.post("save", function (doc, next) {
  console.log("User saved:", doc.email);
  next();
});

// ============= МЕТОДЫ ЭКЗЕМПЛЯРА =============

// Метод для получения публичной информации
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
  };
};

// ============= СТАТИЧЕСКИЕ МЕТОДЫ =============

// Поиск активных пользователей
userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Подсчет по ролям
userSchema.statics.countByRole = function (role) {
  return this.countDocuments({ role });
};

// Создание модели
const User = mongoose.model("User", userSchema);

export default User;
