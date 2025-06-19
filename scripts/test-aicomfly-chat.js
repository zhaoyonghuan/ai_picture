async function testAicomflyChatAPI() {
  const chatApiKey = process.env.AICOMFLY_CHAT_API_KEY || process.env.AICOMFLY_API_KEY;
  const baseUrl = process.env.AICOMFLY_CHAT_BASE_URL || "https://ai.comfly.chat";

  console.log("=== Aicomfly Chat API 测试 ===");
  console.log("环境变量检查:");
  console.log("  AICOMFLY_CHAT_API_KEY:", process.env.AICOMFLY_CHAT_API_KEY ? "已设置" : "未设置");
  console.log("  AICOMFLY_API_KEY:", process.env.AICOMFLY_API_KEY ? "已设置" : "未设置");
  console.log("  实际使用的 API 密钥:", chatApiKey ? `已设置 (${chatApiKey.slice(0, 8)}...${chatApiKey.slice(-4)})` : "未设置");
  console.log("  AICOMFLY_CHAT_BASE_URL:", process.env.AICOMFLY_CHAT_BASE_URL || "使用默认值");
  console.log("  实际使用的 base URL:", baseUrl);

  if (!chatApiKey) {
    console.error("❌ 错误: 未设置 API 密钥");
    console.log("请确保在 .env.local 文件中设置了 AICOMFLY_CHAT_API_KEY 或 AICOMFLY_API_KEY");
    return;
  }

  try {
    // 测试简单的文本请求
    const testRequestBody = {
      model: "gpt-4o-image",
      stream: false,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "你好，请简单回复一下。",
            },
          ],
        },
      ],
    };

    console.log("\n发送测试请求...");
    console.log("请求 URL:", `${baseUrl}/v1/chat/completions`);
    console.log("请求体:", JSON.stringify(testRequestBody, null, 2));

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${chatApiKey}`,
      },
      body: JSON.stringify(testRequestBody),
    });

    console.log("\n响应状态:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 请求失败:");
      console.error("错误详情:", errorText);
      
      // 尝试不同的认证方式
      console.log("\n尝试不同的认证方式...");
      
      // 方式1: 不使用 Bearer 前缀
      const response2 = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': chatApiKey,
        },
        body: JSON.stringify(testRequestBody),
      });
      
      console.log("方式1 (无 Bearer 前缀) 响应状态:", response2.status, response2.statusText);
      if (!response2.ok) {
        const errorText2 = await response2.text();
        console.error("方式1 错误详情:", errorText2);
      } else {
        console.log("✅ 方式1 成功!");
      }
      
      // 方式2: 使用 API-Key 头部
      const response3 = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'API-Key': chatApiKey,
        },
        body: JSON.stringify(testRequestBody),
      });
      
      console.log("方式2 (API-Key 头部) 响应状态:", response3.status, response3.statusText);
      if (!response3.ok) {
        const errorText3 = await response3.text();
        console.error("方式2 错误详情:", errorText3);
      } else {
        console.log("✅ 方式2 成功!");
      }
      
    } else {
      const result = await response.json();
      console.log("✅ 请求成功!");
      console.log("响应内容:", JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error("❌ 测试过程中发生错误:", error.message);
  }
}

testAicomflyChatAPI(); 