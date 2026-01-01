import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Đã thêm đường dẫn dự án kusumix vào đây
      base: '/kusumix/', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // Trỏ alias về thư mục hiện tại
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        // Đảm bảo assets được build đúng cấu trúc thư mục
        assetsDir: 'assets',
      }
    };
});
