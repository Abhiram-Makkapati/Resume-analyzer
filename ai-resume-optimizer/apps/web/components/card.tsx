import { HTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

export const Card = ({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => {
  return (
    <div className={clsx("card", className)} {...props}>
      {children}
    </div>
  );
};
