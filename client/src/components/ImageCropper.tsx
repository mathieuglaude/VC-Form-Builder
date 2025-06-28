import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCw, Save, X } from "lucide-react";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
}

export default function ImageCropper({ isOpen, onClose, imageSrc, onCrop }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const cropSize = 200; // Size of the crop area
  const canvasSize = 300; // Size of the canvas display

  useEffect(() => {
    if (imageSrc && isOpen) {
      const img = new Image();
      img.onload = () => {
        if (imageRef.current) {
          imageRef.current.src = img.src;
          setImageLoaded(true);
          
          // Auto-fit the image to the crop area
          const minScale = Math.max(cropSize / img.width, cropSize / img.height);
          setScale(minScale);
          setPosition({ x: 0, y: 0 });
        }
      };
      img.src = imageSrc;
    }
  }, [imageSrc, isOpen]);

  useEffect(() => {
    if (imageLoaded && imageRef.current && canvasRef.current) {
      drawCanvas();
    }
  }, [scale, position, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Save context for clipping
    ctx.save();

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, cropSize / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Calculate image position and size
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (canvasSize - scaledWidth) / 2 + position.x;
    const y = (canvasSize - scaledHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

    // Restore context
    ctx.restore();

    // Draw crop circle outline
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, cropSize / 2, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw overlay outside crop area
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Cut out the circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, cropSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (value: number[]) => {
    setScale(value[0]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Create a new canvas for the final crop
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Calculate the crop area
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (canvasSize - scaledWidth) / 2 + position.x;
    const y = (canvasSize - scaledHeight) / 2 + position.y;

    // Draw the cropped image
    cropCtx.drawImage(
      image,
      0, 0, image.width, image.height,
      x - (canvasSize - cropSize) / 2, y - (canvasSize - cropSize) / 2, scaledWidth, scaledHeight
    );

    // Convert to base64
    const croppedImage = cropCanvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Canvas for image cropping */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                className="border border-gray-200 cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <img
                ref={imageRef}
                className="hidden"
                alt="Crop preview"
              />
            </div>
          </div>

          {/* Zoom controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ZoomOut className="w-4 h-4" />
              <Slider
                value={[scale]}
                onValueChange={handleZoom}
                min={0.1}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Drag to reposition • Use slider to zoom
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}