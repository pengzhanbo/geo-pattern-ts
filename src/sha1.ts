/*
https://github.com/creationix/git-sha1/blob/master/git-sha1.js

The MIT License (MIT)

Copyright (c) 2013 Tim Caswell

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export interface CreateReturn {
  update: (chunk: string | Uint8Array) => void
  digest: () => string
}

// A streaming interface for when nothing is passed in.
export function create(): CreateReturn {
  let h0 = 0x67452301
  let h1 = 0xEFCDAB89
  let h2 = 0x98BADCFE
  let h3 = 0x10325476
  let h4 = 0xC3D2E1F0
  // The first 64 bytes (16 words) is the data chunk
  const block = new Uint32Array(80)
  let offset = 0
  let shift = 24
  let totalLength = 0

  // We have a full block to process.  Let's do it!
  function processBlock() {
    // Extend the sixteen 32-bit words into eighty 32-bit words:
    for (let i = 16; i < 80; i++) {
      const w = block[i - 3] ^ block[i - 8] ^ block[i - 14] ^ block[i - 16]
      block[i] = (w << 1) | (w >>> 31)
    }

    // log(block);

    // Initialize hash value for this chunk:
    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    let f: number
    let k: number

    // Main loop:
    for (let i = 0; i < 80; i++) {
      if (i < 20) {
        f = d ^ (b & (c ^ d))
        k = 0x5A827999
      }
      else if (i < 40) {
        f = b ^ c ^ d
        k = 0x6ED9EBA1
      }
      else if (i < 60) {
        f = (b & c) | (d & (b | c))
        k = 0x8F1BBCDC
      }
      else {
        f = b ^ c ^ d
        k = 0xCA62C1D6
      }
      const temp = (a << 5 | a >>> 27) + f + e + k + (block[i] | 0)
      e = d
      d = c
      c = (b << 30 | b >>> 2)
      b = a
      a = temp
    }

    // Add this chunk's hash to result so far:
    h0 = (h0 + a) | 0
    h1 = (h1 + b) | 0
    h2 = (h2 + c) | 0
    h3 = (h3 + d) | 0
    h4 = (h4 + e) | 0

    // The block is now reusable.
    offset = 0
    for (let i = 0; i < 16; i++)
      block[i] = 0
  }

  function write(byte: number) {
    block[offset] |= (byte & 0xFF) << shift
    if (shift) {
      shift -= 8
    }
    else {
      offset++
      shift = 24
    }

    if (offset === 16)
      processBlock()
  }

  function updateString(str: string) {
    const length = str.length
    totalLength += length * 8
    for (let i = 0; i < length; i++)
      write(str.charCodeAt(i))
  }

  // The user gave us more data.  Store it!
  function update(chunk: string | Uint8Array) {
    if (typeof chunk === 'string')
      return updateString(chunk)

    const length = chunk.length
    totalLength += length * 8
    for (let i = 0; i < length; i++)
      write(chunk[i])
  }

  function toHex(word: number) {
    let hex = ''
    for (let i = 28; i >= 0; i -= 4)
      hex += ((word >> i) & 0xF).toString(16)

    return hex
  }

  // No more data will come, pad the block, process and return the result.
  function digest(): string {
    // Pad
    write(0x80)
    if (offset > 14 || (offset === 14 && shift < 24))
      processBlock()

    offset = 14
    shift = 24

    // 64-bit length big-endian
    write(0x00) // numbers this big aren't accurate in javascript anyway
    write(0x00) // ..So just hard-code to zero.
    write(totalLength > 0xFFFFFFFFFF ? totalLength / 0x10000000000 : 0x00)
    write(totalLength > 0xFFFFFFFF ? totalLength / 0x100000000 : 0x00)
    for (let s = 24; s >= 0; s -= 8)
      write(totalLength >> s)

    // At this point one last processBlock() should trigger and we can pull out the result.
    return toHex(h0)
      + toHex(h1)
      + toHex(h2)
      + toHex(h3)
      + toHex(h4)
  }

  return { update, digest }
}

export function sha1(): CreateReturn
export function sha1(buffer: string | Uint8Array): string
export function sha1(buffer?: string | Uint8Array): string | CreateReturn {
  if (buffer === undefined)
    return create()

  const shasum = create()
  shasum.update(buffer)
  return shasum.digest()
};
