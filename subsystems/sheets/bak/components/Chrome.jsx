import React from "react";
import { Background } from "./Background.jsx";
import { Logo } from "./Logo.jsx";

// chrome for view.buffer.render — bg + logo. Field/video bg later.
export function Chrome({ children }) {
  return (
    <Background>
      <Logo />
      {children}
    </Background>
  );
}
