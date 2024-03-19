/**
 * The RGB representation
 */
export interface RGBColor {
  /**
   * Red
   */
  r: number
  /**
   * Green
   */
  g: number
  /**
   * Blue
   */
  b: number
}

/**
 * The HSL representation
 */
export interface HSLColor {
  /**
   * Hue
   */
  h: number
  /**
   * Saturation
   */
  s: number
  /**
   * Lightness
   */
  l: number
}

export interface GeoPatternOptions {
  color?: string
  baseColor?: string
  generator?: Generator
  hash?: string
}

export type Generator =
  | 'octogons'
  | 'overlappingCircles'
  | 'plusSigns'
  | 'xes'
  | 'sineWaves'
  | 'hexagons'
  | 'overlappingRings'
  | 'plaid'
  | 'triangles'
  | 'squares'
  | 'concentricCircles'
  | 'diamonds'
  | 'tessellation'
  | 'nestedSquares'
  | 'mosaicSquares'
  | 'chevrons'
