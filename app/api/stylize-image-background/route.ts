import { NextResponse } from 'next/server';
import { getImageStylizationService } from '@/services/image-stylization/image-stylization-factory';
import { TaskStorageFactory } from '@/lib/task-storage';

export async function POST(req: Request) {
  try {
    const { taskId, imageUrl, style, apiKey } = await req.json();

    // 详细日志：检查接收到的参数
    console.log("=== /api/stylize-image-background 接收到的参数 ===");
    console.log("taskId:", taskId);
    console.log("imageUrl:", imageUrl ? `${imageUrl.substring(0, 50)}...` : "undefined");
    console.log("style:", style);
    console.log("apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");
    console.log("apiKey 长度:", apiKey ? apiKey.length : 0);
    console.log("apiKey 类型:", typeof apiKey);

    if (!taskId || !imageUrl || !style || !apiKey) {
      console.error("❌ 后台参数验证失败:");
      console.error("- taskId:", !taskId ? "缺失" : "✓");
      console.error("- imageUrl:", !imageUrl ? "缺失" : "✓");
      console.error("- style:", !style ? "缺失" : "✓");
      console.error("- apiKey:", !apiKey ? "缺失" : "✓");
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const taskStorage = TaskStorageFactory.getStorage();
    console.log("✅ 获取任务存储:", process.env.NODE_ENV === 'development' ? "内存存储" : "Netlify Blobs");

    // 立即更新状态为处理中
    console.log("📝 更新任务状态为 processing");
    await taskStorage.setJSON(taskId, { status: 'processing' });

    try {
      // 创建图像风格化服务
      console.log("🔧 创建图像风格化服务，传入apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");
      const stylizationService = getImageStylizationService(apiKey);
      console.log("✅ 图像风格化服务创建成功");
      
      // 处理图像
      console.log("🎨 开始处理图像风格化...");
      console.log("- 图像URL:", imageUrl ? `${imageUrl.substring(0, 50)}...` : "undefined");
      console.log("- 风格:", style);
      console.log("- API密钥:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");
      
      const result = await stylizationService.stylizeImage(imageUrl, style);
      console.log("✅ 图像风格化处理成功");
      console.log("📊 处理结果:", {
        previewUrl: result.previewUrl ? `${result.previewUrl.substring(0, 50)}...` : "undefined",
        imageUrlsCount: result.imageUrls ? result.imageUrls.length : 0,
        styleNameForDisplay: result.styleNameForDisplay
      });
      
      // 保存成功结果
      console.log("💾 保存成功结果到存储");
      await taskStorage.setJSON(taskId, {
        status: 'completed',
        result: result
      });
      console.log("✅ 任务完成，结果已保存");

    } catch (error: any) {
      console.error(`❌ Stylization failed for task ${taskId}:`, error);
      console.error("错误详情:", error.message);
      console.error("错误堆栈:", error.stack);
      
      // 保存错误结果
      console.log("💾 保存错误结果到存储");
      await taskStorage.setJSON(taskId, {
        status: 'failed',
        error: error.message || 'Stylization failed'
      });
      console.log("✅ 错误结果已保存");
    }

    console.log("✅ 后台任务处理完成");
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ Error in background stylization API:', error);
    console.error("错误详情:", error.message);
    console.error("错误堆栈:", error.stack);
    return NextResponse.json(
      {
        error: 'Failed to process stylization task.',
        details: error.message,
      },
      { status: 500 }
    );
  }
} 