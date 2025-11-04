import { ReactNode } from "react";
import clsx from "clsx";

interface SectionTitleProps {
  children?: ReactNode;
  className?: string;
}

export default function SectionTitle({
  children,
  className,
}: SectionTitleProps) {
  return (
    <h2
      className={clsx(
        "font-heading text-4xl sm:text-5xl font-medium",
        className
      )}
    >
      {children}
    </h2>
  );
}
