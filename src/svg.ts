import { XMLNode } from './xml'

export type Attributes = Record<string, string | number>

export class SVG {
  width: number = 100
  height: number = 100
  svg: XMLNode
  context: XMLNode[] = []

  constructor() {
    this.svg = new XMLNode('svg')
    this.setAttributes(this.svg, {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.width,
      height: this.height,
    })
  }

  currentContext(): XMLNode {
    return this.context[this.context.length - 1] || this.svg
  }

  end(): this {
    this.context.pop()
    return this
  }

  currentNode(): XMLNode {
    const context = this.currentContext()
    return context.lastChild || context
  }

  transform(transformations: Record<string, (string | number)[]>): this {
    const value = Object.keys(transformations).map((transformation) => {
      return `${transformation}(${transformations[transformation].join(',')})`
    }).join(' ')
    this.currentNode().setAttribute('transform', value)
    return this
  }

  setAttributes(el: XMLNode, attrs: Attributes): void {
    Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]))
  }

  setWidth(width: number): void {
    this.svg.setAttribute('width', `${Math.floor(width)}`)
  }

  setHeight(height: number): void {
    this.svg.setAttribute('height', `${Math.floor(height)}`)
  }

  toString(): string {
    return this.svg.toString()
  }

  rect(rects: [number, number, number, number][], args?: Attributes): this
  rect(
    x: number | string,
    y: number | string,
    width: number | string,
    height: number | string,
    args?: Attributes,
  ): this
  rect(...args: any[]): this {
    if (args.length <= 2) {
      const [rects, _args] = args
      if (Array.isArray(rects)) {
        rects.forEach((r: [number, number, number, number]) => this.rect(...r, _args))
        return this
      }
    }

    const [x, y, width, height, _args = {}] = args
    const rect = new XMLNode('rect')
    this.currentContext().appendChild(rect)
    this.setAttributes(rect, {
      x,
      y,
      width,
      height,
      ..._args,
    })

    return this
  }

  circle(
    cx: number | string,
    cy: number | string,
    r: number | string,
    args: Attributes = {},
  ): this {
    const circle = new XMLNode('circle')
    this.currentContext().appendChild(circle)
    this.setAttributes(circle, {
      cx,
      cy,
      r,
      ...args,
    })

    return this
  }

  path(d: string, args: Attributes = {}): this {
    const path = new XMLNode('path')
    this.currentContext().appendChild(path)
    this.setAttributes(path, {
      d,
      ...args,
    })
    return this
  }

  polyline(points: string | string[], args: Attributes = {}): this {
    if (Array.isArray(points)) {
      points.forEach(p => this.polyline(p, args))
      return this
    }
    const polyline = new XMLNode('polyline')
    this.currentContext().appendChild(polyline)
    this.setAttributes(polyline, {
      points,
      ...args,
    })
    return this
  }

  group(args: Attributes = {}): this {
    const group = new XMLNode('g')
    this.currentContext().appendChild(group)
    this.context.push(group)
    this.setAttributes(group, { ...args })
    return this
  }
}
