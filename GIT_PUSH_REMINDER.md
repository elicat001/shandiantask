# 🚀 Git 自动推送指南

## 重要提醒 ⚠️
**每次代码更新后，请记得推送到 GitHub！**

## 快速推送方法

### 方法 1: 使用批处理文件（推荐）
```bash
# 使用默认提交消息
auto-push

# 使用自定义提交消息
auto-push "feat: 添加新功能"
```

### 方法 2: 使用 PowerShell 脚本
```powershell
# 使用默认提交消息
.\scripts\auto-push.ps1

# 使用自定义提交消息
.\scripts\auto-push.ps1 -CommitMessage "fix: 修复bug"
```

### 方法 3: 手动推送
```bash
git add -A
git commit -m "你的提交消息"
git push origin main
```

## 自动推送工作流程

1. **添加所有更改** - `git add -A`
2. **提交更改** - `git commit -m "消息"`
3. **推送到 GitHub** - `git push origin main`

## 提交消息规范

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 其他杂项

## 使用提示

1. **定期推送**: 完成一个功能模块后立即推送
2. **清晰的提交消息**: 使用中文或英文描述具体更改
3. **检查状态**: 推送前使用 `git status` 查看更改

## 常见问题

### 推送失败？
- 检查网络连接
- 确认 GitHub 账号权限
- 执行 `git pull origin main` 同步远程更改

### 忘记推送？
运行 `auto-push` 立即推送所有未提交的更改！

---

💡 **提示**: 将 `auto-push.bat` 添加到任务栏，一键推送更方便！