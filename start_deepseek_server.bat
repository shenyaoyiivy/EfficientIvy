@echo off

REM DeepSeek服务器启动脚本（Windows版本）
REM 此脚本提供了一种不依赖.env文件的方式来设置API密钥

REM 提示用户输入API密钥
set /p API_KEY=请输入您的DeepSeek API密钥: 

REM 验证API密钥是否输入
if "%API_KEY%"=="" (
    echo 错误: API密钥不能为空!
    pause
    exit /b 1
)

REM 设置环境变量并启动服务器
set DEEPSEEK_API_KEY=%API_KEY%
echo 正在启动DeepSeek API服务器...
python deepseek_server.py

REM 说明：
REM 1. 此脚本会临时设置环境变量，只在本次会话中有效
REM 2. 服务器启动后，您可以通过http://localhost:8000访问AI助手
REM 3. 当您关闭命令提示符或按Ctrl+C停止服务器时，设置的环境变量将失效