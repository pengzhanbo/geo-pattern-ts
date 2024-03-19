export class XMLNode {
  readonly attributes: Record<string, string> = Object.create(null)
  readonly children: XMLNode[] = []
  lastChild: XMLNode | null = null

  constructor(public nodeName: string) {
  }

  appendChild(child: XMLNode): this {
    this.children.push(child)
    this.lastChild = child

    return this
  }

  setAttribute(name: string, value: string | number): this {
    this.attributes[name] = `${value}`

    return this
  }

  toString(): string {
    const attrs = Object.keys(this.attributes)
      .map(attr => ` ${attr}="${this.attributes[attr]}"`).join('')
    const children = this.children.map(child => child.toString()).join('')

    return `<${this.nodeName}${attrs}>${children}</${this.nodeName}>`
  }
}
