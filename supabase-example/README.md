# Supabase Edge Functions 使用指南

## 1. 安装 Supabase CLI

```bash
npm install -g supabase
```

## 2. 初始化项目

```bash
supabase init
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

## 3. 创建 Edge Function

```bash
supabase functions new stylize-image
```

## 4. 函数结构

```
supabase/
├── functions/
│   └── stylize-image/
│       ├── index.ts          # 主函数文件
│       └── types.ts          # 类型定义
├── migrations/               # 数据库迁移
└── config.toml              # 配置文件
```

## 5. 数据库表结构

```sql
-- 创建任务表
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid()::text = data->>'userId');

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid()::text = data->>'userId');
```

## 6. 部署函数

```bash
supabase functions deploy stylize-image
```

## 7. 调用函数

```javascript
// 前端调用
const { data, error } = await supabase.functions.invoke('stylize-image', {
  body: {
    taskId: 'uuid',
    imageUrl: 'https://example.com/image.jpg',
    style: 'anime',
    apiKey: 'your-api-key'
  }
});
``` 