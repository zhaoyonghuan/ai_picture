import { NextResponse } from "next/server"
import { getImageStylizationService } from "@/services/image-stylization/image-stylization-factory"

export async function GET() {
  try {
    const stylizationService = getImageStylizationService()
    
    // 检查服务是否有 getSupportedStyles 方法
    if ('getSupportedStyles' in stylizationService) {
      const styles = await (stylizationService as any).getSupportedStyles()
      return NextResponse.json({ styles })
    } else {
      // 如果没有 getSupportedStyles 方法，返回默认风格列表
      const defaultStyles = [
        { id: 'anime', name: '动漫风格', description: '日式动漫风格' },
        { id: 'cartoon', name: '卡通风格', description: '美式卡通风格' },
        { id: 'oil_painting', name: '油画风格', description: '经典油画效果' },
        { id: 'watercolor', name: '水彩风格', description: '柔和水彩效果' },
        { id: 'sketch', name: '素描风格', description: '黑白素描效果' },
        { id: 'realistic', name: '写实风格', description: '超写实效果' },
        { id: 'fantasy', name: '奇幻风格', description: '魔法奇幻效果' },
        { id: 'cyberpunk', name: '赛博朋克', description: '未来科技风格' },
        { id: 'vintage', name: '复古风格', description: '怀旧复古效果' },
        { id: 'modern', name: '现代风格', description: '现代艺术风格' },
      ]
      return NextResponse.json({ styles: defaultStyles })
    }
    
  } catch (error: any) {
    console.error("获取风格列表时出错:", error)
    return NextResponse.json(
      { 
        error: "获取风格列表失败",
        details: error.message 
      },
      { status: 500 }
    )
  }
} 