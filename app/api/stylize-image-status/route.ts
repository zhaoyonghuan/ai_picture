import { NextResponse } from 'next/server';
import { TaskStorageFactory } from '@/lib/task-storage';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  try {
    const taskStorage = TaskStorageFactory.getStorage();
    const result = await taskStorage.get(taskId, { type: 'json' });

    if (!result) {
      // 任务刚开始，还没有写入任何状态
      return NextResponse.json({ status: 'pending' });
    }

    // `result` 包含了 status 和 result/error
    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`Error fetching status for task ${taskId}:`, error);
    return NextResponse.json(
      { error: 'Failed to get stylization status', details: error.message },
      { status: 500 }
    );
  }
} 