# PowerShell 脚本 - 自动提交并推送到 GitHub
param(
    [string]$CommitMessage = "自动更新: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

# 颜色输出函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "========================================="
Write-ColorOutput Cyan "开始自动推送到 GitHub..."
Write-ColorOutput Green "========================================="

# 检查是否在 Git 仓库中
if (!(Test-Path .git)) {
    Write-ColorOutput Red "错误: 当前目录不是 Git 仓库"
    exit 1
}

# 添加所有更改
Write-ColorOutput Yellow "`n📝 添加所有更改..."
git add -A

# 检查是否有更改
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-ColorOutput Cyan "✅ 没有需要提交的更改"
    exit 0
}

# 显示将要提交的更改
Write-ColorOutput Yellow "`n📋 将要提交的更改:"
git status --short

# 提交更改
Write-ColorOutput Yellow "`n💾 提交更改..."
git commit -m "$CommitMessage"

# 推送到远程仓库
Write-ColorOutput Yellow "`n🚀 推送到 GitHub..."
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput Green "`n✅ 成功推送到 GitHub!"
    Write-ColorOutput Cyan "提交消息: $CommitMessage"
    Write-ColorOutput Green "========================================="
} else {
    Write-ColorOutput Red "`n❌ 推送失败，请检查网络连接或仓库权限"
    exit 1
}