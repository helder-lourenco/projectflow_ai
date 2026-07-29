import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { ProjectDraftProvider } from "./context/ProjectDraftContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProjectDraftProvider>
      <App />
    </ProjectDraftProvider>
  </React.StrictMode>
);