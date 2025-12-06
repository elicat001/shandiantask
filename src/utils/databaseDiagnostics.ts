import { supabase } from '../lib/supabase';
import { supabaseApi } from '../services/supabaseApi';

// 数据库诊断工具
export const databaseDiagnostics = {
  // 运行完整诊断
  async runFullDiagnosis() {
    console.log('🔍 开始数据库诊断...');
    const results: any = {};

    // 1. 检查 Supabase 连接
    results.connection = await this.checkConnection();

    // 2. 检查认证状态
    results.auth = await this.checkAuth();

    // 3. 检查表结构
    results.tables = await this.checkTables();

    // 4. 检查数据访问
    results.dataAccess = await this.checkDataAccess();

    // 5. 检查 RLS 策略
    results.rls = await this.checkRLS();

    // 输出诊断报告
    this.printReport(results);

    return results;
  },

  // 检查基础连接
  async checkConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('❌ 连接失败:', error);
        return { status: 'failed', error: error.message };
      }

      console.log('✅ Supabase 连接正常');
      return { status: 'connected' };
    } catch (err: any) {
      console.error('❌ 连接异常:', err);
      return { status: 'error', error: err.message };
    }
  },

  // 检查认证状态
  async checkAuth() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('❌ 认证检查失败:', error);
        return { status: 'failed', error: error.message };
      }

      if (!user) {
        console.log('⚠️ 用户未登录');
        return { status: 'not_authenticated' };
      }

      console.log('✅ 用户已认证:', user.email);
      return { status: 'authenticated', userId: user.id, email: user.email };
    } catch (err: any) {
      console.error('❌ 认证异常:', err);
      return { status: 'error', error: err.message };
    }
  },

  // 检查表是否存在
  async checkTables() {
    const tables = ['users', 'tasks', 'lists', 'notes'];
    const results: any = {};

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        if (error) {
          console.error(`❌ 表 ${table} 访问失败:`, error.message);
          results[table] = { exists: false, error: error.message };
        } else {
          console.log(`✅ 表 ${table} 存在`);
          results[table] = { exists: true };
        }
      } catch (err: any) {
        console.error(`❌ 表 ${table} 异常:`, err);
        results[table] = { exists: false, error: err.message };
      }
    }

    return results;
  },

  // 检查数据访问权限
  async checkDataAccess() {
    const results: any = {};

    try {
      // 尝试获取任务列表
      const tasksResult = await supabaseApi.tasks.getAll();
      if (tasksResult.success) {
        console.log(`✅ 可以访问任务数据 (${tasksResult.data?.length || 0} 条)`);
        results.tasks = { access: true, count: tasksResult.data?.length || 0 };
      } else {
        console.error('❌ 无法访问任务数据:', tasksResult.error);
        results.tasks = { access: false, error: tasksResult.error };
      }

      // 尝试获取列表
      const listsResult = await supabaseApi.lists.getAll();
      if (listsResult.success) {
        console.log(`✅ 可以访问列表数据 (${listsResult.data?.length || 0} 条)`);
        results.lists = { access: true, count: listsResult.data?.length || 0 };
      } else {
        console.error('❌ 无法访问列表数据:', listsResult.error);
        results.lists = { access: false, error: listsResult.error };
      }

      // 尝试获取笔记
      const notesResult = await supabaseApi.notes.getAll();
      if (notesResult.success) {
        console.log(`✅ 可以访问笔记数据 (${notesResult.data?.length || 0} 条)`);
        results.notes = { access: true, count: notesResult.data?.length || 0 };
      } else {
        console.error('❌ 无法访问笔记数据:', notesResult.error);
        results.notes = { access: false, error: notesResult.error };
      }
    } catch (err: any) {
      console.error('❌ 数据访问异常:', err);
      results.error = err.message;
    }

    return results;
  },

  // 检查 RLS 策略
  async checkRLS() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { status: 'no_user' };
      }

      // 尝试直接查询看是否有 RLS 限制
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, user_id')
        .limit(5);

      if (tasksError) {
        console.error('❌ RLS 检查失败:', tasksError);
        return { status: 'error', error: tasksError.message };
      }

      // 检查返回的数据是否都属于当前用户
      const allBelongToUser = tasks?.every(task => task.user_id === user.id) ?? true;

      if (allBelongToUser) {
        console.log('✅ RLS 策略正常工作');
        return { status: 'working', userIsolation: true };
      } else {
        console.warn('⚠️ RLS 可能未正确配置');
        return { status: 'warning', userIsolation: false };
      }
    } catch (err: any) {
      console.error('❌ RLS 检查异常:', err);
      return { status: 'error', error: err.message };
    }
  },

  // 打印诊断报告
  printReport(results: any) {
    console.log('\n' + '='.repeat(50));
    console.log('📊 数据库诊断报告');
    console.log('='.repeat(50));

    // 连接状态
    console.log('\n🔌 连接状态:',
      results.connection.status === 'connected' ? '✅ 正常' : '❌ 异常');

    // 认证状态
    console.log('🔐 认证状态:',
      results.auth.status === 'authenticated'
        ? `✅ 已认证 (${results.auth.email})`
        : '❌ 未认证');

    // 表状态
    console.log('\n📋 表状态:');
    for (const [table, info] of Object.entries(results.tables)) {
      console.log(`  - ${table}: ${info.exists ? '✅ 存在' : '❌ 不存在'}`);
    }

    // 数据访问
    console.log('\n🔓 数据访问:');
    if (results.dataAccess.tasks) {
      console.log(`  - 任务: ${results.dataAccess.tasks.access
        ? `✅ 可访问 (${results.dataAccess.tasks.count} 条)`
        : '❌ 无法访问'}`);
    }
    if (results.dataAccess.lists) {
      console.log(`  - 列表: ${results.dataAccess.lists.access
        ? `✅ 可访问 (${results.dataAccess.lists.count} 条)`
        : '❌ 无法访问'}`);
    }
    if (results.dataAccess.notes) {
      console.log(`  - 笔记: ${results.dataAccess.notes.access
        ? `✅ 可访问 (${results.dataAccess.notes.count} 条)`
        : '❌ 无法访问'}`);
    }

    // RLS 状态
    console.log('\n🛡️ RLS 状态:',
      results.rls.status === 'working'
        ? '✅ 正常'
        : results.rls.status === 'warning'
        ? '⚠️ 可能有问题'
        : '❌ 异常');

    console.log('\n' + '='.repeat(50));

    // 问题总结
    const problems = this.identifyProblems(results);
    if (problems.length > 0) {
      console.log('\n⚠️ 发现的问题:');
      problems.forEach((problem, index) => {
        console.log(`${index + 1}. ${problem}`);
      });

      // 提供解决方案
      console.log('\n💡 建议的解决方案:');
      this.provideSolutions(problems);
    } else {
      console.log('\n✅ 数据库运行正常！');
    }
  },

  // 识别问题
  identifyProblems(results: any): string[] {
    const problems = [];

    if (results.connection.status !== 'connected') {
      problems.push('无法连接到 Supabase');
    }

    if (results.auth.status !== 'authenticated') {
      problems.push('用户未认证');
    }

    // 检查表
    for (const [table, info] of Object.entries(results.tables)) {
      if (!info.exists) {
        problems.push(`表 ${table} 不存在或无法访问`);
      }
    }

    // 检查数据访问
    if (results.dataAccess.tasks && !results.dataAccess.tasks.access) {
      problems.push('无法访问任务数据');
    }
    if (results.dataAccess.lists && !results.dataAccess.lists.access) {
      problems.push('无法访问列表数据');
    }
    if (results.dataAccess.notes && !results.dataAccess.notes.access) {
      problems.push('无法访问笔记数据');
    }

    if (results.rls.status === 'warning' || results.rls.status === 'error') {
      problems.push('RLS 策略可能未正确配置');
    }

    return problems;
  },

  // 提供解决方案
  provideSolutions(problems: string[]) {
    for (const problem of problems) {
      if (problem.includes('无法连接')) {
        console.log('  • 检查环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
        console.log('  • 确保 Supabase 项目正在运行');
        console.log('  • 检查网络连接');
      }

      if (problem.includes('未认证')) {
        console.log('  • 请先登录账号');
        console.log('  • 检查认证 token 是否过期');
      }

      if (problem.includes('表') && problem.includes('不存在')) {
        console.log('  • 在 Supabase 控制台执行迁移脚本');
        console.log('  • 检查表名是否正确');
        console.log('  • 确认数据库权限');
      }

      if (problem.includes('无法访问') && problem.includes('数据')) {
        console.log('  • 检查 RLS 策略是否正确配置');
        console.log('  • 确认用户有访问权限');
        console.log('  • 检查表中是否有数据');
      }

      if (problem.includes('RLS')) {
        console.log('  • 检查表的 RLS 策略');
        console.log('  • 确保策略包含 auth.uid() = user_id 条件');
        console.log('  • 在 Supabase 控制台验证策略');
      }
    }
  }
};

// 导出到全局以便在控制台调用
if (typeof window !== 'undefined') {
  (window as any).dbDiag = databaseDiagnostics;
  console.log('💡 数据库诊断工具已加载！');
  console.log('   在控制台输入 dbDiag.runFullDiagnosis() 运行完整诊断');
}