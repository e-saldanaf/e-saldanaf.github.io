// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: "https://e-saldanaf.github.io",
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [icon()]
});