"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ImageIcon, AlertTriangle, RotateCcw, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import NextImage from "next/image" // Renamed to avoid conflict with Lucide's Image
import { useState } from "react"

interface ResultDisplayProps {
  status: "idle" | "loading" | "success" | "error"
  imageUrl?: string | null
  imageUrls?: string[] // 新增：支持多张图片
  errorMessage?: string | null
  onRetry?: () => void
  onDownload?: () => void
}

export function ResultDisplay({ status, imageUrl, imageUrls, errorMessage, onRetry, onDownload }: ResultDisplayProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 确定要显示的图片数组
  const displayImages = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
  const currentImage = displayImages[currentImageIndex];
  const hasMultipleImages = displayImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const downloadCurrentImage = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `stylized-image-${currentImageIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>生成结果</CardTitle>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {hasMultipleImages ? `图片 ${currentImageIndex + 1}/${displayImages.length}` : "预览效果"}
        </span>
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
        {status === "success" && currentImage && (
          <div className="space-y-4 w-full">
            <div className="relative aspect-square max-w-md mx-auto border rounded-lg overflow-hidden">
              <NextImage src={currentImage} alt={`生成的图片 ${currentImageIndex + 1}`} layout="fill" objectFit="contain" />
              
              {/* 多图片导航按钮 */}
              {hasMultipleImages && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {/* 图片缩略图指示器 */}
            {hasMultipleImages && (
              <div className="flex justify-center space-x-2">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={downloadCurrentImage} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                下载当前图片
              </Button>
              {hasMultipleImages && (
                <Button onClick={onDownload} variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
                  下载所有图片
            </Button>
              )}
            </div>
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
  imageUrls: [],
  errorMessage: null,
  onRetry: () => {},
  onDownload: () => {},
}
