# GitHub 自动推送脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   GitHub 自动推送脚本" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 函数：生成默认的提交信息
function Get-DefaultCommitMessage {
    $changes = git diff --name-only --cached
    $fileCount = ($changes | Measure-Object).Count

    if ($fileCount -eq 0) {
        $changes = git diff --name-only
        $fileCount = ($changes | Measure-Object).Count
    }

    $date = Get-Date -Format "yyyy-MM-dd HH:mm"

    if ($fileCount -eq 1) {
        $fileName = Split-Path $changes -Leaf
        return "chore: 更新 $fileName - $date"
    } elseif ($fileCount -gt 1) {
        return "chore: 更新 $fileCount 个文件 - $date"
    } else {
        return "chore: 自动提交 - $date"
    }
}

# 1. 检查 Git 状态
Write-Host "1. 检查当前 Git 状态..." -ForegroundColor Green
$status = git status --porcelain

if ($status.Count -eq 0) {
    Write-Host "   没有需要提交的变更" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   是否仍要推送到远程仓库？(y/n): " -NoNewline -ForegroundColor Cyan
    $push = Read-Host

    if ($push -eq 'y' -or $push -eq 'Y') {
        Write-Host ""
        Write-Host "2. 推送到 GitHub..." -ForegroundColor Green
        git push origin main

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "   ✓ 推送成功！" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "   ✗ 推送失败" -ForegroundColor Red
            Write-Host "========================================" -ForegroundColor Cyan
        }
    }
    exit
}

# 显示变更文件列表
Write-Host ""
Write-Host "   变更的文件：" -ForegroundColor Yellow
git status --short
Write-Host ""

# 2. 添加所有变更
Write-Host "2. 添加所有变更到暂存区..." -ForegroundColor Green
git add -A
Write-Host ""

# 3. 获取提交信息
$defaultMsg = Get-DefaultCommitMessage
Write-Host "3. 输入提交信息 (按回车使用默认: $defaultMsg):" -ForegroundColor Green
Write-Host "   提交信息: " -NoNewline -ForegroundColor Cyan
$commitMsg = Read-Host

if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = $defaultMsg
}

Write-Host ""

# 4. 提交代码
Write-Host "4. 提交代码..." -ForegroundColor Green
git commit -m "$commitMsg`n`nGenerated with [Claude Code](https://claude.ai/code)`nvia [Happy](https://happy.engineering)`n`nCo-Authored-By: Claude <noreply@anthropic.com>`nCo-Authored-By: Happy <yesreply@happy.engineering>"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   ✗ 提交失败" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    exit
}

Write-Host ""

# 5. 推送到 GitHub
Write-Host "5. 推送到 GitHub..." -ForegroundColor Green
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ 推送成功！" -ForegroundColor Green

    # 显示最新的提交信息
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "最新提交：" -ForegroundColor Yellow
    git log -1 --pretty=format:"%h - %s (%cr)" --abbrev-commit
} else {
    Write-Host "   ✗ 推送失败，请检查网络连接或仓库配置" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "可能的解决方案：" -ForegroundColor Yellow
    Write-Host "  1. 检查网络连接" -ForegroundColor White
    Write-Host "  2. 运行 'git pull origin main' 拉取远程更改" -ForegroundColor White
    Write-Host "  3. 检查 GitHub 认证配置" -ForegroundColor White
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 暂停以查看输出
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")