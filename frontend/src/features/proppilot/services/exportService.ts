import { ConversationState, ProposalSection } from '../types';

export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  icon: string;
  description: string;
}

export interface ExportOptions {
  format: ExportFormat;
  includeComments?: boolean;
  includeDrafts?: boolean;
  customBranding?: BrandingOptions;
  template?: string;
}

export interface BrandingOptions {
  companyName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  headerTemplate?: string;
  footerTemplate?: string;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'pdf',
    name: 'PDF Document',
    extension: 'pdf',
    mimeType: 'application/pdf',
    icon: '📄',
    description: 'Professional PDF with custom branding'
  },
  {
    id: 'docx',
    name: 'Word Document',
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    icon: '📝',
    description: 'Editable Microsoft Word document'
  },
  {
    id: 'html',
    name: 'Web Page',
    extension: 'html',
    mimeType: 'text/html',
    icon: '🌐',
    description: 'Interactive web page with live preview'
  },
  {
    id: 'markdown',
    name: 'Markdown',
    extension: 'md',
    mimeType: 'text/markdown',
    icon: '📋',
    description: 'Plain text format for version control'
  },
  {
    id: 'json',
    name: 'JSON Data',
    extension: 'json',
    mimeType: 'application/json',
    icon: '📊',
    description: 'Structured data for API integration'
  }
];

class ExportService {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL;

  async exportProposal(
    conversationState: ConversationState,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const exportData = this.prepareExportData(conversationState, options);
      
      const response = await fetch(`${this.apiUrl}/api/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: exportData,
          options: options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        downloadUrl: result.downloadUrl,
        fileName: result.fileName,
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown export error',
      };
    }
  }

  async batchExport(
    conversationState: ConversationState,
    formats: ExportFormat[],
    options: Omit<ExportOptions, 'format'>
  ): Promise<ExportResult[]> {
    const results = await Promise.all(
      formats.map(format =>
        this.exportProposal(conversationState, { ...options, format })
      )
    );
    return results;
  }

  generateLivePreviewUrl(
    conversationState: ConversationState,
    options: ExportOptions
  ): string {
    const previewData = this.prepareExportData(conversationState, options);
    const encodedData = encodeURIComponent(JSON.stringify(previewData));
    return `/api/preview?data=${encodedData}&format=${options.format.id}`;
  }

  private prepareExportData(
    conversationState: ConversationState,
    options: ExportOptions
  ) {
    const sections = Object.values(conversationState.proposalSections)
      .filter(section => {
        if (!options.includeDrafts && section.status === 'draft') {
          return false;
        }
        return section.content.trim().length > 0;
      })
      .sort((a, b) => {
        // Sort by standard proposal order
        const order = [
          'executive_summary',
          'project_overview',
          'scope_deliverables',
          'timeline_milestones',
          'budget_pricing',
          'team_expertise',
          'next_steps'
        ];
        return order.indexOf(a.id) - order.indexOf(b.id);
      });

    return {
      metadata: {
        title: conversationState.projectContext.projectTitle || 'Proposal',
        clientName: conversationState.projectContext.clientName,
        industry: conversationState.projectContext.industry,
        createdAt: conversationState.metadata.createdAt,
        updatedAt: conversationState.metadata.updatedAt,
        version: conversationState.persistence.version,
      },
      projectContext: conversationState.projectContext,
      sections: sections,
      branding: options.customBranding,
      exportedAt: new Date().toISOString(),
    };
  }

  // Client-side export methods for immediate download
  async exportToMarkdown(conversationState: ConversationState): Promise<string> {
    const data = this.prepareExportData(conversationState, {
      format: EXPORT_FORMATS.find(f => f.id === 'markdown')!,
      includeDrafts: true,
    });

    let markdown = `# ${data.metadata.title}\n\n`;
    
    if (data.metadata.clientName) {
      markdown += `**Client:** ${data.metadata.clientName}\n\n`;
    }
    
    if (data.metadata.industry) {
      markdown += `**Industry:** ${data.metadata.industry}\n\n`;
    }

    markdown += `**Generated:** ${new Date(data.exportedAt).toLocaleDateString()}\n\n`;
    markdown += '---\n\n';

    data.sections.forEach((section: ProposalSection) => {
      markdown += `## ${section.title}\n\n`;
      markdown += `${section.content}\n\n`;
      
      if (section.status === 'draft') {
        markdown += `*Status: Draft (${section.completionPercentage}% complete)*\n\n`;
      }
    });

    return markdown;
  }

  async exportToHTML(
    conversationState: ConversationState,
    options: ExportOptions
  ): Promise<string> {
    const data = this.prepareExportData(conversationState, options);
    const branding = options.customBranding || {};

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.metadata.title}</title>
    <style>
        :root {
            --primary-color: ${branding.primaryColor || '#3b82f6'};
            --secondary-color: ${branding.secondaryColor || '#64748b'};
            --font-family: ${branding.fontFamily || 'system-ui, -apple-system, sans-serif'};
        }
        
        body {
            font-family: var(--font-family);
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #fff;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid var(--primary-color);
        }
        
        .header h1 {
            color: var(--primary-color);
            margin: 0;
            font-size: 2.5rem;
        }
        
        .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .metadata-item {
            text-align: center;
        }
        
        .metadata-label {
            font-weight: 600;
            color: var(--secondary-color);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .metadata-value {
            font-size: 1.125rem;
            color: #111827;
        }
        
        .section {
            margin-bottom: 3rem;
            padding: 2rem;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #fff;
        }
        
        .section-title {
            color: var(--primary-color);
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .section-content {
            white-space: pre-wrap;
            line-height: 1.7;
        }
        
        .draft-indicator {
            display: inline-block;
            background: #fbbf24;
            color: #92400e;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 1rem;
        }
        
        .footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
            color: var(--secondary-color);
            font-size: 0.875rem;
        }
        
        @media print {
            body { margin: 0; padding: 1rem; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        ${branding.logo ? `<img src="${branding.logo}" alt="Logo" style="max-height: 60px; margin-bottom: 1rem;">` : ''}
        <h1>${data.metadata.title}</h1>
        ${branding.companyName ? `<p style="color: var(--secondary-color); margin: 0.5rem 0 0 0;">${branding.companyName}</p>` : ''}
    </div>
    
    <div class="metadata">
        ${data.metadata.clientName ? `
            <div class="metadata-item">
                <div class="metadata-label">Client</div>
                <div class="metadata-value">${data.metadata.clientName}</div>
            </div>
        ` : ''}
        ${data.metadata.industry ? `
            <div class="metadata-item">
                <div class="metadata-label">Industry</div>
                <div class="metadata-value">${data.metadata.industry}</div>
            </div>
        ` : ''}
        <div class="metadata-item">
            <div class="metadata-label">Generated</div>
            <div class="metadata-value">${new Date(data.exportedAt).toLocaleDateString()}</div>
        </div>
    </div>
    
    ${data.sections.map((section: ProposalSection) => `
        <div class="section">
            <h2 class="section-title">
                ${section.title}
                ${section.status === 'draft' ? `<span class="draft-indicator">Draft ${section.completionPercentage}%</span>` : ''}
            </h2>
            <div class="section-content">${section.content}</div>
        </div>
    `).join('')}
    
    <div class="footer">
        <p>Generated by PropPilot on ${new Date(data.exportedAt).toLocaleString()}</p>
        ${branding.footerTemplate || ''}
    </div>
</body>
</html>`;
  }

  downloadFile(content: string, fileName: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();