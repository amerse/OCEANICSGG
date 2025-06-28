import React from "react";
import "./glowbtn.css";

function Button({ children, ...props }) {
  return (
    <button className="glow-btn" {...props}>
      {children}
    </button>
  );
}

export default Button;