#!/usr/bin/env python3
import os
import json
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# DeepSeek API 配置
# 方法1：从环境变量中读取API密钥（推荐）
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')

# 尝试加载.env文件（可选）
if not DEEPSEEK_API_KEY:
    try:
        from dotenv import load_dotenv
        load_dotenv()
        DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
    except ImportError:
        logger.warning("未安装python-dotenv包，跳过.env文件加载。")

# 方法2：如果以上方法都未设置API密钥，可以直接在此处硬编码（仅在测试环境使用）
# 警告：不要将包含硬编码密钥的代码提交到版本控制系统
# 您已经选择了直接在代码中设置API密钥的方式
DEEPSEEK_API_KEY = 'sk-ae98ce5e6f604de1b6028ce64635421c'

if not DEEPSEEK_API_KEY:
    logger.warning("未设置DEEPSEEK_API_KEY。请使用启动脚本或在代码中直接设置。")
    DEEPSEEK_API_KEY = 'your-api-key-here'  # 仅作为占位符

DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

@app.route('/')
def serve_index():
    """提供前端页面"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    """提供静态文件"""
    return send_from_directory('.', path)

@app.route('/api/chat', methods=['POST'])
def chat_with_deepseek():
    """处理来自客户端的聊天请求，并调用DeepSeek API"""
    try:
        # 获取请求数据
        data = request.json
        user_query = data.get('query', '')
        context_data = data.get('context', {})
        
        # 记录收到的上下文数据，帮助调试
        logger.info(f"收到的用户查询: {user_query}")
        logger.info(f"收到的上下文数据: {context_data}")
        logger.info(f"上下文数据中的待办事项数量: {len(context_data.get('todos', []))}")
        logger.info(f"上下文数据中的计划数量: {len(context_data.get('plans', []))}")
        logger.info(f"上下文数据中的笔记数量: {len(context_data.get('notes', []))}")
        
        if not user_query:
            return jsonify({'error': '查询不能为空'}), 400
        
        # 构建发送给DeepSeek的消息
        messages = build_deepseek_messages(user_query, context_data)
        
        # 调用DeepSeek API
        response = call_deepseek_api(messages)
        
        # 检查API响应
        if 'error' in response:
            logger.error(f"DeepSeek API 错误: {response['error']}")
            return jsonify({'error': 'API调用失败'}), 500
        
        # 提取并返回AI响应
        ai_response = response['choices'][0]['message']['content']
        return jsonify({'response': ai_response})
        
    except Exception as e:
        logger.error(f"处理请求时出错: {str(e)}")
        return jsonify({'error': '服务器内部错误'}), 500


def build_deepseek_messages(user_query, context_data):
    """构建发送给DeepSeek API的消息列表"""
    # 系统提示：定义AI助手的角色和能力
    system_prompt = (
        "你是一个智能个人助手，能够帮助用户总结日程、生成报告和回答各种问题。\n"
        "请根据用户提供的上下文数据，以友好、专业的方式回答用户的问题。\n"
        "对于日程进度总结和阶段性报告，要确保分析全面，提供有洞察力的建议。\n"
        "对于一般性问题，请基于你所拥有的知识给出回答。\n"
        "如果你确实不知道答案，请礼貌地告知用户并建议他们通过其他渠道获取相关信息。"
    )
    
    # 用户提示：包含查询和上下文数据
    user_prompt = f"用户需求：{user_query}\n\n"
    
    # 添加待办事项数据
    if context_data.get('todos'):
        user_prompt += "待办事项数据：\n"
        for todo in context_data['todos']:
            user_prompt += f"日期：{todo.get('date', '')}，内容：{todo.get('text', '')}，状态：{'已完成' if todo.get('completed') else '未完成'}\n"
        user_prompt += "\n"
    
    # 添加长期计划数据
    if context_data.get('plans'):
        user_prompt += "长期计划数据：\n"
        for plan in context_data['plans']:
            is_completed = plan.get('subtasks') and all(subtask.get('completed', False) for subtask in plan['subtasks'])
            user_prompt += f"计划名称：{plan.get('title', '')}，状态：{'已完成' if is_completed else '进行中'}\n"
            
            if plan.get('subtasks'):
                user_prompt += "  子任务：\n"
                for i, subtask in enumerate(plan['subtasks'], 1):
                    user_prompt += f"    {i}. {subtask.get('text', '')}（{'已完成' if subtask.get('completed') else '未完成'}）\n"
        user_prompt += "\n"
    
    # 添加笔记数据
    if context_data.get('notes'):
        user_prompt += "随手记数据：\n"
        for note in context_data['notes']:
            note_date = note.get('timestamp')
            content_preview = note.get('content', '')[:100] + ('...' if len(note.get('content', '')) > 100 else '')
            user_prompt += f"内容：{content_preview}\n"
    
    # 格式化输出要求
    user_prompt += "\n请根据以上数据，以第一人称、友好的口吻回答用户的问题。回答要简洁明了，符合用户的查询意图。"
    
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]


def call_deepseek_api(messages):
    """调用DeepSeek API并返回响应"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
    }
    
    payload = {
        "model": "deepseek-chat",  # 使用适合的模型
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048
    }
    
    try:
        response = requests.post(
            DEEPSEEK_API_URL,
            headers=headers,
            json=payload,
            timeout=30  # 设置超时时间
        )
        response.raise_for_status()  # 如果状态码不是200，抛出异常
        return response.json()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"API请求异常: {str(e)}")
        return {"error": str(e)}


if __name__ == '__main__':
    # 注意：在生产环境中，应该使用WSGI服务器如Gunicorn或uWSGI
    # 这里仅用于开发和演示
    app.run(host='0.0.0.0', port=8001, debug=True)
