export enum ImageStylizationProvider {
  STABILITY_AI = "STABILITY_AI",
  AICOMFLY = "AICOMFLY",
  // 其他提供商将在这里添加，例如:
  // HUGGING_FACE = "HUGGING_FACE",
  // OPEN_AI = "OPEN_AI",
}

// 默认服务提供商，可以通过环境变量覆盖
export const DEFAULT_IMAGE_STYLIZATION_PROVIDER: ImageStylizationProvider = 
  (process.env.NEXT_PUBLIC_IMAGE_STYLIZATION_PROVIDER as ImageStylizationProvider) || ImageStylizationProvider.AICOMFLY; 