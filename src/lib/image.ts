export function dataUrlToBlob(dataUrl: string) {
  const [meta, content] = dataUrl.split(",")
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? "image/jpeg"
  const binary = atob(content)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
  return new Blob([array], { type: mime })
}
