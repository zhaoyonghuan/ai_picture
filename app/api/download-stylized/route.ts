import { NextResponse } from "next/server"

// 验证 NeuralStyle API 密钥
const NEURALSTYLE_API_KEY = process.env.NEURALSTYLE_API_KEY
if (!NEURALSTYLE_API_KEY) {
  throw new Error("NEURALSTYLE_API_KEY 未设置")
}

export async function POST(request: Request) {
  try {
    const { imagePath, neuralStyleId } = await request.json()

    if (!imagePath || !neuralStyleId) {
      return NextResponse.json({ message: "缺少必要参数" }, { status: 400 })
    }

    // 从 base64 图片数据创建 Blob
    const base64Data = imagePath.split(',')[1]  // 移除 data:image/png;base64, 前缀
    const imageBuffer = Buffer.from(base64Data, 'base64')
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' })

    // 创建 FormData 并添加图片文件
    const formData = new FormData()
    formData.append("photo", imageBlob, "image.png")
    formData.append("api_key", NEURALSTYLE_API_KEY)
    formData.append("style_id", neuralStyleId.toString())

    console.log("Calling NeuralStyle.art API for download...")
    console.log("API URL:", "https://neuralstyle.art/api.json")
    console.log("Request payload:", {
      photo: "[BINARY_IMAGE_DATA]",
      api_key: "[REDACTED]",
      style_id: neuralStyleId,
    })

    // 调用 NeuralStyle API
    const response = await fetch("https://neuralstyle.art/api.json", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    })

    const responseText = await response.text()
    console.log("NeuralStyle.art API response:", responseText)
    console.log("NeuralStyle.art API status:", response.status, response.statusText)

    if (!response.ok) {
      return NextResponse.json({ 
        message: `NeuralStyle.art API 调用失败: ${response.status} ${response.statusText}` 
      }, { status: response.status })
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error("无法解析 NeuralStyle.art API 响应:", responseText)
      return NextResponse.json({ message: "NeuralStyle.art 返回了无效的响应" }, { status: 500 })
    }

    // 检查响应格式
    if (result.result !== "OK") {
      console.error("NeuralStyle.art API 返回了错误:", result)
      return NextResponse.json({ 
        message: `NeuralStyle.art API 返回了错误: ${JSON.stringify(result)}` 
      }, { status: 500 })
    }

    // 如果直接返回了结果 URL
    if (result.url) {
      return NextResponse.json({
        stylizedImageUrl: result.url,
      })
    }

    // 如果需要轮询结果
    if (result.filterjob_id) {
      const filterjobId = result.filterjob_id
      console.log("Got filterjob_id, starting to poll for results:", filterjobId)
      
      // 开始轮询结果
      let attempts = 0
      const maxAttempts = 30  // 最多尝试 30 次
      const pollInterval = 2000  // 每 2 秒轮询一次
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))
        attempts++
        
        // 查询任务状态
        const pollResponse = await fetch(
          `https://neuralstyle.art/api/${filterjobId}.json?api_key=${NEURALSTYLE_API_KEY}`,
          {
            headers: { 'Accept': 'application/json' }
          }
        )
        
        if (!pollResponse.ok) {
          console.error(`Poll attempt ${attempts} failed:`, pollResponse.status, pollResponse.statusText)
          continue
        }
        
        const pollResult = await pollResponse.json()
        console.log(`Poll attempt ${attempts} result:`, pollResult)
        
        if (pollResult.status === "done" && pollResult.url) {
          // 任务完成，返回结果 URL
          return NextResponse.json({
            stylizedImageUrl: pollResult.url,
          })
        } else if (pollResult.status === "processing") {
          // 继续轮询
          console.log(`Processing progress: ${pollResult.progress}%`)
          continue
        }
      }
      
      // 如果轮询超时，返回任务 ID 供后续查询
      return NextResponse.json({
        message: "风格化处理超时，请稍后查询结果",
        filterjob_id: filterjobId,
      }, { status: 202 })
    }

    // 如果响应格式不符合预期
    console.error("NeuralStyle.art API 返回了意外的响应格式:", result)
    return NextResponse.json({ 
      message: "NeuralStyle.art 返回了意外的响应格式" 
    }, { status: 500 })

  } catch (error) {
    console.error("Error in download-stylized:", error)
    return NextResponse.json({ message: "下载风格化图片失败" }, { status: 500 })
  }
} 