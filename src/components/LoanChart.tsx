import React, { useState, useMemo } from 'react';
import { LoanResult, ChartDataPoint } from '../types';
import { generateChartData, formatCurrency, formatDate } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';
import { TrendingDown, Info } from 'lucide-react';

interface LoanChartProps {
  result: LoanResult;
}

interface TooltipData {
  x: number;
  y: number;
  data: ChartDataPoint;
  visible: boolean;
}

/**
 * Interactive line chart component for loan balance visualization
 * Features hover tooltips, responsive design, and accessibility
 */
const LoanChart: React.FC<LoanChartProps> = ({ result }) => {
  const { currency } = useCurrency();
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: {} as ChartDataPoint, visible: false });

  // Generate chart data points
  const chartData = useMemo(() => generateChartData(result), [result]);

  // Chart dimensions and margins
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 60, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scales
  const maxBalance = Math.max(...chartData.map(d => Math.max(d.baseBalance, d.simulation1Balance, d.simulation2Balance)));
  const maxMonth = Math.max(...chartData.map(d => d.month));

  const xScale = (month: number) => (month / maxMonth) * chartWidth;
  const yScale = (balance: number) => chartHeight - (balance / maxBalance) * chartHeight;

  /**
   * Generate SVG path for a line chart
   */
  const generatePath = (data: ChartDataPoint[], balanceKey: keyof ChartDataPoint) => {
    return data
      .map((d, i) => {
        const x = xScale(d.month);
        const y = yScale(d[balanceKey] as number);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  /**
   * Handle mouse move for tooltip positioning
   */
  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - margin.left;
    const y = event.clientY - rect.top - margin.top;

    if (x >= 0 && x <= chartWidth && y >= 0 && y <= chartHeight) {
      const monthIndex = Math.round((x / chartWidth) * maxMonth) - 1;
      const dataPoint = chartData[Math.max(0, Math.min(monthIndex, chartData.length - 1))];

      if (dataPoint) {
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          data: dataPoint,
          visible: true
        });
      }
    }
  };

  /**
   * Hide tooltip on mouse leave
   */
  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Generate tick marks for axes
  const xTicks = Array.from({ length: 6 }, (_, i) => (i * maxMonth) / 5);
  const yTicks = Array.from({ length: 6 }, (_, i) => (i * maxBalance) / 5);

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
      <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <svg
          width={width}
          height={height}
          className="bg-gray-50 dark:bg-gray-900"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label="Loan balance comparison chart showing three payment scenarios over time"
        >
          {/* Chart Background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={chartWidth}
            height={chartHeight}
            fill="transparent"
            stroke="none"
          />

          {/* Grid Lines */}
          <g className="opacity-20">
            {/* Horizontal grid lines */}
            {yTicks.map((tick, i) => (
              <line
                key={`h-grid-${i}`}
                x1={margin.left}
                y1={margin.top + yScale(tick)}
                x2={margin.left + chartWidth}
                y2={margin.top + yScale(tick)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-400"
              />
            ))}
            {/* Vertical grid lines */}
            {xTicks.map((tick, i) => (
              <line
                key={`v-grid-${i}`}
                x1={margin.left + xScale(tick)}
                y1={margin.top}
                x2={margin.left + xScale(tick)}
                y2={margin.top + chartHeight}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-400"
              />
            ))}
          </g>

          {/* Chart Lines */}
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Base scenario line */}
            <path
              d={generatePath(chartData, 'baseBalance')}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Simulation 1 line */}
            <path
              d={generatePath(chartData, 'simulation1Balance')}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Simulation 2 line */}
            <path
              d={generatePath(chartData, 'simulation2Balance')}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* X-Axis */}
          <g transform={`translate(${margin.left}, ${height - margin.bottom})`}>
            <line
              x1="0"
              y1="0"
              x2={chartWidth}
              y2="0"
              stroke="currentColor"
              className="text-gray-400"
            />
            {xTicks.map((tick, i) => (
              <g key={`x-tick-${i}`} transform={`translate(${xScale(tick)}, 0)`}>
                <line y1="0" y2="6" stroke="currentColor" className="text-gray-400" />
                <text
                  y="20"
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {Math.round(tick)}
                </text>
              </g>
            ))}
            <text
              x={chartWidth / 2}
              y="45"
              textAnchor="middle"
              className="text-sm fill-gray-700 dark:fill-gray-300 font-medium"
            >
              Months
            </text>
          </g>

          {/* Y-Axis */}
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={chartHeight}
              stroke="currentColor"
              className="text-gray-400"
            />
            {yTicks.map((tick, i) => (
              <g key={`y-tick-${i}`} transform={`translate(0, ${yScale(tick)})`}>
                <line x1="-6" x2="0" stroke="currentColor" className="text-gray-400" />
                <text
                  x="-10"
                  y="4"
                  textAnchor="end"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {formatCurrency(tick, currency.code, false)}
                </text>
              </g>
            ))}
            <text
              x="-50"
              y={chartHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, -50, ${chartHeight / 2})`}
              className="text-sm fill-gray-700 dark:fill-gray-300 font-medium"
            >
              Remaining Balance
            </text>
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 pointer-events-none"
            style={{
              left: Math.min(tooltip.x + 10, width - 200),
              top: Math.max(tooltip.y - 10, 0)
            }}
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Month {tooltip.data.month}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Base:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(tooltip.data.baseBalance, currency.code, false)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Sim 1:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(tooltip.data.simulation1Balance, currency.code, false)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-orange-500" />
                <span className="text-gray-600 dark:text-gray-400">Sim 2:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(tooltip.data.simulation2Balance, currency.code, false)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Hover over the chart to see detailed balance information at any point in time. 
          The chart clearly shows how extra payments accelerate loan payoff and reduce total interest.
        </p>
      </div>
    </div>
  );
};

export default LoanChart;