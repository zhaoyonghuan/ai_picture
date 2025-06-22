import { ImageStylizationService, ImageStylizationResult } from "./image-stylization-service";

export class AicomflyService implements ImageStylizationService {
  private baseUrl: string;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.baseUrl = process.env.AICOMFLY_CHAT_BASE_URL || "https://ai.comfly.chat";
    this.apiKey = apiKey;
    console.log("🔧 AicomflyService 构造函数被调用");
    console.log("- 传入的 apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");
    console.log("- 存储的 apiKey:", this.apiKey ? `已设置 (${this.apiKey.slice(0, 8)}...${this.apiKey.slice(-4)})` : "undefined");
  }

  async stylizeImage(
    imageUrl: string,
    styleId: string,
    apiKey?: string
  ): Promise<ImageStylizationResult> {
    console.log("=== AicomflyService.stylizeImage 开始 ===");
    console.log("接收到的参数:");
    console.log("- imageUrl:", imageUrl ? `${imageUrl.substring(0, 50)}...` : "undefined");
    console.log("- styleId:", styleId);
    console.log("- 传入的 apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");
    console.log("- 构造函数存储的 apiKey:", this.apiKey ? `已设置 (${this.apiKey.slice(0, 8)}...${this.apiKey.slice(-4)})` : "undefined");
    console.log("- baseUrl:", this.baseUrl);

    try {
      const promptText = this.getPromptForStyle(styleId);
      console.log("生成的提示词:", promptText);

      // 优先使用传入的 apiKey，如果没有则使用构造函数存储的
      const finalApiKey = apiKey || this.apiKey;
      console.log("最终使用的 apiKey:", finalApiKey ? `已设置 (${finalApiKey.slice(0, 8)}...${finalApiKey.slice(-4)})` : "undefined");

      if (!finalApiKey) {
        console.error("❌ Aicomfly API 密钥未提供");
        throw new Error("Aicomfly API 密钥未提供");
      }

      console.log("✅ API密钥验证通过");

      const requestBody = {
        model: "gpt-4o-image",
        stream: false,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      };

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${finalApiKey}`,
      };

      console.log("🌐 向 Aicomfly 发起请求...");
      console.log("请求 URL:", `${this.baseUrl}/v1/chat/completions`);
      console.log("请求头 (Headers):", JSON.stringify(headers, null, 2));
      console.log("请求体 (Body):", JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      console.log("📡 Aicomfly API 响应状态:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || errorData?.message || await response.text();
        console.error("❌ Aicomfly API 请求失败:", errorMessage);
        throw new Error(`Aicomfly API 请求失败: ${errorMessage}`);
      }

      const result = await response.json();
      console.log("✅ Aicomfly API 请求成功");
      console.log("响应结构:", {
        hasChoices: !!result.choices,
        choicesLength: result.choices?.length || 0,
        hasMessage: !!result.choices?.[0]?.message,
        hasContent: !!result.choices?.[0]?.message?.content
      });

      const messageContent = result.choices?.[0]?.message?.content;
      let stylizedImageUrls: string[] = [];

      console.log("🔍 解析响应内容...");
      console.log("messageContent 类型:", typeof messageContent);
      console.log("messageContent 是否为数组:", Array.isArray(messageContent));

      if (typeof messageContent === 'string') {
        console.log("📝 处理字符串类型的响应内容");
        // 提取所有图片 URL
        const regex = /!\[.*\]\((https?:\/\/[^)]+\.(?:png|jpe?g|gif|webp))\)/g;
        let match;
        while ((match = regex.exec(messageContent)) !== null) {
          stylizedImageUrls.push(match[1]);
          console.log("找到图片URL:", match[1]);
        }
      } else if (Array.isArray(messageContent)) {
        console.log("📝 处理数组类型的响应内容");
        // 从数组内容中提取所有图片
        for (const item of messageContent) {
          if (item.type === "image_url" && item.image_url?.url) {
            stylizedImageUrls.push(item.image_url.url);
            console.log("找到图片URL:", item.image_url.url);
          }
        }
      }

      console.log("📊 提取到的图片URL数量:", stylizedImageUrls.length);

      if (stylizedImageUrls.length === 0) {
        console.error("❌ Aicomfly Chat API 响应中未找到图片 URL");
        console.log("完整的 messageContent:", messageContent);
        throw new Error("Aicomfly Chat API 响应中未找到图片 URL");
      }

      const styleName = this.getStyleNameForDisplay(styleId);
      console.log("🎨 风格名称:", styleName);

      const finalResult = {
        previewUrl: stylizedImageUrls[0], // 保持向后兼容，显示第一张图片
        imageUrls: stylizedImageUrls, // 新增：所有图片的 URL 数组
        styleNameForDisplay: styleName,
      };

      console.log("✅ AicomflyService.stylizeImage 完成");
      console.log("返回结果:", {
        previewUrl: finalResult.previewUrl ? `${finalResult.previewUrl.substring(0, 50)}...` : "undefined",
        imageUrlsCount: finalResult.imageUrls.length,
        styleNameForDisplay: finalResult.styleNameForDisplay
      });

      return finalResult;

    } catch (error: any) {
      console.error("❌ Aicomfly 图像风格化（通过 Chat API）失败:", error);
      console.error("错误详情:", error.message);
      console.error("错误堆栈:", error.stack);
      throw new Error(`Aicomfly 图像风格化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private getPromptForStyle(styleId: string): string {
    const stylePrompts: { [key: string]: string } = {
      "anime": "将图片转换为日式动漫风格，色彩鲜艳，线条清晰。",
      "cartoon": "将图片转换为美式卡通风格，具有夸张的特征和大胆的颜色。",
      "oil_painting": "将图片转换为经典油画风格，有明显的笔触和丰富的色彩层次。",
      "watercolor": "将图片转换为柔和的水彩风格，色彩过渡自然，边缘模糊。",
      "sketch": "将图片转换为黑白素描风格，强调线条和光影对比。",
      "realistic": "增强图片为超写实风格，细节丰富，光影逼真。",
      "fantasy": "给图片添加魔法和奇幻元素，营造梦幻般的氛围。",
      "cyberpunk": "将图片转换为赛博朋克风格，充满霓虹灯、未来科技和暗黑元素。",
      "vintage": "为图片添加复古滤镜和怀旧色调，使其看起来像老照片。",
      "modern": "将图片转换为现代艺术风格，抽象或极简主义。",
    };
    return stylePrompts[styleId] || `将图片转换为 ${styleId} 风格。`;
  }

  private getStyleNameForDisplay(styleId: string): string {
    const styleMap: { [key: string]: string } = {
      'anime': '动漫风格',
      'cartoon': '卡通风格',
      'oil_painting': '油画风格',
      'watercolor': '水彩风格',
      'sketch': '素描风格',
      'realistic': '写实风格',
      'fantasy': '奇幻风格',
      'cyberpunk': '赛博朋克',
      'vintage': '复古风格',
      'modern': '现代风格',
    };

    return styleMap[styleId] || styleId;
  }

  async getSupportedStyles(): Promise<Array<{ id: string; name: string; description?: string }>> {
    return [
      { id: 'anime', name: '动漫风格', description: '日式动漫风格' },
      { id: 'cartoon', name: '卡通风格', description: '美式卡通风格' },
      { id: 'oil_painting', name: '油画风格', description: '经典油画效果' },
      { id: 'watercolor', name: '水彩风格', description: '柔和水彩效果' },
      { id: 'sketch', name: '素描风格', description: '黑白素描效果' },
      { id: 'realistic', name: '写实风格', description: '超写实效果' },
      { id: 'fantasy', name: '奇幻风格', description: '魔法奇幻效果' },
      { id: 'cyberpunk', name: '赛博朋克', description: '未来科技风格' },
      { id: 'vintage', name: '复古风格', description: '怀旧复古效果' },
      { id: 'modern', name: '现代风格', description: '现代艺术风格' },
    ];
  }
} 