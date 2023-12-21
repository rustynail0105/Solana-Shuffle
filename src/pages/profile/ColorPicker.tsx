import { useState } from "react";

export default function ColorPicker() {
  const [color, setColor] = useState<string>("#1569a8");

  const handleChange = (e: any) => {
    setColor(e.target.value);
  };

  return (
    <div className="relative flex h-full items-center overflow-hidden text-center">
      <span
        className="inline-block h-8 w-8 rounded-full border-2 border-[#393869] transition-colors"
        style={{ background: color }}
      >
        <input
          type="color"
          value={color}
          onChange={handleChange}
          className="absolute left-0 h-full w-full rounded-full opacity-0"
        />
      </span>
      {/* <span>{color}</span> */}
    </div>
  );
}
