import { NextResponse } from "next/server"

// 模拟用户秘钥数据库
// 在实际应用中，这里应该连接真实的数据库
const VALID_USER_KEYS = new Set([
  "USER_KEY_001",
  "USER_KEY_002",
  "USER_KEY_003"
])

// 模拟已使用的秘钥记录
// 在实际应用中，这里应该存储在数据库中
const USED_KEYS = new Set<string>()

export async function POST(request: Request) {
  try {
    const { key } = await request.json()

    if (!key) {
      return NextResponse.json({ isValid: false, message: "未提供秘钥" }, { status: 400 })
    }

    // 验证用户秘钥
    if (!VALID_USER_KEYS.has(key)) {
      return NextResponse.json({ isValid: false, message: "秘钥无效" }, { status: 403 })
    }

    // 检查秘钥是否已被使用
    if (USED_KEYS.has(key)) {
      return NextResponse.json({ isValid: false, message: "此秘钥已被使用" }, { status: 403 })
    }

    // 标记秘钥为已使用
    // 注意：在实际应用中，这应该在生成图片成功后执行
    // USED_KEYS.add(key)

    return NextResponse.json({ 
      isValid: true,
      message: "秘钥验证成功"
    })

  } catch (error) {
    console.error("秘钥验证API错误:", error)
    return NextResponse.json({ isValid: false, message: "服务器内部错误" }, { status: 500 })
  }
}

