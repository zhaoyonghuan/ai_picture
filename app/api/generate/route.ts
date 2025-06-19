import { NextResponse } from "next/server"
import { getImageStylizationService } from "@/services/image-stylization/image-stylization-factory"
import { writeFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

export async function POST(req: Request) {
  try {
    const { imageUrl: inputImageUrl, style } = await req.json()

    if (!inputImageUrl || !style) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      )
    }

    // 将 base64 图片保存到临时文件
    const base64Data = inputImageUrl.replace(/^data:image\/[a-z]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    // 创建临时文件
    const tempFileName = `temp_${Date.now()}.jpg`
    const tempFilePath = join(tmpdir(), tempFileName)
    
    try {
      await writeFile(tempFilePath, buffer)
      
      // 使用图像风格化服务
      const stylizationService = getImageStylizationService()
      const result = await stylizationService.stylizeImage(tempFilePath, style)
      
      return NextResponse.json({
        imageUrl: result.previewUrl,
        styleName: result.styleNameForDisplay,
      })
      
    } finally {
      // 清理临时文件
      try {
        await writeFile(tempFilePath, '') // 清空文件
      } catch (cleanupError) {
        console.warn("清理临时文件失败:", cleanupError)
      }
    }

  } catch (error: any) {
    console.error("生成图片时出错:", error)
    return NextResponse.json(
      { 
        error: "生成图片失败",
        details: error.message 
      },
      { status: 500 }
    )
  }
} 