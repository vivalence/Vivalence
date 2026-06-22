import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

import { GraphChart } from "echarts/charts";
import { HeatmapChart } from "echarts/charts";
import { ScatterChart } from "echarts/charts";
import { LineChart } from "echarts/charts";
import { BarChart } from "echarts/charts";
import { TreemapChart } from "echarts/charts";
import { SunburstChart } from "echarts/charts";

import { TooltipComponent } from "echarts/components";
import { LegendComponent } from "echarts/components";
import { GridComponent } from "echarts/components";
import { DataZoomComponent } from "echarts/components";
import { VisualMapComponent } from "echarts/components";
import { MarkLineComponent } from "echarts/components";
import { MarkAreaComponent } from "echarts/components";

export const stage = {
  echarts,

  graph: GraphChart,
  heatmap: HeatmapChart,
  scatter: ScatterChart,
  line: LineChart,
  bar: BarChart,
  treemap: TreemapChart,
  sunburst: SunburstChart,

  tooltip: TooltipComponent,
  legend: LegendComponent,
  grid: GridComponent,
  dataZoom: DataZoomComponent,
  visualMap: VisualMapComponent,
  markLine: MarkLineComponent,
  markArea: MarkAreaComponent,

  renderer: CanvasRenderer,

  use(...modules) {
    echarts.use(modules);
  },

  chart(container, theme) {
    return echarts.init(container, theme);
  },
};
