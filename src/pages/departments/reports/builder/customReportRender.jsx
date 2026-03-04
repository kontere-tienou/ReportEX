// pages/departments/reports/builder/CustomReportRenderer.jsx
import {
    MetricBlock,
    TextBlock,
    TableBlock,
    ChartBlock,
} from './components';
import useComponentProcessor from './hooks/useComponentProcessor';
import { useMemo } from 'react';

const componentMap = {
    metric: MetricBlock,
    chart: ChartBlock,
    table: TableBlock,
    text: TextBlock,
};

const CustomReportRenderer = ({ layout = [], data }) => {
    const { processMetric, processChartData, processTableData } = useComponentProcessor();

    const processedComponents = useMemo(() => {
        if (!data) return layout;

        return layout.map(component => {
            let processedData = null;

            switch (component.type) {
                case 'metric':
                    processedData = processMetric(data, component.config);
                    break;
                case 'chart':
                    processedData = processChartData(data, component.config);
                    break;
                case 'table':
                    processedData = processTableData(data, component.config);
                    break;
                default:
                    processedData = data;
            }

            return {
                ...component,
                processedData
            };
        });
    }, [layout, data, processMetric, processChartData, processTableData]);

    if (!layout || layout.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                Aucun composant dans ce rapport personnalisé.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {processedComponents.map((component) => {
                const Component = componentMap[component.type];

                if (!Component) {
                    return (
                        <div key={component.id} className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-yellow-800">
                                Composant inconnu : {component.type}
                            </p>
                        </div>
                    );
                }

                return (
                    <div key={component.id} className="bg-white rounded-lg border p-4">
                        {component.config?.title && (
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                {component.config.title}
                            </h3>
                        )}
                        <Component
                            component={component}
                            value={component.processedData}
                            data={component.processedData}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default CustomReportRenderer;