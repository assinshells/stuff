import { ValidationError } from "../utils/errors.js";

/**
 * Универсальный middleware для валидации данных с помощью Joi
 *
 * Поддерживаемые источники:
 * - body   (req.body)
 * - params (req.params)
 * - query  (req.query)
 *
 * Пример:
 * router.post('/users', validateBody(userSchema), createUser);
 */

/**
 * Фабрика middleware для валидации
 * @param {Object} schema - Joi schema (Joi.object({...}))
 * @param {'body' | 'params' | 'query'} source
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    // Защита от undefined (например, если нет express.json())
    const dataToValidate = req[source] ?? {};

    const options = {
      abortEarly: false, // показываем все ошибки
      stripUnknown: true, // удаляем лишние поля
      errors: {
        wrap: {
          label: "", // убираем кавычки вокруг полей
        },
      },
    };

    const { error, value } = schema.validate(dataToValidate, options);

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        type: detail.type,
      }));

      return next(new ValidationError("Validation failed", errors));
    }

    // Подменяем данные на валидированные и очищенные
    req[source] = value;

    next();
  };
};

/**
 * Удобные обёртки
 */
export const validateBody = (schema) => validate(schema, "body");
export const validateParams = (schema) => validate(schema, "params");
export const validateQuery = (schema) => validate(schema, "query");
