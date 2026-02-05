import localforage from "localforage"
import { PositionV1 } from "@/lib/schema/position"

const positionStore = localforage.createInstance({
  name: "backgammon-suggester",
  storeName: "positions",
})

const photoStore = localforage.createInstance({
  name: "backgammon-suggester",
  storeName: "photos",
})

const backupKey = "bgm_backup_v1"

export async function savePosition(position: PositionV1) {
  await positionStore.setItem(position.id, position)
  await saveBackupSnapshot()
}

export async function listPositions() {
  const items: PositionV1[] = []
  await positionStore.iterate<PositionV1, void>((value) => {
    items.push(value)
  })
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getPosition(id: string) {
  return positionStore.getItem<PositionV1>(id)
}

export async function deletePosition(id: string) {
  await positionStore.removeItem(id)
  await saveBackupSnapshot()
}

export async function savePhotoBlob(blob: Blob) {
  const id = crypto.randomUUID()
  await photoStore.setItem(id, blob)
  return id
}

export async function getPhotoBlob(id: string) {
  return photoStore.getItem<Blob>(id)
}

export async function exportPositions() {
  const positions = await listPositions()
  return JSON.stringify({ version: "1", positions }, null, 2)
}

export async function importPositions(json: string) {
  const parsed = JSON.parse(json) as { version: string; positions: PositionV1[] }
  if (parsed.version !== "1") {
    throw new Error("Unsupported export version")
  }
  await Promise.all(parsed.positions.map((pos) => positionStore.setItem(pos.id, pos)))
  await saveBackupSnapshot()
}

export function saveBackupSnapshot() {
  return listPositions().then((positions) => {
    const minimal = positions.map((pos) => ({
      id: pos.id,
      createdAt: pos.createdAt,
      updatedAt: pos.updatedAt,
      label: pos.label,
      source: pos.source,
      board: pos.board,
      turn: pos.turn,
      dice: pos.dice,
      cube: pos.cube,
      mode: pos.mode,
      match: pos.match,
      notes: pos.notes,
    }))
    localStorage.setItem(backupKey, JSON.stringify({ version: "1", positions: minimal }))
  })
}

export function loadBackupSnapshot() {
  const raw = localStorage.getItem(backupKey)
  if (!raw) return null
  return JSON.parse(raw) as { version: string; positions: PositionV1[] }
}

export async function restoreBackupSnapshot() {
  const backup = loadBackupSnapshot()
  if (!backup) return 0
  await Promise.all(backup.positions.map((pos) => positionStore.setItem(pos.id, pos)))
  return backup.positions.length
}
