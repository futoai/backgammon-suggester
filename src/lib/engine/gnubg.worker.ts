/// <reference lib="webworker" />

let initialized = false
type GnuBgModule = {
  _malloc: (size: number) => number
  _run_command: (ptr: number) => void
  HEAPU8: Uint8Array
  setValue: (ptr: number, value: number, type: string) => void
  locateFile?: (path: string) => string
  print?: (line: string) => void
  printErr?: (line: string) => void
  onRuntimeInitialized?: () => void
}

let Module = {} as GnuBgModule
let commandBufferInitialized = false
let commandBuffer = 0

const logQueue: string[] = []
let logResolver: ((lines: string[]) => void) | null = null
let logTimeout: number | null = null

function arrayToHeap(typedArray: Uint8Array) {
  const numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT
  const ptr = Module._malloc(numBytes)
  const heapBytes = Module.HEAPU8.subarray(ptr, ptr + numBytes)
  heapBytes.set(typedArray)
  return heapBytes
}

function makeCommandBuffer() {
  const rawBuffer = new ArrayBuffer(1000)
  const heapView = new Uint8Array(rawBuffer)
  return arrayToHeap(heapView).byteOffset
}

function fillCommandBuffer(buffer: number, command: string) {
  for (let i = 0; i < command.length; i++) {
    Module.setValue(buffer + i, command.charCodeAt(i), "i8")
  }
  Module.setValue(buffer + command.length, 0, "i8")
}

function collectLog(line: string) {
  if (logResolver) {
    logQueue.push(line)
    if (logTimeout) self.clearTimeout(logTimeout)
    logTimeout = self.setTimeout(() => {
      const lines = logQueue.splice(0, logQueue.length)
      const resolver = logResolver
      logResolver = null
      if (resolver) resolver(lines)
    }, 50)
  }
}

async function runCommand(command: string) {
  if (!commandBufferInitialized) {
    commandBuffer = makeCommandBuffer()
    commandBufferInitialized = true
  }

  return new Promise<string[]>((resolve) => {
    logQueue.splice(0, logQueue.length)
    if (logTimeout) {
      self.clearTimeout(logTimeout)
      logTimeout = null
    }
    logResolver = resolve
    fillCommandBuffer(commandBuffer, command)
    Module._run_command(commandBuffer)
    if (!logTimeout) {
      logTimeout = self.setTimeout(() => {
        const lines = logQueue.splice(0, logQueue.length)
        const resolver = logResolver
        logResolver = null
        if (resolver) resolver(lines)
      }, 50)
    }
  })
}

async function initEngine() {
  if (initialized) return
  initialized = true

  let resolveReady: (() => void) | null = null
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve
  })

  // @ts-expect-error Module will be populated by gnubg.js
  Module = {
    locateFile: (path: string) => `/gnubg/${path}`,
    print: (line: string) => collectLog(line),
    printErr: (line: string) => collectLog(line),
    onRuntimeInitialized: () => resolveReady?.(),
  }

  self.importScripts("/gnubg/gnubg.js")
  await ready
}

function parseBestMove(lines: string[]) {
  for (const line of lines) {
    const match = line.match(/^\s*1\.\s+(.+?)\s{2,}/)
    if (match) return match[1].trim()
    if (line.startsWith("1.")) return line.replace(/^1\.\s*/, "").trim()
  }
  return ""
}

self.onmessage = async (event: MessageEvent) => {
  const { id, position, positionId } = event.data as {
    id: string
    positionId: string
    position: {
      mode: "match" | "money"
      match: { length: number | null; scoreWhite: number | null; scoreBlack: number | null }
      turn: "white" | "black" | null
      dice: { d1: number | null; d2: number | null }
      cube: { value: number | null; owner: "white" | "black" | "center" | null }
    }
  }

  try {
    await initEngine()

    if (position.mode === "match") {
      const length = position.match.length ?? 7
      await runCommand(`new match ${length}`)
      await runCommand(`set score ${position.match.scoreWhite ?? 0} ${position.match.scoreBlack ?? 0}`)
    } else {
      await runCommand("new session")
    }

    await runCommand(`set board ${positionId}`)

    if (position.turn) {
      const turnValue = position.turn === "white" ? 0 : 1
      await runCommand(`set turn ${turnValue}`)
    }

    if (position.dice.d1 && position.dice.d2) {
      await runCommand(`set dice ${position.dice.d1} ${position.dice.d2}`)
    }

    if (position.cube.value) {
      await runCommand(`set cube value ${position.cube.value}`)
    }
    if (position.cube.owner) {
      if (position.cube.owner === "center") {
        await runCommand("set cube centre")
      } else {
        const ownerValue = position.cube.owner === "white" ? 0 : 1
        await runCommand(`set cube owner ${ownerValue}`)
      }
    }

    const hintLines = await runCommand("hint")
    const bestMove = parseBestMove(hintLines)

    const moves = bestMove
      .split(" ")
      .filter(Boolean)
      .map((part) => {
        const [from, to] = part.split("/")
        return { from: from === "bar" ? 25 : Number(from), to: to === "off" ? 0 : Number(to) }
      })

    self.postMessage({ id, bestMove, moves })
  } catch (error) {
    self.postMessage({ id, bestMove: "", moves: [], error: (error as Error).message })
  }
}
