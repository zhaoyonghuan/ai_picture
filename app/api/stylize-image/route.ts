import { NextResponse } from "next/server";
import { randomUUID } from 'crypto';
import { supabaseAdminClient } from "@/lib/supabase-client";

// 全局日志：import后立即打印环境变量，便于定位初始化阶段错误
console.log('🌐 stylize-image route loaded, env:', {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
});

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

    // 只要 insertError 为 null 就视为成功，不管 insertData 是否为 null
    if (insertError) {
      console.error(`[TASK ${taskId}] ❌ Supabase insert error:`, insertError.message, insertError);
      throw new Error(`Failed to create task in database: ${insertError.message}`);
    }

    console.log(`[TASK ${taskId}] ✅ Task record created in database.`);

    // 3. Asynchronously invoke the Edge Function to process the task
    // The invocation is now handled by a Supabase Database Webhook on the 'tasks' table.
    // The `supabaseAdminClient.functions.invoke` call has been removed from here
    // to prevent the Netlify function from timing out.

    // 4. Immediately return the task ID to the client
    console.log(`[TASK ${taskId}] ✅ Returning task ID to client. Worker will be triggered by Supabase webhook.`);
    return NextResponse.json({ taskId });

  } catch (error: any) {
    console.error('❌ Error in /api/stylize-image:', error);
    if (error && error.stack) {
      console.error('❌ Error stack:', error.stack);
    }
    // 新增：打印完整错误对象
    console.error('❌ 捕获到的完整错误对象:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
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