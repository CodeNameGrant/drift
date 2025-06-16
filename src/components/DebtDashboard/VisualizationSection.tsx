import React, { useState } from 'react';
import { PieChart, TrendingDown, BarChart3 } from 'lucide-react';
import { DebtAccount } from '../../types/debt';
import ChartSelector, { ChartOption } from './ChartSelector';
import DebtDistributionPieChart from './DebtDistributionPieChart';
import DebtReductionLineChart from './DebtReductionLineChart';
import InterestRateBarChart from './InterestRateBarChart';

interface VisualizationSectionProps {
  accounts: DebtAccount[];
}

/**
 * Visualization section component with chart selector and dynamic chart display
 * Features smooth transitions between charts and consistent layout
 */
const VisualizationSection: React.FC<VisualizationSectionProps> = ({ accounts }) => {
  // Chart options configuration
  const chartOptions: ChartOption[] = [
    {
      id: 'debt-distribution',
      label: 'Debt Distribution',
      description: 'Breakdown of debt by account type',
      icon: PieChart
    },
    {
      id: 'debt-reduction',
      label: 'Debt Reduction Timeline',
      description: 'Projected debt payoff over time',
      icon: TrendingDown
    },
    {
      id: 'interest-rates',
      label: 'Interest Rate Comparison',
      description: 'Compare rates across all accounts',
      icon: BarChart3
    }
  ];

  // State for selected chart
  const [selectedChart, setSelectedChart] = useState<string>(chartOptions[0].id);

  /**
   * Handle chart selection change
   */
  const handleChartChange = (chartId: string) => {
    setSelectedChart(chartId);
  };

  /**
   * Render the selected chart component
   */
  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'debt-distribution':
        return <DebtDistributionPieChart accounts={accounts} />;
      case 'debt-reduction':
        return <DebtReductionLineChart accounts={accounts} />;
      case 'interest-rates':
        return <InterestRateBarChart accounts={accounts} />;
      default:
        return <DebtDistributionPieChart accounts={accounts} />;
    }
  };

  return (
    <div className="space-y-6" data-testid="visualization-section">
      {/* Section Header with Chart Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Data Visualizations
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Interactive charts showing different aspects of your debt portfolio
          </p>
        </div>
        
        {/* Chart Selector */}
        <div className="flex-shrink-0">
          <ChartSelector
            options={chartOptions}
            selectedChart={selectedChart}
            onChartChange={handleChartChange}
          />
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="relative">
        {/* Chart Container with consistent height and smooth transitions */}
        <div 
          className="transition-all duration-300 ease-in-out"
          style={{ minHeight: '600px' }}
          data-testid="chart-container"
        >
          {renderSelectedChart()}
        </div>

        {/* Chart Navigation Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {chartOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleChartChange(option.id)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                selectedChart === option.id
                  ? 'bg-primary scale-110'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Switch to ${option.label}`}
              data-testid={`chart-indicator-${option.id}`}
            />
          ))}
        </div>
      </div>

      {/* Chart Information Panel */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            {React.createElement(
              chartOptions.find(option => option.id === selectedChart)?.icon || PieChart,
              { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              {chartOptions.find(option => option.id === selectedChart)?.label}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {selectedChart === 'debt-distribution' && 
                'This pie chart shows how your total debt is distributed across different account types. Use the legend to show/hide specific types and see detailed breakdowns.'
              }
              {selectedChart === 'debt-reduction' && 
                'This timeline chart projects how your debt balances will decrease over time based on current payment schedules. Use the zoom controls and legend to focus on specific accounts or time periods.'
              }
              {selectedChart === 'interest-rates' && 
                'This bar chart compares interest rates across all your accounts, sorted from highest to lowest. Color coding helps identify high-rate accounts that should be prioritized for faster payoff.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationSection;