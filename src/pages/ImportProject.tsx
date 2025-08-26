import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Folder, Check, X, AlertCircle, FolderOpen, FileCode2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFileSystem, type FileNode } from '@/components/layout/FileSystem';

interface ProjectFile {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  children?: ProjectFile[];
}

const detectedInfo = {
  projectType: 'React TypeScript',
  framework: 'Vite',
  language: 'TypeScript',
  dependencies: 23,
  testFiles: 8,
  configFiles: 5
};

export function ImportProject() {
  const { root, loadZip, openFiles } = useFileSystem();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(file => file.type === 'application/zip' || file.name.endsWith('.zip'));
    
    if (zipFile) {
      await handleFileUpload(zipFile);
    } else {
      setUploadStatus('error');
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
    // Reset input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      setUploadedFileName(file.name);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Load the zip file
      await loadZip(file);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadStatus('processing');
        setTimeout(() => {
          setUploadStatus('complete');
        }, 1500);
      }, 500);

    } catch (error) {
      console.error('Error loading zip:', error);
      setUploadStatus('error');
    }
  };

  const renderFileTree = (node: FileNode, depth = 0) => {
    return (
      <div key={node.path} className={`${depth > 0 ? 'ml-4' : ''}`}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: depth * 0.05 }}
          className="flex items-center gap-2 py-1 hover:bg-muted/30 rounded px-2 transition-colors cursor-pointer"
          onClick={() => node.type === 'file' && openFiles.includes(node.path)}
        >
          {node.type === 'folder' ? (
            <FolderOpen className="w-4 h-4 text-blue-500" />
          ) : (
            <FileCode2 className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm">{node.name}</span>
          {node.type === 'file' && openFiles.includes(node.path) && (
            <Badge variant="outline" className="ml-auto text-xs">
              Open
            </Badge>
          )}
        </motion.div>
        {node.children && node.children.map(child => renderFileTree(child, depth + 1))}
      </div>
    );
  };

  const getProjectStats = () => {
    if (!root) return { files: 0, folders: 0, totalSize: '0 KB' };
    
    let files = 0;
    let folders = 0;
    
    const countNodes = (node: FileNode) => {
      if (node.type === 'file') {
        files++;
      } else {
        folders++;
        node.children?.forEach(countNodes);
      }
    };
    
    root.children?.forEach(countNodes);
    
    return { files, folders, totalSize: `${files + folders} items` };
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Import Project</h1>
        <p className="text-muted-foreground">
          Upload your project ZIP file to start the automated analysis and healing process
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card className="card-dark">
            <CardHeader>
              <CardTitle>Upload Project</CardTitle>
              <CardDescription>
                Drag and drop your project ZIP file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/20'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploadStatus === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium">Drop your project ZIP here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports ZIP files up to 100MB
                      </p>
                    </div>
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      Choose ZIP File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip,application/zip"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </motion.div>
                )}

                {uploadStatus === 'uploading' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-center">
                      <div className="p-4 bg-blue-500/10 rounded-full">
                        <Upload className="w-8 h-8 text-blue-500 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium">Uploading {uploadedFileName}...</p>
                      <Progress value={uploadProgress} className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {uploadProgress}% complete
                      </p>
                    </div>
                  </motion.div>
                )}

                {uploadStatus === 'processing' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-center">
                      <div className="p-4 bg-yellow-500/10 rounded-full">
                        <AlertCircle className="w-8 h-8 text-yellow-500 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium">Processing project...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Analyzing structure and extracting files
                      </p>
                    </div>
                  </motion.div>
                )}

                {uploadStatus === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-center">
                      <div className="p-4 bg-green-500/10 rounded-full">
                        <Check className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium">Upload Complete!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Project successfully imported and ready for analysis
                      </p>
                    </div>
                    <Button
                      onClick={() => setUploadStatus('idle')}
                      variant="outline"
                    >
                      Import Another Project
                    </Button>
                  </motion.div>
                )}

                {uploadStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-center">
                      <div className="p-4 bg-red-500/10 rounded-full">
                        <X className="w-8 h-8 text-red-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium">Upload Failed</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please ensure you're uploading a valid ZIP file
                      </p>
                    </div>
                    <Button
                      onClick={() => setUploadStatus('idle')}
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Analysis */}
        <div className="space-y-6">
          {uploadStatus === 'complete' && root && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="card-dark">
                  <CardHeader>
                    <CardTitle>Project Structure</CardTitle>
                    <CardDescription>
                      Your project files and folders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-80 overflow-y-auto scrollbar-hide">
                      {root.children?.map(node => renderFileTree(node))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="card-dark">
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                    <CardDescription>
                      Automatically detected project details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Files</p>
                        <Badge variant="secondary" className="mt-1">
                          {getProjectStats().files}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Folders</p>
                        <Badge variant="secondary" className="mt-1">
                          {getProjectStats().folders}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Open Files</p>
                        <Badge variant="secondary" className="mt-1">
                          {openFiles.length}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                        <Badge variant="secondary" className="mt-1">
                          {getProjectStats().totalSize}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border space-y-3">
                      <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                        Start Analysis
                      </Button>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Use the Explorer panel to navigate and open files
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                          <ExternalLink className="w-3 h-3" />
                          Files are now available in the left sidebar
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {!root && uploadStatus === 'idle' && (
            <Card className="card-dark">
              <CardHeader>
                <CardTitle>No Project Loaded</CardTitle>
                <CardDescription>
                  Upload a ZIP file to see project analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your project structure will appear here after upload</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}