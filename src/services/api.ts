// API配置和请求封装

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 请求配置类型
interface RequestConfig extends RequestInit {
  token?: string;
}

// API响应类型
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

// 基础请求函数
async function request<T>(
  endpoint: string,
  options: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options;

  // 从localStorage获取token
  const authToken = token || localStorage.getItem('auth_token');

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...fetchOptions.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

// 认证相关API
export const authApi = {
  // 注册
  register: async (data: {
    email: string;
    username: string;
    password: string;
    name?: string;
  }) => {
    const response = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // 保存token
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }

    return response;
  },

  // 登录
  login: async (data: {
    emailOrUsername: string;
    password: string;
  }) => {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // 保存token
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }

    return response;
  },

  // 登出
  logout: async () => {
    const response = await request('/auth/logout', {
      method: 'POST',
    });

    // 清除token
    localStorage.removeItem('auth_token');

    return response;
  },

  // 获取当前用户信息
  getMe: async () => {
    return request('/auth/me');
  },

  // 更新个人信息
  updateProfile: async (data: {
    name?: string;
    avatar?: string;
  }) => {
    return request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 修改密码
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 任务相关API
export const taskApi = {
  // 获取任务列表
  getTasks: async (params?: {
    listId?: string;
    completed?: boolean;
    priority?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    const endpoint = `/tasks${queryParams ? `?${queryParams}` : ''}`;
    return request(endpoint);
  },

  // 创建任务
  createTask: async (data: {
    title: string;
    description?: string;
    listId?: string;
    dueDate?: Date | null;
    priority?: string;
    tags?: string[];
  }) => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新任务
  updateTask: async (id: string, data: Partial<{
    title: string;
    description: string;
    completed: boolean;
    dueDate: Date | null;
    priority: string;
    listId: string;
  }>) => {
    return request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 删除任务
  deleteTask: async (id: string) => {
    return request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // 批量更新任务
  batchUpdateTasks: async (ids: string[], data: any) => {
    return request('/tasks/batch-update', {
      method: 'POST',
      body: JSON.stringify({ ids, data }),
    });
  },

  // 批量删除任务
  batchDeleteTasks: async (ids: string[]) => {
    return request('/tasks/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
};

// 列表相关API
export const listApi = {
  // 获取所有列表
  getLists: async () => {
    return request('/lists');
  },

  // 创建列表
  createList: async (data: {
    name: string;
    color?: string;
    icon?: string;
  }) => {
    return request('/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新列表
  updateList: async (id: string, data: Partial<{
    name: string;
    color: string;
    icon: string;
  }>) => {
    return request(`/lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 删除列表
  deleteList: async (id: string) => {
    return request(`/lists/${id}`, {
      method: 'DELETE',
    });
  },
};

// 导出所有API
export const api = {
  auth: authApi,
  task: taskApi,
  list: listApi,
};

export default api;