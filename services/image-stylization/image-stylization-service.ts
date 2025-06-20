export interface ImageStylizationResult {
  previewUrl: string; // 保持向后兼容，显示第一张图片
  imageUrls: string[]; // 新增：所有图片的 URL 数组
  styleNameForDisplay: string;
}

export interface StyleInfo {
  id: string;
  name: string;
  description?: string;
}

export interface ImageStylizationService {
  stylizeImage(
    imagePath: string,
    styleId: string,
    apiKey?: string
  ): Promise<ImageStylizationResult>; // 返回包含 URL 和名称的对象
  
  // 可选方法：获取支持的风格列表
  getSupportedStyles?(): Promise<StyleInfo[]>;
} 