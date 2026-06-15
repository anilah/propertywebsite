import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  const baseStyles = "bg-white rounded-xl overflow-hidden";
  const interactiveStyles = onClick
    ? "cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1"
    : "shadow-card";

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
