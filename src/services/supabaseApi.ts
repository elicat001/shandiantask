import { supabase } from '../lib/supabase';

// Supabase API 服务层
export const supabaseApi = {
  // ==================== 认证相关 ====================
  auth: {
    // 注册新用户
    async signUp(email: string, password: string, username: string, name?: string) {
      try {
        // 1. 使用 Supabase Auth 注册用户（跳过邮箱确认）
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              name,
            },
            emailRedirectTo: undefined, // 不发送确认邮件
          },
        });

        if (authError) throw authError;

        // 2. 注册成功后自动登录
        if (authData.user && !authData.session) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError && signInData) {
            authData.session = signInData.session;
          }
        }

        // 3. 在 users 表中创建用户记录
        if (authData.user) {
          const { error: dbError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email,
              username,
              name,
            });

          if (dbError) {
            console.error('创建用户记录失败:', dbError);
          }

          // 4. 创建默认列表
          await this.createDefaultLists(authData.user.id);
        }

        return { success: true, data: authData };
      } catch (error) {
        console.error('注册失败:', error);
        return { success: false, error };
      }
    },

    // 登录
    async signIn(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        return { success: true, data };
      } catch (error) {
        console.error('登录失败:', error);
        return { success: false, error };
      }
    },

    // 登出
    async signOut() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error('登出失败:', error);
        return { success: false, error };
      }
    },

    // 获取当前用户
    async getCurrentUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;
        if (!user) return { success: false, error: '未登录' };

        // 获取用户详细信息
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (dbError) throw dbError;

        return { success: true, data: { ...user, ...userData } };
      } catch (error) {
        console.error('获取用户失败:', error);
        return { success: false, error };
      }
    },

    // 更新用户信息
    async updateProfile(updates: { name?: string; avatar_url?: string }) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('未登录');

        const { data, error } = await supabase
          .from('users')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;

        return { success: true, data };
      } catch (error) {
        console.error('更新用户信息失败:', error);
        return { success: false, error };
      }
    },

    // 创建默认列表
    async createDefaultLists(userId: string) {
      const defaultLists = [
        { name: '收件箱', is_default: true, order_index: 0, user_id: userId },
        { name: '工作', is_default: false, order_index: 1, user_id: userId },
        { name: '个人', is_default: false, order_index: 2, user_id: userId },
      ];

      await supabase.from('lists').insert(defaultLists);
    },
  },

  // ==================== 任务相关 ====================
  tasks: {
    // 获取所有任务
    async getAll(filters?: {
      listId?: string;
      completed?: boolean;
      search?: string;
    }) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('未登录');

        let query = supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('order_index', { ascending: true });

        // 应用过滤器
        if (filters?.listId) {
          query = query.eq('list_id', filters.listId);
        }
        if (filters?.completed !== undefined) {
          query = query.eq('completed', filters.completed);
        }
        if (filters?.search) {
          query = query.ilike('title', `%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // 转换数据格式：下划线转驼峰
        const formattedData = data?.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed,
          completedAt: task.completed_at,
          dueDate: task.due_date,
          priority: task.priority,
          orderIndex: task.order_index,
          userId: task.user_id,
          listId: task.list_id,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          subtasks: [],
          tags: [],
        }));

        return { success: true, data: formattedData };
      } catch (error) {
        console.error('获取任务失败:', error);
        return { success: false, error };
      }
    },

    // 创建任务
    async create(task: {
      title: string;
      description?: string;
      listId?: string;
      dueDate?: Date;
      priority?: 'none' | 'low' | 'medium' | 'high';
    }) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('未登录');

        // 如果没有指定列表，使用默认列表
        let listId = task.listId;
        if (!listId) {
          const { data: defaultList } = await supabase
            .from('lists')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .single();

          listId = defaultList?.id;
        }

        // 获取最大 order_index
        const { data: maxOrderData } = await supabase
          .from('tasks')
          .select('order_index')
          .eq('user_id', user.id)
          .order('order_index', { ascending: false })
          .limit(1);

        const maxOrder = maxOrderData?.[0]?.order_index ?? -1;

        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title: task.title,
            description: task.description,
            list_id: listId,
            due_date: task.dueDate,
            user_id: user.id,
            order_index: maxOrder + 1,
            priority: task.priority || 'none',
          })
          .select()
          .single();

        if (error) throw error;

        // 转换返回的数据格式
        const formattedData = {
          id: data.id,
          title: data.title,
          description: data.description,
          completed: data.completed,
          completedAt: data.completed_at,
          dueDate: data.due_date,
          priority: data.priority,
          orderIndex: data.order_index,
          userId: data.user_id,
          listId: data.list_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          subtasks: [],
          tags: [],
        };

        return { success: true, data: formattedData };
      } catch (error) {
        console.error('创建任务失败:', error);
        return { success: false, error };
      }
    },

    // 更新任务
    async update(id: string, updates: Partial<{
      title: string;
      description: string;
      completed: boolean;
      due_date: Date;
      priority: 'none' | 'low' | 'medium' | 'high';
      list_id: string;
    }>) {
      try {
        const updateData: any = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        // 如果标记为完成，添加完成时间
        if (updates.completed === true) {
          updateData.completed_at = new Date().toISOString();
        } else if (updates.completed === false) {
          updateData.completed_at = null;
        }

        const { data, error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return { success: true, data };
      } catch (error) {
        console.error('更新任务失败:', error);
        return { success: false, error };
      }
    },

    // 删除任务
    async delete(id: string) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error('删除任务失败:', error);
        return { success: false, error };
      }
    },

    // 批量更新任务顺序
    async reorder(taskIds: string[], newOrders: number[]) {
      try {
        const updates = taskIds.map((id, index) => ({
          id,
          order_index: newOrders[index],
          updated_at: new Date().toISOString(),
        }));

        // Supabase 批量更新
        const promises = updates.map(update =>
          supabase
            .from('tasks')
            .update({
              order_index: update.order_index,
              updated_at: update.updated_at,
            })
            .eq('id', update.id)
        );

        await Promise.all(promises);

        return { success: true };
      } catch (error) {
        console.error('重新排序失败:', error);
        return { success: false, error };
      }
    },
  },

  // ==================== 列表相关 ====================
  lists: {
    // 获取所有列表
    async getAll() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('未登录');

        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', user.id)
          .order('order_index', { ascending: true });

        if (error) throw error;

        // 转换数据格式：下划线转驼峰
        const formattedData = data?.map(list => ({
          id: list.id,
          name: list.name,
          color: list.color,
          icon: list.icon,
          isDefault: list.is_default,
          orderIndex: list.order_index,
          userId: list.user_id,
          createdAt: list.created_at,
          updatedAt: list.updated_at,
        }));

        return { success: true, data: formattedData };
      } catch (error) {
        console.error('获取列表失败:', error);
        return { success: false, error };
      }
    },

    // 创建列表
    async create(list: {
      name: string;
      color?: string;
      icon?: string;
    }) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('未登录');

        // 获取最大 order_index
        const { data: maxOrderData } = await supabase
          .from('lists')
          .select('order_index')
          .eq('user_id', user.id)
          .order('order_index', { ascending: false })
          .limit(1);

        const maxOrder = maxOrderData?.[0]?.order_index ?? -1;

        const { data, error } = await supabase
          .from('lists')
          .insert({
            ...list,
            user_id: user.id,
            order_index: maxOrder + 1,
            is_default: false,
          })
          .select()
          .single();

        if (error) throw error;

        return { success: true, data };
      } catch (error) {
        console.error('创建列表失败:', error);
        return { success: false, error };
      }
    },

    // 更新列表
    async update(id: string, updates: Partial<{
      name: string;
      color: string;
      icon: string;
    }>) {
      try {
        const { data, error } = await supabase
          .from('lists')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return { success: true, data };
      } catch (error) {
        console.error('更新列表失败:', error);
        return { success: false, error };
      }
    },

    // 删除列表
    async delete(id: string) {
      try {
        // 检查是否为默认列表
        const { data: listData } = await supabase
          .from('lists')
          .select('is_default')
          .eq('id', id)
          .single();

        if (listData?.is_default) {
          throw new Error('不能删除默认列表');
        }

        const { error } = await supabase
          .from('lists')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error('删除列表失败:', error);
        return { success: false, error };
      }
    },
  },

  // ==================== 笔记相关 ====================
  notes: {
    // 获取所有笔记
    async getAll(filters?: {
      category?: string;
      pinned?: boolean;
      archived?: boolean;
      search?: string;
    }) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('未登录');

        let query = supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false });

        // 应用过滤器
        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        if (filters?.pinned !== undefined) {
          query = query.eq('pinned', filters.pinned);
        }
        if (filters?.archived !== undefined) {
          query = query.eq('archived', filters.archived);
        }
        if (filters?.search) {
          query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
      } catch (error) {
        console.error('获取笔记失败:', error);
        return { success: false, error };
      }
    },

    // 创建笔记
    async create(note: {
      title: string;
      content: string;
      category?: string;
    }) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('未登录');

        const { data, error } = await supabase
          .from('notes')
          .insert({
            ...note,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        return { success: true, data };
      } catch (error) {
        console.error('创建笔记失败:', error);
        return { success: false, error };
      }
    },

    // 更新笔记
    async update(id: string, updates: Partial<{
      title: string;
      content: string;
      category: string;
      pinned: boolean;
      archived: boolean;
    }>) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return { success: true, data };
      } catch (error) {
        console.error('更新笔记失败:', error);
        return { success: false, error };
      }
    },

    // 删除笔记
    async delete(id: string) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error('删除笔记失败:', error);
        return { success: false, error };
      }
    },
  },

  // ==================== 实时订阅 ====================
  realtime: {
    // 订阅任务变化
    subscribeToTasks(callback: (payload: any) => void) {
      return supabase
        .channel('tasks')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          callback
        )
        .subscribe();
    },

    // 订阅列表变化
    subscribeToLists(callback: (payload: any) => void) {
      return supabase
        .channel('lists')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'lists' },
          callback
        )
        .subscribe();
    },

    // 取消订阅
    unsubscribe(subscription: any) {
      supabase.removeChannel(subscription);
    },
  },
};

export default supabaseApi;