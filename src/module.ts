import { PanelPlugin } from '@grafana/data';
import { DecisionTrackerPanel } from './components/DecisionTrackerPanel';

export const plugin = new PanelPlugin(DecisionTrackerPanel).setPanelOptions((builder) => {
  return builder;
});
