# Aicomfly 集成配置指南

## 概述

本项目现在支持 Aicomfly API 作为图像风格化服务提供商之一。Aicomfly 提供了强大的图像到图像转换功能。

## 环境变量配置

在您的 `.env.local` 文件中添加以下配置：

```bash
# Cloudinary 图片上传配置
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# 设置 Aicomfly 为默认服务提供商 (请使用全部大写)
NEXT_PUBLIC_IMAGE_STYLIZATION_PROVIDER=AICOMFLY

# Aicomfly 图像风格化 API 配置
AICOMFLY_API_KEY=your_aicomfly_api_key
AICOMFLY_BASE_URL=https://api.aicomfly.com

# Aicomfly 聊天/图片修改 API 配置
AICOMFLY_CHAT_API_KEY=your_aicomfly_chat_api_key
AICOMFLY_CHAT_BASE_URL=https://ai.comfly.chat
```

## 获取 Aicomfly API 密钥

1. 访问 [Aicomfly 官网](https://aicomfly.com)
2. 注册账户并登录
3. 在控制台中获取您的 API 密钥（可能分为不同的服务密钥）
4. 将密钥添加到环境变量中

## 支持的风格 (图像风格化 API)

Aicomfly 图像风格化 API 支持以下风格：

- `anime` - 动漫风格
- `cartoon` - 卡通风格
- `oil_painting` - 油画风格
- `watercolor` - 水彩风格
- `sketch` - 素描风格
- `realistic` - 写实风格
- `fantasy` - 奇幻风格
- `cyberpunk` - 赛博朋克
- `vintage` - 复古风格
- `modern` - 现代风格

## API 端点

- **图像风格化**: `POST /api/generate`
- **获取风格列表**: `GET /api/styles`
- **聊天/图片修改**: `POST /api/chat-image-modify`

## 使用示例

### 切换服务提供商

您可以通过环境变量动态切换服务提供商：

```bash
# 使用 Stability AI
NEXT_PUBLIC_IMAGE_STYLIZATION_PROVIDER=STABILITY_AI

# 使用 Aicomfly
NEXT_PUBLIC_IMAGE_STYLIZATION_PROVIDER=AICOMFLY
```

### 测试配置

启动应用后，访问 `/api/test-env` 端点来验证环境变量配置是否正确。

## 故障排除

### 常见错误

1. **API 密钥未设置**
   - 确保 `AICOMFLY_API_KEY` 环境变量已正确设置

2. **API 请求失败**
   - 检查网络连接
   - 验证 API 密钥是否有效
   - 确认 API 端点地址是否正确

3. **图片格式错误**
   - 确保上传的图片格式为 JPG、PNG 或 WebP
   - 图片大小不应超过 10MB

### 日志查看

在开发模式下，查看控制台日志以获取详细的错误信息。

## 性能优化

- Aicomfly API 支持批量处理
- 建议使用 CDN 加速图片加载
- 可以配置图片缓存以提高响应速度

## 成本控制

- 监控 API 调用次数
- 设置合理的图片质量和尺寸
- 考虑使用缓存减少重复请求 

## 环境变量说明

*   **`AICOMFLY_API_KEY`**: 您的 Aicomfly 通用 API 密钥。当 `AICOMFLY_CHAT_API_KEY` 未设置时，它将作为 Chat API 的回退密钥。
*   **`AICOMFLY_CHAT_API_KEY`**: 您的 Aicomfly Chat API 专用密钥。此密钥优先于 `AICOMFLY_API_KEY` 用于所有涉及 Chat API 的操作，包括图像风格化和图片修改。
*   **`AICOMFLY_CHAT_BASE_URL`**: Aicomfly Chat API 的基础 URL。如果您的部署有不同的端点，请在此处指定。默认值为 `https://ai.comfly.chat`。
*   **`CLOUDINARY_CLOUD_NAME`**, **`CLOUDINARY_API_KEY`**, **`CLOUDINARY_API_SECRET`**: 您的 Cloudinary 账户凭据，用于上传用户图片。这些是必填项，以便应用能够处理和存储图片。

## 重要提示

*   请确保在 `.env.local` 文件中正确设置这些环境变量，并替换为您的实际密钥和名称。
*   `AICOMFLY_API_KEY` 和 `AICOMFLY_CHAT_API_KEY` 之间存在优先级关系，请根据您的 Aicomfly 账户配置进行设置。
*   所有 Aicomfly API 调用（包括图像风格化和图片修改）现在都通过 `https://ai.comfly.chat/v1/chat/completions` 端点进行。

## 运行测试

您可以使用以下命令来测试 Aicomfly 集成：

```bash
pnpm run test:aicomfly
```

这将运行一个简单的测试脚本，验证与 Aicomfly 服务的连接。 