import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 类型定义
interface StylizeRequest {
  taskId: string;
  imageUrl: string;
  style: string;
  apiKey: string;
  userId?: string;
}

interface StylizeResult {
  previewUrl: string;
  imageUrls: string[];
  styleNameForDisplay: string;
}

// CORS 头部
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 验证请求方法
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed')
    }

    // 解析请求体
    const body: StylizeRequest = await req.json()
    const { taskId, imageUrl, style, apiKey, userId } = body

    // 验证必需参数
    if (!taskId || !imageUrl || !style || !apiKey) {
      throw new Error('Missing required parameters: taskId, imageUrl, style, apiKey')
    }

    console.log(`[TASK ${taskId}] Starting image stylization`)

    // 创建 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 更新任务状态为处理中
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ 
        status: 'processing', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', taskId)

    if (updateError) {
      console.error(`[TASK ${taskId}] Failed to update status:`, updateError)
      throw new Error('Failed to update task status')
    }

    // 处理图片风格化（这里调用您的 AI 服务）
    const result: StylizeResult = await processImageStylization(imageUrl, style, apiKey)

    // 更新任务状态为完成
    const { error: completeError } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed', 
        result: result,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (completeError) {
      console.error(`[TASK ${taskId}] Failed to complete task:`, completeError)
      throw new Error('Failed to complete task')
    }

    console.log(`[TASK ${taskId}] Image stylization completed successfully`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        taskId,
        result 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    // 如果有 taskId，尝试更新错误状态
    try {
      const body = await req.json().catch(() => ({}))
      if (body.taskId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )
        
        await supabase
          .from('tasks')
          .update({ 
            status: 'failed', 
            error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', body.taskId)
      }
    } catch (updateError) {
      console.error('Failed to update error status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// 图片风格化处理函数
async function processImageStylization(
  imageUrl: string, 
  style: string, 
  apiKey: string
): Promise<StylizeResult> {
  console.log(`Processing image with style: ${style}`)
  
  // 这里实现您的图片风格化逻辑
  // 可以调用 AICOMFLY 或 Stability AI API
  
  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 返回模拟结果
  return {
    previewUrl: `https://example.com/stylized-${style}.jpg`,
    imageUrls: [
      `https://example.com/stylized-${style}-1.jpg`,
      `https://example.com/stylized-${style}-2.jpg`
    ],
    styleNameForDisplay: style
  }
} 