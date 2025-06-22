import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase-client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }
  
  console.log(`[TASK ${taskId}] 🔍 Status check received.`);

  try {
    const { data, error } = await supabaseAdminClient
      .from('tasks')
      .select('status, result, error')
      .eq('id', taskId)
      .single(); // We expect only one task with this ID

    if (error && error.code !== 'PGRST116') { // PGRST116 means "not found", which is a valid state for a pending task
      console.error(`[TASK ${taskId}] ❌ Supabase select error:`, error.message);
      throw new Error(error.message);
    }

    if (!data) {
      console.log(`[TASK ${taskId}] ⏳ Task not found in DB yet, returning 'pending'.`);
      return NextResponse.json({ status: 'pending' });
    }
    
    console.log(`[TASK ${taskId}] ✅ Returning status from DB: ${data.status}`);
    
    // The data object from Supabase directly matches the structure the frontend expects.
    // It will have { status: 'completed', result: { ... } } or { status: 'failed', error: '...' }
    return NextResponse.json(data);

  } catch (error: any) {
    console.error(`[TASK ${taskId}] ❌ Error fetching task status:`, error.message);
    return NextResponse.json(
      { error: 'Failed to get stylization status', details: error.message },
      { status: 500 }
    );
  }
} 