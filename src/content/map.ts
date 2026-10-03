import type { NormalizedData } from "./schema"
import { SECTIONS, type NodeId } from "./sections"

export interface PanelData {
  id: NodeId
  title: string
  data: NormalizedData
}

export function mapContentToPanels(data: NormalizedData): Record<NodeId, PanelData> {
  return Object.fromEntries(SECTIONS.map(({ id, label }) => [id, { id, title: label, data }])) as Record<NodeId, PanelData>
}
