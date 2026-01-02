import User from "../models/User.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";

/**
 * Контроллер пользователей - бизнес-логика
 *
 * Принцип: тонкие контроллеры, жирные модели
 * Контроллер отвечает за:
 * - Обработку запроса
 * - Вызов нужных методов модели
 * - Формирование ответа
 */

/**
 * Получить всех пользователей
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  // Пагинация и фильтрация
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Фильтры
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined)
    filter.isActive = req.query.isActive === "true";

  // Запрос к БД
  const [users, total] = await Promise.all([
    User.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 }) // Новые первыми
      .lean(), // Для производительности
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

/**
 * Получить пользователя по ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({
    success: true,
    data: user,
  });
};

/**
 * Создать нового пользователя
 * POST /api/users
 */
export const createUser = async (req, res) => {
  const { name, email, age, role } = req.body;

  // Проверка на существование email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError("Email already exists");
  }

  // Создание пользователя
  const user = await User.create({
    name,
    email,
    age,
    role,
  });

  res.status(201).json({
    success: true,
    data: user,
  });
};

/**
 * Обновить пользователя
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Проверяем уникальность email если он меняется
  if (updates.email) {
    const existingUser = await User.findOne({
      email: updates.email,
      _id: { $ne: id }, // Исключаем текущего пользователя
    });

    if (existingUser) {
      throw new ConflictError("Email already exists");
    }
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true, // Вернуть обновленный документ
    runValidators: true, // Запустить валидаторы схемы
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({
    success: true,
    data: user,
  });
};

/**
 * Удалить пользователя
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({
    success: true,
    data: { message: "User deleted successfully" },
  });
};

/**
 * Получить статистику пользователей
 * GET /api/users/stats
 */
export const getUserStats = async (req, res) => {
  const [total, activeCount, adminCount] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countByRole("admin"),
  ]);

  res.json({
    success: true,
    data: {
      total,
      active: activeCount,
      inactive: total - activeCount,
      admins: adminCount,
      users: total - adminCount,
    },
  });
};
