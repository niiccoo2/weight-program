import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const keyPath = path.resolve('cert/key.pem');
const certPath = path.resolve('cert/cert.pem');
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		https: hasCerts
			? {
					key: fs.readFileSync(keyPath),
					cert: fs.readFileSync(certPath)
				}
			: undefined,
		proxy: {}
	}
});
