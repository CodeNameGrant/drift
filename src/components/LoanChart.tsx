import React, { useState, useMemo } from 'react';
import { Chart } from 'react-charts';
import { LoanResult, ChartDataPoint } from '../types';
import { generateChartData, formatCurrency, formatDate } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';
import { TrendingDown, Info } from 'lucide-react';

interface LoanChartProps {
  result: LoanResult;
}

interface ChartSeries {
  label: string;
  data: Array<{ primary: number; secondary: number }>;
}

/**
 * Interactive line chart component using React Charts library
 * Features hover tooltips, responsive design, and accessibility
 */
const LoanChart: React.FC<LoanChartProps> = ({ result }) => {
  const { currency } = useCurrency();
  const [focusedDatum, setFocusedDatum] = useState<any>(null);

  // Generate chart data points
  const chartData = useMemo(() => generateChartData(result), [result]);

  // Transform data for React Charts format
  const data = useMemo(() => {
    const series: ChartSeries[] = [
      {
        label: 'Base Payment',
        data: chartData.map(d => ({
          primary: d.month,
          secondary: d.baseBalance
        }))
      },
      {
        label: `Simulation 1 (+${formatCurrency(result.simulation1.extraPayment, currency.code, false)})`,
        data: chartData
          .filter(d => d.simulation1Balance !== undefined)
          .map(d => ({
            primary: d.month,
            secondary: d.simulation1Balance!
          }))
      },
      {
        label: `Simulation 2 (+${formatCurrency(result.simulation2.extraPayment, currency.code, false)})`,
        data: chartData
          .filter(d => d.simulation2Balance !== undefined)
          .map(d => ({
            primary: d.month,
            secondary: d.simulation2Balance!
          }))
      }
    ];

    return series;
  }, [chartData, result, currency]);

  // Chart configuration
  const primaryAxis = useMemo(
    () => ({
      getValue: (datum: any) => datum.primary,
      type: 'linear' as const,
      position: 'bottom' as const,
      show: true,
      showGrid: true,
      showTicks: true,
      tickCount: 6,
      format: (value: number) => Math.round(value).toString(),
      min: 0
    }),
    []
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (datum: any) => datum.secondary,
        type: 'linear' as const,
        position: 'left' as const,
        show: true,
        showGrid: true,
        showTicks: true,
        tickCount: 6,
        format: (value: number) => formatCurrency(value, currency.code, false),
        min: 0
      }
    ],
    [currency]
  );

  // Chart styling configuration
  const getSeriesStyle = React.useCallback(
    (series: any) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B']; // Blue, Green, Orange
      return {
        color: colors[series.index] || '#3B82F6',
        strokeWidth: 3,
        strokeDasharray: series.index === 0 ? '0' : '0' // Solid lines for all
      };
    },
    []
  );

  // Tooltip configuration
  const renderTooltip = React.useCallback(
    ({ datum, primaryAxis, getSeriesStyle }: any) => {
      if (!datum) return null;

      const seriesColors = ['#3B82F6', '#10B981', '#F59E0B'];
      const seriesLabels = [
        'Base Payment',
        `Simulation 1 (+${formatCurrency(result.simulation1.extraPayment, currency.code, false)})`,
        `Simulation 2 (+${formatCurrency(result.simulation2.extraPayment, currency.code, false)})`
      ];

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[200px]">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Month {Math.round(datum.primaryValue)}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-0.5" 
                  style={{ backgroundColor: seriesColors[datum.seriesIndex] }}
                />
                <span className="text-gray-600 dark:text-gray-400">
                  {seriesLabels[datum.seriesIndex]}:
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(datum.secondaryValue, currency.code, false)}
              </span>
            </div>
          </div>
        </div>
      );
    },
    [result, currency]
  );

  // Error boundary component
  const ChartErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    React.useEffect(() => {
      const handleError = () => setHasError(true);
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load chart. Please try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  };

  // Loading component
  const ChartLoading: React.FC = () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading chart...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6" data-testid="loan-chart">
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Loan Balance Over Time
        </h3>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Base Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Simulation 1 (+{formatCurrency(result.simulation1.extraPayment, currency.code, false)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-orange-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Simulation 2 (+{formatCurrency(result.simulation2.extraPayment, currency.code, false)})
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <ChartErrorBoundary>
        <div className="relative h-96 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <React.Suspense fallback={<ChartLoading />}>
            <Chart
              options={{
                data,
                primaryAxis,
                secondaryAxes,
                getSeriesStyle,
                tooltip: {
                  render: renderTooltip
                },
                interactionMode: 'closest',
                defaultColors: ['#3B82F6', '#10B981', '#F59E0B'],
                dark: document.documentElement.classList.contains('dark'),
                padding: {
                  left: 60,
                  right: 30,
                  top: 20,
                  bottom: 60
                }
              }}
            />
          </React.Suspense>
        </div>
      </ChartErrorBoundary>

      {/* Chart Info */}
      <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Hover over the chart to see detailed balance information at any point in time. 
          The chart clearly shows how extra payments accelerate loan payoff and reduce total interest.
        </p>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only" aria-live="polite">
        {focusedDatum && (
          <span>
            Chart showing loan balance over time. Currently focused on month {Math.round(focusedDatum.primaryValue)} 
            with balance of {formatCurrency(focusedDatum.secondaryValue, currency.code)}.
          </span>
        )}
      </div>
    </div>
  );
};

export default LoanChart;