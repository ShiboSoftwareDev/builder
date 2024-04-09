import type { AnySoupElement, LayerRef } from "lib/soup"
import { gerberBuilder } from "../gerber-builder"
import { GerberLayerName } from "./GerberLayerName"
import { AnyGerberCommand } from "../any_gerber_command"
import { getAllTraceWidths } from "./getAllTraceWidths"
import { ApertureTemplateConfig } from "../commands/define_aperture_template"
import stableStringify from "fast-json-stable-stringify"

export function defineAperturesForLayer({
  glayer,
  soup,
  glayer_name,
}: {
  glayer: AnyGerberCommand[]
  soup: AnySoupElement[]
  glayer_name: GerberLayerName
}) {
  const getNextApertureNumber = () => {
    const highest_aperture_number = glayer.reduce((acc, command) => {
      if (command.command_code === "ADD") {
        return Math.max(acc, command.aperture_number)
      }
      return acc
    }, 0)
    if (highest_aperture_number === 0) {
      return 10
    }
    return highest_aperture_number + 1
  }

  glayer.push(
    ...gerberBuilder()
      .add("comment", { comment: "aperture START LIST" })
      .build()
  )

  // Add all trace width apertures
  const traceWidths: Record<LayerRef, number[]> = getAllTraceWidths(soup)
  for (const width of traceWidths[glayer_name === "F_Cu" ? "top" : "bottom"]) {
    glayer.push(
      ...gerberBuilder()
        .add("define_aperture_template", {
          aperture_number: getNextApertureNumber(),
          standard_template_code: "C",
          diameter: width,
        })
        .build()
    )
  }

  // Add all pcb smtpad aperatures
  const smtpadConfigs = getAllSmtPadApertureTemplateConfigsForLayer(
    soup,
    glayer_name.startsWith("F_") ? "top" : "bottom"
  )

  for (const smtconfig of smtpadConfigs) {
    glayer.push(
      ...gerberBuilder()
        .add("define_aperture_template", {
          aperture_number: getNextApertureNumber(),
          ...smtconfig,
        })
        .build()
    )
  }

  glayer.push(
    ...gerberBuilder()
      .add("delete_attribute", {})
      .add("comment", { comment: "aperture END LIST" })
      .build()
  )
}

function getAllSmtPadApertureTemplateConfigsForLayer(
  soup: AnySoupElement[],
  layer: "top" | "bottom"
): ApertureTemplateConfig[] {
  const configs: ApertureTemplateConfig[] = []
  const configHashMap = new Set<string>()

  const addConfigIfNew = (config: ApertureTemplateConfig) => {
    const hash = stableStringify(config)
    if (!configHashMap.has(hash)) {
      configs.push(config)
      configHashMap.add(hash)
    }
  }

  for (const elm of soup) {
    if (elm.type === "pcb_smtpad") {
      if (elm.layer === layer) {
        if (elm.shape === "rect") {
          addConfigIfNew({
            standard_template_code: "R",
            x_size: elm.width,
            y_size: elm.height,
          })
        } else if (elm.shape === "circle") {
          addConfigIfNew({
            standard_template_code: "C",
            diameter: elm.radius * 2,
          })
        }
      }
    }
  }

  return configs
}
