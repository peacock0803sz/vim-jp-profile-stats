import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query";
import { AuthProvider } from "./contexts/AuthContext";
import Root from "./routes/root";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        lazy: () => import("./routes/index"),
      },
      {
        path: "categories/:id",
        lazy: () => import("./routes/categories.$id"),
      },
      {
        path: "login",
        lazy: () => import("./routes/login"),
      },
      {
        path: "auth/callback",
        lazy: () => import("./routes/auth.callback"),
      },
      {
        path: "profile",
        lazy: () => import("./routes/profile"),
      },
      {
        path: "admin",
        lazy: () => import("./routes/admin"),
        children: [
          {
            path: "categories",
            lazy: () => import("./routes/admin.categories"),
          },
          {
            path: "categories/:id",
            lazy: () => import("./routes/admin.categories.$id"),
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
