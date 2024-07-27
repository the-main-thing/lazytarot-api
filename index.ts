import { router } from './src/router'

Bun.serve({
	fetch: router,
	port: 3000,
})
