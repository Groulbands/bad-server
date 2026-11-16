import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const scssDirectory = fileURLToPath(new URL('./src/scss/', import.meta.url))

export default defineConfig({
    plugins: [svgr(), react()],
    resolve: {
        tsconfigPaths: true,
        alias: {
            $fonts: resolve('./src/vendor/fonts'),
            $assets: resolve('./src/assets'),
        },
    },
    build: {
        assetsInlineLimit: 0,
    },
    css: {
        preprocessorOptions: {
            scss: {
                loadPaths: [scssDirectory],
                additionalData: '@use "variables" as *;\n@use "mixins";\n',
            },
        },
    },
})
