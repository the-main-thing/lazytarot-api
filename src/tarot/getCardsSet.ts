import type { Context } from '../types'

import {
	cardContentQueryObject,
	type Card,
} from './cardContentQueryObject.server'
import { translateCard } from './translateCard.server'

type Slice = [start: number, end: number]

type Params = {
	language?: string | undefined
	slice?: Slice | Readonly<Slice> | undefined
	context: Context
}

export const queryContent = async ({ language, slice, context }: Params) => {
	const query = context.sanity
		.q('*')
		.filterByType('tarotCard')
		.grab(cardContentQueryObject)
	if (slice?.length === 2) {
		query.slice(slice[0], slice[1])
	}
	const data: Array<Card> = await context.sanity.runQuery(query)
	return data.map(card =>
		translateCard({
			language,
			card,
			context,
		})
	)
}

export const getCardsSet = async (params: Params) => {
	const data = await queryContent(params)

	if (data.length < 1) {
		throw new Error('No content for cards has been acuired')
	}

	return data as [(typeof data)[number], ...typeof data]
}
