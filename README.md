# PicMagic AI 图像风格化工具

基于 Stability AI 的 API，为用户提供一键图像风格化服务。

## 功能特点

- 支持多种艺术风格转换
- 实时预览效果
- 高清图片生成
- 简单易用的界面
- 支持自定义风格

## 技术栈

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Stability AI API

## 开发环境设置

1. 克隆仓库：
```bash
git clone [仓库地址]
cd picmagic
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
创建 `.env.local` 文件并添加以下配置：
```
STABILITY_API_KEY=你的_Stability_API_密钥
```

4. 启动开发服务器：
```bash
npm run dev
```

## 使用说明

1. 上传图片：支持 JPG、PNG、GIF 格式
2. 选择风格：从预设风格中选择或使用自定义风格
3. 生成预览：点击生成按钮查看效果
4. 下载图片：满意后可以下载高清版本

## 注意事项

- 需要有效的 Stability AI API 密钥
- 图片大小建议不超过 1024x1024 像素
- 生成高清图片需要消耗 API 积分

## 许可证

MIT License 