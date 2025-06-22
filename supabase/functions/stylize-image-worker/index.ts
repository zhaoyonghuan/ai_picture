// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AicomflyService } from '../_shared/aicomfly-service.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Hello from Functions!")

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let taskId: string | null = null;

  try {
    const { record } = await req.json()
    taskId = record.id;

    if (!taskId) {
      throw new Error("Task ID is missing in the request body.");
    }
    
    console.log(`[TASK ${taskId}] 🚀 Worker received task.`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // 1. Fetch task payload from the database
    const { data: task, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('payload')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      throw new Error(`Failed to fetch task details for ${taskId}: ${fetchError?.message}`);
    }

    const { imageUrl, style, apiKey } = task.payload as { imageUrl: string; style: string; apiKey: string };
    if (!imageUrl || !style || !apiKey) {
      throw new Error(`Task ${taskId} is missing required payload fields (imageUrl, style, apiKey).`);
    }

    // 2. Update task status to 'processing'
    await supabaseAdmin
      .from('tasks')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', taskId)
    
    console.log(`[TASK ${taskId}] ⚙️ Status set to 'processing'. Starting stylization.`);
    
    // 3. Perform the stylization
    const stylizationService = new AicomflyService();
    const result = await stylizationService.stylizeImage(imageUrl, style, apiKey);

    console.log(`[TASK ${taskId}] ✅ Stylization completed.`);

    // 4. Save the result to the database
    await supabaseAdmin
      .from('tasks')
      .update({ 
        status: 'completed', 
        result: result as any, // Cast to 'any' for Supabase client
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);
      
    console.log(`[TASK ${taskId}] 🎉 Task finished successfully.`);

    return new Response(JSON.stringify({ success: true, taskId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`[TASK ${taskId || 'UNKNOWN'}] 🔥🔥🔥 Worker failed:`, error.message);
    
    // 5. If something fails, update the status to 'failed'
    if (taskId) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await supabaseAdmin
        .from('tasks')
        .update({ 
          status: 'failed', 
          error: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);
    }

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stylize-image-worker' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
