import {
    MetricBlock,
    TextBlock,
    TableBlock,
    ChartBlock,
    KPIBlock,
} from './components';
import useComponentProcessor from './hooks/useComponentProcessor';
import { useMemo } from 'react';

const componentMap = {
    metric: MetricBlock,
    chart: ChartBlock,
    table: TableBlock,
    text: TextBlock,
    kpi: KPIBlock,
    //pie: PieBlock
};

const CustomReportRenderer = ({ layout = [], data, mode = 'processed' }) => {
    const { processMetric, processChartData, processTableData } = useComponentProcessor();

    const processedComponents = useMemo(() => {
        if (!layout || layout.length === 0) return [];

        if (mode === 'snapshot') {
            return layout;
        }

        if (!data) {
            return layout.map(component => ({
                ...component,
                processedData: null,
            }));
        }

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
                case 'text':
                    processedData = component.config?.content || '';
                    break;
                case 'text-aerea':
                    processedData = component.config?.content || '';
                    break;
                default:
                    processedData = null;
            }

            return {
                ...component,
                processedData,
            };
        });
    }, [layout, data, mode, processMetric, processChartData, processTableData]);

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