export interface StyleOption {
  id: string
  name: string
  description: string
  stylePreset?: string
  neuralStyleId?: string
}

export const styles: StyleOption[] = [
  { id: "custom", name: "自定义风格", description: "上传您自己的风格参考图或调整高级参数。" },
  { id: "teddy", name: "玩具熊奖", description: "生成类似皮克斯动画电影的可爱3D风格。 (类 Pixar 动漫风)" },
  { id: "natural", name: "自然风", description: "增强照片的自然光影和色彩，保持真实感。" },
  { id: "polaroid-grain", name: "拍立得颗粒", description: "模拟复古拍立得相纸的颗粒感和色调，适合复古。" },
  { id: "cheshire", name: "柴郡猫", description: "神秘而梦幻，带有奇特扭曲和鲜艳色彩。" },
  { id: "sticker", name: "贴纸力", description: "将图片转化为扁平、边缘清晰的贴纸效果。" },
  { id: "3d-model", name: "3D模型", description: "专业的3D模型渲染风格，适合产品展示。", stylePreset: "3d-model" },
  { id: "pixar", name: "皮克斯", description: "经典的皮克斯动画风格，角色生动有趣。" },
  { id: "polaroid-realistic", name: "拍立得写实", description: "写实风格的拍立得效果，注重细节和光线。" },
  { id: "chibi-comic", name: "Q版漫画", description: "可爱的Q版大头漫画风格。" },
  { id: "chibi-icon", name: "Q版图标", description: "简洁的Q版图标风格，适合用作表情包或小头像。" },
  { id: "mysterious", name: "神秘风格", description: "每周更新的限定神秘风格，带来未知惊喜！" },
  { id: "kandinsky", name: "康定斯基", description: "抽象艺术风格，源自康定斯基。", neuralStyleId: "873" },
  { id: "analog-film", name: "胶片风格", description: "模拟传统胶片摄影效果，带有复古质感。", stylePreset: "analog-film" },
  { id: "anime", name: "动漫风格", description: "日本动漫风格，线条清晰，色彩鲜明。", stylePreset: "anime" },
  { id: "cinematic", name: "电影风格", description: "电影级画面效果，富有戏剧性和艺术感。", stylePreset: "cinematic" },
  { id: "comic-book", name: "漫画风格", description: "美式漫画风格，线条粗犷，色彩对比强烈。", stylePreset: "comic-book" },
  { id: "digital-art", name: "数字艺术", description: "现代数字艺术风格，适合创意作品。", stylePreset: "digital-art" },
  { id: "enhance", name: "增强风格", description: "增强图片细节和质感，保持真实感。", stylePreset: "enhance" },
  { id: "fantasy-art", name: "奇幻艺术", description: "充满想象力的奇幻艺术风格。", stylePreset: "fantasy-art" },
  { id: "isometric", name: "等距风格", description: "等距投影风格，适合技术图解。", stylePreset: "isometric" },
  { id: "line-art", name: "线条艺术", description: "简约的线条艺术风格，突出轮廓。", stylePreset: "line-art" },
  { id: "low-poly", name: "低多边形", description: "低多边形风格，现代简约。", stylePreset: "low-poly" },
  { id: "modeling-compound", name: "复合建模", description: "复合建模风格，适合建筑和产品展示。", stylePreset: "modeling-compound" },
  { id: "neon-punk", name: "霓虹朋克", description: "赛博朋克风格，霓虹灯效果。", stylePreset: "neon-punk" },
  { id: "origami", name: "折纸风格", description: "折纸艺术风格，几何感强。", stylePreset: "origami" },
  { id: "photographic", name: "摄影风格", description: "专业摄影效果，自然真实。", stylePreset: "photographic" },
  { id: "pixel-art", name: "像素艺术", description: "复古像素艺术风格，怀旧感。", stylePreset: "pixel-art" },
  { id: "tile-texture", name: "纹理风格", description: "适合制作无缝纹理和图案。", stylePreset: "tile-texture" },
]
