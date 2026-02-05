import { useCallback, useState } from "react"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { getCroppedImage, compressImage, CropArea } from "@/features/scan/imageUtils"
import { scanFromImage } from "@/features/scan/scanClient"
import { scanResultToPosition } from "@/features/scan/scanResult"
import { savePhotoBlob, savePosition } from "@/lib/storage/positions"
import { dataUrlToBlob } from "@/lib/image"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export default function ScanPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedArea, setCroppedArea] = useState<CropArea | null>(null)
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const onCropComplete = useCallback((_area: CropArea, areaPixels: CropArea) => {
    setCroppedArea(areaPixels)
  }, [])

  async function handleFile(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function runScan() {
    if (!imageSrc || !croppedArea) return
    setBusy(true)
    try {
      const cropped = await getCroppedImage(imageSrc, croppedArea, rotation)
      const compressed = await compressImage(cropped)
      const scan = await scanFromImage(compressed)
      const position = scanResultToPosition(scan)
      const blob = dataUrlToBlob(compressed)
      const photoId = await savePhotoBlob(blob)
      const saved = { ...position, photoId }
      await savePosition(saved)
      toast({ title: "Scan complete", description: "Review and edit the detected position." })
      navigate("/review", { state: { positionId: saved.id, scan } })
    } catch (error) {
      toast({ title: "Scan failed", description: (error as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Scan From Photo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <label>
                Camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </Button>
            <Button asChild variant="outline">
              <label>
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </Button>
          </div>
          {!imageSrc && (
            <div className="text-sm text-muted-foreground">Choose a photo to start.</div>
          )}
        </CardContent>
      </Card>

      {imageSrc && (
        <Card>
          <CardHeader>
            <CardTitle>Crop & Rotate</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="relative h-80 w-full overflow-hidden rounded-lg border bg-muted">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="grid gap-2">
              <div className="text-xs text-muted-foreground">Zoom</div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setRotation((prev) => (prev + 90) % 360)}>
                Rotate 90°
              </Button>
              <Button variant="outline" onClick={() => setZoom(1)}>
                Reset zoom
              </Button>
              <Button onClick={runScan} disabled={busy}>
                {busy ? "Scanning…" : "Run AI Scan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
