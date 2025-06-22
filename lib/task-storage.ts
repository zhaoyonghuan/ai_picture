import { getStore } from '@netlify/blobs';

// 任务状态类型
export interface TaskStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

// 内存存储（用于本地开发）
class MemoryTaskStorage {
  private tasks = new Map<string, TaskStatus>();

  async setJSON(taskId: string, data: TaskStatus): Promise<void> {
    this.tasks.set(taskId, data);
  }

  async get(taskId: string, options?: { type: 'json' }): Promise<TaskStatus | null> {
    return this.tasks.get(taskId) || null;
  }
}

// 存储工厂
class TaskStorageFactory {
  private static instance: MemoryTaskStorage | null = null;

  static getStorage() {
    // 在本地开发环境使用内存存储
    if (process.env.NODE_ENV === 'development') {
      if (!this.instance) {
        this.instance = new MemoryTaskStorage();
      }
      return this.instance;
    }

    // 在生产环境使用 Netlify Blobs
    return getStore('stylizationResults');
  }
}

export { TaskStorageFactory }; 