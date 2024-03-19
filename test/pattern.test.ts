import path from 'node:path'
import { it } from 'vitest'
import { type Generator, generate, generators } from '../src/index'

const assetsDir = path.join('test', 'assets')

it('should derive the color from the hash', ({ expect }) => {
  expect(generate('GitHub').color).toBe('#455e8a')
})

it('should override the hash-derived color', ({ expect }) => {
  expect(generate('', { color: '#ff7f00' }).color).toBe('#ff7f00')
})

it('should derive the pattern from the hash', ({ expect }) => {
  expect(generate('GitHub').toString().slice(200, 250))
    .toBe('6666666668" fill="#222" fill-opacity="0.0633333333')
})

it('should override the hash-derived generator', ({ expect }) => {
  expect(generate('GitHub', { generator: 'sineWaves' }).toString().slice(200, 250))
    .toBe(' 300, 48" fill="none" stroke="#222" opacity="0.063')
})

it.concurrent('should generate the correct SVG string', async ({ expect }) => {
  await Promise.all(generators.map(async (generator) => {
    const file = path.resolve(assetsDir, `${generator}.svg`)
    const pattern = generate(generator, { generator: generator as Generator })
    const content = pattern.toString()

    await expect.soft(content).toMatchFileSnapshot(file)
  }))
})
