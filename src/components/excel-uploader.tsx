'use client';

import { useState, DragEvent } from 'react';
import { UploadCloud, FileCheck2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ExcelUploaderProps {
  onFileUpload: (file: File) => void;
  loading: boolean;
  fileName: string | null;
}

export default function ExcelUploader({ onFileUpload, loading, fileName }: ExcelUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (loading) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || files[0].name.endsWith('.xlsx')) {
          onFileUpload(files[0]);
      } else {
          toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a valid .xlsx file.",
          });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;
    const files = e.target.files;
    if (files && files.length > 0) {
        onFileUpload(files[0]);
    }
  };

  const uploaderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-primary">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-lg font-medium">Processing "{fileName}"...</p>
          <p className="text-sm text-muted-foreground">Please wait a moment.</p>
        </div>
      );
    }
    if (fileName) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-green-600">
           <FileCheck2 className="w-12 h-12" />
           <p className="text-lg font-medium">"{fileName}" ready to process.</p>
           <p className="text-sm text-muted-foreground">You can upload another file if you wish.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground group-hover:text-primary transition-colors">
        <UploadCloud className="w-12 h-12" />
        <p className="text-lg font-medium">Drag & drop your Excel file here</p>
        <p className="text-sm">or click to select a file</p>
        <p className="text-xs mt-2">.XLSX files only</p>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative group w-full p-8 border-2 border-dashed rounded-lg text-center transition-colors duration-300',
        'border-border',
        !loading && 'hover:border-primary cursor-pointer',
        isDragging && 'border-primary bg-primary/10'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !loading && document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileChange}
        disabled={loading}
      />
      {uploaderContent()}
    </div>
  );
}
