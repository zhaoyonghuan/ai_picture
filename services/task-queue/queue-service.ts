export interface TaskQueueService {
  enqueue(task: Task): Promise<string>;
  dequeue(): Promise<Task | null>;
  complete(taskId: string, result: any): Promise<void>;
  fail(taskId: string, error: string): Promise<void>;
  getStatus(taskId: string): Promise<TaskStatus>;
}

export interface Task {
  id: string;
  type: 'image-stylization';
  data: {
    imageUrl: string;
    style: string;
    apiKey: string;
  };
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface TaskStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

// 基于数据库的简单队列实现
export class DatabaseTaskQueue implements TaskQueueService {
  async enqueue(task: Task): Promise<string> {
    // 这里可以使用任何数据库（PostgreSQL、MySQL、SQLite等）
    // 或者使用 Supabase、PlanetScale 等托管数据库
    console.log('Enqueueing task:', task.id);
    return task.id;
  }

  async dequeue(): Promise<Task | null> {
    // 获取下一个待处理任务
    console.log('Dequeueing next task');
    return null;
  }

  async complete(taskId: string, result: any): Promise<void> {
    console.log('Completing task:', taskId);
  }

  async fail(taskId: string, error: string): Promise<void> {
    console.log('Failing task:', taskId, error);
  }

  async getStatus(taskId: string): Promise<TaskStatus> {
    console.log('Getting status for task:', taskId);
    return { status: 'pending' };
  }
} 