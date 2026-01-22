import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "child_process";

// Custom plugin to generate sitemap and service pages on build
function seoPlugin() {
  return {
    name: "seo-generator",
    buildEnd: () => {
      console.log("Running SEO generators...");
      try {
        // Generate static service pages for SEO
        console.log("Generating static service pages...");
        execSync("bun run src/lib/generate-service-pages.ts", { stdio: "inherit" });
        
        // Generate sitemap
        console.log("Generating sitemap...");
        execSync("bun run src/lib/generate-sitemap.ts", { stdio: "inherit" });
      } catch (error) {
        console.error("Failed to run SEO generators:", error);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    seoPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
}));
