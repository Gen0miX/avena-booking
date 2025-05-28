import React from "react";
import { IoSunny, IoMoon } from "react-icons/io5";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleButtonProps {
  iconSize?: number;
  className?: string;
}

export default function ThemeToggleButton({
  iconSize = 24,
  className,
}: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || !theme) return null;
  return (
    <label className={`swap swap-rotate ${className}`}>
      <span className="hidden">Switch theme</span>
      <input
        type="checkbox"
        onClick={toggleTheme}
        checked={theme === "avenal"}
        readOnly
      />
      <IoSunny className="swap-off text-neutral-content" size={iconSize} />
      <IoMoon className="swap-on text-neutral-content" size={iconSize} />
    </label>
  );
}
