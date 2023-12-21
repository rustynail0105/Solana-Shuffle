import React, { useState } from "react";
import Spinner from "./Spinner";

const Button = ({
  className,
  background,
  width,
  height,
  onClick,
  onError,
  text,
  disabled,
}) => {
  const [processing, setProcessing] = useState(false);

  return (
    <button
      disabled={disabled || processing}
      onClick={async () => {
        setProcessing(true);
        try {
          await onClick();
        } catch (err) {
          await onError(err);
        } finally {
          setProcessing(false);
        }
      }}
      style={{
        background: disabled
          ? "#6E6FA6"
          : background === "green"
          ? "radial-gradient(191.08% 125.83% at 26.69% 10%, #56FFFA 2.08%, #00DFD9 26.92%, #00D0CB 46.85%, #00C278 91.62%)"
          : "radial-gradient(132.75% 155.27% at 31.94% -11.82%, #9186FF 0%, #6D61FF 33.87%, #574AFF 91.62%)",
      }}
      className={`flex items-center justify-center ${
        disabled && "cursor-not-allowed"
      } ${height ? height : "h-10"} ${
        width ? width : "w-1/2"
      } rounded-lg text-lg font-semibold ${background} ${className}`}
    >
      {processing ? <Spinner width={24} /> : text}
    </button>
  );
};

Button.defaultProps = {
  onClick: () => {},
  onError: (err) => {
    console.log(err);
  },
};

export default Button;
