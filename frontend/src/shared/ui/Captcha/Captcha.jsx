import { useEffect, useRef } from "react";
import "./Captcha.css";

export const Captcha = ({ onChange, error }) => {
  const captchaRef = useRef(null);
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    // In development mode, auto-generate a fake captcha token
    if (isDevelopment) {
      const fakeToken = `dev_captcha_${Date.now()}`;
      onChange(fakeToken);
      return;
    }

    // In production, load reCAPTCHA script
    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        renderRecaptcha();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderRecaptcha;
      document.body.appendChild(script);
    };

    const renderRecaptcha = () => {
      if (captchaRef.current && window.grecaptcha) {
        window.grecaptcha.render(captchaRef.current, {
          sitekey: import.meta.env.VITE_CAPTCHA_SITE_KEY,
          callback: onChange,
        });
      }
    };

    loadRecaptcha();
  }, [onChange, isDevelopment]);

  if (isDevelopment) {
    return (
      <div className="captcha-container">
        <div className="captcha-dev">
          <div className="captcha-dev-icon">✓</div>
          <div className="captcha-dev-text">
            <strong>Development Mode</strong>
            <span>Captcha verification bypassed</span>
          </div>
        </div>
        {error && <div className="captcha-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="captcha-container">
      <div ref={captchaRef} className="captcha-widget"></div>
      {error && <div className="captcha-error">{error}</div>}
    </div>
  );
};

export default Captcha;
