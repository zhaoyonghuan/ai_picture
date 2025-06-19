import sharp from "sharp";
import axios from "axios";
import FormData from "form-data";
import { ImageStylizationService, ImageStylizationResult, StyleInfo } from "./image-stylization-service";
import { styles } from "@/components/picmagic/picmagic-styles";

// 验证 Stability AI API 配置
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
// 使用 Control API Style Guide 端点
const STABILITY_API_URL = "https://api.stability.ai/v2beta/stable-image/control/style";

if (!STABILITY_API_KEY) {
  // 在服务初始化时抛出错误，而不是在每次调用时
  throw new Error("STABILITY_API_KEY 未设置");
}

// 风格提示词映射
const stylePrompts: { [key: string]: string } = {
  "teddy": "3D Pixar style, cute and adorable, soft lighting, high quality, detailed fur texture, professional 3D rendering, Disney Pixar animation style",
  "natural": "enhance natural lighting and colors, photorealistic, high detail, professional photography, natural tones, realistic textures",
  "polaroid-grain": "vintage polaroid style, film grain, warm tones, nostalgic, retro photography, analog film look, faded colors",
  "cheshire": "mysterious and dreamy, surreal colors, magical atmosphere, ethereal glow, fantasy art style, whimsical elements",
  "sticker": "flat design, clean edges, vibrant colors, sticker art style, bold outlines, pop art influence, graphic design",
  "3d-model": "3D model style, thick brush strokes, sculptural look, professional 3D rendering, depth and volume, high quality textures",
  "pixar": "Pixar animation style, 3D rendering, expressive characters, vibrant colors, professional animation quality, Disney Pixar look",
  "polaroid-realistic": "realistic polaroid style, high quality photography, natural lighting, authentic film look, professional photo quality",
  "chibi-comic": "chibi style, cute and adorable, big head small body, manga influence, kawaii style, Japanese anime art",
  "chibi-icon": "chibi icon style, minimalist design, cute and simple, perfect for emoji or avatar, clean lines, kawaii style",
  "mysterious": "mysterious atmosphere, ethereal glow, fantasy elements, magical effects, dreamy quality, artistic style",
  "kandinsky": "abstract art style inspired by Kandinsky, geometric shapes, vibrant colors, modern art, artistic composition",
  "custom": "artistic style, creative transformation, professional quality, high detail, unique interpretation"
};

export class StabilityAIService implements ImageStylizationService {
  async stylizeImage(imagePath: string, styleId: string): Promise<ImageStylizationResult> {
    console.log("Entering StabilityAIService.stylizeImage");

    const selectedStyleOption = styles.find((s) => s.id === styleId);
    const prompt = stylePrompts[styleId] || selectedStyleOption?.description;
    const stylePreset = selectedStyleOption?.stylePreset;
    const styleNameForDisplay = selectedStyleOption?.name || styleId; // 获取显示名称
    console.log("Selected style prompt:", prompt, "style preset:", stylePreset, "display name:", styleNameForDisplay);

    if (!prompt) {
      throw new Error(`未找到风格 ${styleId} 对应的描述`);
    }

    if (!imagePath.startsWith("data:image/")) {
      throw new Error("无效的图片数据格式");
    }

    const base64Data = imagePath.split(",")[1];
    const imageBuffer = Buffer.from(base64Data, "base64");
    console.log("Original image buffer created. Size:", imageBuffer.length);

    const originalImageMetadata = await sharp(imageBuffer).metadata();
    console.log("Original image dimensions:", originalImageMetadata.width, "x", originalImageMetadata.height);

    console.log("Resizing image to 1024x1024 using sharp...");
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(1024, 1024, {
        fit: sharp.fit.contain,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFormat("png")
      .toBuffer();

    const resizedImageMetadata = await sharp(resizedImageBuffer).metadata();
    console.log("Resized image dimensions:", resizedImageMetadata.width, "x", resizedImageMetadata.height);
    console.log("Image resized. Resized buffer size:", resizedImageBuffer.length);

    console.log("Calling Stability AI v2 API...");
    console.log("Stability AI API URL:", STABILITY_API_URL);
    console.log("Stability AI API Key (last 5 chars):", STABILITY_API_KEY ? STABILITY_API_KEY.slice(-5) : "N/A");

    try {
      const formData = new FormData();
      formData.append('image', resizedImageBuffer, 'image.png');
      formData.append('prompt', prompt);
      formData.append('fidelity', 0.35);
      if (stylePreset) {
        formData.append('style_preset', stylePreset);
      }
      formData.append('negative_prompt', 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, poorly drawn face, poorly drawn hands, text, error, missing fingers, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry');
      formData.append('output_format', 'png');

      console.log("Request parameters (Control Style API):", {
        prompt,
        fidelity: 0.35,
        stylePreset,
        negative_prompt: "...",
        output_format: "png",
        image_data: "[BINARY_IMAGE_DATA]"
      });

      const response = await axios.post(
        STABILITY_API_URL,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${STABILITY_API_KEY}`,
            'Accept': 'image/*',
            'Content-Type': 'multipart/form-data'
          },
          responseType: 'arraybuffer'
        }
      );

      console.log("Stability AI Response status:", response.status);

      if (response.status !== 200) {
        let errorDetails = "未知错误";
        try {
          const errorData = JSON.parse(Buffer.from(response.data as ArrayBuffer).toString());
          errorDetails = errorData.message || JSON.stringify(errorData.errors) || JSON.stringify(errorData);
        } catch (jsonError) {
          errorDetails = Buffer.from(response.data as ArrayBuffer).toString();
        }
        console.error("Stability AI API error details:", errorDetails);
        throw new Error(
          `Stability AI API 调用失败: ${response.status} ${response.statusText}\n错误详情: ${errorDetails}`
        );
      }

      const resultBase64 = Buffer.from(response.data as ArrayBuffer).toString('base64');
      const previewUrl = `data:image/png;base64,${resultBase64}`;
      console.log("Generated preview URL length:", previewUrl.length);

      return { 
        previewUrl, 
        imageUrls: [previewUrl], // 对于 Stability AI，只有一张图片
        styleNameForDisplay 
      };

    } catch (error: any) {
      console.error("Error in StabilityAIService.stylizeImage:\n", error);
      throw new Error(`图像风格化失败: ${error.message || "未知错误"}`);
    }
  }

  async getSupportedStyles(): Promise<StyleInfo[]> {
    // 返回 Stability AI 支持的风格列表
    return styles.map(style => ({
      id: style.id,
      name: style.name,
      description: style.description
    }));
  }
} 