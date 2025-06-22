import { NextResponse } from "next/server";
import { randomUUID } from 'crypto';
import { supabaseAdminClient } from "@/lib/supabase-client";

// 这个接口现在是同步的，它会触发一个后台函数
export async function POST(req: Request) {
  try {
    const { imageUrl, style, apiKey } = await req.json();

    console.log('--- Netlify API /api/stylize-image 启动 ---');
    console.log('环境变量:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置');
    console.log('收到参数:', { imageUrl, style, apiKey: apiKey ? `已设置 (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : '未设置' });

    if (!imageUrl || !style || !apiKey) {
      console.error('❌ 缺少参数:', { imageUrl, style, apiKey });
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Generate a unique task ID
    const taskId = randomUUID();
    console.log(`[TASK ${taskId}] ✅ New task received. Creating record in Supabase.`);

    // 2. Insert the new task into the Supabase 'tasks' table
    const insertPayload = {
      id: taskId,
      status: 'pending',
      payload: { imageUrl, style, apiKey },
    };
    console.log(`[TASK ${taskId}] 🚀 准备写入 Supabase，参数:`, insertPayload);
    const { error: insertError, data: insertData } = await supabaseAdminClient
      .from('tasks')
      .insert(insertPayload);
    console.log(`[TASK ${taskId}] 📝 Supabase insert 返回:`, { insertError, insertData });

    if (insertError) {
      console.error(`[TASK ${taskId}] ❌ Supabase insert error:`, insertError.message, insertError);
      throw new Error(`Failed to create task in database: ${insertError.message}`);
    }

    console.log(`[TASK ${taskId}] ✅ Task record created in database.`);

    // 3. Asynchronously invoke the Edge Function to process the task
    const invokeParams = {
      body: { record: { id: taskId } },
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      }
    };
    console.log(`[TASK ${taskId}] 🚀 准备调用 Edge Function stylize-image-worker，参数:`, invokeParams);
    const { error: invokeError, data: invokeData } = await supabaseAdminClient.functions.invoke('stylize-image-worker', invokeParams);
    console.log(`[TASK ${taskId}] 🚀 Edge Function invoke 返回:`, { invokeError, invokeData });

    if (invokeError) {
      console.error(`[TASK ${taskId}] ❌ Supabase function invoke error:`, invokeError.message, invokeError);
      throw new Error(`Failed to invoke stylization worker: ${invokeError.message}`);
    }
    
    console.log(`[TASK ${taskId}] ✅ Edge Function 'stylize-image-worker' invoked.`);

    // 4. Immediately return the task ID to the client
    return NextResponse.json({ taskId });

  } catch (error: any) {
    console.error('❌ Error in /api/stylize-image:', error);
    if (error && error.stack) {
      console.error('❌ Error stack:', error.stack);
    }
    // 打印所有环境变量和上下文
    console.error('环境变量:', {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
    });
    return NextResponse.json(
      {
        errorType: error?.name || 'Error',
        errorMessage: error?.message || 'An unknown error has occurred',
        errorStack: error?.stack || null,
      },
      { status: 500 }
    );
  }
}