@echo off
echo ========================================
echo   GitHub 自动推送脚本
echo ========================================
echo.

:: 显示当前状态
echo 1. 检查当前 Git 状态...
git status

echo.
echo 2. 添加所有变更到暂存区...
git add -A

echo.
echo 3. 输入提交信息（按回车使用默认信息）：
set /p commit_msg="提交信息: "
if "%commit_msg%"=="" set commit_msg=chore: 自动提交代码变更

echo.
echo 4. 提交代码...
git commit -m "%commit_msg%"

echo.
echo 5. 推送到 GitHub...
git push origin main

echo.
echo ========================================
if %errorlevel% == 0 (
    echo   ✓ 推送成功！
) else (
    echo   ✗ 推送失败，请检查网络连接或仓库配置
)
echo ========================================
echo.
pause