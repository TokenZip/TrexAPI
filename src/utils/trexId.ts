import crypto from 'crypto'

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

const generateBase62String = (length: number): string => {
    let result = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, 62)
        result += BASE62_CHARS[randomIndex]
    }
    return result
}

/**
 * Derives a 2-char lowercase region code from TZP_REGION (e.g. "us-west-1" -> "us").
 * Falls back to "lo" (local) if unset or too short.
 */
const getRegionCode = (): string => {
    const region = process.env.TZP_REGION
    if (region && region.length >= 2) {
        return region.slice(0, 2).toLowerCase()
    }
    return 'lo'
}

/**
 * Generates a TrexID per TZP spec: tx_[2-char region]_[9-char base62 random]
 * Regex: ^tx_[a-z]{2}_[a-zA-Z0-9]{9}$
 */
export const generateTrexID = (): string => {
    return `tx_${getRegionCode()}_${generateBase62String(9)}`
}
