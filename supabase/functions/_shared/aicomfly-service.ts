import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Note: This file is adapted to run in a Deno environment for Supabase Edge Functions.

// Since Deno doesn't have a global `process` object, we read from Deno.env
// The class is modified to not rely on `process.env` in the constructor.
// The baseUrl is now passed in or falls back to a default.

export interface ImageStylizationResult {
  previewUrl: string;
  imageUrls: string[];
  styleNameForDisplay: string;
}

// 带超时的 fetch 工具函数
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 300000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export class AicomflyService {
  private baseUrl: string;

  constructor() {
    // In Deno, environment variables are accessed via Deno.env.get()
    this.baseUrl = Deno.env.get("AICOMFLY_CHAT_BASE_URL") || "https://ai.comfly.chat";
  }

  async stylizeImage(
    imageUrl: string,
    styleId: string,
    apiKey: string // apiKey is now mandatory
  ): Promise<ImageStylizationResult> {
    console.log("=== Deno/AicomflyService.stylizeImage Start ===");
    try {
      if (!apiKey) {
        throw new Error("Aicomfly API key was not provided.");
      }

      const promptText = this.getPromptForStyle(styleId);

      const requestBody = {
        model: "gpt-4o-image",
        stream: false,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      };

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };

      // 使用带超时的 fetch，设置 5 分钟超时
      const response = await fetchWithTimeout(
        `${this.baseUrl}/v1/chat/completions`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody),
        },
        300000 // 5 分钟超时
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
        throw new Error(`Aicomfly API request failed: ${errorData.error?.message || errorData.message}`);
      }

      const result = await response.json();
      const messageContent = result.choices?.[0]?.message?.content;
      let stylizedImageUrls: string[] = [];

      if (typeof messageContent === 'string') {
        const regex = /!\[.*\]\((https?:\/\/[^)]+\.(?:png|jpe?g|gif|webp))\)/g;
        let match;
        while ((match = regex.exec(messageContent)) !== null) {
          stylizedImageUrls.push(match[1]);
        }
      } else if (Array.isArray(messageContent)) {
        for (const item of messageContent) {
          if (item.type === "image_url" && item.image_url?.url) {
            stylizedImageUrls.push(item.image_url.url);
          }
        }
      }

      if (stylizedImageUrls.length === 0) {
        throw new Error("No image URL found in the Aicomfly Chat API response.");
      }

      const styleName = this.getStyleNameForDisplay(styleId);

      return {
        previewUrl: stylizedImageUrls[0],
        imageUrls: stylizedImageUrls,
        styleNameForDisplay: styleName,
      };

    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error("Error in Deno/AicomflyService.stylizeImage:", error);
      throw new Error(`Aicomfly stylization failed: ${error.message}`);
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
} 