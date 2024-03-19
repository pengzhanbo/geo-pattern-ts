import {
  FILL_COLOR_DARK,
  FILL_COLOR_LIGHT,
  OPACITY_MAX,
  OPACITY_MIN,
  STROKE_COLOR,
  STROKE_OPACITY,
} from './constants'
import type { SVG } from './svg'

/**
 * Extract a substring from a hex string and parse it as an integer
 *
 * @param hash - Source hex string
 * @param index - Start index of substring
 * @param len - Length of substring. Defaults to `1` .
 */
export function hexVal(hash: string, index: number, len?: number): number {
  return Number.parseInt(hash.substr(index, len || 1), 16)
}

/**
 * Re-maps a number from one range to another
 * http://processing.org/reference/map_.html
 */
export function map(
  value: string | number,
  vMin: number,
  vMax: number,
  dMin: number,
  dMax: number,
): number {
  const vValue = Number.parseFloat(`${value}`)
  const vRange = vMax - vMin
  const dRange = dMax - dMin

  return (vValue - vMin) * dRange / vRange + dMin
}

export function fillColor(val: number): string {
  return (val % 2 === 0) ? FILL_COLOR_LIGHT : FILL_COLOR_DARK
}

export function fillOpacity(val: string | number): number {
  return map(val, 0, 15, OPACITY_MIN, OPACITY_MAX)
}

export function buildHexagonShape(sideLength: number): string {
  const c = sideLength
  const a = c / 2
  const b = Math.sin(60 * Math.PI / 180) * c

  return `0,${b},${a},0,${a + c},${0},${2 * c},${b},${a + c},${2 * b},${a},${2 * b},0,${b}`
}

export function buildChevronShape(width: number, height: number): string[] {
  const e = height * 0.66
  const x = width / 2
  const y = height - e

  return [
    `0,0,${x},${y},${x},${height},0,${e},0,0`,
    `${x},${y},${width},0,${width},${e},${x},${height},${x},${y}`,
  ]
}

export function buildPlusShape(squareSize: number): [number, number, number, number][] {
  return [
    [squareSize, 0, squareSize, squareSize * 3],
    [0, squareSize, squareSize * 3, squareSize],
  ]
}

export function buildOctogonShape(squareSize: number): string {
  const s = squareSize
  const c = s * 0.33
  const t = s - c
  return [c, 0, t, 0, s, c, s, t, t, s, c, s, 0, t, 0, c, c, 0].join(',')
}

export function buildTriangleShape(sideLength: number, height: number): string {
  const halfWidth = sideLength / 2
  return [halfWidth, 0, sideLength, height, 0, height, halfWidth, 0].join(',')
}

export function buildDiamondShape(width: number, height: number): string {
  return [width / 2, 0, width, height / 2, width / 2, height, 0, height / 2].join(',')
}

export function buildRightTriangleShape(sideLength: number): string {
  return [0, 0, sideLength, sideLength, 0, sideLength, 0, 0].join(',')
}

export function drawInnerMosaicTile(
  svg: SVG,
  x: number,
  y: number,
  triangleSize: number,
  vals: [number, number],
) {
  const triangle = buildRightTriangleShape(triangleSize)
  let opacity = fillOpacity(vals[0])
  let fill = fillColor(vals[0])
  let styles = {
    'stroke': STROKE_COLOR,
    'stroke-opacity': STROKE_OPACITY,
    'fill-opacity': opacity,
    'fill': fill,
  }

  svg.polyline(triangle, styles).transform({
    translate: [
      x + triangleSize,
      y,
    ],
    scale: [-1, 1],
  })
  svg.polyline(triangle, styles).transform({
    translate: [
      x + triangleSize,
      y + triangleSize * 2,
    ],
    scale: [1, -1],
  })

  opacity = fillOpacity(vals[1])
  fill = fillColor(vals[1])
  styles = {
    'stroke': STROKE_COLOR,
    'stroke-opacity': STROKE_OPACITY,
    'fill-opacity': opacity,
    'fill': fill,
  }

  svg.polyline(triangle, styles).transform({
    translate: [
      x + triangleSize,
      y + triangleSize * 2,
    ],
    scale: [-1, -1],
  })
  svg.polyline(triangle, styles).transform({
    translate: [
      x + triangleSize,
      y,
    ],
    scale: [1, 1],
  })
}

export function drawOuterMosaicTile(
  svg: SVG,
  x: number,
  y: number,
  triangleSize: number,
  val: number,
) {
  const opacity = fillOpacity(val)
  const fill = fillColor(val)
  const triangle = buildRightTriangleShape(triangleSize)
  const styles = {
    'stroke': STROKE_COLOR,
    'stroke-opacity': STROKE_OPACITY,
    'fill-opacity': opacity,
    'fill': fill,
  }

  svg.polyline(triangle, styles).transform({
    translate: [
      x,
      y + triangleSize,
    ],
    scale: [1, -1],
  })
  svg.polyline(triangle, styles).transform({
    translate: [
      x + triangleSize * 2,
      y + triangleSize,
    ],
    scale: [-1, -1],
  })
  svg.polyline(triangle, styles).transform({
    translate: [
      x,
      y + triangleSize,
    ],
    scale: [1, 1],
  })
  svg.polyline(triangle, styles).transform({
    translate: [
      x + triangleSize * 2,
      y + triangleSize,
    ],
    scale: [-1, 1],
  })
}

export function buildRotatedTriangleShape(sideLength: number, triangleWidth: number): string {
  const halfHeight = sideLength / 2
  return [0, 0, triangleWidth, halfHeight, 0, sideLength, 0, 0].join(',')
}
