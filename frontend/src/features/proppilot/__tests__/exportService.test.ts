import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { exportService, EXPORT_FORMATS } from '../services/exportService';
import { ConversationState } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

const mockConversationState: ConversationState = {
  id: 'test-conversation',
  messages: [
    {
      id: 'msg-1',
      content: 'Test message 1',
      role: 'user',
      timestamp: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'msg-2',
      content: 'Test message 2',
      role: 'assistant',
      timestamp: new Date('2024-01-01T00:01:00Z'),
    },
  ],
  projectContext: {
    clientName: 'Test Client Corp',
    projectTitle: 'Test Project Proposal',
    industry: 'Technology',
    budget: '$50,000',
    timeline: '3 months',
    requirements: ['Requirement 1', 'Requirement 2', 'Requirement 3'],
    objectives: ['Objective 1', 'Objective 2'],
    constraints: ['Budget constraint', 'Time constraint'],
    readinessScore: 85,
  },
  proposalSections: {
    'executive_summary': {
      id: 'executive_summary',
      title: 'Executive Summary',
      content: 'This is the executive summary content with detailed information about the project.',
      status: 'complete',
      lastUpdated: new Date('2024-01-01T00:00:00Z'),
      wordCount: 150,
      completionPercentage: 100,
    },
    'project_overview': {
      id: 'project_overview',
      title: 'Project Overview',
      content: 'This is the project overview content describing the scope and objectives.',
      status: 'complete',
      lastUpdated: new Date('2024-01-01T00:01:00Z'),
      wordCount: 200,
      completionPercentage: 100,
    },
    'scope_deliverables': {
      id: 'scope_deliverables',
      title: 'Scope & Deliverables',
      content: 'Draft content for scope and deliverables section.',
      status: 'draft',
      lastUpdated: new Date('2024-01-01T00:02:00Z'),
      wordCount: 75,
      completionPercentage: 60,
    },
  },
  generationState: {
    isGenerating: false,
    currentPhase: 'complete',
    progress: 100,
  },
  viewState: {
    showPreview: true,
    layout: 'split-view',
    isMobile: false,
  },
  persistence: {
    lastSaved: new Date('2024-01-01T00:00:00Z'),
    isDirty: false,
    autoSaveEnabled: true,
    version: 1,
  },
  metadata: {
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:01:00Z'),
    conversationTitle: 'Test Conversation',
    tags: ['technology', 'proposal'],
  },
};

