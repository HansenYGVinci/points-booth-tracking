import { defineConfig } from 'vite';

export default defineConfig({
    preview: {
        // Render web service runs `vite preview` behind its own domain
        allowedHosts: ['.onrender.com']
    }
});
