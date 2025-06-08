import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp } from 'lucide-react';
import { ChartDataPoint } from '@/types/mining';

declare global {
  interface Window {
    Chart: any;
  }
}

interface PerformanceChartsProps {
  hashrateHistory: ChartDataPoint[];
  earningsHistory: ChartDataPoint[];
}

export function PerformanceCharts({ hashrateHistory, earningsHistory }: PerformanceChartsProps) {
  const hashrateChartRef = useRef<HTMLCanvasElement>(null);
  const earningsChartRef = useRef<HTMLCanvasElement>(null);
  const hashrateChartInstance = useRef<any>(null);
  const earningsChartInstance = useRef<any>(null);

  useEffect(() => {
    // Load Chart.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
    script.onload = () => {
      initializeCharts();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (hashrateChartInstance.current) {
        hashrateChartInstance.current.destroy();
      }
      if (earningsChartInstance.current) {
        earningsChartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (hashrateChartInstance.current && hashrateHistory.length > 0) {
      updateHashrateChart();
    }
  }, [hashrateHistory]);

  useEffect(() => {
    if (earningsChartInstance.current && earningsHistory.length > 0) {
      updateEarningsChart();
    }
  }, [earningsHistory]);

  const initializeCharts = () => {
    if (!window.Chart) return;

    // Initialize hashrate chart
    if (hashrateChartRef.current) {
      const ctx = hashrateChartRef.current.getContext('2d');
      hashrateChartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: Array(20).fill(''),
          datasets: [{
            label: 'Hashrate (MH/s)',
            data: hashrateHistory.map(point => point.value),
            borderColor: '#1976D2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#F0F6FC' }
            }
          },
          scales: {
            x: { 
              grid: { color: '#374151' },
              ticks: { color: '#9CA3AF' }
            },
            y: { 
              grid: { color: '#374151' },
              ticks: { color: '#9CA3AF' },
              beginAtZero: true
            }
          }
        }
      });
    }

    // Initialize earnings chart
    if (earningsChartRef.current) {
      const ctx = earningsChartRef.current.getContext('2d');
      earningsChartInstance.current = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Accepted', 'Rejected'],
          datasets: [{
            data: [95, 5],
            backgroundColor: ['#4CAF50', '#F44336'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#F0F6FC',
                padding: 20
              }
            }
          }
        }
      });
    }
  };

  const updateHashrateChart = () => {
    if (hashrateChartInstance.current) {
      hashrateChartInstance.current.data.datasets[0].data = hashrateHistory.map(point => point.value);
      hashrateChartInstance.current.update('none');
    }
  };

  const updateEarningsChart = () => {
    if (earningsChartInstance.current) {
      earningsChartInstance.current.data.datasets[0].data = earningsHistory.map(point => point.value);
      earningsChartInstance.current.update('none');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-mining-surface border-mining-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-mining-text">
              <BarChart3 className="w-5 h-5" />
              <span>Performance Analytics</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="px-3 py-1 text-xs bg-mining-primary/20 text-mining-primary border-mining-primary"
              >
                1H
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="px-3 py-1 text-xs border-mining-border text-mining-text-secondary"
              >
                6H
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="px-3 py-1 text-xs border-mining-border text-mining-text-secondary"
              >
                24H
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <canvas ref={hashrateChartRef} className="w-full h-full"></canvas>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-mining-surface border-mining-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-mining-text">
            <TrendingUp className="w-5 h-5" />
            <span>Share Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas ref={earningsChartRef} className="w-full h-full"></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
