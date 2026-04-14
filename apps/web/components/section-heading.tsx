import { PropsWithChildren } from "react";

export const SectionHeading = ({
  title,
  eyebrow,
  children
}: PropsWithChildren<{ title: string; eyebrow?: string }>) => (
  <div className="section-heading">
    {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
    <div>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  </div>
);
