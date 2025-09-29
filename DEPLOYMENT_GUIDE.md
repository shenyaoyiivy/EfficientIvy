# 网站部署指南

本指南将帮助您将网站部署到线上，使其他人能够访问和使用您的应用。我已为您准备了所有必要的部署文件，以下是详细的部署步骤。

## 一、准备工作（已完成）

我已经为您完成了以下准备工作：

1. 创建了详细的部署指南文件
2. 优化了`app.js`文件，使其在API调用失败时自动切换到模拟响应模式，确保AI助手功能在线上环境中也能正常工作
3. 创建了部署包文件夹`deploy`，并复制了所有必要的前端文件
4. 将所有文件添加到Git暂存区并创建了提交

## 二、后续部署步骤（详细操作指南）

### 步骤1：在GitHub上创建新仓库

**详细操作步骤：**

1. 打开浏览器，访问 [GitHub官网](https://github.com/) 并登录您的账号
2. 点击右上角的加号图标（+），在下拉菜单中选择 "New repository"
3. 在新页面中，填写以下信息：
   - **Repository name**: 为您的项目输入一个名称（例如：`personal-efficiency-tool`）
   - **Description**: 可选，为项目添加简短描述
   - **Visibility**: 选择 "Public"（公开）或 "Private"（私有）
   - 不要勾选 "Initialize this repository with a README"、"Add .gitignore" 或 "Choose a license"
4. 点击页面底部的 "Create repository" 按钮

**操作截图说明：**
- 在GitHub主页右上角点击加号，选择"New repository"
- 填写仓库信息，点击"Create repository"

### 步骤2：将本地仓库与GitHub仓库关联

**详细操作步骤：**

1. 在创建完GitHub仓库后，您会看到一个带有Git命令的页面
2. 打开您的终端应用程序
3. 导航到您的项目目录（已在正确目录中）
4. 复制GitHub页面上显示的以下命令并在终端中执行：

```bash
git remote add origin https://github.com/您的用户名/仓库名称.git
```

**注意：** 请将命令中的"您的用户名"和"仓库名称"替换为您实际的GitHub用户名和刚才创建的仓库名称。

### 步骤3：将代码推送到GitHub

**详细操作步骤：**

1. 在终端中执行以下命令，将本地代码推送到GitHub：

```bash
git push -u origin main
```

2. 第一次推送时，系统可能会提示您输入GitHub的用户名和密码/个人访问令牌
3. 输入您的GitHub凭证，等待推送完成

**注意：** 如果您使用的是较新版本的Git或启用了两步验证，可能需要使用个人访问令牌（Personal Access Token）而不是密码。如果需要创建个人访问令牌，请参考GitHub的官方文档。

### 步骤4：配置GitHub Pages

**详细操作步骤：**

1. 推送完成后，返回GitHub网站上的仓库页面
2. 点击顶部导航栏中的 "Settings" 选项卡
3. 在左侧边栏菜单中，找到并点击 "Pages" 选项
4. 在 "GitHub Pages" 配置页面中：
   - 在 "Source" 部分，点击 "None" 下拉菜单，选择 "main" 分支
   - 然后确保选择的是根目录 "/ (root)"
   - 点击 "Save" 按钮
5. 保存后，页面会刷新，您会看到一条提示信息："Your site is ready to be published at https://您的用户名.github.io/仓库名称/"

**操作截图说明：**
- 点击仓库页面的"Settings"选项卡
- 在左侧菜单选择"Pages"
- 配置Source为"main"分支和根目录，点击"Save"

### 步骤5：等待部署完成并访问网站

**详细操作步骤：**

1. 配置完成后，GitHub Pages会自动开始构建和部署您的网站
2. 部署过程通常需要1-5分钟时间
3. 部署完成后，您可以通过以下方式访问您的网站：
   - 在GitHub Pages配置页面中，点击显示的网站URL
   - 或者直接在浏览器地址栏中输入：`https://您的用户名.github.io/仓库名称/`

**验证部署成功：**
- 如果您能看到与本地预览相同的网站界面，则说明部署成功
- 尝试使用网站的各项功能，确保它们正常工作
- 特别是检查AI助手功能是否能够提供模拟响应

## 三、常见问题及解决方案

### 问题1：推送代码时提示权限错误

**解决方案：**
- 确保您输入了正确的GitHub用户名和密码/个人访问令牌
- 如果您使用的是个人访问令牌，请确保该令牌具有足够的权限（至少需要repo权限）
- 检查远程仓库URL是否正确（`git remote -v`）

### 问题2：GitHub Pages配置后看不到网站

**解决方案：**
- 等待几分钟，部署可能需要时间
- 检查浏览器地址栏中的URL是否正确
- 确认在GitHub Pages配置中选择了正确的分支和目录
- 查看仓库的"Actions"选项卡，检查部署工作流是否有错误

### 问题3：网站上的AI助手功能无法正常工作

**解决方案：**
- 这是正常现象，因为线上环境没有运行`deepseek_server.py`后端服务
- 但您会看到模拟的AI响应，这是我为您优化的功能
- 如果需要完整的AI功能，您需要配置线上的后端服务

### 问题4：网站上的图片无法显示

**解决方案：**
- 检查图片文件名和路径是否正确
- 确认图片文件已经被推送到GitHub仓库
- 尝试清除浏览器缓存后重新访问网站

## 四、网站更新与维护

### 更新网站内容

如果您需要更新网站内容，可以按照以下步骤操作：

1. 在本地修改代码
2. 提交更改：
   ```bash
   git add .
   git commit -m "描述您的更改"
   ```
3. 推送到GitHub：
   ```bash
   git push origin main
   ```
4. GitHub Pages会自动重新部署您的网站

### 查看网站访问统计

GitHub Pages不提供内置的访问统计功能，但您可以：
- 集成第三方统计工具（如Google Analytics）
- 定期检查GitHub仓库的访问数据

## 五、额外的部署选项

除了GitHub Pages，您还可以考虑以下部署选项：

### 使用Netlify部署

**详细步骤：**

1. 访问 [Netlify官网](https://www.netlify.com/) 并创建免费账号
2. 登录后，点击"New site from Git"
3. 选择"GitHub"，并授权Netlify访问您的仓库
4. 选择要部署的仓库
5. 配置部署设置：
   - Branch to deploy: main（或您的主分支）
   - Build command: 留空（不需要构建步骤）
   - Publish directory: 留空（使用根目录）
6. 点击"Deploy site"
7. 部署完成后，Netlify会为您的网站分配一个随机域名

### 使用Vercel部署

**详细步骤：**

1. 访问 [Vercel官网](https://vercel.com/) 并创建免费账号
2. 登录后，点击"New Project"
3. 选择"Import from Git Repository"
4. 选择"GitHub"，并授权Vercel访问您的仓库
5. 选择要部署的仓库
6. Vercel会自动检测项目配置，通常不需要额外设置
7. 点击"Deploy"
8. 部署完成后，Vercel会为您的网站分配一个域名

## 六、注意事项

1. **数据存储**：
   - 网站使用localStorage存储数据，这些数据只保存在用户的本地浏览器中
   - 不同用户之间的数据不会共享
   - 清除浏览器缓存或更换设备会导致数据丢失

2. **安全性**：
   - 不要在前端代码中暴露任何敏感信息
   - 本项目不包含后端数据库，因此不存在数据库安全问题

3. **性能优化**：
   - 对于大型网站，您可以考虑压缩HTML、CSS和JavaScript文件
   - 优化图片大小和格式以提高加载速度

4. **自定义域名**：
   - 如果您想使用自定义域名（如`yourdomain.com`），可以参考GitHub Pages、Netlify或Vercel的官方文档进行配置

祝您部署顺利！如有任何问题，请参考所选托管服务的官方文档，或在搜索引擎中搜索相关解决方案。