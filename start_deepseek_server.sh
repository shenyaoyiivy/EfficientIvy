#!/bin/bash

# DeepSeek服务器启动脚本
# 此脚本提供了一种不依赖.env文件的方式来设置API密钥

# 提示用户输入API密钥
read -p "请输入您的DeepSeek API密钥: " API_KEY

# 验证API密钥是否输入
if [ -z "$API_KEY" ]; then
    echo "错误: API密钥不能为空!"
    exit 1
fi

# 设置环境变量并启动服务器
export DEEPSEEK_API_KEY="$API_KEY"
echo "正在启动DeepSeek API服务器..."
python3 deepseek_server.py

# 说明：
# 1. 此脚本会临时设置环境变量，只在本次会话中有效
# 2. 服务器启动后，您可以通过http://localhost:8000访问AI助手
# 3. 当您关闭终端或按Ctrl+C停止服务器时，设置的环境变量将失效