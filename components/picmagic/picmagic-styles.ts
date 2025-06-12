export interface StyleOption {
  id: string
  name: string
  description: string
  neuralStyleId?: string
}

export const styles: StyleOption[] = [
  { id: "custom", name: "自定义风格", description: "上传您自己的风格参考图或调整高级参数。" },
  { id: "teddy", name: "玩具熊奖", description: "生成类似皮克斯动画电影的可爱3D风格。 (类 Pixar 动漫风)" },
  { id: "natural", name: "自然风", description: "增强照片的自然光影和色彩，保持真实感。" },
  { id: "polaroid-grain", name: "拍立得颗粒", description: "模拟复古拍立得相纸的颗粒感和色调，适合复古。" },
  { id: "cheshire", name: "柴郡猫", description: "神秘而梦幻，带有奇特扭曲和鲜艳色彩。" },
  { id: "sticker", name: "贴纸力", description: "将图片转化为扁平、边缘清晰的贴纸效果。" },
  { id: "3d-model", name: "3D模型", description: "赋予图像厚涂般的3D模型质感，适合头像。" },
  { id: "pixar", name: "皮克斯", description: "经典的皮克斯动画风格，角色生动有趣。" },
  { id: "polaroid-realistic", name: "拍立得写实", description: "写实风格的拍立得效果，注重细节和光线。" },
  { id: "chibi-comic", name: "Q版漫画", description: "可爱的Q版大头漫画风格。" },
  { id: "chibi-icon", name: "Q版图标", description: "简洁的Q版图标风格，适合用作表情包或小头像。" },
  { id: "mysterious", name: "神秘风格", description: "每周更新的限定神秘风格，带来未知惊喜！" },
  { id: "kandinsky", name: "康定斯基", description: "抽象艺术风格，源自康定斯基。", neuralStyleId: "873" },
]
