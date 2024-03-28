import { convertUnits } from "convert-units"

const si_prefix_multiplier = {
  tera: 10e12,
  T: 10e12,
  giga: 10e9,
  G: 10e9,
  mega: 10e6,
  M: 10e6,
  kilo: 10e3,
  k: 10e3,
  deci: 10e-1,
  d: 10e-1,
  centi: 10e-2,
  c: 10e-2,
  milli: 10e-3,
  m: 10e-3,
  micro: 10e-6,
  u: 10e-6,
  µ: 10e-6,
  nano: 10e-9,
  n: 10e-9,
  pico: 10e-12,
  p: 10e-12,
}
const si_prefixes = Object.keys(si_prefix_multiplier)

const target_conversion = {
  mass: "g",
  length: "mm",
  time: "ms",
  volume: "ml",
}

function getSiPrefixMultiplierFromUnit(v: string): number {
  for (const prefix of si_prefixes) {
    if (v.startsWith(prefix)) {
      return si_prefix_multiplier[prefix]
    }
  }
  return 1
}

export const parseAndConvertSiUnit = <
  T extends
    | string
    | number
    | undefined
    | { x: string | number; y: string | number }
>(
  v: T
): {
  unit: string | null
  value: T extends { x: string | number; y: string | number }
    ? null | { x: number; y: number }
    : null | number
} => {
  if (typeof v === "undefined") return { unit: null, value: null }
  if (typeof v === "string" && v.match(/^[\d\.]+$/))
    return { value: parseFloat(v) as any, unit: null }
  if (typeof v === "number") return { value: v as any, unit: null }
  if (typeof v === "object" && "x" in v && "y" in v) {
    return {
      unit: parseAndConvertSiUnit(v.x).unit,
      value: {
        x: parseAndConvertSiUnit(v.x as any).value as number,
        y: parseAndConvertSiUnit(v.y as any).value as number,
      } as any,
    }
  }
  const unit_reversed = v
    .split("")
    .reverse()
    .join("")
    .match(/[a-zA-Z]+/)?.[0]
  if (!unit_reversed) {
    throw new Error(`Could not determine unit: "${v}"`)
  }
  const unit = unit_reversed.split("").reverse().join("")
  const value = v.slice(0, -unit.length)
  const measure = convertUnits().describe(unit)?.measure
  if (measure) {
    return {
      unit,
      value: convertUnits(parseFloat(value)).from(unit).to(measure),
    }
  } else {
    return {
      unit,
      value: (getSiPrefixMultiplierFromUnit(unit) * parseFloat(value)) as any,
    }
  }
}
