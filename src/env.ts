export const env = {
	API_KEY: process.env.API_KEY!,
	SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID!,
}
if (!Object.values(env).every(value => value)) {
	throw new Error('Missing required environment variables')
}
