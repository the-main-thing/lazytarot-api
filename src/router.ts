import { env } from './env'
import { getPages } from './getPages'
import { sanity } from './sanity'

import { isAuthenticated } from './auth'
import { BREAKPOINTS } from './constants'
import type { Context } from './types'
import { getCardById } from './tarot/getCard'
import { getRandomCard } from './tarot/getRandomCard'
import { getCardsSet } from './tarot/getCardsSet'

const notFound = () => new Response('Not found', { status: 404 })
const LONG_LIVED_CACHE_HEADERS = new Headers({
	'Cache-Control': `public, max-age=${
		60 * 60 * 24 * 2
	}, stale-while-revalidate=${60 * 60 * 24 * 2}`,
})

export const router = async (request: Request) => {
	if (!isAuthenticated(request)) {
		return new Response('Unauthorized', { status: 401 })
	}
	try {
		return (
			(await handlePost(request)) ||
			(await handleGet(request)) ||
			new Response('Not Found', { status: 404 })
		)
	} catch (error) {
		console.error(new Date().toISOString())
		console.error(request.method)
		console.error(request.url)
		if (error && typeof error === 'object' && 'message' in error) {
			console.error(error.message, '\n\n')
		} else {
			console.error('Unknown error\n', error, '\n\n')
		}
		return new Response('Internal server error', { status: 500 })
	}
}

const client = sanity.createClient(env.SANITY_PROJECT_ID)
const context: Context = {
	sanity: {
		...sanity,
		client,
		runQuery: sanity.getRunQuery(client),
	},
}

async function handleGet(request: Request): Promise<Response | undefined> {
	const url = new URL(request.url)
	const params = url.pathname.split('/').filter(Boolean)
	if (url.pathname.startsWith('/pages')) {
		const language = params.at(-1)
		if (!language || params.length !== 2) {
			return notFound()
		}
		const pages = await getPages({
			language,
			breakpoints: BREAKPOINTS,
			context,
		})

		return Response.json(pages, {
			headers: LONG_LIVED_CACHE_HEADERS,
		})
	}
	if (url.pathname.startsWith('/card/')) {
		if (params.length !== 3) {
			return notFound()
		}
		const language = params.at(-2)
		const id = params.at(-1)
		if (!language || !id) {
			return notFound()
		}
		const card = await getCardById({ language, id, context })
		if (!card) {
			return notFound()
		}
		return Response.json(card, {
			headers: LONG_LIVED_CACHE_HEADERS,
		})
	}
	if (url.pathname.startsWith('/cards/')) {
		const language = params.at(-1)
		if (!language || params.length !== 2) {
			return notFound()
		}
		const allCards = await getCardsSet({
			language,
			context,
		})
		if (!allCards?.length) {
			console.error(new Date().toISOString())
			console.error('No cards set data returned from sanity')
			return new Response('Internal server error', { status: 500 })
		}
		return Response.json(allCards, {
			headers: LONG_LIVED_CACHE_HEADERS,
		})
	}
}
async function handlePost(request: Request): Promise<Response | undefined> {
	const url = new URL(request.url)
	if (url.pathname.startsWith('/card/random')) {
		const { language, prevPickedCards } = await request.json()
		if (!language) {
			return new Response('Invalid request', { status: 400 })
		}
		if (!Array.isArray(prevPickedCards)) {
			return new Response('Invalid request', { status: 400 })
		}
		const card = await getRandomCard({
			language,
			prevPickedCards,
			context,
		})

		return Response.json(card)
	}
}
