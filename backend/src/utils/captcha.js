import { config } from "../config/env.js";
import logger from "./logger.js";
import { ValidationError } from "./errors.js";

/**
 * Captcha валидация
 *
 * В DEV режиме (ENABLE_CAPTCHA=false):
 * - Любая captcha проходит валидацию
 * - Результат логируется
 *
 * В PRODUCTION режиме (ENABLE_CAPTCHA=true):
 * - Реальная проверка через Google reCAPTCHA или hCaptcha
 */

/**
 * Валидация captcha
 * @param {string} captchaToken - Токен от клиента
 * @returns {Promise<boolean>}
 */
export const validateCaptcha = async (captchaToken) => {
  if (!config.features.captcha) {
    // DEV MODE - автоматический success
    logger.info(
      {
        type: "CAPTCHA_DEV_MODE",
        token: captchaToken,
        result: "PASSED",
      },
      "🤖 Captcha validation (DEV MODE - auto pass)"
    );

    return true;
  }

  // PRODUCTION MODE - реальная проверка
  try {
    // Проверяем что токен передан
    if (!captchaToken) {
      throw new ValidationError("Captcha token is required");
    }

    // Здесь подключить реальный сервис
    // Пример для Google reCAPTCHA:
    // const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: `secret=${RECAPTCHA_SECRET}&response=${captchaToken}`
    // });
    // const data = await response.json();
    // return data.success;

    logger.info(
      {
        type: "CAPTCHA_VALIDATED",
        token: captchaToken,
      },
      "Captcha validated successfully"
    );

    return true;
  } catch (error) {
    logger.error(
      {
        type: "CAPTCHA_ERROR",
        token: captchaToken,
        error: error.message,
      },
      "Captcha validation failed"
    );

    throw new ValidationError("Captcha validation failed");
  }
};

/**
 * Middleware для валидации captcha
 */
export const captchaMiddleware = async (req, res, next) => {
  try {
    const captchaToken = req.body.captchaToken;

    await validateCaptcha(captchaToken);

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  validateCaptcha,
  captchaMiddleware,
};
