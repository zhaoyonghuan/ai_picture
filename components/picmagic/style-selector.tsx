"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { styles, type StyleOption } from "./picmagic-styles"
import { Palette } from "lucide-react"

interface StyleSelectorProps {
  selectedStyle: string | null
  onStyleSelect: (styleId: string) => void
}

export function StyleSelector({ selectedStyle, onStyleSelect }: StyleSelectorProps) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Palette className="mr-2 h-5 w-5 text-primary" />
        选择风格
      </h3>
      <TooltipProvider delayDuration={200}>
        <RadioGroup
          value={selectedStyle || undefined}
          onValueChange={onStyleSelect}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          {styles.map((style: StyleOption) => (
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
      </TooltipProvider>
    </div>
  )
}

StyleSelector.defaultProps = {
  selectedStyle: null,
  onStyleSelect: () => {},
}
