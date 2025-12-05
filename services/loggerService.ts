// 日志服务 - 记录、分析和管理应用程序日志

import {
  LogEntry,
  LogLevel,
  LogCategory,
  LogFilter,
  LogAnalysis,
  LoggerConfig,
  Fix,
  Pattern
} from '../types/logger';

class LoggerService {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private config: LoggerConfig;
  private localStorage_KEY = 'app_logs';
  private analysisCache: LogAnalysis | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = this.getDefaultConfig();
    this.loadLogs();
    this.setupErrorHandlers();
  }

  // ========== 配置管理 ==========
  private getDefaultConfig(): LoggerConfig {
    return {
      maxEntries: 10000,
      rotationSize: 5, // 5MB
      retentionDays: 7,
      autoAnalyzeInterval: 1, // 每小时
      enableAutoFix: true,
      logToConsole: true,
      logToFile: true,
      remoteLogging: {
        enabled: false,
        endpoint: '',
        apiKey: ''
      }
    };
  }

  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    localStorage.setItem('logger_config', JSON.stringify(this.config));
  }

  // ========== 核心日志功能 ==========
  log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: any,
    component?: string
  ): string {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      category,
      message,
      details,
      component,
      sessionId: this.sessionId,
      resolved: false
    };

    // 如果是错误级别，尝试获取堆栈信息
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      entry.stackTrace = this.getStackTrace();
    }

    this.addLog(entry);

    // 控制台输出
    if (this.config.logToConsole) {
      this.logToConsole(entry);
    }

    // 远程日志
    if (this.config.remoteLogging?.enabled) {
      this.sendToRemote(entry);
    }

    return entry.id;
  }

  // 便捷方法
  debug(message: string, details?: any, component?: string): void {
    this.log(LogLevel.DEBUG, LogCategory.SYSTEM, message, details, component);
  }

  info(message: string, details?: any, component?: string): void {
    this.log(LogLevel.INFO, LogCategory.SYSTEM, message, details, component);
  }

  warn(message: string, details?: any, component?: string): void {
    this.log(LogLevel.WARNING, LogCategory.SYSTEM, message, details, component);
  }

  error(message: string, error?: Error, component?: string): void {
    this.log(LogLevel.ERROR, LogCategory.ERROR_HANDLING, message, {
      error: error?.message,
      stack: error?.stack
    }, component);
  }

  critical(message: string, error?: Error, component?: string): void {
    this.log(LogLevel.CRITICAL, LogCategory.ERROR_HANDLING, message, {
      error: error?.message,
      stack: error?.stack
    }, component);
  }

  // ========== 日志管理 ==========
  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry);

    // 限制日志数量
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(0, this.config.maxEntries);
    }

    // 检查大小并轮换
    if (this.shouldRotate()) {
      this.rotateLogs();
    }

    this.saveLogs();

    // 清除分析缓存
    this.analysisCache = null;
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(this.localStorage_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.logs = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        this.cleanOldLogs();
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(this.localStorage_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs:', error);
      // 如果存储失败，保留最近的日志
      this.logs = this.logs.slice(0, 1000);
    }
  }

  private shouldRotate(): boolean {
    const size = new Blob([JSON.stringify(this.logs)]).size / (1024 * 1024);
    return size > this.config.rotationSize;
  }

  private rotateLogs(): void {
    // 归档旧日志
    const archived = this.logs.slice(this.config.maxEntries / 2);
    const archiveKey = `logs_archive_${Date.now()}`;
    localStorage.setItem(archiveKey, JSON.stringify(archived));

    // 保留最近的日志
    this.logs = this.logs.slice(0, this.config.maxEntries / 2);
  }

  private cleanOldLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    this.logs = this.logs.filter(log =>
      new Date(log.timestamp) > cutoffDate
    );
  }

  // ========== 查询和过滤 ==========
  getLogs(filter?: LogFilter): LogEntry[] {
    let filtered = [...this.logs];

    if (filter) {
      if (filter.level && filter.level.length > 0) {
        filtered = filtered.filter(log => filter.level!.includes(log.level));
      }
      if (filter.category && filter.category.length > 0) {
        filtered = filtered.filter(log => filter.category!.includes(log.category));
      }
      if (filter.component) {
        filtered = filtered.filter(log => log.component === filter.component);
      }
      if (filter.resolved !== undefined) {
        filtered = filtered.filter(log => log.resolved === filter.resolved);
      }
      if (filter.startDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= filter.startDate!);
      }
      if (filter.endDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) <= filter.endDate!);
      }
    }

    return filtered;
  }

  getRecentErrors(limit = 10): LogEntry[] {
    return this.logs
      .filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL)
      .slice(0, limit);
  }

  // ========== 日志分析 ==========
  analyzeLogs(forceRefresh = false): LogAnalysis {
    if (this.analysisCache && !forceRefresh) {
      return this.analysisCache;
    }

    const errors = this.logs.filter(log => log.level === LogLevel.ERROR);
    const warnings = this.logs.filter(log => log.level === LogLevel.WARNING);
    const performanceIssues = this.detectPerformanceIssues();
    const patterns = this.detectPatterns();
    const suggestedFixes = this.generateFixes(errors, patterns);

    this.analysisCache = {
      totalLogs: this.logs.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      performanceIssues,
      suggestedFixes,
      patterns
    };

    return this.analysisCache;
  }

  private detectPerformanceIssues(): string[] {
    const issues: string[] = [];
    const performanceLogs = this.logs.filter(log => log.category === LogCategory.PERFORMANCE);

    // 检测慢渲染
    const slowRenders = performanceLogs.filter(log =>
      log.details?.renderTime && log.details.renderTime > 16
    );
    if (slowRenders.length > 5) {
      issues.push(`检测到${slowRenders.length}次慢渲染(>16ms)`);
    }

    // 检测内存问题
    const memoryWarnings = this.logs.filter(log =>
      log.message.toLowerCase().includes('memory') ||
      log.details?.memoryUsage > 100 * 1024 * 1024
    );
    if (memoryWarnings.length > 0) {
      issues.push('检测到潜在的内存问题');
    }

    return issues;
  }

  private detectPatterns(): Pattern[] {
    const patterns: Pattern[] = [];
    const errorGroups = new Map<string, LogEntry[]>();

    // 按错误消息分组
    this.logs
      .filter(log => log.level === LogLevel.ERROR)
      .forEach(log => {
        const key = log.message;
        if (!errorGroups.has(key)) {
          errorGroups.set(key, []);
        }
        errorGroups.get(key)!.push(log);
      });

    // 查找重复错误
    errorGroups.forEach((logs, message) => {
      if (logs.length >= 3) {
        patterns.push({
          type: 'recurring_error',
          description: `重复错误: ${message}`,
          frequency: logs.length,
          firstOccurrence: new Date(logs[logs.length - 1].timestamp),
          lastOccurrence: new Date(logs[0].timestamp),
          affectedComponents: [...new Set(logs.map(l => l.component).filter(Boolean))] as string[]
        });
      }
    });

    return patterns;
  }

  private generateFixes(errors: LogEntry[], patterns: Pattern[]): Fix[] {
    const fixes: Fix[] = [];

    // 为重复错误生成修复建议
    patterns
      .filter(p => p.type === 'recurring_error')
      .forEach(pattern => {
        fixes.push({
          id: this.generateId(),
          issue: pattern.description,
          severity: pattern.frequency > 10 ? 'high' : 'medium',
          component: pattern.affectedComponents[0] || 'unknown',
          suggestedAction: `建议检查${pattern.affectedComponents.join(', ')}中的错误处理逻辑`,
          autoFixable: false
        });
      });

    // 为特定错误类型生成修复建议
    errors.forEach(error => {
      // 类型错误
      if (error.message.includes('TypeError')) {
        fixes.push({
          id: this.generateId(),
          issue: '类型错误',
          severity: 'high',
          component: error.component || 'unknown',
          suggestedAction: '添加类型检查和空值保护',
          autoFixable: true,
          code: `if (value && typeof value === 'object') { /* safe to use */ }`
        });
      }

      // 网络错误
      if (error.message.includes('fetch') || error.message.includes('network')) {
        fixes.push({
          id: this.generateId(),
          issue: '网络请求错误',
          severity: 'medium',
          component: error.component || 'unknown',
          suggestedAction: '添加重试机制和错误处理',
          autoFixable: true,
          code: `try { await fetch(url).catch(err => { /* retry logic */ }); } catch(e) { /* handle */ }`
        });
      }
    });

    return fixes;
  }

  // ========== 错误处理 ==========
  private setupErrorHandlers(): void {
    // 捕获全局错误
    window.addEventListener('error', (event) => {
      this.error(`Uncaught error: ${event.message}`, new Error(event.message), 'Window');
    });

    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.error(`Unhandled promise rejection: ${event.reason}`, new Error(event.reason), 'Promise');
    });
  }

  // ========== 工具方法 ==========
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStackTrace(): string {
    const error = new Error();
    return error.stack || '';
  }

  private logToConsole(entry: LogEntry): void {
    const style = this.getConsoleStyle(entry.level);
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    console.log(
      `%c[${timestamp}] [${entry.level}] [${entry.category}]`,
      style,
      entry.message,
      entry.details || ''
    );
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: gray;';
      case LogLevel.INFO:
        return 'color: blue;';
      case LogLevel.WARNING:
        return 'color: orange; font-weight: bold;';
      case LogLevel.ERROR:
        return 'color: red; font-weight: bold;';
      case LogLevel.CRITICAL:
        return 'color: red; background: yellow; font-weight: bold;';
      default:
        return '';
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteLogging?.endpoint) return;

    try {
      await fetch(this.config.remoteLogging.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.remoteLogging.apiKey}`
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send log to remote:', error);
    }
  }

  // ========== 导出功能 ==========
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }

    // CSV格式
    const headers = ['Timestamp', 'Level', 'Category', 'Component', 'Message', 'Details'];
    const rows = this.logs.map(log => [
      log.timestamp.toISOString(),
      log.level,
      log.category,
      log.component || '',
      log.message,
      JSON.stringify(log.details || {})
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
    this.analysisCache = null;
  }

  // 标记日志为已解决
  resolveLog(logId: string, note?: string): void {
    const log = this.logs.find(l => l.id === logId);
    if (log) {
      log.resolved = true;
      log.resolutionNote = note;
      this.saveLogs();
    }
  }
}

// 导出单例
export const loggerService = new LoggerService();