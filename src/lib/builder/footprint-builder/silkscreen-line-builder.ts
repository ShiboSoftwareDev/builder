import { BuildContext } from "lib/types"
import {
  AnySoupElement,
  PcbSilkscreenLine,
  PcbSilkscreenPath,
} from "@tscircuit/soup"
import { BuilderInterface } from "../builder-interface"
import type { SilkscreenLineProps } from "@tscircuit/props"

export interface SilkscreenLineBuilder extends BuilderInterface {
  builder_type: "silkscreen_line_builder"
  setProps(props: SilkscreenLineProps): this
  build(bc: BuildContext): AnySoupElement[]
}

export class SilkscreenLineBuilderClass implements SilkscreenLineBuilder {
  builder_type = "silkscreen_line_builder" as const
  props: Partial<SilkscreenLineProps>
  constructor() {
    this.props = {}
  }
  setProps(props: Partial<SilkscreenLineProps>): this {
    this.props = { ...this.props, ...props }
    return this
  }
  build(bc) {
    const silkscreen_line: PcbSilkscreenLine = {
      type: "pcb_silkscreen_line",
      layer: "top",
      pcb_component_id: bc.pcb_component_id,
      pcb_silkscreen_line_id: bc.getId("pcb_silkscreen_path"),
      x1: bc.convert(this.props.x1!),
      x2: bc.convert(this.props.x2!),
      y1: bc.convert(this.props.y1!),
      y2: bc.convert(this.props.y2!),
      stroke_width: 0.1,
    }
    return [silkscreen_line]
  }
}

export const createSilkscreenLineBuilder = (): SilkscreenLineBuilder => {
  return new SilkscreenLineBuilderClass()
}
