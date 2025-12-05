@echo off
echo ========================================
echo 后台自动推送脚本
echo 当网络恢复时会自动推送到 GitHub
echo ========================================

:loop
echo.
echo [%date% %time%] 尝试推送...
git push origin main 2>nul

if %errorlevel% == 0 (
    echo [%date% %time%] 推送成功！
    echo.
    echo 最新提交记录：
    git log --oneline -3
    echo.
    echo 推送完成，脚本退出。
    pause
    exit /b 0
) else (
    echo [%date% %time%] 推送失败，30秒后重试...
    timeout /t 30 /nobreak >nul
    goto loop
)