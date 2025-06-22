import { NextResponse } from "next/server";
import { randomUUID } from 'crypto';
import { supabaseAdminClient } from "@/lib/supabase-client";

// 这个接口现在是同步的，它会触发一个后台函数
export async function POST(req: Request) {
  try {
    const { imageUrl, style, apiKey } = await req.json();

    // 详细日志：检查接收到的参数
    console.log("=== /api/stylize-image 接收到的参数 ===");
    console.log("imageUrl:", imageUrl ? `${imageUrl.substring(0, 50)}...` : "undefined");
    console.log("style:", style);
    console.log("apiKey:", apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : "undefined");
    console.log("apiKey 长度:", apiKey ? apiKey.length : 0);
    console.log("apiKey 类型:", typeof apiKey);

    if (!imageUrl || !style || !apiKey) {
      console.error("❌ 参数验证失败:");
      console.error("- imageUrl:", !imageUrl ? "缺失" : "✓");
      console.error("- style:", !style ? "缺失" : "✓");
      console.error("- apiKey:", !apiKey ? "缺失" : "✓");
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Generate a unique task ID
    const taskId = randomUUID();
    console.log(`[TASK ${taskId}] ✅ New task received. Creating record in Supabase.`);

    // 2. Insert the new task into the Supabase 'tasks' table
    const { error: insertError } = await supabaseAdminClient
      .from('tasks')
      .insert({
        id: taskId,
        status: 'pending',
        payload: { imageUrl, style, apiKey }, // Store all necessary info for the worker
      });

    if (insertError) {
      console.error(`[TASK ${taskId}] ❌ Supabase insert error:`, insertError.message);
      throw new Error(`Failed to create task in database: ${insertError.message}`);
    }

    console.log(`[TASK ${taskId}] ✅ Task record created in database.`);

    // 3. Asynchronously invoke the Edge Function to process the task
    // We don't wait for the function to finish, just trigger it.
    const { error: invokeError } = await supabaseAdminClient.functions.invoke('stylize-image-worker', {
      body: { record: { id: taskId } }, // Pass the task ID to the worker
    });

    if (invokeError) {
      console.error(`[TASK ${taskId}] ❌ Supabase function invoke error:`, invokeError.message);
      // Optional: You could try to mark the task as failed here, but for now, we'll log and throw.
      throw new Error(`Failed to invoke stylization worker: ${invokeError.message}`);
    }
    
    console.log(`[TASK ${taskId}] ✅ Edge Function 'stylize-image-worker' invoked.`);

    // 4. Immediately return the task ID to the client
    return NextResponse.json({ taskId });

  } catch (error: any) {
    console.error('❌ Error in /api/stylize-image:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate stylization task.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}