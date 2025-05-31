import { ReactNode } from "react";

interface SectionTitleProps {
  children?: ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="font-heading text-center font-semibold text-3xl mb-5">
      {children}
    </h2>
  );
}
