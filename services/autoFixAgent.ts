// 自动修复智能体 - 分析日志并自动修复问题

import { loggerService } from './loggerService';
import { LogLevel, LogCategory } from '../types/logger';
import { useStore } from '../store/useStore';

interface AutoFixResult {
  success: boolean;
  fixApplied: string;
  details?: any;
  error?: string;
}

interface HealthCheck {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  lastCheck: Date;
}

class AutoFixAgent {
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private fixHistory: Map<string, Date> = new Map();
  private healthStatus: Map<string, HealthCheck> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    loggerService.info('AutoFixAgent initialized', {}, 'AutoFixAgent');

    // 设置默认健康检查
    this.setupHealthChecks();
  }

  // ========== 自动修复逻辑 ==========
  async analyzeAndFix(): Promise<void> {
    if (this.isRunning) {
      loggerService.debug('AutoFix already running, skipping', {}, 'AutoFixAgent');
      return;
    }

    this.isRunning = true;
    loggerService.info('Starting automatic analysis and fix', {}, 'AutoFixAgent');

    try {
      // 1. 分析日志
      const analysis = loggerService.analyzeLogs(true);

      // 2. 执行健康检查
      await this.performHealthChecks();

      // 3. 应用自动修复
      if (analysis.suggestedFixes.length > 0) {
        for (const fix of analysis.suggestedFixes) {
          if (fix.autoFixable && !this.hasRecentlyFixed(fix.id)) {
            await this.applyFix(fix);
          }
        }
      }

      // 4. 处理性能问题
      if (analysis.performanceIssues.length > 0) {
        await this.handlePerformanceIssues(analysis.performanceIssues);
      }

      // 5. 处理重复错误模式
      if (analysis.patterns.length > 0) {
        await this.handlePatterns(analysis.patterns);
      }

      // 6. 清理和优化
      await this.performMaintenance();

      loggerService.info('Automatic analysis and fix completed', {
        fixesApplied: analysis.suggestedFixes.filter(f => f.autoFixable).length,
        performanceIssues: analysis.performanceIssues.length,
        patterns: analysis.patterns.length
      }, 'AutoFixAgent');

    } catch (error) {
      loggerService.error('AutoFix failed', error as Error, 'AutoFixAgent');
    } finally {
      this.isRunning = false;
    }
  }

  // ========== 具体修复方法 ==========
  private async applyFix(fix: any): Promise<AutoFixResult> {
    loggerService.info(`Applying fix: ${fix.suggestedAction}`, fix, 'AutoFixAgent');

    try {
      let result: AutoFixResult = {
        success: false,
        fixApplied: fix.suggestedAction
      };

      // 根据问题类型应用不同的修复策略
      switch (fix.issue) {
        case '类型错误':
          result = await this.fixTypeError(fix);
          break;

        case '网络请求错误':
          result = await this.fixNetworkError(fix);
          break;

        case '状态不一致':
          result = await this.fixStateInconsistency(fix);
          break;

        case '内存泄漏':
          result = await this.fixMemoryLeak(fix);
          break;

        default:
          result = await this.applyGenericFix(fix);
      }

      if (result.success) {
        this.recordFix(fix.id);
        loggerService.info(`Fix applied successfully: ${fix.suggestedAction}`, result, 'AutoFixAgent');
      } else {
        loggerService.warn(`Fix failed: ${fix.suggestedAction}`, result, 'AutoFixAgent');
      }

      return result;

    } catch (error) {
      loggerService.error(`Error applying fix: ${fix.suggestedAction}`, error as Error, 'AutoFixAgent');
      return {
        success: false,
        fixApplied: fix.suggestedAction,
        error: (error as Error).message
      };
    }
  }

  private async fixTypeError(fix: any): Promise<AutoFixResult> {
    // 类型错误修复逻辑
    try {
      // 添加类型检查包装器
      const componentName = fix.component;

      // 示例：为组件添加类型保护
      if (window[componentName as any]) {
        const original = window[componentName as any];
        window[componentName as any] = function(...args: any[]) {
          // 添加参数验证
          const validatedArgs = args.map(arg => {
            if (arg === undefined || arg === null) {
              return {};
            }
            return arg;
          });

          try {
            return original.apply(this, validatedArgs);
          } catch (error) {
            loggerService.error(`Type error caught in ${componentName}`, error as Error, componentName);
            return null;
          }
        };
      }

      return {
        success: true,
        fixApplied: `Added type safety wrapper to ${componentName}`,
        details: { component: componentName }
      };
    } catch (error) {
      return {
        success: false,
        fixApplied: 'Type error fix',
        error: (error as Error).message
      };
    }
  }

  private async fixNetworkError(fix: any): Promise<AutoFixResult> {
    // 网络错误修复逻辑
    try {
      // 实现重试机制
      const originalFetch = window.fetch;

      window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        let lastError: Error | null = null;
        const maxRetries = 3;
        const retryDelay = 1000;

        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await originalFetch(input, init);
            if (!response.ok && i < maxRetries - 1) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
          } catch (error) {
            lastError = error as Error;
            loggerService.warn(`Network request failed, retry ${i + 1}/${maxRetries}`, {
              url: input.toString(),
              error: lastError.message
            }, 'NetworkRetry');

            if (i < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
            }
          }
        }

        throw lastError || new Error('Network request failed after retries');
      };

      return {
        success: true,
        fixApplied: 'Added network retry mechanism',
        details: { maxRetries: 3, retryDelay: 1000 }
      };
    } catch (error) {
      return {
        success: false,
        fixApplied: 'Network error fix',
        error: (error as Error).message
      };
    }
  }

  private async fixStateInconsistency(fix: any): Promise<AutoFixResult> {
    // 状态不一致修复逻辑
    try {
      const store = useStore.getState();

      // 重新加载所有数据
      store.initializeApp();

      // 验证状态一致性
      const tasks = store.tasks;
      const validTasks = tasks.filter(task =>
        task.id && task.title && task.listId
      );

      if (validTasks.length !== tasks.length) {
        store.setTasks(validTasks);
        loggerService.info('Cleaned invalid tasks', {
          removed: tasks.length - validTasks.length
        }, 'AutoFixAgent');
      }

      return {
        success: true,
        fixApplied: 'State consistency restored',
        details: {
          tasksValidated: validTasks.length,
          tasksRemoved: tasks.length - validTasks.length
        }
      };
    } catch (error) {
      return {
        success: false,
        fixApplied: 'State consistency fix',
        error: (error as Error).message
      };
    }
  }

  private async fixMemoryLeak(fix: any): Promise<AutoFixResult> {
    // 内存泄漏修复逻辑
    try {
      // 清理未使用的事件监听器
      const listeners = (window as any).__eventListeners || [];
      listeners.forEach((listener: any) => {
        if (listener.unused) {
          window.removeEventListener(listener.type, listener.handler);
        }
      });

      // 清理过期的定时器
      const timers = (window as any).__activeTimers || [];
      timers.forEach((timer: any) => {
        if (timer.expired) {
          clearTimeout(timer.id);
        }
      });

      // 强制垃圾回收（如果可用）
      if ((window as any).gc) {
        (window as any).gc();
      }

      // 清理大型缓存
      const store = useStore.getState();
      if (store.tasks.length > 1000) {
        const recentTasks = store.tasks.slice(0, 500);
        store.setTasks(recentTasks);
      }

      return {
        success: true,
        fixApplied: 'Memory optimization performed',
        details: {
          listenersRemoved: listeners.filter((l: any) => l.unused).length,
          timersCleared: timers.filter((t: any) => t.expired).length
        }
      };
    } catch (error) {
      return {
        success: false,
        fixApplied: 'Memory leak fix',
        error: (error as Error).message
      };
    }
  }

  private async applyGenericFix(fix: any): Promise<AutoFixResult> {
    // 通用修复逻辑
    try {
      // 记录修复尝试
      loggerService.info(`Attempting generic fix for: ${fix.issue}`, fix, 'AutoFixAgent');

      // 如果提供了代码，尝试执行
      if (fix.code) {
        try {
          // 安全执行代码（在生产环境中应该更加谨慎）
          const func = new Function('fix', 'store', 'logger', fix.code);
          func(fix, useStore.getState(), loggerService);
        } catch (codeError) {
          loggerService.error('Failed to execute fix code', codeError as Error, 'AutoFixAgent');
        }
      }

      return {
        success: true,
        fixApplied: `Generic fix for ${fix.issue}`,
        details: fix
      };
    } catch (error) {
      return {
        success: false,
        fixApplied: 'Generic fix',
        error: (error as Error).message
      };
    }
  }

  // ========== 性能问题处理 ==========
  private async handlePerformanceIssues(issues: string[]): Promise<void> {
    for (const issue of issues) {
      loggerService.warn(`Handling performance issue: ${issue}`, {}, 'AutoFixAgent');

      if (issue.includes('慢渲染')) {
        // 优化渲染性能
        this.optimizeRendering();
      }

      if (issue.includes('内存')) {
        // 执行内存清理
        await this.fixMemoryLeak({});
      }
    }
  }

  private optimizeRendering(): void {
    // 降低动画帧率
    if ((window as any).requestAnimationFrame) {
      let skipFrame = false;
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = function(callback: FrameRequestCallback): number {
        if (skipFrame) {
          skipFrame = false;
          return originalRAF(callback);
        }
        skipFrame = true;
        return setTimeout(() => callback(Date.now()), 33); // 30fps instead of 60fps
      };
    }

    loggerService.info('Rendering optimization applied', {}, 'AutoFixAgent');
  }

  // ========== 模式处理 ==========
  private async handlePatterns(patterns: any[]): Promise<void> {
    for (const pattern of patterns) {
      if (pattern.type === 'recurring_error' && pattern.frequency > 5) {
        loggerService.critical(
          `Recurring error pattern detected: ${pattern.description}`,
          new Error(pattern.description),
          'AutoFixAgent'
        );

        // 为高频错误创建特定的错误处理器
        this.createErrorHandler(pattern);
      }
    }
  }

  private createErrorHandler(pattern: any): void {
    // 为特定错误模式创建处理器
    const handler = (error: Error) => {
      if (error.message.includes(pattern.description)) {
        loggerService.debug('Handled known error pattern', { pattern }, 'AutoFixAgent');
        // 阻止错误传播
        return true;
      }
      return false;
    };

    // 注册错误处理器
    (window as any).__errorHandlers = (window as any).__errorHandlers || [];
    (window as any).__errorHandlers.push(handler);
  }

  // ========== 健康检查 ==========
  private setupHealthChecks(): void {
    const components = ['TaskView', 'CalendarView', 'Store', 'API', 'Storage'];

    components.forEach(component => {
      this.healthStatus.set(component, {
        component,
        status: 'healthy',
        issues: [],
        lastCheck: new Date()
      });
    });
  }

  private async performHealthChecks(): Promise<void> {
    // 检查存储健康
    const storageHealth = await this.checkStorageHealth();
    this.healthStatus.set('Storage', storageHealth);

    // 检查Store健康
    const storeHealth = await this.checkStoreHealth();
    this.healthStatus.set('Store', storeHealth);

    // 检查API健康
    const apiHealth = await this.checkAPIHealth();
    this.healthStatus.set('API', apiHealth);

    // 记录不健康的组件
    this.healthStatus.forEach((health, component) => {
      if (health.status !== 'healthy') {
        loggerService.warn(
          `Component health check failed: ${component}`,
          health,
          'HealthCheck'
        );
      }
    });
  }

  private async checkStorageHealth(): Promise<HealthCheck> {
    const health: HealthCheck = {
      component: 'Storage',
      status: 'healthy',
      issues: [],
      lastCheck: new Date()
    };

    try {
      // 检查localStorage可用性
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);

      // 检查存储空间
      const used = new Blob(Object.values(localStorage)).size;
      const estimatedMax = 5 * 1024 * 1024; // 5MB estimate

      if (used > estimatedMax * 0.9) {
        health.status = 'critical';
        health.issues.push('Storage almost full');
      } else if (used > estimatedMax * 0.7) {
        health.status = 'warning';
        health.issues.push('Storage usage high');
      }

    } catch (error) {
      health.status = 'critical';
      health.issues.push('Storage not accessible');
    }

    return health;
  }

  private async checkStoreHealth(): Promise<HealthCheck> {
    const health: HealthCheck = {
      component: 'Store',
      status: 'healthy',
      issues: [],
      lastCheck: new Date()
    };

    try {
      const store = useStore.getState();

      // 检查任务数量
      if (store.tasks.length > 10000) {
        health.status = 'warning';
        health.issues.push('Too many tasks in memory');
      }

      // 检查是否有无效任务
      const invalidTasks = store.tasks.filter(t => !t.id || !t.title);
      if (invalidTasks.length > 0) {
        health.status = 'warning';
        health.issues.push(`${invalidTasks.length} invalid tasks found`);
      }

    } catch (error) {
      health.status = 'critical';
      health.issues.push('Store not accessible');
    }

    return health;
  }

  private async checkAPIHealth(): Promise<HealthCheck> {
    const health: HealthCheck = {
      component: 'API',
      status: 'healthy',
      issues: [],
      lastCheck: new Date()
    };

    // 检查API密钥
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      health.status = 'warning';
      health.issues.push('API key not configured');
    }

    return health;
  }

  // ========== 维护任务 ==========
  private async performMaintenance(): Promise<void> {
    // 清理旧日志
    const logs = loggerService.getLogs();
    if (logs.length > 5000) {
      loggerService.clearLogs();
      loggerService.info('Logs cleared due to size', { previousCount: logs.length }, 'AutoFixAgent');
    }

    // 清理修复历史
    const now = Date.now();
    this.fixHistory.forEach((date, id) => {
      if (now - date.getTime() > 24 * 60 * 60 * 1000) { // 24小时
        this.fixHistory.delete(id);
      }
    });
  }

  // ========== 定时执行 ==========
  startAutoFix(intervalHours = 1): void {
    if (this.checkInterval) {
      loggerService.warn('AutoFix already scheduled', {}, 'AutoFixAgent');
      return;
    }

    const intervalMs = intervalHours * 60 * 60 * 1000;

    // 立即执行一次
    this.analyzeAndFix();

    // 设置定时任务
    this.checkInterval = setInterval(() => {
      this.analyzeAndFix();
    }, intervalMs);

    loggerService.info(`AutoFix scheduled every ${intervalHours} hour(s)`, {}, 'AutoFixAgent');
  }

  stopAutoFix(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      loggerService.info('AutoFix stopped', {}, 'AutoFixAgent');
    }
  }

  // ========== 工具方法 ==========
  private hasRecentlyFixed(fixId: string): boolean {
    const lastFix = this.fixHistory.get(fixId);
    if (!lastFix) return false;

    // 24小时内不重复修复同一问题
    const hoursSinceLastFix = (Date.now() - lastFix.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastFix < 24;
  }

  private recordFix(fixId: string): void {
    this.fixHistory.set(fixId, new Date());
  }

  // 获取健康状态报告
  getHealthReport(): Map<string, HealthCheck> {
    return this.healthStatus;
  }

  // 手动触发特定组件的修复
  async fixComponent(component: string): Promise<AutoFixResult> {
    loggerService.info(`Manual fix requested for component: ${component}`, {}, 'AutoFixAgent');

    // 根据组件执行特定修复
    const health = this.healthStatus.get(component);
    if (!health || health.status === 'healthy') {
      return {
        success: false,
        fixApplied: `No fix needed for ${component}`,
        details: health
      };
    }

    // 执行组件特定的修复逻辑
    return this.applyGenericFix({
      issue: `${component} health issues`,
      component,
      suggestedAction: `Fix ${component} issues: ${health.issues.join(', ')}`
    });
  }
}

// 导出单例
export const autoFixAgent = new AutoFixAgent();