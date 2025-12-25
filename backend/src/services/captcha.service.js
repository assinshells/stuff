import { ENV } from "../config/env.js";
import { logger } from "../utils/logger.js";

class CaptchaService {
  async verify(captchaToken) {
    // In development mode, just log and return true
    if (ENV.isDevelopment) {
      logger.info({ captchaToken }, "DEV MODE: Captcha verification skipped");
      return true;
    }

    // In production, verify with actual captcha service (e.g., reCAPTCHA)
    try {
      // Example for Google reCAPTCHA v2/v3
      const response = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `secret=${ENV.CAPTCHA_SECRET}&response=${captchaToken}`,
        }
      );

      const data = await response.json();

      if (!data.success) {
        logger.warn(
          { errorCodes: data["error-codes"] },
          "Captcha verification failed"
        );
        return false;
      }

      return true;
    } catch (error) {
      logger.error({ err: error }, "Captcha verification error");
      return false;
    }
  }
}

export const captchaService = new CaptchaService();
export default captchaService;
