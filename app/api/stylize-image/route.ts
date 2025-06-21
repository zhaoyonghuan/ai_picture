import { NextResponse } from "next/server";
import { getImageStylizationService } from "@/services/image-stylization/image-stylization-factory";

export async function POST(request: Request) {
  console.log("Entering POST function for stylize-image (API Route)");
  console.log("Stylize Image API route called");
  try {
    const {
      imageUrl,
      style,
      customStyle,
      apiKey,
      provider,
    } = await request.json();
    console.log("Received imageUrl:", imageUrl ? "length " + imageUrl.length : "null", "style:", style, "customStyle:", customStyle, "apiKey:", apiKey ? "[REDACTED]" : "null", "provider:", provider);

    if (!imageUrl || !style || !apiKey || !provider) {
      console.log("Returning 400: Missing parameters");
      return NextResponse.json({ 
        message: !apiKey ? "请先输入秘钥" : "缺少必要参数" 
      }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    console.log(`Received stylize request with provider: ${provider}, style: ${style}`);

    const imageStylizationService = getImageStylizationService(provider);

    const stylizedImage = await imageStylizationService.stylizeImage(
      imageUrl,
      style,
      apiKey
    );

    console.log("Image stylized successfully");
    return NextResponse.json({ stylizedImage });

  } catch (error: any) {
    console.error("Error in stylize-image API:", error);
    return NextResponse.json(
      { 
        error: "Failed to stylize image.",
        details: error.message,
        stack: error.stack, // For debugging, might want to remove in production
      }, 
      { status: 500 }
    );
  }
}