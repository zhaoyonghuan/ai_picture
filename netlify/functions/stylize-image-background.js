const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // 设置为 background function，可以运行更长时间
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const { taskId, imageUrl, style, apiKey } = JSON.parse(event.body);
    
    console.log(`[TASK ${taskId}] Background function started`);
    
    // 更新任务状态为处理中
    const store = getStore('stylizationResults');
    await store.setJSON(taskId, { status: 'processing' });
    
    // 这里调用您的图片风格化服务
    const result = await processImageStylization(imageUrl, style, apiKey);
    
    // 保存完成状态
    await store.setJSON(taskId, {
      status: 'completed',
      result: result
    });
    
    console.log(`[TASK ${taskId}] Background function completed successfully`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
    
  } catch (error) {
    console.error('Background function error:', error);
    
    // 保存错误状态
    if (taskId) {
      const store = getStore('stylizationResults');
      await store.setJSON(taskId, {
        status: 'failed',
        error: error.message
      });
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function processImageStylization(imageUrl, style, apiKey) {
  // 这里实现您的图片风格化逻辑
  // 可以调用 AICOMFLY 或 Stability AI API
  // 返回处理结果
} 