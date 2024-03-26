import { z } from "zod"
import { source_component_base } from "lib/soup/source/base/source_component_base"
import { resistance } from "lib/soup/units"

export const source_simple_resistor = source_component_base.extend({
  ftype: z.literal("simple_resistor"),
  resistance,
})
