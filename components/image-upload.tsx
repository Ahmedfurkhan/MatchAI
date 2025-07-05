"use client"

import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Upload, X, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  currentImage?: string
  onImageUpload: (file: File) => Promise<void>
  uploading?: boolean
  className?: string
}

export function ImageUpload({ currentImage, onImageUpload, uploading = false, className = "" }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    onImageUpload(file)
  }, [onImageUpload, toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver 
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' 
            : 'border-border hover:border-purple-300 dark:hover:border-purple-700'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm text-muted-foreground">Uploading image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {currentImage ? (
                <div className="relative">
                  <img
                    src={currentImage}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-border"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full bg-background border-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {currentImage ? "Change Profile Picture" : "Upload Profile Picture"}
              </p>
              <p className="text-xs text-muted-foreground">
                Drag and drop an image here, or click to browse
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Choose Image
            </Button>
          </div>
        )}
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
} 