import React, { useState, useMemo } from 'react';
import { Chart } from 'react-charts';
import { DebtAccount } from '../../types/debt';
import { generateDebtReductionData, formatCurrency, formatDate } from '../../utils/calculations';
import { useCurrency } from '../../context/CurrencyContext';
import { TrendingDown, Info, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';

interface DebtReductionLineChartProps {
  accounts: DebtAccount[];
}

/**
 * Line chart component showing debt reduction timeline for each account
 * Features color-coded lines, interactive legend, zooming, and detailed tooltips
 */
const DebtReductionLineChart: React.FC<DebtReductionLineChartProps> = ({ accounts }) => {
  const { currency } = useCurrency();
  const [hiddenAccounts, setHiddenAccounts] = useState<Set<string>>(new Set());
  const [focusedDatum, setFocusedDatum] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Generate timeline data
  const timelineData = useMemo(() => generateDebtReductionData(accounts.filter(account => account.isActive)), [accounts]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const visibleAccounts = accounts.filter(account => 
      account.isActive && !hiddenAccounts.has(account.id)
    );

    return visibleAccounts.map(account => ({
      label: account.name,
      data: timelineData.map(point => {
        const accountData = point.accounts.find(acc => acc.id === account.id);
        return {
          primary: point.month,
          secondary: accountData?.balance || 0,
          date: point.date,
          accountName: account.name,
          accountType: account.type
        };
      }).filter(point => point.secondary > 0), // Only show months with remaining balance
      color: timelineData[0]?.accounts.find(acc => acc.id === account.id)?.color || '#3B82F6'
    }));
  }, [accounts, hiddenAccounts, timelineData]);

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
      format: (value: number) => `${Math.round(value)}mo`,
      min: 0,
      max: Math.round(120 / zoomLevel) // Adjust max based on zoom level
    }),
    [zoomLevel]
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (datum: any) => datum.secondary,
        type: 'linear' as const,
        position: 'left' as const,
        elementType: 'line' as const,
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
    (series: any) => ({
      color: series.originalSeries?.color || '#3B82F6',
      strokeWidth: 2,
      strokeDasharray: '0'
    }),
    []
  );

  // Toggle account visibility
  const toggleAccountVisibility = (accountId: string) => {
    setHiddenAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  };

  // Tooltip configuration
  const renderTooltip = React.useCallback(
    ({ datum }: any) => {
      if (!datum) return null;

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[200px]">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {datum.accountName}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Month:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {datum.primary}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Balance:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(datum.secondary, currency.code)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(datum.date)}
              </span>
            </div>
          </div>
        </div>
      );
    },
    [currency]
  );

  // Loading component
  const ChartLoading: React.FC = () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading chart...</p>
      </div>
    </div>
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700" data-testid="debt-reduction-line-chart">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Debt Reduction Timeline
          </h3>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Zoom out"
            data-testid="zoom-out-button"
          >
            <ZoomOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 4}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Zoom in"
            data-testid="zoom-in-button"
          >
            <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Accounts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {accounts.filter(account => account.isActive).map((account) => {
            const isHidden = hiddenAccounts.has(account.id);
            const accountColor = timelineData[0]?.accounts.find(acc => acc.id === account.id)?.color || '#3B82F6';
            
            return (
              <button
                key={account.id}
                onClick={() => toggleAccountVisibility(account.id)}
                className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  isHidden ? 'opacity-50' : ''
                }`}
                data-testid={`legend-item-${account.id}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-3 h-0.5 flex-shrink-0"
                    style={{ backgroundColor: accountColor }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {account.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(account.currentBalance, currency.code, false)}
                  </span>
                  {isHidden ? (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  ) : (
                    <Eye className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Container */}
      <ChartErrorBoundary>
        <div className="relative h-96 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {chartData.length > 0 ? (
            <React.Suspense fallback={<ChartLoading />}>
              <Chart
                options={{
                  data: chartData,
                  primaryAxis,
                  secondaryAxes,
                  getSeriesStyle,
                  tooltip: {
                    render: renderTooltip
                  },
                  interactionMode: 'closest',
                  defaultColors: chartData.map(series => series.color),
                  dark: document.documentElement.classList.contains('dark'),
                  padding: {
                    left: 80,
                    right: 30,
                    top: 20,
                    bottom: 60
                  }
                }}
              />
            </React.Suspense>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {hiddenAccounts.size === accounts.filter(a => a.isActive).length 
                    ? 'All accounts are hidden. Click the legend items to show them.'
                    : 'No debt timeline data available'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </ChartErrorBoundary>

      {/* Chart Info */}
      <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          This chart shows projected debt reduction over time based on current payment schedules. 
          Click legend items to show/hide accounts. Use zoom controls to focus on specific time periods.
        </p>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only" aria-live="polite">
        {focusedDatum && (
          <span>
            Line chart showing debt reduction timeline. Currently focused on {focusedDatum.accountName} 
            at month {focusedDatum.primary} with balance of {formatCurrency(focusedDatum.secondary, currency.code)}.
          </span>
        )}
      </div>
    </div>
  );
};

export default DebtReductionLineChart;