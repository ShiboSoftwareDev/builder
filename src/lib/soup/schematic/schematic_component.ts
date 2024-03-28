import { z } from "zod"
import { point } from "../common/point"
import { size } from "../common/size"
import { rotation } from "../units"

export const schematic_component = z.object({
  type: z.literal("schematic_component"),
  rotation: rotation.default(0),
  size,
  center: point,
  source_component_id: z.string(),
  schematic_component_id: z.string(),
  port_arrangement: z.union([
    z.object({
      left_size: z.number(),
      right_size: z.number(),
      top_size: z.number().optional(),
      bottom_size: z.number().optional(),
    }),
    z.object({
      left_side: z
        .object({
          pins: z.array(z.number()),
          direction: z.enum(["top-to-bottom", "bottom-to-top"]).optional(),
        })
        .optional(),
      right_side: z
        .object({
          pins: z.array(z.number()),
          direction: z.enum(["top-to-bottom", "bottom-to-top"]).optional(),
        })
        .optional(),
      top_side: z
        .object({
          pins: z.array(z.number()),
          direction: z.enum(["left-to-right", "right-to-left"]).optional(),
        })
        .optional(),
      bottom_side: z
        .object({
          pins: z.array(z.number()),
          direction: z.enum(["left-to-right", "right-to-left"]).optional(),
        })
        .optional(),
    }),
  ]),
  port_labels: z.record(z.string()),
})

export type SchematicComponent = z.infer<typeof schematic_component>
