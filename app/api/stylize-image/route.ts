import { NextResponse } from "next/server";
import { randomUUID } from 'crypto';

// 这个接口现在是同步的，它会触发一个后台函数
export async function POST(req: Request) {
  try {
    const { imageUrl, style, provider, apiKey } = await req.json();

    // 详细日志：检查接收到的参数
    console.log("=== /api/stylize-image 接收到的参数 ===");
    console.log("imageUrl:", imageUrl ? `${imageUrl.substring(0, 50)}...` : "undefined");
    console.log("style:", style);
    console.log("provider:", provider);
    console.log("apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");
    console.log("apiKey 长度:", apiKey ? apiKey.length : 0);
    console.log("apiKey 类型:", typeof apiKey);

    if (!imageUrl || !style || !provider || !apiKey) {
      console.error("❌ 参数验证失败:");
      console.error("- imageUrl:", !imageUrl ? "缺失" : "✓");
      console.error("- style:", !style ? "缺失" : "✓");
      console.error("- provider:", !provider ? "缺失" : "✓");
      console.error("- apiKey:", !apiKey ? "缺失" : "✓");
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. 生成唯一的任务 ID
    const taskId = randomUUID();
    console.log("✅ 生成任务ID:", taskId);

    // 2. 准备触发后台函数的请求
    // 注意：这里的 URL 是相对于网站根目录的，Netlify 会正确路由
    // 我们需要确保 fetch 能够调用到内部的后台函数
    const invokeUrl = new URL('/api/stylize-image-background', req.url);
    console.log("📡 准备调用后台API:", invokeUrl.toString());

    // 准备传递给后台的参数
    const backgroundPayload = {
      taskId,
      imageUrl,
      style,
      apiKey,
    };
    console.log("📦 传递给后台的参数:");
    console.log("- taskId:", taskId);
    console.log("- imageUrl:", imageUrl ? `${imageUrl.substring(0, 50)}...` : "undefined");
    console.log("- style:", style);
    console.log("- apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");

    // 异步调用后台函数，但不等待其完成（fire and forget）
    fetch(invokeUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backgroundPayload),
    }).catch(err => {
      // 这里的错误只是调用后台函数本身的失败，需要记录
      console.error(`❌ Failed to invoke background function for task ${taskId}:`, err);
    });

    console.log("✅ 后台任务已启动，返回taskId给客户端");
    // 3. 立即将任务 ID 返回给客户端
    return NextResponse.json({ taskId });

  } catch (error: any) {
    console.error('❌ Error in main stylize-image API:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate stylization task.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}