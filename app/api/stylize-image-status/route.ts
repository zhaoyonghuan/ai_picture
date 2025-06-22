import { NextResponse } from 'next/server';
import { TaskStorageFactory } from '@/lib/task-storage';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  console.log("=== /api/stylize-image-status 查询任务状态 ===");
  console.log("taskId:", taskId);

  if (!taskId) {
    console.error("❌ 缺少 taskId 参数");
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  try {
    console.log("🔧 获取任务存储");
    const taskStorage = TaskStorageFactory.getStorage();
    
    console.log("📖 查询任务状态:", taskId);
    const result = await taskStorage.get(taskId, { type: 'json' });
    
    console.log("📊 查询结果:", result ? {
      status: result.status,
      hasResult: !!result.result,
      hasError: !!result.error
    } : "null");

    if (!result) {
      console.log("⏳ 任务状态为 pending (未找到记录)");
      // 任务刚开始，还没有写入任何状态
      return NextResponse.json({ status: 'pending' });
    }

    console.log("✅ 返回任务状态:", result.status);
    // `result` 包含了 status 和 result/error
    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`❌ Error fetching status for task ${taskId}:`, error);
    console.error("错误详情:", error.message);
    console.error("错误堆栈:", error.stack);
    return NextResponse.json(
      { error: 'Failed to get stylization status', details: error.message },
      { status: 500 }
    );
  }
} 