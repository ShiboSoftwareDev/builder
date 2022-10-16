import * as Type from "lib/types"
import * as CB from "./component-builder"
import flatten from "lodash/flatten"
import { ProjectBuilder } from "./project-builder"
import {
  createTraceBuilder,
  convertToReadableTraceTree,
  TraceBuilder,
  TraceBuilderCallback,
} from "./trace-builder"

const addables = {
  generic_component: CB.createComponentBuilder,
  resistor: CB.createResistorBuilder,
  capacitor: CB.createCapacitorBuilder,
  diode: CB.createDiodeBuilder,
  power_source: CB.createPowerSourceBuilder,
  inductor: CB.createInductorBuilder,
  ground: CB.createGroundBuilder,
  bug: CB.createBugBuilder,
  trace: createTraceBuilder,
  group: createGroupBuilder,
}

export type GroupBuilderCallback = (gb: GroupBuilder) => unknown
export interface GroupBuilder {
  project_builder: ProjectBuilder
  builder_type: "group_builder"
  addables: typeof addables
  reset: () => GroupBuilder
  setName: (name: string) => GroupBuilder
  appendChild(
    child: CB.ComponentBuilder | GroupBuilder | TraceBuilder
  ): GroupBuilder
  addGroup(
    groupBuilderCallback: GroupBuilderCallback | GroupBuilder
  ): GroupBuilder
  addComponent(
    componentBuilderCallback: CB.GenericComponentBuilderCallback
  ): GroupBuilder
  addResistor(resistorBuilderCallback: CB.ResistorBuilderCallback): GroupBuilder
  addCapacitor(
    capacitorBuilderCallback: CB.CapacitorBuilderCallback
  ): GroupBuilder
  addDiode(capacitorBuilderCallback: CB.DiodeBuilderCallback): GroupBuilder
  addBug(bugBuilderCallback: CB.BugBuilderCallback): GroupBuilder
  addPowerSource(
    powerSourceBuilderCallback: CB.PowerSourceBuilderCallback
  ): GroupBuilder
  addInductor(
    powerSourceBuilderCallback: CB.InductorBuilderCallback
  ): GroupBuilder
  addGround(groundBuilderCallback: CB.GroundBuilderCallback): GroupBuilder
  addTrace: (
    traceBuiderCallback: TraceBuilderCallback | string[]
  ) => GroupBuilder
  add<T extends keyof typeof addables>(
    builder_type: T,
    callback: (builder: ReturnType<typeof addables[T]>) => unknown
  ): GroupBuilder
  build(): Promise<Type.AnyElement[]>
}

export class GroupBuilderClass implements GroupBuilder {
  builder_type: "group_builder"
  groups: GroupBuilder[]
  components: CB.BaseComponentBuilder<any>[]
  traces: TraceBuilder[]
  project_builder: ProjectBuilder
  name: string
  addables = addables

  constructor(project_builder?: ProjectBuilder) {
    this.project_builder = project_builder
    this.reset()
  }

  reset() {
    this.groups = []
    this.components = []
    this.traces = []
    return this
  }
  add(new_builder_type, callback) {
    if (!this.addables[new_builder_type]) {
      throw new Error(
        `No addable in group builder for builder_type: "${new_builder_type}"`
      )
    }
    const new_builder = this.addables[new_builder_type](this.project_builder)
    callback(new_builder as any) // not smart enough to infer generic
    this.appendChild(new_builder)
    return this
  }
  setName(name) {
    this.name = name
    return this
  }
  appendChild(child) {
    if (
      [
        "schematic_symbol_builder",
        "schematic_box_builder",
        "schematic_line_builder",
        "schematic_text_builder",
      ].includes(child.builder_type)
    ) {
      throw new Error(
        `Schematic primitives can't be added to a group builder (try adding to a component)`
      )
    }

    if (child.builder_type === "group_builder") {
      this.groups.push(child as any)
    } else if (child.builder_type === "trace_builder") {
      this.traces.push(child as any)
    } else {
      this.components.push(child as any)
    }
    return this
  }
  addGroup(gb) {
    return this.add("group", gb)
  }
  addPowerSource(cb) {
    return this.add("power_source", cb)
  }
  addComponent(cb) {
    return this.add("component", cb)
  }
  addResistor(cb) {
    return this.add("resistor", cb)
  }
  addCapacitor(cb) {
    return this.add("capacitor", cb)
  }
  addBug(cb) {
    return this.add("bug", cb)
  }
  addDiode(cb) {
    return this.add("diode", cb)
  }
  addInductor(cb) {
    return this.add("diode", cb)
  }
  addGround(cb) {
    return this.add("ground", cb)
  }
  addTrace(tb) {
    if (typeof tb !== "function") {
      const portSelectors = tb as string[]
      tb = (rb) => {
        rb.addConnections(portSelectors)
      }
    }
    const builder = createTraceBuilder(this.project_builder)
    this.traces.push(builder)
    tb(builder)
    return this
  }
  async build() {
    const elements = []
    elements.push(
      ...flatten(await Promise.all(this.groups.map((g) => g.build())))
    )
    elements.push(
      ...flatten(await Promise.all(this.components.map((c) => c.build())))
    )
    elements.push(
      ...flatten(await Promise.all(this.traces.map((c) => c.build(elements))))
    )
    return elements
  }
}

/**
 * This uses an old construction pattern that's been tested.
 */
export function createGroupBuilder(
  project_builder?: ProjectBuilder
): GroupBuilder {
  const gb = new GroupBuilderClass(project_builder)
  return gb
}
