import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./views/styles/index.css";
import { Root } from "./shared/contexts/_root";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
