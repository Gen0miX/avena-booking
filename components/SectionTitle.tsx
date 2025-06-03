import { ReactNode } from "react";

interface SectionTitleProps {
  children?: ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="font-heading text-4xl sm:text-5xl font-semibold">
      {children}
    </h2>
  );
}
