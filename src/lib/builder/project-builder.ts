import * as Type from "lib/types"
import {
  createGroupBuilder,
  GroupBuilder,
  GroupBuilderCallback,
} from "./group-builder"
import { GenericComponentBuilderCallback } from "./component-builder"
import { createProjectFromElements } from "../project/create-project-from-elements"
import { TraceBuilderCallback } from "./trace-builder"

export interface ProjectBuilder extends GroupBuilder {
  getId: (prefix: string) => string
  addGroup: (groupBuilderCallback: GroupBuilderCallback) => ProjectBuilder
  buildProject: () => Promise<Type.Project>
}

export const createProjectBuilder = (): ProjectBuilder => {
  const builder: any = createGroupBuilder()
  builder.project_builder = builder
  const idCount = {}
  const resetIdCount = () => Object.keys(idCount).map((k) => (idCount[k] = 0))
  builder.getId = (prefix: string) => {
    idCount[prefix] = idCount[prefix] || 0
    return `${prefix}_${idCount[prefix]++}`
  }
  builder.build_group = builder.build
  builder.buildProject = async () => {
    resetIdCount()
    return createProjectFromElements(await builder.build())
  }
  return builder
}
