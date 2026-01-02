import mongoose from "mongoose";

/**
 * Модель пользователя
 *
 * Особенности:
 * - Индексы для быстрого поиска
 * - Автоматические timestamps
 * - Виртуальные поля
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
      index: true, // Индекс для быстрого поиска
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
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
      index: true, // Индекс для фильтрации по роли
    },

    // Активность аккаунта
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Индекс для фильтрации по статусу
    },
  },
  {
    // Автоматически добавляет createdAt и updatedAt
    timestamps: true,

    // Настройки toJSON для скрытия внутренних полей
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },

    // Также настройки toObject
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

// Составной индекс для частых запросов
userSchema.index({ isActive: 1, createdAt: -1 });
userSchema.index({ role: 1, isActive: 1 });

// ============= ВИРТУАЛЬНЫЕ ПОЛЯ =============

// Виртуальное поле - не хранится в БД
userSchema.virtual("ageGroup").get(function () {
  if (!this.age) return "Unknown";
  if (this.age < 18) return "Minor";
  if (this.age < 60) return "Adult";
  return "Senior";
});

// ============= МЕТОДЫ ЭКЗЕМПЛЯРА =============

/**
 * Получить публичную информацию о пользователе
 * @returns {Object} Публичные данные пользователя
 */
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
  };
};

/**
 * Проверить, является ли пользователь админом
 * @returns {Boolean}
 */
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// ============= СТАТИЧЕСКИЕ МЕТОДЫ =============

/**
 * Найти активных пользователей
 * @returns {Promise<Array>} Массив активных пользователей
 */
userSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

/**
 * Подсчитать пользователей по роли
 * @param {String} role - Роль пользователя
 * @returns {Promise<Number>} Количество пользователей
 */
userSchema.statics.countByRole = function (role) {
  return this.countDocuments({ role });
};

/**
 * Найти пользователя по email (case-insensitive)
 * @param {String} email - Email пользователя
 * @returns {Promise<Object>} Пользователь или null
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// ============= MIDDLEWARE (HOOKS) =============

/**
 * Pre-save hook - выполняется перед сохранением
 * Можно использовать для дополнительной обработки
 */
userSchema.pre("save", function (next) {
  // Пример: нормализация email
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase().trim();
  }

  next();
});

/**
 * Pre-remove hook - выполняется перед удалением
 * Можно использовать для очистки связанных данных
 */
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    // Пример: удаление связанных документов
    // await RelatedModel.deleteMany({ userId: this._id });

    next();
  }
);

// Создание модели
const User = mongoose.model("User", userSchema);

export default User;
