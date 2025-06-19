import { ImageStylizationService } from "./image-stylization-service";
import { StabilityAIService } from "./stability-ai-service";
import { AicomflyService } from "./aicomfly-service";
import { ImageStylizationProvider, DEFAULT_IMAGE_STYLIZATION_PROVIDER } from "@/config/image-stylization-config";

export function getImageStylizationService(): ImageStylizationService {
  console.log("运行时 DEFAULT_IMAGE_STYLIZATION_PROVIDER 的值:", DEFAULT_IMAGE_STYLIZATION_PROVIDER);
  switch (DEFAULT_IMAGE_STYLIZATION_PROVIDER) {
    case ImageStylizationProvider.STABILITY_AI:
      return new StabilityAIService();
    case ImageStylizationProvider.AICOMFLY:
      return new AicomflyService();
    // 未来其他提供商将在这里添加
    // case ImageStylizationProvider.HUGGING_FACE:
    //   return new HuggingFaceService();
    // case ImageStylizationProvider.OPEN_AI:
    //   return new OpenAIService();
    default:
      throw new Error(`未知的图像风格化服务提供商: ${DEFAULT_IMAGE_STYLIZATION_PROVIDER}`);
  }
} 