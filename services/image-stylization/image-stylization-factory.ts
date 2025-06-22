import { ImageStylizationService } from "./image-stylization-service";
import { StabilityAIService } from "./stability-ai-service";
import { AicomflyService } from "./aicomfly-service";
import { ImageStylizationProvider, DEFAULT_IMAGE_STYLIZATION_PROVIDER } from "@/config/image-stylization-config";

export function getImageStylizationService(apiKey?: string): ImageStylizationService {
  console.log("🔧 getImageStylizationService 被调用");
  console.log("- 传入的 apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");
  console.log("- 运行时 DEFAULT_IMAGE_STYLIZATION_PROVIDER 的值:", DEFAULT_IMAGE_STYLIZATION_PROVIDER);
  
  switch (DEFAULT_IMAGE_STYLIZATION_PROVIDER) {
    case ImageStylizationProvider.STABILITY_AI:
      console.log("✅ 创建 StabilityAIService 实例");
      return new StabilityAIService();
    case ImageStylizationProvider.AICOMFLY:
      console.log("✅ 创建 AicomflyService 实例，传入 apiKey");
      return new AicomflyService(apiKey);
    // 未来其他提供商将在这里添加
    // case ImageStylizationProvider.HUGGING_FACE:
    //   return new HuggingFaceService();
    // case ImageStylizationProvider.OPEN_AI:
    //   return new OpenAIService();
    default:
      console.error("❌ 未知的图像风格化服务提供商:", DEFAULT_IMAGE_STYLIZATION_PROVIDER);
      throw new Error(`未知的图像风格化服务提供商: ${DEFAULT_IMAGE_STYLIZATION_PROVIDER}`);
  }
} 