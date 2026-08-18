import React, { useState } from "react";

/**
 * Password field with a show/hide eye toggle.
 * Forwards value/onChange so antd's Form.Item binding works like a plain <input>.
 */
const PasswordInput = React.forwardRef(({ value, onChange, placeholder, ...rest }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        {...rest}
        ref={ref}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onChange}
      />
      <i
        className={`password-toggle ${visible ? "ri-eye-off-line" : "ri-eye-line"}`}
        onClick={() => setVisible((prev) => !prev)}
        title={visible ? "Hide password" : "Show password"}
      ></i>
    </div>
  );
});

export default PasswordInput;
