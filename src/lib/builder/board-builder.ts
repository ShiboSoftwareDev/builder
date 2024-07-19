import type { Point } from "@tscircuit/soup"
import type * as Type from "lib/types"
import * as CB from "./component-builder"
import {
  GroupBuilderClass,
  createGroupBuilder,
  type GroupBuilder,
} from "./group-builder"
import { createNetBuilder } from "./net-builder/net-builder"
import type { ProjectBuilder } from "./project-builder"
import type { TraceBuilder } from "./trace-builder"
import { createTraceBuilder } from "./trace-builder"
import { createTraceHintBuilder } from "./trace-hint-builder"

export const getBoardAddables = () =>
  ({
    generic_component: CB.createComponentBuilder,
    component: CB.createComponentBuilder,
    resistor: CB.createResistorBuilder,
    net_alias: CB.createNetAliasBuilder,
    capacitor: CB.createCapacitorBuilder,
    diode: CB.createDiodeBuilder,
    led: CB.createLedBuilder,
    power_source: CB.createPowerSourceBuilder,
    inductor: CB.createInductorBuilder,
    ground: CB.createGroundBuilder,
    bug: CB.createBugBuilder,
    trace: createTraceBuilder,
    via: CB.createViaBuilder,
    group: createGroupBuilder,
    trace_hint: createTraceHintBuilder,
    net: createNetBuilder,
  } as const)
export type BoardBuilderAddables = ReturnType<typeof getBoardAddables>

export interface BoardProps {
  width: number
  height: number
  center?: Point
  center_x: number
  center_y: number
  board_thickness?: number
}

export interface BoardBuilder {
  project_builder: ProjectBuilder
  builder_type: "board_builder"
  addables: BoardBuilderAddables
  reset: () => BoardBuilder
  appendChild(
    child: CB.ComponentBuilder | GroupBuilder | TraceBuilder
  ): BoardBuilder
  add<T extends keyof BoardBuilderAddables>(
    builder_type: T,
    callback: (builder: ReturnType<BoardBuilderAddables[T]>) => unknown
  ): BoardBuilder
  setProps(props: BoardProps): BoardBuilder
  build(build_context: Type.BuildContext): Promise<Type.AnyElement[]>
}

export class BoardBuilderClass
  extends GroupBuilderClass
  implements BoardBuilder
{
  builder_type = "board_builder" as const
  props: Partial<BoardProps>
  declare addables: BoardBuilderAddables

  constructor(project_builder?: ProjectBuilder) {
    super(project_builder)
    this.props = {}
  }

  setProps(props: BoardProps): this {
    GroupBuilderClass.prototype.setProps.call(this, props)
    // have to manually set board props for now
    this.props = { ...this.props, ...props }
    return this
  }

  async build(bc: Type.BuildContext): Promise<Type.AnyElement[]> {
    const required_props = ["width", "height", "center_x", "center_y"]
    for (const prop of required_props) {
      if (this.props[prop] === undefined) {
        throw new Error(`<board /> "${prop}" is not set`)
      }
    }
    bc.board_thickness = this.props.board_thickness
      ? bc.convert(this.props.board_thickness)
      : 1.2

    return [
      ...(await super.build(bc)),
      {
        type: "pcb_board",
        center: this.props.center
          ? bc.convert(this.props.center)
          : {
              x: bc.convert(this.props.center_x!),
              y: bc.convert(this.props.center_y!),
            },
        width: bc.convert(this.props.width!),
        height: bc.convert(this.props.height!),
      },
    ]
  }
}

export function createBoardBuilder(
  project_builder?: ProjectBuilder
): BoardBuilder {
  const bb = new BoardBuilderClass(project_builder)
  return bb
}
