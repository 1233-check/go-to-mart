const Jimp = require('jimp')

async function getColor() {
  const image = await Jimp.read('public/logo-new.jpg')
  // sample from top-left pixel (x=0, y=0)
  const hex = image.getPixelColor(0, 0)
  const rgba = Jimp.intToRGBA(hex)
  console.log(`rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a / 255})`)
  
  // also get hex string
  const hexStr = rgba.r.toString(16).padStart(2, '0') + rgba.g.toString(16).padStart(2, '0') + rgba.b.toString(16).padStart(2, '0')
  console.log(`#${hexStr}`)
}

getColor().catch(console.error)
