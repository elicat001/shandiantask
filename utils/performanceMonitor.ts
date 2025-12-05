// 性能监控工具
import { loggerService } from '../services/loggerService';
import { LogLevel, LogCategory } from '../types/logger';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: Date;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.setupPerformanceObservers();
  }

  // 设置性能观察器
  private setupPerformanceObservers(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // 监控长任务
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const duration = entry.duration;
            if (duration > 50) { // 超过50ms视为长任务
              loggerService.log(
                LogLevel.WARNING,
                LogCategory.PERFORMANCE,
                `Long task detected: ${duration.toFixed(2)}ms`,
                {
                  name: entry.name,
                  startTime: entry.startTime,
                  duration: duration
                },
                'PerformanceMonitor'
              );
            }
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        // Long Task API可能不被支持
        console.debug('Long Task API not supported');
      }

      // 监控FCP (First Contentful Paint)
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              loggerService.log(
                LogLevel.INFO,
                LogCategory.PERFORMANCE,
                `First Contentful Paint: ${entry.startTime.toFixed(2)}ms`,
                { startTime: entry.startTime },
                'PerformanceMonitor'
              );
            }
          }
        });

        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) {
        console.debug('Paint timing API not supported');
      }
    }
  }

  // 开始测量组件性能
  startMeasure(componentName: string): () => void {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return () => {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      const renderTime = endTime - startTime;

      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: new Date(),
        memoryUsage: endMemory - startMemory
      };

      // 存储指标
      if (!this.metrics.has(componentName)) {
        this.metrics.set(componentName, []);
      }
      this.metrics.get(componentName)!.push(metrics);

      // 记录慢渲染
      if (renderTime > 16) { // 超过16ms视为慢渲染（60fps标准）
        loggerService.log(
          LogLevel.WARNING,
          LogCategory.PERFORMANCE,
          `Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`,
          metrics,
          componentName
        );
      }

      // 清理旧数据（保留最近100条）
      const componentMetrics = this.metrics.get(componentName)!;
      if (componentMetrics.length > 100) {
        this.metrics.set(componentName, componentMetrics.slice(-100));
      }
    };
  }

  // 测量异步操作
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      if (duration > 1000) { // 超过1秒视为慢操作
        loggerService.log(
          LogLevel.WARNING,
          LogCategory.PERFORMANCE,
          `Slow async operation: ${operationName} took ${duration.toFixed(2)}ms`,
          { operationName, duration },
          'PerformanceMonitor'
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      loggerService.log(
        LogLevel.ERROR,
        LogCategory.PERFORMANCE,
        `Async operation failed: ${operationName}`,
        {
          operationName,
          duration,
          error: (error as Error).message
        },
        'PerformanceMonitor'
      );
      throw error;
    }
  }

  // 获取内存使用情况
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  // 获取性能报告
  getPerformanceReport(componentName?: string): any {
    if (componentName) {
      const metrics = this.metrics.get(componentName) || [];
      if (metrics.length === 0) return null;

      const renderTimes = metrics.map(m => m.renderTime);
      return {
        component: componentName,
        avgRenderTime: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
        minRenderTime: Math.min(...renderTimes),
        maxRenderTime: Math.max(...renderTimes),
        slowRenders: renderTimes.filter(t => t > 16).length,
        totalRenders: renderTimes.length
      };
    }

    // 返回所有组件的报告
    const report: any = {};
    this.metrics.forEach((metrics, component) => {
      report[component] = this.getPerformanceReport(component);
    });
    return report;
  }

  // 检查并报告性能问题
  checkPerformance(): void {
    const report = this.getPerformanceReport();

    Object.entries(report).forEach(([component, data]: [string, any]) => {
      if (data && data.avgRenderTime > 16) {
        loggerService.log(
          LogLevel.WARNING,
          LogCategory.PERFORMANCE,
          `Component ${component} has performance issues`,
          data,
          'PerformanceMonitor'
        );
      }
    });
  }

  // 清理观察器
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor();