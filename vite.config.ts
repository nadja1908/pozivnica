import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    /** Na Windows-u `localhost` ponekad ide na IPv6 (::1) pa browser javlja "connection failed".
     * Eksplicitno slušamo IPv4 — otvori http://127.0.0.1:3000 */
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: false,
  },
});
