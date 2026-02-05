import { z } from "zod"

export const CheckerCountsSchema = z.object({
  white: z.number().int().min(0).max(15),
  black: z.number().int().min(0).max(15),
})

export const BoardPointSchema = CheckerCountsSchema

export const BoardSchema = z.object({
  points: z.array(BoardPointSchema).length(24),
  bar: CheckerCountsSchema,
  borneOff: CheckerCountsSchema,
  orientation: z.enum(["whiteBottom", "blackBottom"]),
})

export const DiceSchema = z.object({
  d1: z.number().int().min(1).max(6).nullable(),
  d2: z.number().int().min(1).max(6).nullable(),
})

export const CubeSchema = z.object({
  value: z.number().int().min(1).max(64).nullable(),
  owner: z.enum(["white", "black", "center"]).nullable(),
})

export const MatchSchema = z.object({
  length: z.number().int().min(1).max(25).nullable(),
  scoreWhite: z.number().int().min(0).max(24).nullable(),
  scoreBlack: z.number().int().min(0).max(24).nullable(),
})

export const ScanUnknownSchema = z.object({
  field: z.string(),
  reason: z.string(),
})

export const BackgammonScanResultV1Schema = z.object({
  version: z.literal("1"),
  source: z.enum(["photo", "manual", "import", "history"]).default("photo"),
  board: BoardSchema,
  turn: z.enum(["white", "black"]).nullable(),
  dice: DiceSchema,
  cube: CubeSchema,
  mode: z.enum(["match", "money"]),
  match: MatchSchema,
  confidence: z.object({
    overall: z.number().min(0).max(1).nullable(),
    board: z.number().min(0).max(1).nullable(),
    dice: z.number().min(0).max(1).nullable(),
    cube: z.number().min(0).max(1).nullable(),
    match: z.number().min(0).max(1).nullable(),
    turn: z.number().min(0).max(1).nullable(),
  }),
  unknowns: z.array(ScanUnknownSchema),
})

export const PositionV1Schema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  label: z.string().optional(),
  source: z.enum(["manual", "photo", "history", "import"]),
  board: BoardSchema,
  turn: z.enum(["white", "black"]).nullable(),
  dice: DiceSchema,
  cube: CubeSchema,
  mode: z.enum(["match", "money"]),
  match: MatchSchema,
  notes: z.string().optional(),
  photoId: z.string().optional(),
})

export type BackgammonScanResultV1 = z.infer<typeof BackgammonScanResultV1Schema>
export type PositionV1 = z.infer<typeof PositionV1Schema>

export const BackgammonScanResultV1JsonSchema = {
  name: "BackgammonScanResultV1",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "version",
      "source",
      "board",
      "turn",
      "dice",
      "cube",
      "mode",
      "match",
      "confidence",
      "unknowns",
    ],
    properties: {
      version: { type: "string", enum: ["1"] },
      source: { type: "string", enum: ["photo", "manual", "import", "history"] },
      board: {
        type: "object",
        additionalProperties: false,
        required: ["points", "bar", "borneOff", "orientation"],
        properties: {
          points: {
            type: "array",
            minItems: 24,
            maxItems: 24,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["white", "black"],
              properties: {
                white: { type: "integer", minimum: 0, maximum: 15 },
                black: { type: "integer", minimum: 0, maximum: 15 },
              },
            },
          },
          bar: {
            type: "object",
            additionalProperties: false,
            required: ["white", "black"],
            properties: {
              white: { type: "integer", minimum: 0, maximum: 15 },
              black: { type: "integer", minimum: 0, maximum: 15 },
            },
          },
          borneOff: {
            type: "object",
            additionalProperties: false,
            required: ["white", "black"],
            properties: {
              white: { type: "integer", minimum: 0, maximum: 15 },
              black: { type: "integer", minimum: 0, maximum: 15 },
            },
          },
          orientation: { type: "string", enum: ["whiteBottom", "blackBottom"] },
        },
      },
      turn: { type: ["string", "null"], enum: ["white", "black", null] },
      dice: {
        type: "object",
        additionalProperties: false,
        required: ["d1", "d2"],
        properties: {
          d1: { type: ["integer", "null"], minimum: 1, maximum: 6 },
          d2: { type: ["integer", "null"], minimum: 1, maximum: 6 },
        },
      },
      cube: {
        type: "object",
        additionalProperties: false,
        required: ["value", "owner"],
        properties: {
          value: { type: ["integer", "null"], minimum: 1, maximum: 64 },
          owner: { type: ["string", "null"], enum: ["white", "black", "center", null] },
        },
      },
      mode: { type: "string", enum: ["match", "money"] },
      match: {
        type: "object",
        additionalProperties: false,
        required: ["length", "scoreWhite", "scoreBlack"],
        properties: {
          length: { type: ["integer", "null"], minimum: 1, maximum: 25 },
          scoreWhite: { type: ["integer", "null"], minimum: 0, maximum: 24 },
          scoreBlack: { type: ["integer", "null"], minimum: 0, maximum: 24 },
        },
      },
      confidence: {
        type: "object",
        additionalProperties: false,
        required: ["overall", "board", "dice", "cube", "match", "turn"],
        properties: {
          overall: { type: ["number", "null"], minimum: 0, maximum: 1 },
          board: { type: ["number", "null"], minimum: 0, maximum: 1 },
          dice: { type: ["number", "null"], minimum: 0, maximum: 1 },
          cube: { type: ["number", "null"], minimum: 0, maximum: 1 },
          match: { type: ["number", "null"], minimum: 0, maximum: 1 },
          turn: { type: ["number", "null"], minimum: 0, maximum: 1 },
        },
      },
      unknowns: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["field", "reason"],
          properties: {
            field: { type: "string" },
            reason: { type: "string" },
          },
        },
      },
    },
  },
} as const
