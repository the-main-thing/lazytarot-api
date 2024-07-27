const defaultLanguage = 'en'

export function getTranslated<T>(
	i18n: Array<{
		_key: string
		value: T
	}>,
	lang: string | undefined
) {
	lang = lang || defaultLanguage
	let defaultTranslation: T = undefined as never
	let foundSomething = false
	for (const translation of i18n) {
		if (translation._key === lang) {
			return translation.value
		}
		if (translation._key === defaultLanguage) {
			foundSomething = true
			defaultTranslation = translation.value
		}
	}

	if (!foundSomething) {
		return i18n[0]!.value
	}

	return defaultTranslation
}
