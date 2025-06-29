'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EXPORT_FORMATS, exportService } from '../../services/exportService';
import { ConversationState } from '../../types';
import ExportDialog from './ExportDialog';

interface ExportButtonProps {
  conversationState: ConversationState;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showDropdown?: boolean;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  conversationState,
  variant = 'default',
  size = 'default',
  showDropdown = true,
  className = '',
}) => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleQuickExport = async (formatId: string) => {
    setIsExporting(true);
    
    try {
      const format = EXPORT_FORMATS.find(f => f.id === formatId);
      if (!format) return;

      const options = {
        format,
        includeDrafts: true,
        includeComments: false,
      };

      if (formatId === 'markdown') {
        const content = await exportService.exportToMarkdown(conversationState);
        const fileName = `${conversationState.projectContext.projectTitle || 'proposal'}.md`;
        exportService.downloadFile(content, fileName, format.mimeType);
      } else if (formatId === 'html') {
        const content = await exportService.exportToHTML(conversationState, options);
        const fileName = `${conversationState.projectContext.projectTitle || 'proposal'}.html`;
        exportService.downloadFile(content, fileName, format.mimeType);
      } else {
        // Open dialog for more complex exports
        setShowExportDialog(true);
      }
    } catch (error) {
      console.error('Quick export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const hasContent = Object.values(conversationState.proposalSections).some(
    section => section.content.trim().length > 0
  );

  if (!hasContent) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={`opacity-50 ${className}`}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    );
  }

  if (!showDropdown) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          onClick={() => setShowExportDialog(true)}
          disabled={isExporting}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          conversationState={conversationState}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isExporting}
            className={`${className} ${isExporting ? 'pointer-events-none' : ''}`}
          >
            {isExporting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 mr-2"
              >
                <Download className="h-4 w-4" />
              </motion.div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
            Quick Export
          </div>
          
          {EXPORT_FORMATS.slice(0, 3).map((format) => (
            <DropdownMenuItem
              key={format.id}
              onClick={() => handleQuickExport(format.id)}
              className="flex items-center"
            >
              <span className="mr-2">{format.icon}</span>
              <div>
                <div className="font-medium">{format.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format.description}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setShowExportDialog(true)}
            className="flex items-center font-medium"
          >
            <span className="mr-2">⚙️</span>
            Advanced Export Options
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        conversationState={conversationState}
      />
    </>
  );
};

export default ExportButton;