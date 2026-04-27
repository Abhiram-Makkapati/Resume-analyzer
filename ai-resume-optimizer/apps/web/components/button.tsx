import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
  }
>;

export const Button = ({
  children,
  className,
  variant = "primary",
  fullWidth,
  ...props
}: ButtonProps) => (
  <button
    className={clsx("button", `button-${variant}`, fullWidth && "button-full", className)}
    {...props}
  >
    {children}
  </button>
);
