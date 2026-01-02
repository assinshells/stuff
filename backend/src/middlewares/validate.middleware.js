import { ValidationError } from "../utils/errors.js";

/**
 * Middleware для валидации данных с использованием Joi
 *
 * Поддерживает валидацию:
 * - body - тело запроса
 * - params - параметры URL
 * - query - query параметры
 *
 * Пример использования:
 * router.post('/users', validate(userSchema), createUser);
 */

/**
 * Фабрика middleware для валидации
 * @param {Object} schema - Joi схема
 * @param {String} source - Источник данных ('body', 'params', 'query')
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    // Получаем данные из нужного источника
    const dataToValidate = req[source];

    // Опции валидации
    const options = {
      abortEarly: false, // Собираем все ошибки, не только первую
      stripUnknown: true, // Удаляем неизвестные поля
      errors: {
        wrap: {
          label: "", // Убираем кавычки вокруг имен полей
        },
      },
    };

    // Валидируем данные
    const { error, value } = schema.validate(dataToValidate, options);

    if (error) {
      // Форматируем ошибки валидации
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        type: detail.type,
      }));

      // Создаем кастомную ошибку
      throw new ValidationError("Validation failed", errors);
    }

    // Заменяем исходные данные на валидированные и очищенные
    req[source] = value;

    next();
  };
};

/**
 * Удобные обертки для разных источников данных
 */
export const validateBody = (schema) => validate(schema, "body");
export const validateParams = (schema) => validate(schema, "params");
export const validateQuery = (schema) => validate(schema, "query");
