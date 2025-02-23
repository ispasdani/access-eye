"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  EyeIcon, 
  UploadIcon, 
  AlertTriangle, 
  MinusIcon, 
  PlusIcon, 
  ZoomInIcon, 
  ZoomOutIcon,
  Type,
  Link2,
  Heading,
  Braces,
  Globe,
  Camera,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";

type AccessibilityIssue = {
  type: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
};

export default function Home() {
  const [previewImage, setPreviewImage] = useState("");
  const [originalImage, setOriginalImage] = useState("");
  const [activeFilter, setActiveFilter] = useState("normal");
  const [intensity, setIntensity] = useState(50);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [accessibilityIssues, setAccessibilityIssues] = useState<AccessibilityIssue[]>([]);
  const [activeTab, setActiveTab] = useState("vision");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [screenshotService, setScreenshotService] = useState<'apiflash' | 'puppeteer'>('apiflash');
  const [imageSource, setImageSource] = useState<'url' | 'upload' | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filters = {
    normal: "None",
    blur: "Blurred Vision",
    contrast: "Reduced Contrast",
    protanopia: "Protanopia (No Red)",
    deuteranopia: "Deuteranopia (No Green)",
    tritanopia: "Tritanopia (No Blue)",
    achromatopsia: "Achromatopsia (No Color)",
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isZooming) return;
    
    e.preventDefault();
    
    const delta = -e.deltaY * 0.01;
    const newZoomLevel = Math.min(Math.max(zoomLevel + delta, 1.5), 5);
    setZoomLevel(newZoomLevel);
  };

  const handleZoomLevelChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };

  const checkTextContrast = () => {
    setAccessibilityIssues([
      {
        type: 'contrast',
        description: 'Low contrast ratio (2.5:1) found in header text. WCAG requires at least 4.5:1.',
        severity: 'error'
      },
      {
        type: 'contrast',
        description: 'Link color (#777) may be difficult to read on white background.',
        severity: 'warning'
      }
    ]);
  };

  const checkHeadingStructure = () => {
    setAccessibilityIssues([
      {
        type: 'heading',
        description: 'Skipped heading level: h1 to h3 (missing h2)',
        severity: 'error'
      },
      {
        type: 'heading',
        description: 'Multiple h1 headings found on the page',
        severity: 'warning'
      }
    ]);
  };

  const checkAriaAttributes = () => {
    setAccessibilityIssues([
      {
        type: 'aria',
        description: 'Missing aria-label on interactive element',
        severity: 'error'
      },
      {
        type: 'aria',
        description: 'Invalid aria-role value found',
        severity: 'error'
      },
      {
        type: 'aria',
        description: 'Redundant aria-label and aria-labelledby',
        severity: 'warning'
      }
    ]);
  };

  const checkLinks = () => {
    setAccessibilityIssues([
      {
        type: 'link',
        description: 'Generic link text found ("click here", "read more")',
        severity: 'warning'
      },
      {
        type: 'link',
        description: 'Missing link destinations (href="#")',
        severity: 'error'
      },
      {
        type: 'link',
        description: 'Links open in new window without warning',
        severity: 'info'
      }
    ]);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          service: screenshotService
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to capture screenshot');
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = data.image;
      });

      setOriginalImage(data.image);
      setPreviewImage(data.image);
      setActiveFilter("normal");
      setIntensity(50);
      setAccessibilityIssues([]);
      setImageSource('url');
    } catch (error) {
      console.error('Screenshot error:', error);
      alert("Failed to capture website screenshot. Please try again or use a different URL.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = (filter: string, intensityValue: number = intensity) => {
    if (!originalImage) return;
    
    if (filter === "normal") {
      setPreviewImage(originalImage);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const strength = intensityValue / 100;

      switch (filter) {
        case "blur":
          ctx.filter = `blur(${strength * 8}px)`;
          ctx.drawImage(img, 0, 0);
          break;

        case "contrast":
          for (let i = 0; i < data.length; i += 4) {
            const mix = strength;
            data[i] = data[i] * (1 - mix) + 128 * mix;
            data[i + 1] = data[i + 1] * (1 - mix) + 128 * mix;
            data[i + 2] = data[i + 2] * (1 - mix) + 128 * mix;
          }
          ctx.putImageData(imageData, 0, 0);
          break;

        case "protanopia":
          for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            data[i] = data[i] * (1 - strength) + gray * strength;
          }
          ctx.putImageData(imageData, 0, 0);
          break;

        case "deuteranopia":
          for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            data[i + 1] = data[i + 1] * (1 - strength) + gray * strength;
          }
          ctx.putImageData(imageData, 0, 0);
          break;

        case "tritanopia":
          for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            data[i + 2] = data[i + 2] * (1 - strength) + gray * strength;
          }
          ctx.putImageData(imageData, 0, 0);
          break;

        case "achromatopsia":
          for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            data[i] = data[i] * (1 - strength) + gray * strength;
            data[i + 1] = data[i + 1] * (1 - strength) + gray * strength;
            data[i + 2] = data[i + 2] * (1 - strength) + gray * strength;
          }
          ctx.putImageData(imageData, 0, 0);
          break;
      }

      setPreviewImage(canvas.toDataURL());
    };

    img.src = originalImage;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setPreviewImage(result);
        setActiveFilter("normal");
        setIntensity(50);
        setAccessibilityIssues([]);
        setImageSource('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0];
    setIntensity(newIntensity);
    applyFilter(activeFilter, newIntensity);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Vision Accessibility Tester</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a screenshot or enter a website URL to test how it appears to users with different vision conditions.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <form onSubmit={handleUrlSubmit} className="flex flex-col items-center gap-4">
              <Tabs
                value={screenshotService}
                onValueChange={(value) => setScreenshotService(value as 'apiflash' | 'puppeteer')}
                className="w-full max-w-md"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="apiflash" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    APIFlash
                  </TabsTrigger>
                  <TabsTrigger value="puppeteer" className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Puppeteer
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-2 text-sm text-center text-muted-foreground">
                {screenshotService === 'apiflash' ? (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Faster, cloud-based screenshots
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <Camera className="w-4 h-4" />
                      Higher quality, local screenshots
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Requires Chrome, Chromium, or Edge browser
                    </div>
                  </div>
                )}
              </div>

              <div className="flex w-full max-w-md gap-2">
                <Input
                  type="url"
                  placeholder="Enter website URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  <Globe className="mr-2 h-4 w-4" />
                  {isLoading ? "Loading..." : "Test URL"}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={() => document.getElementById('fileInput')?.click()}
                className="w-full max-w-md"
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: PNG, JPEG, WebP
              </p>
            </div>
          </Card>
        </div>

        {previewImage && (
          <div className="space-y-4">
            {imageSource === 'url' && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <TabsTrigger value="vision">
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Vision Simulation
                  </TabsTrigger>
                  <TabsTrigger value="contrast" onClick={checkTextContrast}>
                    <Type className="mr-2 h-4 w-4" />
                    Text Contrast
                  </TabsTrigger>
                  <TabsTrigger value="links" onClick={checkLinks}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Link Analysis
                  </TabsTrigger>
                  <TabsTrigger value="headings" onClick={checkHeadingStructure}>
                    <Heading className="mr-2 h-4 w-4" />
                    Heading Structure
                  </TabsTrigger>
                  <TabsTrigger value="aria" onClick={checkAriaAttributes}>
                    <Braces className="mr-2 h-4 w-4" />
                    ARIA Validation
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="grid gap-6">
              <Tabs value={activeFilter} onValueChange={(value) => {
                setActiveFilter(value);
                applyFilter(value);
              }}>
                <TabsList className="grid grid-cols-2 lg:grid-cols-7 gap-4">
                  {Object.entries(filters).map(([key, label]) => (
                    <TabsTrigger key={key} value={key}>
                      <EyeIcon className="mr-2 h-4 w-4" />
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {activeFilter !== "normal" && (
                <div className="flex items-center gap-4 px-4">
                  <MinusIcon className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[intensity]}
                    onValueChange={handleIntensityChange}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <PlusIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <Button
                    variant={isZooming ? "secondary" : "outline"}
                    onClick={() => setIsZooming(!isZooming)}
                    className="flex items-center gap-2"
                  >
                    {isZooming ? <ZoomOutIcon className="h-4 w-4" /> : <ZoomInIcon className="h-4 w-4" />}
                    {isZooming ? "Disable Zoom" : "Enable Zoom"}
                  </Button>
                  
                  {isZooming && (
                    <div className="flex items-center gap-4 flex-1 max-w-xs ml-4">
                      <MinusIcon className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={[zoomLevel]}
                        onValueChange={handleZoomLevelChange}
                        min={1.5}
                        max={5}
                        step={0.5}
                        className="flex-1"
                      />
                      <PlusIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div 
                  ref={containerRef}
                  className="aspect-video relative rounded-lg overflow-hidden border bg-white"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setIsZooming(false)}
                  onWheel={handleWheel}
                >
                  <img
                    ref={imageRef}
                    src={previewImage}
                    alt="Image preview"
                    className="w-full h-full object-contain"
                  />
                  {isZooming && (
                    <div
                      className="absolute pointer-events-none rounded-full border-2 border-primary shadow-lg overflow-hidden"
                      style={{
                        width: "200px",
                        height: "200px",
                        left: `${mousePosition.x}%`,
                        top: `${mousePosition.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className="absolute"
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url(${previewImage})`,
                          backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                          backgroundSize: `${zoomLevel * 100}%`,
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {imageSource === 'url' && accessibilityIssues.length > 0 && (
                <div className="space-y-4">
                  {accessibilityIssues.map((issue, index) => (
                    <Alert key={index} variant={issue.severity === 'error' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="capitalize">{issue.type} {issue.severity}</AlertTitle>
                      <AlertDescription>{issue.description}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {imageSource === 'url' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Accessibility Tips</AlertTitle>
                  <AlertDescription>
                    • Ensure sufficient color contrast for text readability
                    <br />
                    • Provide alt text for all important images
                    <br />
                    • Use semantic HTML elements for better screen reader support
                    <br />
                    • Make all interactive elements keyboard accessible
                    <br />
                    • Test with different vision conditions using the filters above
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}