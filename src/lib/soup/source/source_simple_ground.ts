import { source_component_base } from "lib/soup/source/base/source_component_base"
import { z } from "zod"

export const source_simple_ground = source_component_base.extend({
  ftype: z.literal("simple_ground"),
})

export type SourceSimpleGround = z.infer<typeof source_simple_ground>
export type SourceSimpleGroundInput = z.input<typeof source_simple_ground>
