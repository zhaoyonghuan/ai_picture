import { NextResponse } from "next/server";
import { getImageStylizationService } from "@/services/image-stylization/image-stylization-factory";

export async function POST(request: Request) {
  console.log("Entering POST function for stylize-image (API Route)");
  try {
    const { imageUrl, styleId, apiKey } = await request.json();
    console.log("Received imageUrl:", imageUrl ? "length " + imageUrl.length : "null", "styleId:", styleId, "apiKey:", apiKey ? "[REDACTED]" : "null");

    if (!imageUrl || !styleId || !apiKey) {
      console.log("Returning 400: Missing parameters");
      return NextResponse.json({ 
        message: !apiKey ? "请先输入秘钥" : "缺少必要参数" 
      }, { status: 400 });
    }

    // 通过工厂函数获取当前配置的服务实例，传递 apiKey
    const imageStylizationService = getImageStylizationService(apiKey);
    // 调用通用服务接口的方法，传递 imageUrl、styleId
    const { previewUrl, imageUrls, styleNameForDisplay } = await imageStylizationService.stylizeImage(imageUrl, styleId, apiKey);
    console.log("Generated preview URL length:", previewUrl.length);
    console.log("Total images generated:", imageUrls.length);

    console.log("Returning 200: Image stylization successful");
    return NextResponse.json({
      previewUrl: previewUrl,
      imageUrls: imageUrls,
      style: styleNameForDisplay,
      imageUrl: imageUrl,
    });

  } catch (error: any) {
    console.error("Error in stylize-image API route:\n", error);
    return NextResponse.json(
      {
        message: "生成预览失败",
        error: error.message || "未知错误",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}