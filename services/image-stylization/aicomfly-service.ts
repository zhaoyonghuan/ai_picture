import { ImageStylizationService, ImageStylizationResult } from "./image-stylization-service";

export class AicomflyService implements ImageStylizationService {
  private chatApiKey: string;
  private baseUrl: string;

  constructor() {
    this.chatApiKey = process.env.AICOMFLY_CHAT_API_KEY || process.env.AICOMFLY_API_KEY || "";
    this.baseUrl = process.env.AICOMFLY_CHAT_BASE_URL || "https://ai.comfly.chat";
    
    if (!this.chatApiKey) {
      throw new Error("AICOMFLY_CHAT_API_KEY 或 AICOMFLY_API_KEY 环境变量未设置");
    }
  }

  async stylizeImage(
    imageUrl: string,
    styleId: string
  ): Promise<ImageStylizationResult> {
    try {
      const promptText = this.getPromptForStyle(styleId);

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

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.chatApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Aicomfly Chat API 请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      const messageContent = result.choices?.[0]?.message?.content;
      let stylizedImageUrls: string[] = [];

      if (typeof messageContent === 'string') {
        // 提取所有图片 URL
        const regex = /!\[.*\]\((https?:\/\/[^)]+\.(?:png|jpe?g|gif|webp))\)/g;
        let match;
        while ((match = regex.exec(messageContent)) !== null) {
          stylizedImageUrls.push(match[1]);
        }
      } else if (Array.isArray(messageContent)) {
        // 从数组内容中提取所有图片
        for (const item of messageContent) {
          if (item.type === "image_url" && item.image_url?.url) {
            stylizedImageUrls.push(item.image_url.url);
          }
        }
      }

      if (stylizedImageUrls.length === 0) {
        throw new Error("Aicomfly Chat API 响应中未找到图片 URL");
      }

      const styleName = this.getStyleNameForDisplay(styleId);

      return {
        previewUrl: stylizedImageUrls[0], // 保持向后兼容，显示第一张图片
        imageUrls: stylizedImageUrls, // 新增：所有图片的 URL 数组
        styleNameForDisplay: styleName,
      };

    } catch (error) {
      console.error("Aicomfly 图像风格化（通过 Chat API）失败:", error);
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