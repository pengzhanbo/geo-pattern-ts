import { Pattern } from './pattern'
import type { GeoPatternOptions } from './types'

/**
 * Generate a new pattern.
 *
 * By default, the current time is used as input
 *
 * @example
 * ```ts
 * const pattern = generate()
 * const style = {
 *  'background-image': pattern.toDataUrl(),
 * }
 * ```
 */
export function generate(): GenerateReturn
/**
 * Generate a new pattern
 *
 * @param options - Options
 *
 * @example
 * ```ts
 * const pattern = generate({
 *   baseColor: '#f00',
 *   generator: 'squares',
 * })
 * const style = {
 *  'background-image': pattern.toDataUrl(),
 * }
 * ```
 *
 */
export function generate(options?: GeoPatternOptions): GenerateReturn
/**
 * Generate a new pattern
 * @param input - Input
 * @param options - Options
 *
 * @example
 * ```ts
 * const pattern = generate('input')
 * const style = {
 *  'background-image': pattern.toDataUrl(),
 * }
 * ```
 *
 * @example
 * ```ts
 * const pattern = generate('input', {
 *   generator: 'squares',
 * })
 * const style = {
 *  'background-image': pattern.toDataUrl(),
 * }
 * ```
 */
export function generate(input?: string, options?: GeoPatternOptions): GenerateReturn
export function generate(input?: string | GeoPatternOptions, options?: GeoPatternOptions): GenerateReturn {
  if (typeof input === 'object') {
    options = input
    input = undefined
  }
  if (input === null || input === undefined)
    input = (new Date()).toString()

  if (!options)
    options = {}

  const pattern = new Pattern(input, options)

  return {
    toSvg: () => pattern.toSvg(),
    toString: () => pattern.toString(),
    toDataUrl: () => pattern.toDataUrl(),
    toDataUri: () => pattern.toDataUri(),
    toBase64: () => pattern.toBase64(),
    get color() { return pattern.color },
  }
}

export interface GenerateReturn {
  /**
   * Gets the pattern's background color as a hexadecimal string.
   */
  get color(): string

  /**
   * Gets the SVG string representing the pattern.
   */
  toSvg: () => string
  /**
   * Gets the SVG string representing the pattern.
   */
  toString: () => string
  /**
   * Gets the pattern as a data URL suitable for use as a CSS background-image,
   * i.e. `url("data:image/svg+xml;base64,PHN2ZyB...").`
   */
  toDataUrl: () => string
  /**
   * Gets the pattern as a data URI, i.e. `data:image/svg+xml;base64,PHN2ZyB....`
   */
  toDataUri: () => string
  /**
   * Gets the SVG as a Base64-encoded string.
   */
  toBase64: () => string
}
