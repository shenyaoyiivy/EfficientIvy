# 网站部署指南

本指南将帮助您将网站部署到线上，使其他人能够访问和使用您的应用。

## 一、准备部署文件

### 1.1 确定必要的部署文件

您的网站是一个前端应用，主要包含以下必要文件：

- `index.html` - 网站主页面
- `app.js` - 主JavaScript文件
- `*.jpg` 和 `*.webp` - 头像图片文件
- `README.md` - 项目说明文档

### 1.2 排除不需要的文件

以下文件不需要包含在部署包中：

- `deepseek_server.py` - 本地AI服务器脚本（线上环境不需要）
- `requirements.txt` - Python依赖文件（线上环境不需要）
- `start_deepseek_server.bat` 和 `start_deepseek_server.sh` - 服务器启动脚本（线上环境不需要）
- `.env.example` - 环境变量示例文件
- `.gitignore` - Git忽略文件配置

### 1.3 创建部署包

创建一个新文件夹（例如 `deploy`），并将所有必要的文件复制到这个文件夹中：

```bash
# 在项目根目录执行
mkdir deploy
cp index.html app.js *.jpg *.webp README.md deploy/
```

## 二、选择托管服务

考虑到您的网站是一个静态前端应用（没有复杂的后端和数据库），以下是几个推荐的免费或低成本托管服务：

### 2.1 GitHub Pages

**优点：**
- 完全免费
- 与GitHub集成，便于版本控制
- 简单易用
- 适合个人项目和开源项目

**限制：**
- 只支持静态网站
- 自定义域名需要额外配置

### 2.2 Netlify

**优点：**
- 免费计划足够个人使用
- 自动部署（与Git仓库集成）
- 提供HTTPS和自定义域名
- 简单的表单处理功能

**限制：**
- 免费计划有带宽限制

### 2.3 Vercel

**优点：**
- 免费计划适合个人项目
- 自动部署和预览
- 优秀的开发体验
- 提供HTTPS和自定义域名

**限制：**
- 免费计划有使用限制

### 推荐选择

基于您的需求，**GitHub Pages** 是最适合的选择，因为它完全免费、简单易用，并且非常适合托管静态网站。以下部署指南将主要基于GitHub Pages。

## 三、使用GitHub Pages部署

### 3.1 前提条件

- 已安装Git
- 已创建GitHub账号
- 已在本地初始化Git仓库

### 3.2 步骤说明

#### 1. 在本地初始化Git仓库（如果尚未初始化）

```bash
# 在项目根目录执行
git init
git add .
git commit -m "Initial commit"
```

#### 2. 在GitHub上创建新仓库

- 访问GitHub官网并登录
- 点击右上角的"+", 选择"New repository"
- 输入仓库名称，点击"Create repository"

#### 3. 将本地仓库推送到GitHub

按照GitHub上的提示，将本地仓库与远程仓库关联并推送：

```bash
git remote add origin https://github.com/您的用户名/仓库名称.git
git branch -M main
git push -u origin main
```

#### 4. 配置GitHub Pages

- 在GitHub仓库页面，点击"Settings"
- 在左侧菜单中选择"Pages"
- 在"Source"部分：
  - 选择"main"分支（或您使用的主分支）
  - 选择根目录 "/ (root)"
  - 点击"Save"

#### 5. 等待部署完成

GitHub Pages会自动构建和部署您的网站。通常几分钟后，您可以在设置页面看到部署成功的提示和网站URL。

#### 6. 访问您的网站

部署完成后，您可以通过GitHub Pages提供的URL访问您的网站，格式通常为：`https://您的用户名.github.io/仓库名称/`

## 四、使用Netlify部署（备选方案）

如果您选择使用Netlify部署，可以按照以下步骤操作：

### 4.1 步骤说明

#### 1. 创建Netlify账号

访问 https://www.netlify.com/ 并创建免费账号。

#### 2. 部署网站

- 登录后，点击"New site from Git"
- 选择"GitHub"，并授权Netlify访问您的仓库
- 选择要部署的仓库
- 配置部署设置：
  - Branch to deploy: main（或您的主分支）
  - Build command: 留空（不需要构建步骤）
  - Publish directory: 留空（使用根目录）
- 点击"Deploy site"

#### 3. 访问您的网站

部署完成后，Netlify会为您的网站分配一个随机域名（例如：`https://random-name-12345.netlify.app/`）。您可以在Netlify的控制面板中查看这个域名。

## 五、注意事项

1. **关于AI助手功能**：
   - 当前的AI助手功能依赖于本地运行的`deepseek_server.py`
   - 在部署到线上环境后，AI助手功能将无法正常工作，因为服务器端代码没有被部署
   - 如果需要在线上环境启用AI助手功能，需要额外配置后端服务

2. **数据存储**：
   - 网站使用localStorage存储数据，这些数据只保存在用户的本地浏览器中
   - 不同用户之间的数据不会共享
   - 清除浏览器缓存或更换设备会导致数据丢失

3. **后续更新**：
   - 对于GitHub Pages：每次推送到主分支后，网站会自动更新
   - 对于Netlify：根据您的配置，代码更新后网站可能会自动重新部署

祝您部署顺利！如有任何问题，请参考所选托管服务的官方文档。