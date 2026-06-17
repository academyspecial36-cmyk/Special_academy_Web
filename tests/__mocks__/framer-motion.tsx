import { vi } from "vitest";
import React from "react";

const motion = new Proxy(
  {},
  {
    get: (_target, prop: string) => {
      if (prop === "div") return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) =>
        React.createElement("div", { ...props, ref })
      );
      if (prop === "span") return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLSpanElement>) =>
        React.createElement("span", { ...props, ref })
      );
      if (prop === "p") return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLParagraphElement>) =>
        React.createElement("p", { ...props, ref })
      );
      return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) =>
        React.createElement(prop, { ...props, ref })
      );
    },
  }
);

const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export { motion, AnimatePresence };
export default motion;
