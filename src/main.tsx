import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./presentation/styles/index.css";
import { Root } from "./presentation/components/providers/_root";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
