"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Sparkles } from "lucide-react"

interface PromptInputProps {
  selectedPrompt: string
  onPromptChange: (prompt: string) => void
}

const defaultPrompts = [
  {
    id: "cute",
    name: "可爱",
    value: "让图片看起来更可爱",
    description: "使图片中的对象或场景更加可爱和讨人喜欢。",
  },
  {
    id: "cartoon",
    name: "卡通风格",
    value: "将图片转换为卡通风格",
    description: "将图片转换为具有卡通动画特点的风格。",
  },
  {
    id: "scifi",
    name: "科幻元素",
    value: "给图片添加一些科幻元素",
    description: "在图片中融入未来科技、赛博朋克或太空等科幻主题。",
  },
  {
    id: "artistic",
    name: "艺术感",
    value: "让图片更具艺术感",
    description: "增强图片的艺术表现力，使其看起来更像一幅画作或艺术品。",
  },
];

export function PromptInput({ selectedPrompt, onPromptChange }: PromptInputProps) {
  const [customPrompt, setCustomPrompt] = useState<string>("");

  useEffect(() => {
    // 如果当前选中的 prompt 是默认选项之一，则清空自定义输入
    const isDefaultSelected = defaultPrompts.some(p => p.value === selectedPrompt);
    if (isDefaultSelected) {
      setCustomPrompt("");
    }
  }, [selectedPrompt]);

  const handleRadioChange = (value: string) => {
    onPromptChange(value);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCustomPrompt(value);
    onPromptChange(value); // 实时更新父组件的 prompt
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Sparkles className="mr-2 h-5 w-5 text-primary" />
        选择或输入修改提示
      </h3>
      
      <RadioGroup
        value={defaultPrompts.some(p => p.value === selectedPrompt) ? selectedPrompt : ""} // 如果是自定义输入，则不选中任何电台按钮
        onValueChange={handleRadioChange}
        className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-6"
      >
        {defaultPrompts.map((prompt) => (
          <div key={prompt.id} className="flex flex-col space-y-1">
            <RadioGroupItem value={prompt.value} id={prompt.id} className="sr-only" />
            <Label
              htmlFor={prompt.id}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <div className="text-center">
                <Brain className="mb-2 h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{prompt.name}</span>
                <p className="text-xs text-muted-foreground mt-1">{prompt.description}</p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="space-y-2">
        <Label htmlFor="custom-prompt">自定义提示</Label>
        <Textarea
          id="custom-prompt"
          placeholder="输入您想如何修改图片，例如：将背景改为太空场景，或添加一只猫咪。"
          value={customPrompt || (defaultPrompts.some(p => p.value === selectedPrompt) ? "" : selectedPrompt)}
          onChange={handleCustomInputChange}
          rows={4}
        />
      </div>
    </div>
  );
} 