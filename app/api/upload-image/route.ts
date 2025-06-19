import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log("Cloudinary 配置环境变量:")
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "已设置" : "未设置")
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "已设置 (****" + process.env.CLOUDINARY_API_KEY.slice(-4) + ")" : "未设置")
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "已设置 (****" + process.env.CLOUDINARY_API_SECRET.slice(-4) + ")" : "未设置")

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      return NextResponse.json({ message: "未找到图片文件" }, { status: 400 })
    }

    // 将图片文件转换为 Buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 上传到 Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "picmagic" }, // 可选：指定上传到 Cloudinary 的文件夹
        (error, result) => {
          if (error) reject(error)
          resolve(result)
        }
      ).end(buffer)
    })

    if (!uploadResult || typeof uploadResult !== 'object' || !('secure_url' in uploadResult)) {
      throw new Error("Cloudinary 上传失败，未返回有效 URL")
    }

    const imageUrl = (uploadResult as { secure_url: string }).secure_url

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("图片上传到 Cloudinary 时出错:", error)
    return NextResponse.json({ message: "图片上传失败，服务器错误" }, { status: 500 })
  }
}
