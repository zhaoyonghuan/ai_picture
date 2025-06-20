# PicMagic AI 图片风格化工具

一个基于AI的图片风格化和修改工具，支持多种风格转换和图片编辑功能。

## 功能特性

- 🎨 多种图片风格转换（动漫、卡通、油画、水彩等）
- ✏️ AI图片修改和编辑
- 📱 响应式设计，支持移动端
- 🌙 深色/浅色主题切换
- ⚡ 快速图片处理

## 环境变量配置

### 必需的环境变量

在项目根目录创建 `.env.local` 文件，配置以下环境变量：

```bash
# Cloudinary 配置（用于图片上传）
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### API密钥使用

- **AICOMFLY_API_KEY**: 从界面输入，无需在环境变量中配置
- **Stability AI API Key**: 从界面输入，无需在环境变量中配置

## 安装和运行

1. 安装依赖：
```bash
npm install
# 或
pnpm install
```

2. 配置环境变量（见上文）

3. 启动开发服务器：
```bash
npm run dev
# 或
pnpm dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 使用方法

1. 在界面顶部输入您的API密钥
2. 上传要处理的图片
3. 选择风格或输入修改提示词
4. 点击生成按钮
5. 查看结果并下载图片

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **UI组件**: Radix UI, Tailwind CSS
- **图片处理**: Sharp, Cloudinary
- **AI服务**: Aicomfly, Stability AI

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React组件
│   ├── picmagic/         # 主要功能组件
│   ├── ui/               # UI组件库
│   └── theme-provider.tsx # 主题提供者
├── config/               # 配置文件
├── services/             # 服务层
│   └── image-stylization/ # 图片风格化服务
├── scripts/              # 测试脚本
└── public/               # 静态资源
```

## 开发

### 测试API连接

```bash
# 测试Aicomfly API
node scripts/test-aicomfly.js [API_KEY]

# 测试Aicomfly Chat API
node scripts/test-aicomfly-chat.js [API_KEY]
```

### 构建生产版本

```bash
npm run build
npm start
```

## 许可证

MIT License 