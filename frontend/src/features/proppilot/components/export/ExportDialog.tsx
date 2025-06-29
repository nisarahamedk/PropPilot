'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Settings, 
  Eye, 
  Palette, 
  FileText, 
  Package,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  EXPORT_FORMATS, 
  ExportFormat, 
  ExportOptions, 
  BrandingOptions,
  exportService 
} from '../../services/exportService';
import { ConversationState } from '../../types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationState: ConversationState;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  conversationState
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(EXPORT_FORMATS[0]);
  const [includeDrafts, setIncludeDrafts] = useState(true);
  const [includeComments, setIncludeComments] = useState(false);
  const [enableBranding, setEnableBranding] = useState(false);
  const [branding, setBranding] = useState<BrandingOptions>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      const options: ExportOptions = {
        format: selectedFormat,
        includeDrafts,
        includeComments,
        customBranding: enableBranding ? branding : undefined,
      };

      // For immediate download formats (markdown, html), handle client-side
      if (selectedFormat.id === 'markdown') {
        const content = await exportService.exportToMarkdown(conversationState);
        const fileName = `${conversationState.projectContext.projectTitle || 'proposal'}.md`;
        exportService.downloadFile(content, fileName, selectedFormat.mimeType);
        setExportStatus('success');
      } else if (selectedFormat.id === 'html') {
        const content = await exportService.exportToHTML(conversationState, options);
        const fileName = `${conversationState.projectContext.projectTitle || 'proposal'}.html`;
        exportService.downloadFile(content, fileName, selectedFormat.mimeType);
        setExportStatus('success');
      } else {
        // For server-side formats (PDF, DOCX, etc.)
        const result = await exportService.exportProposal(conversationState, options);
        
        if (result.success && result.downloadUrl) {
          // Trigger download
          window.open(result.downloadUrl, '_blank');
          setExportStatus('success');
        } else {
          throw new Error(result.error || 'Export failed');
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBatchExport = async () => {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      const selectedFormats = EXPORT_FORMATS.filter(format => 
        format.id === 'pdf' || format.id === 'docx' || format.id === 'html'
      );

      const options = {
        includeDrafts,
        includeComments,
        customBranding: enableBranding ? branding : undefined,
      };

      const results = await exportService.batchExport(
        conversationState, 
        selectedFormats, 
        options
      );

      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        setExportStatus('success');
        // Open all successful downloads
        results.forEach(result => {
          if (result.success && result.downloadUrl) {
            window.open(result.downloadUrl, '_blank');
          }
        });
      } else {
        throw new Error('All exports failed');
      }
    } catch (error) {
      console.error('Batch export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    const options: ExportOptions = {
      format: selectedFormat,
      includeDrafts,
      includeComments,
      customBranding: enableBranding ? branding : undefined,
    };

    const url = exportService.generateLivePreviewUrl(conversationState, options);
    setPreviewUrl(url);
    window.open(url, '_blank');
  };

  const updateBranding = (field: keyof BrandingOptions, value: string) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Proposal</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="format" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="format">Format & Options</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="format" className="space-y-6">
              {/* Format Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Choose Export Format</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EXPORT_FORMATS.map((format) => (
                    <motion.div
                      key={format.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all ${
                          selectedFormat.id === format.id
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedFormat(format)}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{format.icon}</div>
                          <div className="font-medium text-sm">{format.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format.description}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Export Options</Label>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-drafts">Include Draft Sections</Label>
                    <p className="text-sm text-muted-foreground">
                      Include sections that are still in draft status
                    </p>
                  </div>
                  <Switch
                    id="include-drafts"
                    checked={includeDrafts}
                    onCheckedChange={setIncludeDrafts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-comments">Include Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Include collaboration comments and notes
                    </p>
                  </div>
                  <Switch
                    id="include-comments"
                    checked={includeComments}
                    onCheckedChange={setIncludeComments}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-semibold">Custom Branding</Label>
                  <p className="text-sm text-muted-foreground">
                    Add your company&apos;s branding to the exported document
                  </p>
                </div>
                <Switch
                  checked={enableBranding}
                  onCheckedChange={setEnableBranding}
                />
              </div>

              {enableBranding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={branding.companyName || ''}
                        onChange={(e) => updateBranding('companyName', e.target.value)}
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="logo-url">Logo URL</Label>
                      <Input
                        id="logo-url"
                        value={branding.logo || ''}
                        onChange={(e) => updateBranding('logo', e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={branding.primaryColor || '#3b82f6'}
                          onChange={(e) => updateBranding('primaryColor', e.target.value)}
                          className="w-16"
                        />
                        <Input
                          value={branding.primaryColor || '#3b82f6'}
                          onChange={(e) => updateBranding('primaryColor', e.target.value)}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={branding.secondaryColor || '#64748b'}
                          onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                          className="w-16"
                        />
                        <Input
                          value={branding.secondaryColor || '#64748b'}
                          onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                          placeholder="#64748b"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="font-family">Font Family</Label>
                    <Input
                      id="font-family"
                      value={branding.fontFamily || ''}
                      onChange={(e) => updateBranding('fontFamily', e.target.value)}
                      placeholder="Arial, Helvetica, sans-serif"
                    />
                  </div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="text-center">
                <div className="mb-4">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <p className="text-muted-foreground">
                    Preview your proposal with current settings before exporting
                  </p>
                </div>

                <Button onClick={handlePreview} variant="outline" size="lg">
                  <Eye className="h-4 w-4 mr-2" />
                  Open Live Preview
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center space-x-2">
              <AnimatePresence>
                {exportStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center text-green-600"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-sm">Export successful!</span>
                  </motion.div>
                )}
                {exportStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center text-red-600"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Export failed. Please try again.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleBatchExport}
                disabled={isExporting}
              >
                <Package className="h-4 w-4 mr-2" />
                Batch Export
              </Button>
              
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="min-w-[120px]"
              >
                {isExporting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 mr-2"
                  >
                    <Settings className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
              
              <Button variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;