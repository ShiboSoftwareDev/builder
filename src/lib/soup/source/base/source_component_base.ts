import { supplier_name } from "lib/soup/pcb/properties/supplier_name"
import { z } from "zod"

export const source_component_base = z.object({
  type: z.literal("source_component"),
  ftype: z.string().optional(),
  source_component_id: z.string(),
  name: z.string(),
  // part_numbers: z.array(z.string()).optional(),
  supplier_part_numbers: z
    .record(supplier_name, z.array(z.string()))
    .optional(),
})

export type SourceComponentBase = z.infer<typeof source_component_base>
