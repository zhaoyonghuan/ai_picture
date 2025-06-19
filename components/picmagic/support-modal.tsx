"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast" // 确保路径正确
import Image from "next/image"

interface SupportModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportModal({ isOpen, onOpenChange }: SupportModalProps) {
  const { toast } = useToast()
  const wechatId = "agegcc"
  const taobaoLink = "https://h5.m.taobao.com/awp/core/detail.htm?ft=t&id=942553296261" // 替换为您的淘宝链接

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(wechatId)
      .then(() => {
        toast({
          title: "复制成功",
          description: `微信号 ${wechatId} 已复制到剪贴板。`,
        })
      })
      .catch((err) => {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板，请手动复制。",
          variant: "destructive",
        })
        console.error("Failed to copy: ", err)
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>客服与购买支持</DialogTitle>
          <DialogDescription>如遇支付问题、秘钥未显示、图片未生成等问题，请通过以下方式联系我们。</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2 p-4 border rounded-lg">
            <h4 className="font-semibold text-md">购买服务</h4>
            <p className="text-sm text-muted-foreground">点击下方按钮前往淘宝店铺购买秘钥。</p>
            <Button onClick={() => window.open(taobaoLink, "_blank")} className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              购买秘钥
            </Button>
          </div>
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-semibold text-md">联系客服</h4>
            <p className="text-sm text-muted-foreground">工作时间：9:00 - 22:00</p>
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              <Image
                src="/placeholder.svg?width=128&height=128&text=微信客服QR"
                alt="微信客服二维码"
                width={100}
                height={100}
                className="rounded-md border"
              />
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-sm">请扫描二维码添加客服微信，或复制下方微信号添加。</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 p-2 bg-muted rounded-md">
                  <span className="font-mono text-sm">微信号: {wechatId}</span>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Copy className="mr-1 h-3 w-3" />
                    复制
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

SupportModal.defaultProps = {
  isOpen: false,
  onOpenChange: () => {},
}
