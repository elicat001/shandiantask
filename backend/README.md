# Shandian Task 后端服务

这是 Shandian Task 应用的后端API服务，使用 Node.js + Express + Prisma + SQLite 构建。

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js 5.x
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma 5.x
- **认证**: JWT (jsonwebtoken)
- **语言**: TypeScript
- **密码加密**: bcryptjs

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

创建 `.env` 文件（可以复制 `.env.example`）：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT配置
JWT_SECRET="your-secret-key-change-this"
JWT_EXPIRES_IN="7d"
JWT_COOKIE_EXPIRES_IN="7"

# 密码加密
BCRYPT_ROUNDS="10"

# 服务器配置
PORT="5000"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 查看数据库（可选）
npx prisma studio
```

### 4. 启动服务器

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm run build
npm start
```

服务器将在 `http://localhost:5000` 启动

## API 端点

### 认证相关

#### 注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "name": "用户名称" // 可选
}
```

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "user@example.com",
  "password": "password123"
}
```

#### 登出
```http
POST /api/auth/logout
```

#### 获取当前用户
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### 更新个人信息
```http
PATCH /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新名称",
  "avatar": "头像URL"
}
```

#### 修改密码
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "旧密码",
  "newPassword": "新密码"
}
```

### 任务相关

#### 获取任务列表
```http
GET /api/tasks
Authorization: Bearer <token>

查询参数：
- listId: 列表ID（可选）
- completed: true/false（可选）
- priority: none/low/medium/high（可选）
```

#### 创建任务
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "任务标题",
  "description": "任务描述",
  "listId": "列表ID", // 可选，默认收件箱
  "dueDate": "2024-01-01T00:00:00Z", // 可选
  "priority": "high", // 可选：none/low/medium/high
  "tags": ["标签1", "标签2"] // 可选
}
```

#### 更新任务
```http
PATCH /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新标题",
  "completed": true,
  "priority": "medium"
}
```

#### 删除任务
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

#### 批量更新任务
```http
POST /api/tasks/batch-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": ["id1", "id2"],
  "data": {
    "completed": true
  }
}
```

#### 批量删除任务
```http
POST /api/tasks/batch-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": ["id1", "id2"]
}
```

### 任务列表相关

#### 获取列表
```http
GET /api/lists
Authorization: Bearer <token>
```

#### 创建列表
```http
POST /api/lists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "列表名称",
  "color": "#FF0000",
  "icon": "📁"
}
```

#### 更新列表
```http
PATCH /api/lists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新名称",
  "color": "#00FF00"
}
```

#### 删除列表
```http
DELETE /api/lists/:id
Authorization: Bearer <token>
```

## 数据模型

### User（用户）
- id: 唯一标识
- email: 邮箱（唯一）
- username: 用户名（唯一）
- password: 密码（加密）
- name: 显示名称
- avatar: 头像URL
- emailVerified: 邮箱验证状态
- createdAt: 创建时间
- updatedAt: 更新时间
- lastLogin: 最后登录时间

### Task（任务）
- id: 唯一标识
- title: 标题
- description: 描述
- completed: 完成状态
- completedAt: 完成时间
- dueDate: 截止日期
- priority: 优先级（none/low/medium/high）
- order: 排序顺序
- userId: 用户ID
- listId: 列表ID
- tags: 标签数组
- subtasks: 子任务数组

### List（列表）
- id: 唯一标识
- name: 名称
- color: 颜色
- icon: 图标
- isDefault: 是否默认列表
- order: 排序顺序
- userId: 用户ID

## 错误处理

所有错误响应格式：

```json
{
  "success": false,
  "error": "错误信息",
  "stack": "调试栈信息（仅开发环境）",
  "details": {
    "statusCode": 400,
    "isOperational": true
  }
}
```

常见错误码：
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误

## 认证机制

1. **注册/登录**: 成功后返回 JWT token
2. **Token 使用**:
   - 可以通过 HTTP Header: `Authorization: Bearer <token>`
   - 或者通过 Cookie: `auth_token`
3. **Token 过期**: 默认 7 天，可通过环境变量配置

## 开发指南

### 项目结构

```
backend/
├── src/
│   ├── controllers/    # 控制器
│   ├── routes/         # 路由定义
│   ├── middleware/     # 中间件
│   ├── utils/          # 工具函数
│   ├── config/         # 配置文件
│   └── index.ts        # 入口文件
├── prisma/
│   ├── schema.prisma   # 数据模型
│   └── migrations/     # 数据库迁移
├── dist/              # 编译输出
├── package.json
├── tsconfig.json
└── .env
```

### 添加新功能

1. 在 `prisma/schema.prisma` 定义数据模型
2. 运行 `npx prisma migrate dev` 创建迁移
3. 在 `src/controllers` 创建控制器
4. 在 `src/routes` 创建路由
5. 在 `src/routes/index.ts` 注册路由

### 常用命令

```bash
# 查看数据库
npx prisma studio

# 重置数据库
npx prisma migrate reset

# 生成种子数据
npm run seed

# 类型检查
npx tsc --noEmit

# 格式化代码
npx prettier --write .
```

## 部署

### 环境变量配置

生产环境需要设置：
- `NODE_ENV=production`
- `DATABASE_URL`: PostgreSQL 连接字符串
- `JWT_SECRET`: 强随机密钥
- `FRONTEND_URL`: 前端部署地址

### 构建步骤

```bash
# 安装依赖
npm ci --only=production

# 构建 TypeScript
npm run build

# 运行迁移
npx prisma migrate deploy

# 启动服务
npm start
```

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

## 安全建议

1. **环境变量**: 不要提交 `.env` 文件到版本控制
2. **JWT Secret**: 使用强随机字符串
3. **CORS**: 配置允许的域名
4. **Rate Limiting**: 添加请求限制（推荐使用 express-rate-limit）
5. **输入验证**: 使用 joi 或 zod 进行参数验证
6. **SQL注入**: Prisma 自动防护
7. **HTTPS**: 生产环境使用 HTTPS

## 故障排查

### 数据库连接失败
- 检查 DATABASE_URL 配置
- 确保数据库文件有写入权限
- 运行 `npx prisma generate`

### JWT 验证失败
- 检查 token 是否过期
- 确保 JWT_SECRET 一致
- 验证 token 格式

### 中文乱码
- 确保数据库使用 UTF-8 编码
- 请求头包含 `Content-Type: application/json`

## 联系支持

如有问题，请提交 Issue 或联系开发团队。

## License

MIT