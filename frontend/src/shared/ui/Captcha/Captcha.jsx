import { useEffect, useRef } from "react";

export const Captcha = ({ onChange, error }) => {
  const captchaRef = useRef(null);
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    if (isDevelopment) {
      const fakeToken = `dev_captcha_${Date.now()}`;
      onChange(fakeToken);
      return;
    }

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
      <div>
        <div className="alert alert-warning d-flex align-items-center">
          <i
            className="bi bi-check-circle-fill me-2"
            style={{ fontSize: "1.5rem" }}
          ></i>
          <div>
            <strong>Development Mode</strong>
            <div className="small">Captcha verification bypassed</div>
          </div>
        </div>
        {error && <div className="text-danger small">{error}</div>}
      </div>
    );
  }

  return (
    <div>
      <div ref={captchaRef} className="d-flex justify-content-center"></div>
      {error && <div className="text-danger small mt-2">{error}</div>}
    </div>
  );
};

export default Captcha;
