// 日志系统类型定义

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum LogCategory {
  SYSTEM = 'SYSTEM',
  USER_ACTION = 'USER_ACTION',
  API_CALL = 'API_CALL',
  STATE_CHANGE = 'STATE_CHANGE',
  PERFORMANCE = 'PERFORMANCE',
  ERROR_HANDLING = 'ERROR_HANDLING',
  STORAGE = 'STORAGE',
  UI_RENDER = 'UI_RENDER'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  stackTrace?: string;
  component?: string;
  userId?: string;
  sessionId: string;
  resolved?: boolean;
  resolutionNote?: string;
}

export interface LogFilter {
  level?: LogLevel[];
  category?: LogCategory[];
  startDate?: Date;
  endDate?: Date;
  component?: string;
  resolved?: boolean;
}

export interface LogAnalysis {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  performanceIssues: string[];
  suggestedFixes: Fix[];
  patterns: Pattern[];
}

export interface Fix {
  id: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  suggestedAction: string;
  autoFixable: boolean;
  code?: string;
}

export interface Pattern {
  type: 'recurring_error' | 'performance_degradation' | 'memory_leak' | 'logic_issue';
  description: string;
  frequency: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  affectedComponents: string[];
}

export interface LoggerConfig {
  maxEntries: number;
  rotationSize: number; // MB
  retentionDays: number;
  autoAnalyzeInterval: number; // 小时
  enableAutoFix: boolean;
  logToConsole: boolean;
  logToFile: boolean;
  remoteLogging?: {
    enabled: boolean;
    endpoint: string;
    apiKey: string;
  };
}