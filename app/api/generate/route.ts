import { NextResponse } from "next/server"

// Hugging Face API 端点
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"

export async function POST(req: Request) {
  try {
    const { imageUrl: inputImageUrl, style } = await req.json()

    if (!inputImageUrl || !style) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      )
    }

    // 根据选择的风格设置提示词
    const stylePrompts: { [key: string]: string } = {
      "油画": "oil painting style, detailed brushstrokes, rich colors, classical art",
      "水彩": "watercolor style, soft colors, flowing textures, artistic",
      "素描": "pencil sketch style, detailed lines, monochrome, artistic",
      "动漫": "anime style, vibrant colors, clean lines, Japanese animation",
      "像素": "pixel art style, 8-bit, retro gaming, pixelated",
      "赛博朋克": "cyberpunk style, neon colors, futuristic, high tech",
      "写实": "photorealistic style, high detail, natural lighting",
      "抽象": "abstract art style, modern, artistic, creative",
    }

    const prompt = stylePrompts[style] || "artistic style"

    // 调用 Hugging Face API
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          image: inputImageUrl,
          prompt: prompt,
          negative_prompt: "blurry, low quality, distorted, deformed",
          num_inference_steps: 50,
          guidance_scale: 7.5,
          strength: 0.7,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.statusText}`)
    }

    // 获取生成的图片
    const imageBlob = await response.blob()
    const imageBuffer = await imageBlob.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const generatedImageUrl = `data:image/jpeg;base64,${base64Image}`

    return NextResponse.json({
      imageUrl: generatedImageUrl,
    })

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