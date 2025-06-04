import { ReactNode } from "react";

interface SectionTitleProps {
  children?: ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="font-heading text-4xl 2xl:text-5xl font-medium">
      {children}
    </h2>
  );
}
