import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "未找到 HUGGINGFACE_API_KEY 环境变量" },
      { status: 500 }
    )
  }

  // 只返回密钥的前4位和后4位，中间用星号代替
  const maskedKey = `${apiKey.slice(0, 4)}${'*'.repeat(apiKey.length - 8)}${apiKey.slice(-4)}`

  return NextResponse.json({
    message: "环境变量加载成功",
    apiKeyMasked: maskedKey,
    keyLength: apiKey.length
  })
} 