"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HelpCircle, X } from "lucide-react"

interface KeyValidatorProps {
  apiKey: string
  setApiKey: (key: string) => void
  onOpenSupportModal: () => void
}

export function KeyValidator({ apiKey, setApiKey, onOpenSupportModal }: KeyValidatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-grow">
      <Input
        type="text"
        placeholder="在此粘贴您的秘钥"
        value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="min-w-[600px] pr-10 text-sm"
        />
        {apiKey.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted"
            onClick={() => setApiKey("")}
            aria-label="清空秘钥"
          >
            <X className="h-4 w-4" />
      </Button>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onOpenSupportModal} 
        aria-label="帮助与客服"
        className="flex-shrink-0"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    </div>
  )
}

KeyValidator.defaultProps = {
  apiKey: "",
  setApiKey: () => {},
  onOpenSupportModal: () => {},
}
