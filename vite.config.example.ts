import { defineConfig } from 'vite';
import { angular } from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  optimizeDeps: {
    exclude: ['@angular/cdk']
  },
  build: {
    rollupOptions: {
      external: ['@angular/cdk/a11y']
    }
  }
});