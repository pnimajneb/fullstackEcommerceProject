// this custom component is only used in the admin area why we can create a _components folder -> this means next.js does not use this folder for routing

import { ReactNode } from "react";

export function PageHeader({ children }: { children: ReactNode }) {
  return <h1 className="text-4xl mb-4">{children}</h1>;
}
