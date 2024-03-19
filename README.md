# GeoPattern

[![jsr](https://jsr.io/badges/@raise/geo-pattern)](https://jsr.io/@raise/geo-pattern)
![jsr score](https://jsr.io/badges/@raise/geo-pattern/score)
![gzip size](https://img.badgesize.io/https:/unpkg.com/geo-pattern-ts/dist/index.js?label=gzip%20size&compression=gzip)
![License](https://github.com/pengzhanbo/geo-pattern-ts/blob/main/LICENSE)

This is a TypeScript port of [jasonlong/geo_pattern](https://github.com/jasonlong/geo_pattern) with a
[live preview page](http://btmills.github.io/geopattern/).

## Install

```bash
# pnpm
pnpm add geo-pattern-ts
# yarn
yarn add geo-pattern-ts
# npm
npm install geo-pattern-ts
```

You can also use JSR：

```bash
# pnpm
pnpm dlx jsr add @raise/geo-pattern
# yarn
yarn dlx jsr add @raise/geo-pattern
# npm
npx jsr add @raise/geo-pattern
# Deno
deno add @raise/geo-pattern
```

## Usage

```ts
import { generate } from 'geo-pattern-ts' // jsr package name: @raise/geo-pattern

const pattern = generate('GitHub')
pattern.toDataUrl() // url("data:image/svg+xml;...
```

## API

### pattern = generate(input, options)

Returns a newly-generated, tiling SVG Pattern.

- `input` Will be hashed using the SHA1 algorithm, and the resulting hash will be used as the seed for generation.
- `options.color` Specify an exact background color. This is a CSS hexadecimal color value.
- `options.baseColor` Controls the relative background color of the generated image. The color is not identical to that used in the pattern because the hue is rotated by the generator. This is a CSS hexadecimal color value, which defaults to `#933c3c`.
- `options.generator` Determines the pattern. [All of the original patterns](https://github.com/jasonlong/geo_pattern#available-patterns) are available in this port, and their names are camelCased.

### pattern.color

Gets the pattern's background color as a hexadecimal string.

```ts
const pattern = generate('GitHub')
pattern.color // => "#455e8a"
```

### pattern.toString() and pattern.toSvg()

Gets the SVG string representing the pattern.

### pattern.toBase64()

Gets the SVG as a Base64-encoded string.

### pattern.toDataUri()

Gets the pattern as a data URI, i.e. `data:image/svg+xml;base64,PHN2ZyB....`

### pattern.toDataUrl()

Gets the pattern as a data URL suitable for use as a CSS background-image,
i.e. `url("data:image/svg+xml;base64,PHN2ZyB...").`

## License

Licensed under the terms of the MIT License, the full text of which can be read in [LICENSE](/LICENSE).

<!-- https://github.com/btmills/geopattern -->
