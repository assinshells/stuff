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
 *
 * Благодаря express-async-errors, не нужно оборачивать в try/catch
 */

/**
 * Получить всех пользователей с пагинацией и фильтрацией
 * GET /api/users?page=1&limit=10&role=admin&isActive=true
 */
export const getAllUsers = async (req, res) => {
  // Пагинация
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  // Фильтры
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  }

  // Выполняем запросы параллельно
  const [users, total] = await Promise.all([
    User.find(filter).limit(limit).skip(skip).sort({ createdAt: -1 }).lean(), // Для производительности
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
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
};

/**
 * Получить пользователя по ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);

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
 * Body: { name, email, age?, role? }
 */
export const createUser = async (req, res) => {
  const { name, email, age, role } = req.body;

  // Проверка на существование email
  const existingUser = await User.findByEmail(email);
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
    message: "User created successfully",
  });
};

/**
 * Обновить пользователя
 * PUT /api/users/:id
 * Body: { name?, email?, age?, role?, isActive? }
 */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Проверяем уникальность email если он меняется
  if (updates.email) {
    const existingUser = await User.findOne({
      email: updates.email.toLowerCase(),
      _id: { $ne: id },
    });

    if (existingUser) {
      throw new ConflictError("Email already exists");
    }
  }

  // Обновляем пользователя
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
    message: "User updated successfully",
  });
};

/**
 * Удалить пользователя
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      message: "User deleted successfully",
    },
  });
};

/**
 * Получить статистику пользователей
 * GET /api/users/stats
 */
export const getUserStats = async (req, res) => {
  // Используем aggregation для эффективного подсчета
  const stats = await User.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
        byStatus: [{ $group: { _id: "$isActive", count: { $sum: 1 } } }],
      },
    },
  ]);

  // Форматируем результат
  const result = {
    total: stats[0].total[0]?.count || 0,
    byRole: {},
    byStatus: {},
  };

  stats[0].byRole.forEach((item) => {
    result.byRole[item._id] = item.count;
  });

  stats[0].byStatus.forEach((item) => {
    result.byStatus[item._id ? "active" : "inactive"] = item.count;
  });

  res.json({
    success: true,
    data: result,
  });
};
