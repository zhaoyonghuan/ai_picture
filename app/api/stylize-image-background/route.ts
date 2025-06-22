import { NextResponse } from 'next/server';
import { getImageStylizationService } from '@/services/image-stylization/image-stylization-factory';
import { TaskStorageFactory } from '@/lib/task-storage';

export async function POST(req: Request) {
  let taskId: string | null = null;
  try {
    console.log("🚀🚀🚀 [BACKGROUND TASK START] /api/stylize-image-background received a request! 🚀🚀🚀");
    
    const body = await req.json();
    taskId = body.taskId;
    console.log(`[TASK ${taskId}] 1. Received payload:`, { taskId: body.taskId, style: body.style, imageUrl: body.imageUrl ? 'present' : 'missing', apiKey: body.apiKey ? 'present' : 'missing' });

    const { imageUrl, style, apiKey } = body;
    if (!taskId || !imageUrl || !style || !apiKey) {
      console.error(`[TASK ${taskId}] ❌ Missing parameters. Aborting.`);
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    console.log(`[TASK ${taskId}] 2. Parameters validated.`);
    const taskStorage = TaskStorageFactory.getStorage();
    console.log(`[TASK ${taskId}] 3. Task storage obtained. Type: ${process.env.NODE_ENV === 'development' ? 'Memory' : 'Netlify Blobs'}`);

    await taskStorage.setJSON(taskId, { status: 'processing' });
    console.log(`[TASK ${taskId}] 4. Status set to 'processing' in storage.`);

    console.log(`[TASK ${taskId}] 5. Creating stylization service...`);
    const stylizationService = getImageStylizationService(apiKey);
    console.log(`[TASK ${taskId}] 6. Service created successfully.`);

    console.log(`[TASK ${taskId}] 7. Calling stylizeImage method...`);
    const result = await stylizationService.stylizeImage(imageUrl, style);
    console.log(`[TASK ${taskId}] 8. stylizeImage method completed.`);

    console.log(`[TASK ${taskId}] 9. Saving 'completed' status to storage.`);
    await taskStorage.setJSON(taskId, {
      status: 'completed',
      result: result
    });
    console.log(`[TASK ${taskId}] 10. 🎉🎉🎉 [BACKGROUND TASK SUCCESS] Task completed and result saved. 🎉🎉🎉`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    const errorMsg = error.message || 'An unknown error occurred';
    console.error(`🔥🔥🔥 [TASK ${taskId || 'UNKNOWN'}] ❌❌❌ [BACKGROUND TASK FAILED] An error occurred. 🔥🔥🔥`);
    console.error(`[TASK ${taskId || 'UNKNOWN'}] Error details:`, errorMsg);
    console.error(`[TASK ${taskId || 'UNKNOWN'}] Error stack:`, error.stack);
    
    if (taskId) {
      try {
        const taskStorage = TaskStorageFactory.getStorage();
        console.log(`[TASK ${taskId}] Saving 'failed' status to storage due to error.`);
        await taskStorage.setJSON(taskId, {
          status: 'failed',
          error: errorMsg
        });
        console.log(`[TASK ${taskId}] 'failed' status saved successfully.`);
      } catch (storageError: any) {
        console.error(`[TASK ${taskId}] ❌ CRITICAL: Failed to save error status to storage.`, storageError);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to process stylization task.', details: errorMsg },
      { status: 500 }
    );
  }
} 