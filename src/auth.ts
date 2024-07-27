import { env } from './env'
const apiKey = env.API_KEY
const authHeaderKey = 'x-api-key'

export const isAuthenticated = (request: Request): boolean => {
	return request.headers.get(authHeaderKey) === apiKey
}