describe('ExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    
    // Mock the exportService to use the test environment
    Object.defineProperty(exportService, 'apiUrl', {
      get: () => 'http://localhost:3000',
      configurable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Export Formats', () => {
    it('should have all required export formats', () => {
      expect(EXPORT_FORMATS).toHaveLength(5);
      
      const formatIds = EXPORT_FORMATS.map(f => f.id);
      expect(formatIds).toContain('pdf');
      expect(formatIds).toContain('docx');
      expect(formatIds).toContain('html');
      expect(formatIds).toContain('markdown');
      expect(formatIds).toContain('json');
    });

    it('should have proper format structure', () => {
      EXPORT_FORMATS.forEach(format => {
        expect(format).toHaveProperty('id');
        expect(format).toHaveProperty('name');
        expect(format).toHaveProperty('extension');
        expect(format).toHaveProperty('mimeType');
        expect(format).toHaveProperty('icon');
        expect(format).toHaveProperty('description');
        
        expect(typeof format.id).toBe('string');
        expect(typeof format.name).toBe('string');
        expect(typeof format.extension).toBe('string');
        expect(typeof format.mimeType).toBe('string');
        expect(typeof format.icon).toBe('string');
        expect(typeof format.description).toBe('string');
      });
    });
  });

  describe('Server-side Export', () => {
    it('should successfully export to PDF', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          downloadUrl: 'http://localhost:3000/downloads/proposal.pdf',
          fileName: 'proposal.pdf',
        }),
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const pdfFormat = EXPORT_FORMATS.find(f => f.id === 'pdf')!;
      const result = await exportService.exportProposal(mockConversationState, {
        format: pdfFormat,
        includeDrafts: true,
        includeComments: false,
      });

      expect(result.success).toBe(true);
      expect(result.downloadUrl).toBe('http://localhost:3000/downloads/proposal.pdf');
      expect(result.fileName).toBe('proposal.pdf');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/export',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle export failures', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Internal Server Error',
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const pdfFormat = EXPORT_FORMATS.find(f => f.id === 'pdf')!;
      const result = await exportService.exportProposal(mockConversationState, {
        format: pdfFormat,
        includeDrafts: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Export failed: Internal Server Error');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const pdfFormat = EXPORT_FORMATS.find(f => f.id === 'pdf')!;
      const result = await exportService.exportProposal(mockConversationState, {
        format: pdfFormat,
        includeDrafts: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('Batch Export', () => {
    it('should export multiple formats successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          downloadUrl: 'http://localhost:3000/downloads/proposal.pdf',
          fileName: 'proposal.pdf',
        }),
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const formats = [
        EXPORT_FORMATS.find(f => f.id === 'pdf')!,
        EXPORT_FORMATS.find(f => f.id === 'docx')!,
      ];

      const results = await exportService.batchExport(mockConversationState, formats, {
        includeDrafts: true,
        includeComments: false,
      });

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in batch export', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ downloadUrl: 'test.pdf', fileName: 'test.pdf' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: 'Server Error',
        });

      const formats = [
        EXPORT_FORMATS.find(f => f.id === 'pdf')!,
        EXPORT_FORMATS.find(f => f.id === 'docx')!,
      ];

      const results = await exportService.batchExport(mockConversationState, formats, {
        includeDrafts: true,
      });

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('Client-side Export', () => {
    describe('Markdown Export', () => {
      it('should generate proper markdown format', async () => {
        const markdown = await exportService.exportToMarkdown(mockConversationState);

        expect(markdown).toContain('# Test Project Proposal');
        expect(markdown).toContain('**Client:** Test Client Corp');
        expect(markdown).toContain('**Industry:** Technology');
        expect(markdown).toContain('## Executive Summary');
        expect(markdown).toContain('## Project Overview');
        expect(markdown).toContain('## Scope & Deliverables');
        expect(markdown).toContain('This is the executive summary content');
        expect(markdown).toContain('*Status: Draft (60% complete)*');
      });

      it('should handle empty project context gracefully', async () => {
        const emptyState = {
          ...mockConversationState,
          projectContext: {
            ...mockConversationState.projectContext,
            clientName: undefined,
            projectTitle: undefined,
            industry: undefined,
          },
        };

        const markdown = await exportService.exportToMarkdown(emptyState);

        expect(markdown).toContain('# Proposal');
        expect(markdown).not.toContain('**Client:**');
        expect(markdown).not.toContain('**Industry:**');
      });
    });

    describe('HTML Export', () => {
      it('should generate proper HTML format', async () => {
        const html = await exportService.exportToHTML(mockConversationState, {
          format: EXPORT_FORMATS.find(f => f.id === 'html')!,
          includeDrafts: true,
          customBranding: {
            companyName: 'Test Company',
            primaryColor: '#3b82f6',
            secondaryColor: '#64748b',
            fontFamily: 'Arial, sans-serif',
          },
        });

        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('<title>Test Project Proposal</title>');
        expect(html).toContain('--primary-color: #3b82f6');
        expect(html).toContain('--secondary-color: #64748b');
        expect(html).toContain('--font-family: Arial, sans-serif');
        expect(html).toContain('<h1>Test Project Proposal</h1>');
        expect(html).toContain('Test Company');
        expect(html).toContain('Test Client Corp');
        expect(html).toContain('Technology');
        expect(html).toContain('Executive Summary');
        expect(html).toContain('This is the executive summary content');
        expect(html).toContain('Draft 60%');
      });

      it('should work without custom branding', async () => {
        const html = await exportService.exportToHTML(mockConversationState, {
          format: EXPORT_FORMATS.find(f => f.id === 'html')!,
          includeDrafts: true,
        });

        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('--primary-color: #3b82f6'); // Default colors
        expect(html).not.toContain('Test Company');
      });

      it('should include logo when provided', async () => {
        const html = await exportService.exportToHTML(mockConversationState, {
          format: EXPORT_FORMATS.find(f => f.id === 'html')!,
          customBranding: {
            logo: 'https://example.com/logo.png',
          },
        });

        expect(html).toContain('<img src="https://example.com/logo.png"');
        expect(html).toContain('alt="Logo"');
      });
    });
  });

  describe('Live Preview URL Generation', () => {
    it('should generate valid preview URL', () => {
      const htmlFormat = EXPORT_FORMATS.find(f => f.id === 'html')!;
      const url = exportService.generateLivePreviewUrl(mockConversationState, {
        format: htmlFormat,
        includeDrafts: true,
      });

      expect(url).toContain('/api/preview?data=');
      expect(url).toContain('&format=html');
      
      // URL should contain encoded data
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const encodedData = urlParams.get('data');
      expect(encodedData).toBeTruthy();
      
      // Should be able to decode the data
      const decodedData = JSON.parse(decodeURIComponent(encodedData!));
      expect(decodedData.metadata.title).toBe('Test Project Proposal');
      expect(decodedData.sections).toHaveLength(3);
    });
  });

  describe('Data Preparation', () => {
    it('should filter out drafts when includeDrafts is false', () => {
      const htmlFormat = EXPORT_FORMATS.find(f => f.id === 'html')!;
      const url = exportService.generateLivePreviewUrl(mockConversationState, {
        format: htmlFormat,
        includeDrafts: false,
      });

      const urlParams = new URLSearchParams(url.split('?')[1]);
      const encodedData = urlParams.get('data');
      const decodedData = JSON.parse(decodeURIComponent(encodedData!));
      
      // Should only include complete sections
      expect(decodedData.sections).toHaveLength(2);
      expect(decodedData.sections.every((s: any) => s.status === 'complete')).toBe(true);
    });

    it('should sort sections in standard proposal order', () => {
      const htmlFormat = EXPORT_FORMATS.find(f => f.id === 'html')!;
      const url = exportService.generateLivePreviewUrl(mockConversationState, {
        format: htmlFormat,
        includeDrafts: true,
      });

      const urlParams = new URLSearchParams(url.split('?')[1]);
      const encodedData = urlParams.get('data');
      const decodedData = JSON.parse(decodeURIComponent(encodedData!));
      
      expect(decodedData.sections[0].id).toBe('executive_summary');
      expect(decodedData.sections[1].id).toBe('project_overview');
      expect(decodedData.sections[2].id).toBe('scope_deliverables');
    });

    it('should include proper metadata', () => {
      const htmlFormat = EXPORT_FORMATS.find(f => f.id === 'html')!;
      const url = exportService.generateLivePreviewUrl(mockConversationState, {
        format: htmlFormat,
        includeDrafts: true,
      });

      const urlParams = new URLSearchParams(url.split('?')[1]);
      const encodedData = urlParams.get('data');
      const decodedData = JSON.parse(decodeURIComponent(encodedData!));
      
      expect(decodedData.metadata).toMatchObject({
        title: 'Test Project Proposal',
        clientName: 'Test Client Corp',
        industry: 'Technology',
        version: 1,
      });
      expect(decodedData.projectContext).toBeDefined();
      expect(decodedData.exportedAt).toBeDefined();
    });
  });

  describe('File Download', () => {
    let mockLink: HTMLAnchorElement;
    let mockURL: typeof URL;

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      } as any;

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

      mockURL = {
        createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: jest.fn(),
      } as any;

      global.URL = mockURL;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create download link and trigger download', () => {
      const content = 'Test file content';
      const fileName = 'test-file.txt';
      const mimeType = 'text/plain';

      exportService.downloadFile(content, fileName, mimeType);

      expect(mockURL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: mimeType,
        })
      );
      expect(mockLink.download).toBe(fileName);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});