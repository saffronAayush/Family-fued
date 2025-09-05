import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Make environment variables available to the client
    "import.meta.env.VITE_SERVER_URL": JSON.stringify(
      process.env.VITE_SERVER_URL || "http://localhost:5000"
    ),
  },
});
