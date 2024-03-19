import { sha1 } from './sha1'
import { SVG } from './svg'
import * as color from './color'
import {
  DEFAULTS,
  PATTERNS,
  STROKE_COLOR,
  STROKE_OPACITY,
} from './constants'
import type { GeoPatternOptions, HSLColor, RGBColor } from './types'
import {
  buildChevronShape,
  buildDiamondShape,
  buildHexagonShape,
  buildOctogonShape,
  buildPlusShape,
  buildRotatedTriangleShape,
  buildTriangleShape,
  drawInnerMosaicTile,
  drawOuterMosaicTile,
  fillColor,
  fillOpacity,
  hexVal,
  map,
} from './helper'

export class Pattern {
  readonly opts: GeoPatternOptions
  readonly hash: string
  readonly svg: SVG
  color: string = ''

  constructor(input: string, options: GeoPatternOptions = {}) {
    this.opts = { ...DEFAULTS, ...options }
    this.hash = options.hash || sha1(input)
    this.svg = new SVG()

    this.generateBackground()
    this.generatePattern()
  }

  toSvg(): string {
    return this.svg.toString()
  }

  toString(): string {
    return this.toSvg()
  }

  toBase64(): string {
    const str = this.toSvg()
    let b64: string = ''

    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      b64 = window.btoa(str)
    }
    else {
      // eslint-disable-next-line node/prefer-global/buffer
      b64 = typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : ''
    }

