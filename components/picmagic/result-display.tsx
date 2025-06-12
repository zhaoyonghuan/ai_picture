"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ImageIcon, AlertTriangle, RotateCcw, Loader2 } from "lucide-react"
import NextImage from "next/image" // Renamed to avoid conflict with Lucide's Image

interface ResultDisplayProps {
  status: "idle" | "loading" | "success" | "error"
  imageUrl?: string | null
  errorMessage?: string | null
  onRetry?: () => void
  onDownload?: () => void
}

export function ResultDisplay({ status, imageUrl, errorMessage, onRetry, onDownload }: ResultDisplayProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>生成结果</CardTitle>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">预览效果</span>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center p-6">
        {status === "idle" && (
          <div className="space-y-2 text-muted-foreground">
            <ImageIcon className="mx-auto h-16 w-16" />
            <p className="font-medium">您的生成结果将显示在这里</p>
            <p className="text-sm">上传图片并选择风格后开始</p>
          </div>
        )}
        {status === "loading" && (
          <div className="space-y-2">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            <p className="font-medium">正在生成中，请稍候...</p>
          </div>
        )}
        {status === "success" && imageUrl && (
          <div className="space-y-4 w-full">
            <div className="relative aspect-square max-w-md mx-auto border rounded-lg overflow-hidden">
              <NextImage src={imageUrl} alt="生成的图片" layout="fill" objectFit="contain" />
            </div>
            <Button onClick={onDownload} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              下载图片
            </Button>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4 text-red-500">
            <AlertTriangle className="mx-auto h-16 w-16" />
            <p className="font-medium">生成失败</p>
            <p className="text-sm">{errorMessage || "发生未知错误，请稍后重试。"}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                重试
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

ResultDisplay.defaultProps = {
  status: "idle",
  imageUrl: null,
  errorMessage: null,
  onRetry: () => {},
  onDownload: () => {},
}
