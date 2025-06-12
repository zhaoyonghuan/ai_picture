import { NextResponse } from "next/server";
import { styles } from "@/components/picmagic/picmagic-styles";
import sharp from "sharp";
import axios from "axios";
import FormData from "form-data";

// 验证 Stability AI API 配置
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
// 使用 v2beta API 端点
const STABILITY_API_URL = "https://api.stability.ai/v2beta/stable-image/generate/core";

if (!STABILITY_API_KEY) {
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

// 预览 API
export async function POST(request: Request) {
  console.log("Entering POST function for stylize-image (Stability AI v2beta)");
  try {
    const { imagePath, styleId } = await request.json();
    console.log("Received imagePath:", imagePath ? "length " + imagePath.length : "null", "styleId:", styleId);

    if (!imagePath || !styleId) {
      console.log("Returning 400: Missing parameters");
      return NextResponse.json({ message: "缺少必要参数" }, { status: 400 });
    }

    const selectedStyleOption = styles.find((s) => s.id === styleId);
    const prompt = stylePrompts[styleId] || selectedStyleOption?.description;
    const styleNameForDisplay = selectedStyleOption?.name || styleId;
    console.log("Selected style prompt:", prompt, "display name:", styleNameForDisplay);

    if (!prompt) {
      console.log(`Returning 400: No prompt found for style ${styleId}`);
      return NextResponse.json(
        { message: `未找到风格 ${styleId} 对应的描述` },
        { status: 400 }
      );
    }

    // 检查图片路径格式并提取 base64 数据
    if (!imagePath.startsWith("data:image/")) {
      console.log("Returning 400: Invalid image data format");
      return NextResponse.json(
        { message: "无效的图片数据格式" },
        { status: 400 }
      );
    }

    const base64Data = imagePath.split(",")[1];
    const imageBuffer = Buffer.from(base64Data, "base64");
    console.log("Original image buffer created. Size:", imageBuffer.length);

    // 获取原始图片尺寸以便调试
    const originalImageMetadata = await sharp(imageBuffer).metadata();
    console.log("Original image dimensions:", originalImageMetadata.width, "x", originalImageMetadata.height);

    // 使用 sharp 调整图片大小为 1024x1024
    console.log("Resizing image to 1024x1024 using sharp...");
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(1024, 1024, {
        fit: sharp.fit.contain,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFormat("png")
      .toBuffer();

    // 获取调整后图片尺寸以便调试
    const resizedImageMetadata = await sharp(resizedImageBuffer).metadata();
    console.log("Resized image dimensions:", resizedImageMetadata.width, "x", resizedImageMetadata.height);
    console.log("Image resized. Resized buffer size:", resizedImageBuffer.length);

    // 将调整后的图片转换为 base64
    const resizedBase64 = resizedImageBuffer.toString('base64');
    const resizedDataUrl = `data:image/png;base64,${resizedBase64}`;

    console.log("Calling Stability AI v2beta API...");
    console.log("Stability AI API URL:", STABILITY_API_URL);
    console.log("Stability AI API Key (last 5 chars):", STABILITY_API_KEY ? STABILITY_API_KEY.slice(-5) : "N/A");

    try {
      // 准备请求参数
      const payload = {
        prompt: prompt,
        init_image: resizedDataUrl,
        image_strength: 0.35,  // 降低原图影响，让风格效果更明显
        steps: 50,
        cfg_scale: 8.5,  // 增加提示词引导强度
        samples: 1,
        output_format: "png",
        style_preset: "enhance",  // 添加风格预设
        negative_prompt: "blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, poorly drawn face, poorly drawn hands, text, error, missing fingers, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"  // 添加负面提示词
      };

      // 使用 axios 发送请求
      const response = await axios.postForm(
        STABILITY_API_URL,
        axios.toFormData(payload, new FormData()),
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${STABILITY_API_KEY}`,
            Accept: "image/*"
          },
        }
      );

      console.log("Stability AI Response status:", response.status);

      if (response.status !== 200) {
        const errorText = Buffer.from(response.data).toString();
        console.error("Stability AI API error:", errorText);
        throw new Error(`Stability AI API 调用失败: ${response.status}\n错误详情: ${errorText}`);
      }

      // 将返回的图片数据转换为 base64
      const resultBase64 = Buffer.from(response.data).toString('base64');
      const previewUrl = `data:image/png;base64,${resultBase64}`;
      console.log("Generated preview URL length:", previewUrl.length);

      console.log("Returning 200: Stability AI image result");
      return NextResponse.json({
        previewUrl: previewUrl,
        style: styleNameForDisplay,
        imagePath: imagePath,
      });

    } catch (error: any) {
      console.error("Error in stylize-image (Stability AI v2beta) caught inside try-catch:\n", error);
      console.log("Returning 500: General error from inner catch");
      return NextResponse.json(
        {
          message: "生成预览失败",
          error: error.message || "未知错误",
          details: error.stack,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Outer Error in stylize-image (Stability AI v2beta) caught in outer catch:\n", error);
    return NextResponse.json(
      {
        message: "生成预览失败 (外部捕获)",
        error: error.message || "未知错误",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}