    return b64
  }

  toDataUri(): string {
    return `data:image/svg+xml;base64,${this.toBase64()}`
  }

  toDataUrl(): string {
    return `url("${this.toDataUri()}")`
  }

  generateBackground() {
    let baseColor: HSLColor
    let hueOffset: number
    let rgb: RGBColor
    let satOffset: number

    if (this.opts.color) {
      rgb = color.hex2rgb(this.opts.color) as RGBColor
    }
    else {
      hueOffset = map(hexVal(this.hash, 14, 3), 0, 4095, 0, 359)
      satOffset = hexVal(this.hash, 17)
      baseColor = color.rgb2hsl(color.hex2rgb(this.opts.baseColor!) as RGBColor)

      baseColor.h = (((baseColor.h * 360 - hueOffset) + 360) % 360) / 360

      if (satOffset % 2 === 0)
        baseColor.s = Math.min(1, ((baseColor.s * 100) + satOffset) / 100)
      else
        baseColor.s = Math.max(0, ((baseColor.s * 100) - satOffset) / 100)

      rgb = color.hsl2rgb(baseColor)
    }

    this.color = color.rgb2hex(rgb)

    this.svg.rect(0, 0, '100%', '100%', {
      fill: color.rgb2rgbString(rgb),
    })
  }

  generatePattern(): void {
    let generator = this.opts.generator

    if (generator) {
      if (!PATTERNS.includes(generator))
        throw new Error(`The generator ${generator} does not exist.`)
    }
    else {
      generator = PATTERNS[hexVal(this.hash, 20)]
    }

    const name = `geo${generator.slice(0, 1).toUpperCase()}${generator.slice(1)}` as keyof this
    if (name in this) {
      const fn = this[name]
      return typeof fn === 'function' ? fn.call(this) : undefined
    }
  }

  geoHexagons(): void {
    const scale = hexVal(this.hash, 0)
    const sideLength = map(scale, 0, 15, 8, 60)
    const hexHeight = sideLength * Math.sqrt(3)
    const hexWidth = sideLength * 2
    const hex = buildHexagonShape(sideLength)

    this.svg.setWidth(hexWidth * 3 + sideLength * 3)
    this.svg.setHeight(hexHeight * 6)

    let i = 0

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        const fill = fillColor(val)

        let dy = x % 2 === 0 ? y * hexHeight : y * hexHeight + hexHeight / 2

        const styles = {
          'fill': fill,
          'fill-opacity': opacity,
          'stroke': STROKE_COLOR,
          'stroke-opacity': STROKE_OPACITY,
        }

        this.svg.polyline(hex, styles).transform({
          translate: [
            x * sideLength * 1.5 - hexWidth / 2,
            dy - hexHeight / 2,
          ],
        })

        // Add an extra one at top-right, for tiling.
        if (x === 0) {
          this.svg.polyline(hex, styles).transform({
            translate: [
              6 * sideLength * 1.5 - hexWidth / 2,
              dy - hexHeight / 2,
            ],
          })
        }

        // Add an extra row at the end that matches the first row, for tiling.
        if (y === 0) {
          dy = x % 2 === 0 ? 6 * hexHeight : 6 * hexHeight + hexHeight / 2
          this.svg.polyline(hex, styles).transform({
            translate: [
              x * sideLength * 1.5 - hexWidth / 2,
              dy - hexHeight / 2,
            ],
          })
        }

        // Add an extra one at bottom-right, for tiling.
        if (x === 0 && y === 0) {
          this.svg.polyline(hex, styles).transform({
            translate: [
              6 * sideLength * 1.5 - hexWidth / 2,
              5 * hexHeight + hexHeight / 2,
            ],
          })
        }

        i++
      }
    }
  }

  geoSineWaves(): void {
    const period = Math.floor(map(hexVal(this.hash, 0), 0, 15, 100, 400))
    const amplitude = Math.floor(map(hexVal(this.hash, 1), 0, 15, 30, 100))
    const waveWidth = Math.floor(map(hexVal(this.hash, 2), 0, 15, 3, 30))

    this.svg.setWidth(period)
    this.svg.setHeight(waveWidth * 36)

    for (let i = 0; i < 36; i++) {
      const val = hexVal(this.hash, i)
      const opacity = fillOpacity(val)
      const fill = fillColor(val)
      const xOffset = period / 4 * 0.7

      const styles = {
        'fill': 'none',
        'stroke': fill,
        'opacity': opacity,
        'stroke-width': `${waveWidth}px`,
      }

      const str = `M0 ${amplitude
        } C ${xOffset} 0, ${period / 2 - xOffset} 0, ${period / 2} ${amplitude
        } S ${period - xOffset} ${amplitude * 2}, ${period} ${amplitude
        } S ${period * 1.5 - xOffset} 0, ${period * 1.5}, ${amplitude}`

      this.svg.path(str, styles).transform({
        translate: [
          -period / 4,
          waveWidth * i - amplitude * 1.5,
        ],
      })
      this.svg.path(str, styles).transform({
        translate: [
          -period / 4,
          waveWidth * i - amplitude * 1.5 + waveWidth * 36,
        ],
      })
    }
  }

  geoChevrons(): void {
    const chevronWidth = map(hexVal(this.hash, 0), 0, 15, 30, 80)
    const chevronHeight = map(hexVal(this.hash, 0), 0, 15, 30, 80)
    const chevron = buildChevronShape(chevronWidth, chevronHeight)

    this.svg.setWidth(chevronWidth * 6)
    this.svg.setHeight(chevronHeight * 6 * 0.66)

    let i = 0

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        const fill = fillColor(val)

        const styles = {
          'stroke': STROKE_COLOR,
          'stroke-opacity': STROKE_OPACITY,
          'fill': fill,
          'fill-opacity': opacity,
          'stroke-width': 1,
        }

        this.svg.group(styles).transform({
          translate: [
            x * chevronWidth,
            y * chevronHeight * 0.66 - chevronHeight / 2,
          ],
        }).polyline(chevron).end()

        // Add an extra row at the end that matches the first row, for tiling.
        if (y === 0) {
          this.svg.group(styles).transform({
            translate: [
              x * chevronWidth,
              6 * chevronHeight * 0.66 - chevronHeight / 2,
            ],
          }).polyline(chevron).end()
        }

        i += 1
      }
    }
  }

  geoPlusSigns(): void {
    const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25)
    const plusSize = squareSize * 3
    const plusShape = buildPlusShape(squareSize)

    this.svg.setWidth(squareSize * 12)
    this.svg.setHeight(squareSize * 12)

    let i = 0

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        const fill = fillColor(val)
        const dx = (y % 2 === 0) ? 0 : 1

        const styles = {
          'fill': fill,
          'stroke': STROKE_COLOR,
          'stroke-opacity': STROKE_OPACITY,
          'fill-opacity': opacity,
        }

        this.svg.group(styles).transform({
          translate: [
            x * plusSize - x * squareSize + dx * squareSize - squareSize,
            y * plusSize - y * squareSize - plusSize / 2,
          ],
        }).rect(plusShape).end()

        // Add an extra column on the right for tiling.
        if (x === 0) {
          this.svg.group(styles).transform({
            translate: [
              4 * plusSize - x * squareSize + dx * squareSize - squareSize,
              y * plusSize - y * squareSize - plusSize / 2,
            ],
          }).rect(plusShape).end()
        }

        // Add an extra row on the bottom that matches the first row, for tiling
        if (y === 0) {
          this.svg.group(styles).transform({
            translate: [
              x * plusSize - x * squareSize + dx * squareSize - squareSize,
              4 * plusSize - y * squareSize - plusSize / 2,
            ],
          }).rect(plusShape).end()
        }

        // Add an extra one at top-right and bottom-right, for tiling
        if (x === 0 && y === 0) {
          this.svg.group(styles).transform({
            translate: [
              4 * plusSize - x * squareSize + dx * squareSize - squareSize,
              4 * plusSize - y * squareSize - plusSize / 2,
            ],
          }).rect(plusShape).end()
        }

        i++
      }
    }
  }

  geoXes(): void {
    const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25)
    const xShape = buildPlusShape(squareSize)
    const xSize = squareSize * 3 * 0.943

    this.svg.setWidth(xSize * 3)
    this.svg.setHeight(xSize * 3)

    let i = 0
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        let dy = x % 2 === 0 ? y * xSize - xSize * 0.5 : y * xSize - xSize * 0.5 + xSize / 4
        const fill = fillColor(val)

        const styles = {
          fill,
          opacity,
        }

        this.svg.group(styles).transform({
          translate: [
            x * xSize / 2 - xSize / 2,
            dy - y * xSize / 2,
          ],
          rotate: [
            45,
            xSize / 2,
            xSize / 2,
          ],
        }).rect(xShape).end()

        // Add an extra column on the right for tiling.
        if (x === 0) {
          this.svg.group(styles).transform({
            translate: [
              6 * xSize / 2 - xSize / 2,
              dy - y * xSize / 2,
            ],
            rotate: [
              45,
              xSize / 2,
              xSize / 2,
            ],
          }).rect(xShape).end()
        }

        // Add an extra row on the bottom that matches the first row, for tiling.
        if (y === 0) {
          dy = x % 2 === 0 ? 6 * xSize - xSize / 2 : 6 * xSize - xSize / 2 + xSize / 4
          this.svg.group(styles).transform({
            translate: [
              x * xSize / 2 - xSize / 2,
              dy - 6 * xSize / 2,
            ],
            rotate: [
              45,
              xSize / 2,
              xSize / 2,
            ],
          }).rect(xShape).end()
        }

        // These can hang off the bottom, so put a row at the top for tiling.
        if (y === 5) {
          this.svg.group(styles).transform({
            translate: [
              x * xSize / 2 - xSize / 2,
              dy - 11 * xSize / 2,
            ],
            rotate: [
              45,
              xSize / 2,
              xSize / 2,
            ],
          }).rect(xShape).end()
        }

        // Add an extra one at top-right and bottom-right, for tiling
        if (x === 0 && y === 0) {
          this.svg.group(styles).transform({
            translate: [
              6 * xSize / 2 - xSize / 2,
              dy - 6 * xSize / 2,
            ],
            rotate: [
              45,
              xSize / 2,
              xSize / 2,
            ],
          }).rect(xShape).end()
        }
        i++
      }
    }
  }

  geoOverlappingCircles(): void {
    const scale = hexVal(this.hash, 0)
    const diameter = map(scale, 0, 15, 25, 200)
    const radius = diameter / 2

    this.svg.setWidth(radius * 6)
    this.svg.setHeight(radius * 6)

    let i = 0
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        const fill = fillColor(val)

        const styles = {
          fill,
          opacity,
        }

        this.svg.circle(x * radius, y * radius, radius, styles)

        // Add an extra one at top-right, for tiling.
        if (x === 0)
          this.svg.circle(6 * radius, y * radius, radius, styles)

        // Add an extra row at the end that matches the first row, for tiling.
        if (y === 0)
          this.svg.circle(x * radius, 6 * radius, radius, styles)

        // Add an extra one at bottom-right, for tiling.
        if (x === 0 && y === 0)
          this.svg.circle(6 * radius, 6 * radius, radius, styles)

        i++
      }
    }
  }

  geoOctogons(): void {
    const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 60)
    const tile = buildOctogonShape(squareSize)

    this.svg.setWidth(squareSize * 6)
    this.svg.setHeight(squareSize * 6)

    let i = 0
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        const fill = fillColor(val)

        this.svg.polyline(tile, {
          'fill': fill,
          'fill-opacity': opacity,
          'stroke': STROKE_COLOR,
          'stroke-opacity': STROKE_OPACITY,
        }).transform({
          translate: [x * squareSize, y * squareSize],
        })

        i += 1
      }
    }
  }

  geoSquares(): void {
    const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 60)

    this.svg.setWidth(squareSize * 6)
    this.svg.setHeight(squareSize * 6)

    let i = 0

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        const fill = fillColor(val)

        this.svg.rect(x * squareSize, y * squareSize, squareSize, squareSize, {
          'fill': fill,
          'fill-opacity': opacity,
          'stroke': STROKE_COLOR,
          'stroke-opacity': STROKE_OPACITY,
        })

        i += 1
      }
    }
  }

  geoConcentricCircles(): void {
    const scale = hexVal(this.hash, 0)
    const ringSize = map(scale, 0, 15, 10, 60)
    const strokeWidth = ringSize / 5

    this.svg.setWidth((ringSize + strokeWidth) * 6)
    this.svg.setHeight((ringSize + strokeWidth) * 6)

    let i = 0
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        let val = hexVal(this.hash, i)
        let opacity = fillOpacity(val)
        let fill = fillColor(val)

        this.svg.circle(
          x * ringSize + x * strokeWidth + (ringSize + strokeWidth) / 2,
          y * ringSize + y * strokeWidth + (ringSize + strokeWidth) / 2,
          ringSize / 2,
          {
            'fill': 'none',
            'stroke': fill,
            'opacity': opacity,
            'stroke-width': `${strokeWidth}px`,
          },
        )

        val = hexVal(this.hash, 39 - i)
        opacity = fillOpacity(val)
        fill = fillColor(val)

        this.svg.circle(
          x * ringSize + x * strokeWidth + (ringSize + strokeWidth) / 2,
          y * ringSize + y * strokeWidth + (ringSize + strokeWidth) / 2,
          ringSize / 4,
          {
            'fill': fill,
            'fill-opacity': opacity,
          },
        )

        i += 1
      }
    }
  }

  geoOverlappingRings(): void {
    const scale = hexVal(this.hash, 0)
    const ringSize = map(scale, 0, 15, 10, 60)
    const strokeWidth = ringSize / 4

    this.svg.setWidth(ringSize * 6)
    this.svg.setHeight(ringSize * 6)

    let i = 0
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        const fill = fillColor(val)

        const styles = {
          'fill': 'none',
          'stroke': fill,
          'opacity': opacity,
          'stroke-width': `${strokeWidth}px`,
        }

        this.svg.circle(x * ringSize, y * ringSize, ringSize - strokeWidth / 2, styles)

        // Add an extra one at top-right, for tiling.
        if (x === 0)
          this.svg.circle(6 * ringSize, y * ringSize, ringSize - strokeWidth / 2, styles)

        if (y === 0)
          this.svg.circle(x * ringSize, 6 * ringSize, ringSize - strokeWidth / 2, styles)

        if (x === 0 && y === 0)
          this.svg.circle(6 * ringSize, 6 * ringSize, ringSize - strokeWidth / 2, styles)

        i += 1
      }
    }
  }

  geoTriangles(): void {
    const scale = hexVal(this.hash, 0)
    const sideLength = map(scale, 0, 15, 15, 80)
    const triangleHeight = sideLength / 2 * Math.sqrt(3)
    const triangle = buildTriangleShape(sideLength, triangleHeight)

    this.svg.setWidth(sideLength * 3)
    this.svg.setHeight(triangleHeight * 6)

    let rotation: number
    let i = 0

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        const fill = fillColor(val)

        const styles = {
          'fill': fill,
          'fill-opacity': opacity,
          'stroke': STROKE_COLOR,
          'stroke-opacity': STROKE_OPACITY,
        }

        if (y % 2 === 0)
          rotation = x % 2 === 0 ? 180 : 0
        else
          rotation = x % 2 !== 0 ? 180 : 0

        this.svg.polyline(triangle, styles).transform({
          translate: [
            x * sideLength * 0.5 - sideLength / 2,
            triangleHeight * y,
          ],
          rotate: [rotation, sideLength / 2, triangleHeight / 2],
        })

        // Add an extra one at top-right, for tiling.
        if (x === 0) {
          this.svg.polyline(triangle, styles).transform({
            translate: [
              6 * sideLength * 0.5 - sideLength / 2,
              triangleHeight * y,
            ],
            rotate: [rotation, sideLength / 2, triangleHeight / 2],
          })
        }

        i += 1
      }
    }
  }

  geoDiamonds(): void {
    const diamondWidth = map(hexVal(this.hash, 0), 0, 15, 10, 50)
    const diamondHeight = map(hexVal(this.hash, 1), 0, 15, 10, 50)
    const diamond = buildDiamondShape(diamondWidth, diamondHeight)

    this.svg.setWidth(diamondWidth * 6)
    this.svg.setHeight(diamondHeight * 3)

    let dx: number
    let i = 0
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const val = hexVal(this.hash, i)
        const opacity = fillOpacity(val)
        const fill = fillColor(val)

        const styles = {
          'fill': fill,
          'fill-opacity': opacity,
          'stroke': STROKE_COLOR,
          'stroke-opacity': STROKE_OPACITY,
        }

        dx = (y % 2 === 0) ? 0 : diamondWidth / 2

        this.svg.polyline(diamond, styles).transform({
          translate: [
            x * diamondWidth - diamondWidth / 2 + dx,
            diamondHeight / 2 * y - diamondHeight / 2,
          ],
        })

        // Add an extra one at top-right, for tiling.
        if (x === 0) {
          this.svg.polyline(diamond, styles).transform({
            translate: [
              6 * diamondWidth - diamondWidth / 2 + dx,
              diamondHeight / 2 * y - diamondHeight / 2,
            ],
          })
        }

        // Add an extra row at the end that matches the first row, for tiling.
        if (y === 0) {
          this.svg.polyline(diamond, styles).transform({
            translate: [
              x * diamondWidth - diamondWidth / 2 + dx,
              diamondHeight / 2 * 6 - diamondHeight / 2,
            ],
          })
        }

        // Add an extra one at bottom-right, for tiling.
        if (x === 0 && y === 0) {
          this.svg.polyline(diamond, styles).transform({
            translate: [
              6 * diamondWidth - diamondWidth / 2 + dx,
              diamondHeight / 2 * 6 - diamondHeight / 2,
            ],
          })
        }

        i += 1
      }
    }
  }

  geoNestedSquares(): void {
    const blockSize = map(hexVal(this.hash, 0), 0, 15, 4, 12)
    const squareSize = blockSize * 7

    this.svg.setWidth((squareSize + blockSize) * 6 + blockSize * 6)
    this.svg.setHeight((squareSize + blockSize) * 6 + blockSize * 6)

    let i = 0

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        let val = hexVal(this.hash, i)
        let opacity = fillOpacity(val)
        let fill = fillColor(val)

        let styles = {
          'fill': 'none',
          'stroke': fill,
          'opacity': opacity,
          'stroke-width': `${blockSize}px`,
        }

        this.svg.rect(x * squareSize + x * blockSize * 2 + blockSize / 2, y * squareSize + y * blockSize * 2 + blockSize / 2, squareSize, squareSize, styles)

        val = hexVal(this.hash, 39 - i)
        opacity = fillOpacity(val)
        fill = fillColor(val)

        styles = {
          'fill': 'none',
          'stroke': fill,
          'opacity': opacity,
          'stroke-width': `${blockSize}px`,
        }

        this.svg.rect(x * squareSize + x * blockSize * 2 + blockSize / 2 + blockSize * 2, y * squareSize + y * blockSize * 2 + blockSize / 2 + blockSize * 2, blockSize * 3, blockSize * 3, styles)

        i += 1
      }
    }
  }

  geoMosaicSquares(): void {
    const triangleSize = map(hexVal(this.hash, 0), 0, 15, 15, 50)

    this.svg.setWidth(triangleSize * 8)
    this.svg.setHeight(triangleSize * 8)

    let i = 0

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (x % 2 === 0) {
          if (y % 2 === 0) {
            drawOuterMosaicTile(
              this.svg,
              x * triangleSize * 2,
              y * triangleSize * 2,
              triangleSize,
              hexVal(this.hash, i),
            )
          }
          else {
            drawInnerMosaicTile(
              this.svg,
              x * triangleSize * 2,
              y * triangleSize * 2,
              triangleSize,
              [hexVal(this.hash, i), hexVal(this.hash, i + 1)],
            )
          }
        }
        else {
          if (y % 2 === 0) {
            drawInnerMosaicTile(
              this.svg,
              x * triangleSize * 2,
              y * triangleSize * 2,
              triangleSize,
              [hexVal(this.hash, i), hexVal(this.hash, i + 1)],
            )
          }
          else {
            drawOuterMosaicTile(
              this.svg,
              x * triangleSize * 2,
              y * triangleSize * 2,
              triangleSize,
              hexVal(this.hash, i),
            )
          }
        }

        i += 1
      }
    }
  }

  geoPlaid(): void {
    let height = 0
    let width = 0
    let fill: string
    let opacity: number
    let space: number
    let stripeHeight: number
    let stripeWidth: number
    let val: number

    // Horizontal stripes
    let i = 0
    while (i < 36) {
      space = hexVal(this.hash, i)
      height += space + 5

      val = hexVal(this.hash, i + 1)
      opacity = fillOpacity(val)
      fill = fillColor(val)
      stripeHeight = val + 5

      this.svg.rect(0, height, '100%', stripeHeight, {
        opacity,
        fill,
      })

      height += stripeHeight
      i += 2
    }

    // Vertical stripes
    i = 0
    while (i < 36) {
      space = hexVal(this.hash, i)
      width += space + 5

      val = hexVal(this.hash, i + 1)
      opacity = fillOpacity(val)
      fill = fillColor(val)
      stripeWidth = val + 5

      this.svg.rect(width, 0, stripeWidth, '100%', {
        opacity,
        fill,
      })

      width += stripeWidth
      i += 2
    }

    this.svg.setWidth(width)
    this.svg.setHeight(height)
  }

  geoTessellation(): void {
    // 3.4.6.4 semi-regular tessellation
    const sideLength = map(hexVal(this.hash, 0), 0, 15, 5, 40)
    const hexHeight = sideLength * Math.sqrt(3)
    const hexWidth = sideLength * 2
    const triangleHeight = sideLength / 2 * Math.sqrt(3)
    const triangle = buildRotatedTriangleShape(sideLength, triangleHeight)
    const tileWidth = sideLength * 3 + triangleHeight * 2
    const tileHeight = (hexHeight * 2) + (sideLength * 2)

    this.svg.setWidth(tileWidth)
    this.svg.setHeight(tileHeight)

    for (let i = 0; i < 20; i++) {
      const val = hexVal(this.hash, i)
      const opacity = fillOpacity(val)
      const fill = fillColor(val)

      const styles = {
        'stroke': STROKE_COLOR,
        'stroke-opacity': STROKE_OPACITY,
        'fill': fill,
        'fill-opacity': opacity,
        'stroke-width': 1,
      }

      switch (i) {
        case 0: // All 4 corners
          this.svg.rect(-sideLength / 2, -sideLength / 2, sideLength, sideLength, styles)
          this.svg.rect(tileWidth - sideLength / 2, -sideLength / 2, sideLength, sideLength, styles)
          this.svg.rect(-sideLength / 2, tileHeight - sideLength / 2, sideLength, sideLength, styles)
          this.svg.rect(tileWidth - sideLength / 2, tileHeight - sideLength / 2, sideLength, sideLength, styles)
          break
        case 1: // Center / top square
          this.svg.rect(hexWidth / 2 + triangleHeight, hexHeight / 2, sideLength, sideLength, styles)
          break
        case 2: // Side squares
          this.svg.rect(-sideLength / 2, tileHeight / 2 - sideLength / 2, sideLength, sideLength, styles)
          this.svg.rect(tileWidth - sideLength / 2, tileHeight / 2 - sideLength / 2, sideLength, sideLength, styles)
          break
        case 3: // Center / bottom square
          this.svg.rect(hexWidth / 2 + triangleHeight, hexHeight * 1.5 + sideLength, sideLength, sideLength, styles)
          break
        case 4: // Left top / bottom triangle
          this.svg.polyline(triangle, styles).transform({
            translate: [
              sideLength / 2,
              -sideLength / 2,
            ],
            rotate: [
              0,
              sideLength / 2,
              triangleHeight / 2,
            ],
          })
          this.svg.polyline(triangle, styles).transform({
            translate: [
              sideLength / 2,
              tileHeight - -sideLength / 2,
            ],
            rotate: [
              0,
              sideLength / 2,
              triangleHeight / 2,
            ],
            scale: [1, -1],
          })
          break
        case 5: // Right top / bottom triangle
          this.svg.polyline(triangle, styles).transform({
            translate: [
              tileWidth - sideLength / 2,
              -sideLength / 2,
            ],
            rotate: [
              0,
              sideLength / 2,
              triangleHeight / 2,
            ],
            scale: [-1, 1],
          })
          this.svg.polyline(triangle, styles).transform({
            translate: [
              tileWidth - sideLength / 2,
              tileHeight + sideLength / 2,
            ],
            rotate: [
              0,
              sideLength / 2,
              triangleHeight / 2,
            ],
            scale: [-1, -1],
          })
          break
        case 6: // Center / top / right triangle
          this.svg.polyline(triangle, styles).transform({
            translate: [
              tileWidth / 2 + sideLength / 2,
              hexHeight / 2,
            ],
          })
          break
        case 7: // Center / top / left triangle
          this.svg.polyline(triangle, styles).transform({
            translate: [
              tileWidth - tileWidth / 2 - sideLength / 2,
              hexHeight / 2,
            ],
            scale: [-1, 1],
          })
          break
        case 8: // Center / bottom / right triangle
          this.svg.polyline(triangle, styles).transform({
            translate: [
              tileWidth / 2 + sideLength / 2,
              tileHeight - hexHeight / 2,
            ],
            scale: [1, -1],
          })
          break
        case 9: // Center / bottom / left triangle
          this.svg.polyline(triangle, styles).transform({
            translate: [
              tileWidth - tileWidth / 2 - sideLength / 2,
              tileHeight - hexHeight / 2,
            ],
            scale: [-1, -1],
          })
          break
        case 10: // Left / middle triangle
          this.svg.polyline(triangle, styles).transform({
            translate: [
              sideLength / 2,
              tileHeight / 2 - sideLength / 2,
            ],
          })
          break
        case 11: // Right // middle triangle
          this.svg.polyline(triangle, styles).transform({
            translate: [
              tileWidth - sideLength / 2,
              tileHeight / 2 - sideLength / 2,
            ],
            scale: [-1, 1],
          })
          break
        case 12: // Left / top square
          this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
            translate: [sideLength / 2, sideLength / 2],
            rotate: [-30, 0, 0],
          })
          break
        case 13: // Right / top square
          this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
            scale: [-1, 1],
            translate: [-tileWidth + sideLength / 2, sideLength / 2],
            rotate: [-30, 0, 0],
          })
          break
        case 14: // Left / center-top square
          this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
            translate: [
              sideLength / 2,
              tileHeight / 2 - sideLength / 2 - sideLength,
            ],
            rotate: [30, 0, sideLength],
          })
          break
        case 15: // Right / center-top square
          this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
            scale: [-1, 1],
            translate: [
              -tileWidth + sideLength / 2,
              tileHeight / 2 - sideLength / 2 - sideLength,
            ],
            rotate: [30, 0, sideLength],
          })
          break
        case 16: // Left / center-top square
          this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
            scale: [1, -1],
            translate: [
              sideLength / 2,
              -tileHeight + tileHeight / 2 - sideLength / 2 - sideLength,
            ],
            rotate: [30, 0, sideLength],
          })
          break
        case 17: // Right / center-bottom square
          this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
            scale: [-1, -1],
            translate: [
              -tileWidth + sideLength / 2,
              -tileHeight + tileHeight / 2 - sideLength / 2 - sideLength,
            ],
            rotate: [30, 0, sideLength],
          })
          break
        case 18: // Left / bottom square
          this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
            scale: [1, -1],
            translate: [
              sideLength / 2,
              -tileHeight + sideLength / 2,
            ],
            rotate: [-30, 0, 0],
          })
          break
        case 19: // Right / bottom square
          this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
            scale: [-1, -1],
            translate: [
              -tileWidth + sideLength / 2,
              -tileHeight + sideLength / 2,
            ],
            rotate: [-30, 0, 0],
          })
          break
      }
    }
  }
}
