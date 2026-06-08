import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
import type { ComponentType, CSSProperties } from 'react';

const PlotlyComponent = createPlotlyComponent(Plotly);

export interface PlotlyChartProps {
  data: object[];
  layout?: object;
  config?: object;
  revision?: number;
  useResizeHandler?: boolean;
  style?: CSSProperties;
}

const Plot = PlotlyComponent as ComponentType<PlotlyChartProps>;

export default Plot;
