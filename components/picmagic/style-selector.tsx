"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { styles, type StyleOption } from "./picmagic-styles"
import { Palette } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface StyleInfo {
  id: string
  name: string
  description?: string
}

interface StyleSelectorProps {
  selectedStyle: string | null
  onStyleSelect: (styleId: string) => void
  customStyleValue: string
  onCustomStyleChange: (value: string) => void
}

export function StyleSelector({ selectedStyle, onStyleSelect, customStyleValue, onCustomStyleChange }: StyleSelectorProps) {
  const [dynamicStyles, setDynamicStyles] = useState<StyleInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取动态风格列表
  useEffect(() => {
    const fetchStyles = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/styles')
        if (!response.ok) {
          throw new Error('获取风格列表失败')
        }
        
        const data = await response.json()
        if (data.styles && Array.isArray(data.styles)) {
          setDynamicStyles(data.styles)
        }
      } catch (err) {
        console.error('获取风格列表失败:', err)
        setError(err instanceof Error ? err.message : '未知错误')
        // 如果 API 失败，使用默认风格列表
        setDynamicStyles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchStyles()
  }, [])

  // 合并动态风格和默认风格
  const availableStyles = dynamicStyles.length > 0 
    ? dynamicStyles.map(style => ({
        id: style.id,
        name: style.name,
        description: style.description || '',
        stylePreset: undefined // 动态风格可能没有 stylePreset
      }))
    : styles

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Palette className="mr-2 h-5 w-5 text-primary" />
        选择风格
        {isLoading && <span className="ml-2 text-sm text-muted-foreground">(加载中...)</span>}
      </h3>
      
      {error && (
        null
      )}
      
      <TooltipProvider delayDuration={200}>
        <ScrollArea className="h-72 rounded-md border">
          <RadioGroup
            value={selectedStyle || undefined}
            onValueChange={val => {
              onStyleSelect(val)
              if (val !== "custom") {
                onCustomStyleChange("")
              }
            }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4"
          >
            {availableStyles.map((style: StyleOption) => (
              <Tooltip key={style.id}>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 p-3 border rounded-md hover:border-primary transition-colors data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary">
                    <RadioGroupItem value={style.id} id={style.id} />
                    <Label htmlFor={style.id} className="cursor-pointer flex-1 text-sm">
                      {style.name}
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p className="text-xs max-w-xs">{style.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </RadioGroup>
        </ScrollArea>
      </TooltipProvider>
      
      {selectedStyle === "custom" && (
        <div className="mt-4">
          <Input
            type="text"
            placeholder="请输入自定义风格名称"
            value={customStyleValue}
            onChange={e => {
              onCustomStyleChange(e.target.value)
            }}
          />
        </div>
      )}
    </div>
  )
}

StyleSelector.defaultProps = {
  selectedStyle: null,
  onStyleSelect: () => {},
  customStyleValue: "",
  onCustomStyleChange: () => {},
}
