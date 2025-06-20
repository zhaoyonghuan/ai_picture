import { NextResponse } from "next/server"
import { styles } from "@/components/picmagic/picmagic-styles"

export async function GET() {
  try {
    return NextResponse.json({ styles })
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