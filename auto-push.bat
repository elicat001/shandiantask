@echo off
echo =========================================
echo     自动推送到 GitHub
echo =========================================
echo.

REM 检查是否提供了提交消息
if "%~1"=="" (
    set COMMIT_MSG=自动更新: %date% %time%
) else (
    set COMMIT_MSG=%*
)

REM 显示当前状态
echo 📊 当前 Git 状态:
git status --short
echo.

REM 添加所有更改
echo 📝 添加所有更改...
git add -A
echo.

REM 提交更改
echo 💾 提交更改...
git commit -m "%COMMIT_MSG%"
echo.

REM 推送到远程
echo 🚀 推送到 GitHub...
git push origin main

if %errorlevel% == 0 (
    echo.
    echo ✅ 成功推送到 GitHub!
    echo 提交消息: %COMMIT_MSG%
) else (
    echo.
    echo ❌ 推送失败，请检查网络连接或仓库权限
)

echo =========================================
pause