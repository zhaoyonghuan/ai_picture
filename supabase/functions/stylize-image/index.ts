import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { taskId, imageUrl, style, apiKey } = await req.json()
    
    // 创建 Supabase 客户端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 更新任务状态为处理中
    await supabaseClient
      .from('tasks')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', taskId)

    // 处理图片风格化
    const result = await processImageStylization(imageUrl, style, apiKey)

    // 更新任务状态为完成
    await supabaseClient
      .from('tasks')
      .update({ 
        status: 'completed', 
        result: result,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function processImageStylization(imageUrl: string, style: string, apiKey: string) {
  // 实现图片风格化逻辑
  // 可以调用 AICOMFLY 或 Stability AI API
  return { imageUrl: 'processed-image-url' }
} 