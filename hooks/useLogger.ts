// 日志Hook - 方便在React组件中使用日志系统

import { useEffect, useCallback, useRef } from 'react';
import { loggerService } from '../services/loggerService';
import { LogLevel, LogCategory } from '../types/logger';

interface UseLoggerOptions {
  component: string;
  trackPerformance?: boolean;
  trackUserActions?: boolean;
}

export const useLogger = (options: UseLoggerOptions) => {
  const { component, trackPerformance = false, trackUserActions = true } = options;
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // 性能追踪
  useEffect(() => {
    if (trackPerformance) {
      renderStartTime.current = performance.now();
      renderCount.current++;

      return () => {
        const renderTime = performance.now() - renderStartTime.current;

        if (renderTime > 16) { // 超过16ms视为慢渲染
          loggerService.log(
            LogLevel.WARNING,
            LogCategory.PERFORMANCE,
            `Slow render detected`,
            {
              component,
              renderTime,
              renderCount: renderCount.current
            },
            component
          );
        }
      };
    }
  });

  // 组件生命周期日志
  useEffect(() => {
    loggerService.log(
      LogLevel.DEBUG,
      LogCategory.UI_RENDER,
      `Component mounted`,
      { component },
      component
    );

    return () => {
      loggerService.log(
        LogLevel.DEBUG,
        LogCategory.UI_RENDER,
        `Component unmounted`,
        { component },
        component
      );
    };
  }, [component]);

  // 用户操作追踪
  const logUserAction = useCallback((action: string, details?: any) => {
    if (trackUserActions) {
      loggerService.log(
        LogLevel.INFO,
        LogCategory.USER_ACTION,
        action,
        details,
        component
      );
    }
  }, [component, trackUserActions]);

  // 状态变化追踪
  const logStateChange = useCallback((stateName: string, oldValue: any, newValue: any) => {
    loggerService.log(
      LogLevel.DEBUG,
      LogCategory.STATE_CHANGE,
      `State changed: ${stateName}`,
      {
        stateName,
        oldValue,
        newValue,
        component
      },
      component
    );
  }, [component]);

  // API调用追踪
  const logAPICall = useCallback(async (
    apiName: string,
    request: any,
    apiCall: () => Promise<any>
  ) => {
    const startTime = performance.now();
    const logId = loggerService.log(
      LogLevel.INFO,
      LogCategory.API_CALL,
      `API call started: ${apiName}`,
      { request },
      component
    );

    try {
      const response = await apiCall();
      const duration = performance.now() - startTime;

      loggerService.log(
        LogLevel.INFO,
        LogCategory.API_CALL,
        `API call completed: ${apiName}`,
        {
          request,
          response,
          duration,
          originalLogId: logId
        },
        component
      );

      if (duration > 1000) {
        loggerService.log(
          LogLevel.WARNING,
          LogCategory.PERFORMANCE,
          `Slow API call: ${apiName}`,
          {
            duration,
            apiName
          },
          component
        );
      }

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;

      loggerService.log(
        LogLevel.ERROR,
        LogCategory.API_CALL,
        `API call failed: ${apiName}`,
        {
          request,
          error: (error as Error).message,
          duration,
          originalLogId: logId
        },
        component
      );

      throw error;
    }
  }, [component]);

  // 错误处理
  const logError = useCallback((message: string, error?: Error, isCritical = false) => {
    const level = isCritical ? LogLevel.CRITICAL : LogLevel.ERROR;

    loggerService.log(
      level,
      LogCategory.ERROR_HANDLING,
      message,
      {
        error: error?.message,
        stack: error?.stack,
        component
      },
      component
    );
  }, [component]);

  // 性能标记
  const measurePerformance = useCallback((
    operationName: string,
    operation: () => any
  ) => {
    const startTime = performance.now();

    try {
      const result = operation();
      const duration = performance.now() - startTime;

      if (duration > 100) {
        loggerService.log(
          LogLevel.WARNING,
          LogCategory.PERFORMANCE,
          `Slow operation: ${operationName}`,
          {
            duration,
            component
          },
          component
        );
      }

      return result;
    } catch (error) {
      logError(`Operation failed: ${operationName}`, error as Error);
      throw error;
    }
  }, [component, logError]);

  return {
    logUserAction,
    logStateChange,
    logAPICall,
    logError,
    measurePerformance,
    // 直接暴露日志方法
    debug: (message: string, details?: any) =>
      loggerService.debug(message, details, component),
    info: (message: string, details?: any) =>
      loggerService.info(message, details, component),
    warn: (message: string, details?: any) =>
      loggerService.warn(message, details, component),
    error: (message: string, error?: Error) =>
      loggerService.error(message, error, component),
  };
};