# PowerShell 脚本自动重试 Git 推送
$maxRetries = 10
$retryDelay = 5
$attempt = 0
$success = $false

Write-Host "开始尝试推送到 GitHub..." -ForegroundColor Yellow

while (-not $success -and $attempt -lt $maxRetries) {
    $attempt++
    Write-Host "`n尝试 $attempt/$maxRetries..." -ForegroundColor Cyan

    try {
        git push origin main 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "推送成功！" -ForegroundColor Green
        } else {
            throw "Push failed"
        }
    } catch {
        Write-Host "推送失败，等待 $retryDelay 秒后重试..." -ForegroundColor Red
        Start-Sleep -Seconds $retryDelay
    }
}

if (-not $success) {
    Write-Host "`n所有尝试都失败了。请检查网络连接。" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n代码已成功推送到 GitHub！" -ForegroundColor Green
    git log --oneline -5
}