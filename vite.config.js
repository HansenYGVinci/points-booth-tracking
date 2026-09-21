import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        // Local dev: proxy API calls to the Express server (npm run server)
        proxy: {
            '/api': 'http://localhost:3000'
        }
    },
    preview: {
        // Render web service runs `vite preview` behind its own domain
        allowedHosts: ['.onrender.com']
    }
});
