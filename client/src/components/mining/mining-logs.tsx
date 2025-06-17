import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Download, Trash2, RotateCcw } from 'lucide-react';
import { LogEntry } from '@/types/mining';

interface MiningLogsProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export function MiningLogs({ logs, onClearLogs }: MiningLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-mining-success';
      case 'error':
        return 'text-mining-error';
      case 'warning':
        return 'text-mining-warning';
      case 'info':
      default:
        return 'text-mining-text-secondary';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'POOL':
        return 'text-mining-primary';
      case 'ENGINE':
        return 'text-mining-warning';
      case 'SYSTEM':
        return 'text-mining-success';
      default:
        return 'text-mining-text-secondary';
    }
  };

  const exportLogs = () => {
    const logText = logs
      .map(log => `[${log.timestamp}] [${log.source}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mining-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      // Handle various timestamp formats
      if (timestamp.includes(':') && !timestamp.includes('T')) {
        // Already a time string, return as is
        return timestamp;
      }
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // If invalid date, return current time
        return new Date().toLocaleTimeString();
      }
      return date.toLocaleTimeString();
    } catch {
      return new Date().toLocaleTimeString();
    }
  };

  return (
    <Card className="bg-mining-surface border-mining-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-mining-text">
            <Terminal className="w-5 h-5" />
            <span>Mining Logs</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearLogs}
              className="border-mining-border text-mining-text-secondary hover:bg-mining-border"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportLogs}
              className="border-mining-border text-mining-text-secondary hover:bg-mining-border"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-mining-border text-mining-text-secondary hover:bg-mining-border"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={logsContainerRef}
          className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm mining-logs"
        >
          {logs.length === 0 ? (
            <div className="text-center text-mining-text-secondary py-8">
              <Terminal className="w-12 h-12 mx-auto mb-4" />
              <p>No logs yet</p>
              <p className="text-xs mt-2">Mining logs will appear here</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`mb-1 ${getLevelColor(log.level)}`}>
                <span className="text-mining-warning">
                  [{formatTimestamp(log.timestamp)}]
                </span>
                {' '}
                <span className={getSourceColor(log.source)}>
                  [{log.source}]
                </span>
                {' '}
                <span className="text-mining-text">
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </CardContent>
    </Card>
  );
}
