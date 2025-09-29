# 随手记 AI 助手

本项目是一个集成了DeepSeek大模型的智能助手，为"随手记"网页应用提供AI增强功能。

## 功能特点

AI助手具备以下三个核心功能：

1. **日程进度总结**：分析用户的待办事项，提供进度报告和未完成任务列表
2. **阶段性总结报告**：综合分析所有数据，生成结构化的总结报告
3. **通用问答能力**：回答生活、知识和编程类问题

## 安装与配置

### 1. 安装依赖

首先，安装Python服务器所需的依赖：

```bash
pip install -r requirements.txt
```

### 2. 配置DeepSeek API密钥

复制.env.example文件并重命名为.env：

```bash
cp .env.example .env
```

然后，编辑.env文件，填入您的DeepSeek API密钥：

```
DEEPSEEK_API_KEY=your-actual-api-key-here
```

### 3. 启动服务器

启动Python HTTP服务器和DeepSeek API代理服务器：

```bash
# 启动主HTTP服务器
python3 -m http.server 8000

# 在另一个终端启动DeepSeek API代理服务器
python3 deepseek_server.py
```

## 使用说明

1. 打开浏览器，访问 http://localhost:8000
2. 导航到"随手记"页面
3. 在右侧的AI助手对话框中，可以：
   - 直接输入问题或指令
   - 点击快捷功能按钮快速获取日程总结或报告

## 安全注意事项

- API密钥存储在服务器端的环境变量中，不会暴露在客户端代码中
- 所有与DeepSeek API的交互都在服务器端进行
- 客户端通过安全的HTTP请求与服务器通信

## 文件说明

- `index.html`：主页面文件，包含UI结构
- `app.js`：客户端JavaScript逻辑
- `deepseek_server.py`：基于Flask的DeepSeek API代理服务器
- `requirements.txt`：Python依赖列表
- `.env.example`：环境变量配置模板
- `.gitignore`：Git忽略规则文件