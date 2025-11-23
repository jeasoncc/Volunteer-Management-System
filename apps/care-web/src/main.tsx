import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routes/routeTree.gen";

// Create router instance
import { createRouter } from '@tanstack/react-router';
const router = createRouter({ routeTree });

import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
