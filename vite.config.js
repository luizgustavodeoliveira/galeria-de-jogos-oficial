import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const redirectPlugin = () => ({
  name: 'redirect-to-base',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || '';
      if (
        !url.startsWith('/galeria-de-jogos-oficial/') &&
        !url.startsWith('/@') &&
        !url.includes('.') &&
        !url.startsWith('/src/') &&
        !url.startsWith('/node_modules/')
      ) {
        res.writeHead(302, { Location: `/galeria-de-jogos-oficial${url === '/' ? '/' : url}` });
        res.end();
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  plugins: [react(), redirectPlugin()],
  base: '/galeria-de-jogos-oficial/'
})
