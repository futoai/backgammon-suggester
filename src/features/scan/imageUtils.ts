export type CropArea = { x: number; y: number; width: number; height: number }

export async function getCroppedImage(imageSrc: string, crop: CropArea, rotation = 0) {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Unable to get canvas context")

  const rad = (rotation * Math.PI) / 180
  const sin = Math.abs(Math.sin(rad))
  const cos = Math.abs(Math.cos(rad))
  const width = image.width
  const height = image.height
  const boundWidth = width * cos + height * sin
  const boundHeight = width * sin + height * cos

  canvas.width = boundWidth
  canvas.height = boundHeight

  ctx.translate(boundWidth / 2, boundHeight / 2)
  ctx.rotate(rad)
  ctx.drawImage(image, -width / 2, -height / 2)

  const data = ctx.getImageData(crop.x, crop.y, crop.width, crop.height)
  canvas.width = crop.width
  canvas.height = crop.height
  ctx.putImageData(data, 0, 0)

  return canvas.toDataURL("image/jpeg", 0.85)
}

export async function compressImage(dataUrl: string, maxSize = 1024) {
  const image = await loadImage(dataUrl)
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Unable to get canvas context")
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/jpeg", 0.8)
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}
