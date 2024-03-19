import type { HSLColor, RGBColor } from './types'

/**
 * Converts a hex CSS color value to RGB.
 *
 * Adapted from http://stackoverflow.com/a/5624139.
 * @param hex - The hexadecimal color value
 * @returns  The RGB representation
 */
export function hex2rgb(hex: string): RGBColor | null {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (_, r, g, b) => {
    return r + r + g + g + b + b
  })

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

const rgbKeys = ['r', 'g', 'b'] as const
/**
 * Converts an RGB color value to a hex string.
 * @param rgb - The RGB representation
 * @returns Hex color string
 */
export function rgb2hex(rgb: RGBColor): string {
  return `#${rgbKeys.map(
    key => (`0${rgb[key].toString(16)}`).slice(-2),
  ).join('')}`
}

/**
 * Converts an RGB color value to HSL. Conversion formula adapted from
 * http://en.wikipedia.org/wiki/HSL_color_space.
 *
 * This function adapted from http://stackoverflow.com/a/9493060.
 *
 * Assumes `r`, `g`, and `b` are contained in the set `[0, 255]` and
 * returns `h`, `s`, and `l` in the set `[0, 1]` .
 *
 * @param rgb - The RGB representation
 * @returns The HSL representation
 */
export function rgb2hsl(rgb: RGBColor): HSLColor {
  let { r, g, b } = rgb
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h!: number
  let s!: number
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h, s, l }
}

/**
 * Converts an HSL color value to RGB. Conversion formula adapted from
 * http://en.wikipedia.org/wiki/HSL_color_space.
 *
 * This function adapted from http://stackoverflow.com/a/9493060.
 *
 * Assumes `h`, `s`, and `l` are contained in the set `[0, 1]` and
 * returns `r`, `g`, and `b` in the set `[0, 255]` .
 *
 * @param hsl - The HSL representation
 * @returns The RGB representation
 */
export function hsl2rgb(hsl: HSLColor): RGBColor {
  const { h, s, l } = hsl
  let r: number
  let g: number
  let b: number

  if (s === 0) {
    r = g = b = l // achromatic
  }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0)
    t += 1
  if (t > 1)
    t -= 1
  if (t < 1 / 6)
    return p + (q - p) * 6 * t
  if (t < 1 / 2)
    return q
  if (t < 2 / 3)
    return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/**
 * Converts an RGB color value to RGB string.
 *
 * @param rgb - The RGB representation
 * @returns  RGB color string
 */
export function rgb2rgbString(rgb: RGBColor): string {
  return `rgb(${rgb.r},${rgb.g},${rgb.b})`
}
