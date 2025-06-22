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
    console.log("💾 [内存存储] 保存任务:", taskId, "状态:", data.status);
    this.tasks.set(taskId, data);
    console.log("✅ [内存存储] 保存成功");
  }

  async get(taskId: string, options?: { type: 'json' }): Promise<TaskStatus | null> {
    console.log("📖 [内存存储] 读取任务:", taskId);
    const result = this.tasks.get(taskId) || null;
    console.log("📖 [内存存储] 读取结果:", result ? result.status : "null");
    return result;
  }
}

// 存储工厂
class TaskStorageFactory {
  private static instance: MemoryTaskStorage | null = null;

  static getStorage() {
    console.log("🔧 TaskStorageFactory.getStorage() 被调用");
    console.log("- NODE_ENV:", process.env.NODE_ENV);
    console.log("- VERCEL_ENV:", process.env.VERCEL_ENV);
    console.log("- NETLIFY:", process.env.NETLIFY);
    console.log("- NETLIFY_DEV:", process.env.NETLIFY_DEV);
    
    // 检查是否在 Netlify 环境
    const isNetlify = process.env.NETLIFY === 'true';
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NETLIFY_DEV === 'true';
    
    console.log("- 是否在 Netlify 环境:", isNetlify);
    console.log("- 是否为开发环境:", isDevelopment);
    
    // 在本地开发环境使用内存存储
    if (isDevelopment) {
      console.log("✅ 使用内存存储 (开发环境)");
      if (!this.instance) {
        this.instance = new MemoryTaskStorage();
      }
      return this.instance;
    }

    // 在生产环境使用 Netlify Blobs
    console.log("✅ 使用 Netlify Blobs (生产环境)");
    const store = getStore('stylizationResults');
    console.log("🔧 Netlify Blobs store 创建成功");
    return store;
  }
}

export { TaskStorageFactory }; 