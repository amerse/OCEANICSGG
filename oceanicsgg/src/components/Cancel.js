import React from "react";

function Cancel({ onClick }) {
  return (
    <button type="button" className="btn cancel" onClick={onClick}>
      Cancel
    </button>
  );
}

export default Cancel;