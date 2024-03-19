import type { Generator, GeoPatternOptions } from './types'

export const DEFAULTS: GeoPatternOptions = {
  baseColor: '#933c3c',
}

export const PATTERNS: Generator[] = [
  'octogons',
  'overlappingCircles',
  'plusSigns',
  'xes',
  'sineWaves',
  'hexagons',
  'overlappingRings',
  'plaid',
  'triangles',
  'squares',
  'concentricCircles',
  'diamonds',
  'tessellation',
  'nestedSquares',
  'mosaicSquares',
  'chevrons',
] as const

export const FILL_COLOR_DARK = '#222'
export const FILL_COLOR_LIGHT = '#ddd'
export const STROKE_COLOR = '#000'
export const STROKE_OPACITY = 0.02
export const OPACITY_MIN = 0.02
export const OPACITY_MAX = 0.15
