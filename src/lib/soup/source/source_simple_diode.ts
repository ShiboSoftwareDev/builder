import { source_component_base } from "lib/soup/source/base/source_component_base"
import { z } from "zod"

export const source_simple_diode = source_component_base.extend({
  ftype: z.literal("simple_diode"),
})

export type SourceSimpleDiode = z.infer<typeof source_simple_diode>
export type SourceSimpleDiodeInput = z.input<typeof source_simple_diode>
