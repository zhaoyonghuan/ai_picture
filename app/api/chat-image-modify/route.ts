import { NextResponse } from "next/server";

const AICOMFLY_CHAT_API_URL = "https://ai.comfly.chat/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { imageUrl, promptText, apiKey } = await req.json();

    if (!imageUrl || !promptText || !apiKey) {
      return NextResponse.json(
        { error: "缺少必要参数：imageUrl、promptText 或 apiKey" },
        { status: 400 }
      );
    }

    const requestBody = {
      model: "gpt-4o-image", // 根据您提供的模型名称
      stream: false,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };

    console.log("调用 Aicomfly Chat API，请求体：", JSON.stringify(requestBody, null, 2));
    console.log("请求头：", headers);

    const response = await fetch(AICOMFLY_CHAT_API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Aicomfly Chat API 请求失败响应：", errorText);
      throw new Error(`Aicomfly Chat API 请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Aicomfly Chat API 成功响应：", JSON.stringify(result, null, 2));

    // 根据 Aicomfly Chat API 的实际响应结构提取图片 URL
    const messageContent = result.choices?.[0]?.message?.content;
    let modifiedImageUrls: string[] = [];

    if (typeof messageContent === 'string') {
      // 使用正则表达式从 Markdown 字符串中提取图片 URL
      const regex = /!\[.*\]\((https?:\/\/[^)]+\.(?:png|jpe?g|gif|webp))\)/g;
      let match;
      while ((match = regex.exec(messageContent)) !== null) {
        modifiedImageUrls.push(match[1]);
      }
    } else if (Array.isArray(messageContent)) {
      // 如果 content 是数组，检查是否有 type: "image_url" 的对象
      for (const item of messageContent) {
        if (item.type === "image_url" && item.image_url?.url) {
          modifiedImageUrls.push(item.image_url.url);
        }
      }
    }

    if (modifiedImageUrls.length === 0) {
      console.warn("Aicomfly Chat API 响应中未找到图片 URL：", JSON.stringify(result, null, 2));
      return NextResponse.json({
        message: "图片修改请求成功，但响应中未找到修改后的图片URL",
        rawResponse: result
      });
    }

    return NextResponse.json({ modifiedImageUrls });

  } catch (error: any) {
    console.error("调用 Aicomfly Chat Image Modify API 时出错:", error);
    return NextResponse.json(
      {
        error: "调用 Aicomfly Chat Image Modify API 失败",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
} 