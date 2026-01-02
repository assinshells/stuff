import { Router } from "express";
import Joi from "joi";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} from "../controllers/user.controller.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import {
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * Joi схемы валидации
 *
 * Преимущества:
 * - Декларативная валидация
 * - Автоматическая трансформация данных
 * - Подробные сообщения об ошибках
 * - Переиспользуемые схемы
 */

// Схема для создания пользователя
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),

  email: Joi.string().email().required().trim().lowercase().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
  }),

  age: Joi.number().integer().min(0).max(150).optional().messages({
    "number.min": "Age must be positive",
    "number.max": "Age must be realistic",
  }),

  role: Joi.string().valid("user", "admin").default("user").messages({
    "any.only": 'Role must be either "user" or "admin"',
  }),
});

// Схема для обновления (все поля опциональны)
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  email: Joi.string().email().trim().lowercase(),
  age: Joi.number().integer().min(0).max(150),
  role: Joi.string().valid("user", "admin"),
  isActive: Joi.boolean(),
}).min(1); // Хотя бы одно поле должно быть

// Схема для параметров ID
const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid ID format",
    }),
});

// Схема для query параметров списка
const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid("user", "admin"),
  isActive: Joi.boolean(),
});

/**
 * Роуты пользователей
 *
 * Порядок важен:
 * 1. Специфичные роуты (stats)
 * 2. Параметризованные роуты (:id)
 */

// GET /api/users/stats - статистика (должен быть первым!)
router.get("/stats", getUserStats);

// GET /api/users - список пользователей
router.get("/", validateQuery(listQuerySchema), getAllUsers);

// GET /api/users/:id - один пользователь
router.get("/:id", validateParams(idParamSchema), getUserById);

// POST /api/users - создать пользователя
router.post("/", validateBody(createUserSchema), createUser);

// PUT /api/users/:id - обновить пользователя
router.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  updateUser
);

// DELETE /api/users/:id - удалить пользователя
router.delete("/:id", validateParams(idParamSchema), deleteUser);

export default router;
