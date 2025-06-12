"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast" // 确保路径正确

interface KeyValidatorProps {
  apiKey: string
  setApiKey: (key: string) => void
  isKeyValid: boolean | null
  setIsKeyValid: (valid: boolean | null) => void
  onOpenSupportModal: () => void
}

export function KeyValidator({ apiKey, setApiKey, isKeyValid, setIsKeyValid, onOpenSupportModal }: KeyValidatorProps) {
  const [isValidating, setIsValidating] = useState(false)
  const { toast } = useToast()

  const validateKey = useCallback(
    async (keyToValidate: string) => {
      if (!keyToValidate) {
        setIsKeyValid(null)
        return
      }
      setIsValidating(true)
      try {
        const response = await fetch("/api/validate-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: keyToValidate }),
        })

        const data = await response.json()

        if (response.ok && data.isValid) {
          setIsKeyValid(true)
          toast({ title: "秘钥有效", description: "秘钥验证成功！" })
        } else {
          setIsKeyValid(false)
          toast({
            title: "秘钥无效",
            description: data.message || "请输入有效的秘钥。",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Key validation error:", error)
        setIsKeyValid(false)
        toast({
          title: "验证出错",
          description: "无法连接到服务器进行秘钥验证。",
          variant: "destructive",
        })
      } finally {
        setIsValidating(false)
      }
    },
    [setIsKeyValid, toast],
  )

  const handlePaste = async (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData("text")
    setApiKey(pastedText)
    await validateKey(pastedText)
  }

  useEffect(() => {
    // Optional: validate on initial load if key exists (e.g. from localStorage)
    // if (apiKey) validateKey(apiKey);
  }, []) // apiKey, validateKey - if you want to re-validate if apiKey prop changes from parent

  return (
    <div className="flex items-center gap-2 p-4 bg-card border-b">
      <Input
        type="text"
        placeholder="在此粘贴您的秘钥"
        value={apiKey}
        onChange={(e) => {
          setApiKey(e.target.value)
          setIsKeyValid(null) // Reset validation status on manual change
        }}
        onPaste={handlePaste}
        className="flex-grow"
      />
      <Button onClick={() => validateKey(apiKey)} disabled={isValidating || !apiKey} variant="outline">
        {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        验证秘钥
      </Button>
      {isKeyValid === true && <CheckCircle2 className="h-6 w-6 text-green-500" />}
      {isKeyValid === false && <XCircle className="h-6 w-6 text-red-500" />}
      {isKeyValid === true && <span className="text-sm text-green-500">可用</span>}
      {isKeyValid === false && <span className="text-sm text-red-500">无效</span>}
      <Button variant="ghost" size="icon" onClick={onOpenSupportModal} aria-label="帮助与客服">
        <HelpCircle className="h-5 w-5" />
      </Button>
    </div>
  )
}

KeyValidator.defaultProps = {
  apiKey: "",
  setApiKey: () => {},
  isKeyValid: null,
  setIsKeyValid: () => {},
  onOpenSupportModal: () => {},
}
