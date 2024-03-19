import './style.css'

import { type Generator, generate, generators } from '../../src/index'

const geoBg = document.getElementById('geoBg')!
const input = document.getElementById('input')! as HTMLInputElement
const baseColor = document.getElementById('baseColor')! as HTMLInputElement
const generator = document.getElementById('generator')! as HTMLSelectElement
const saveBtn = document.getElementById('save')! as HTMLAnchorElement

const canvas = document.createElement('canvas')

let pattern!: ReturnType<typeof generate>
let timer: number | undefined

function setBgImage() {
  pattern = generate(input.value, {
    generator: (generator.value === 'auto' ? undefined : generator.value) as Generator,
    baseColor: baseColor.value,
  })
  geoBg.style.backgroundImage = pattern.toDataUrl()
  saveBtn.download = `${input.value}.png`

  timer && clearTimeout(timer)
  timer = setTimeout(resolveDataUrl, 500) as unknown as number
}

function initOptions() {
  let html = `<option value="auto">Auto</option>`
  generators.forEach((generator) => {
    html += `<option value="${generator}">${generator}</option>`
  })
  generator.innerHTML = html
}

function resolveDataUrl() {
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.onload = function () {
    canvas.width = img.width
    canvas.height = img.height
    ctx?.drawImage(img, 0, 0)

    saveBtn.href = canvas.toDataURL('image/png')
  }
  img.src = pattern.toDataUri()
}

initOptions()
setBgImage()
input.focus()

input.addEventListener('input', setBgImage, { passive: true })
generator.addEventListener('change', setBgImage)
baseColor.addEventListener('change', setBgImage)
