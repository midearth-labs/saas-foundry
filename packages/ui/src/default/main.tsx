import React from "react";
import { createRoot } from "react-dom/client";

const el = document.getElementById("root");
if (el) {
  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      Load testing UI component here
    </React.StrictMode>
  );
} else {
  throw new Error("Could not find root element");
}