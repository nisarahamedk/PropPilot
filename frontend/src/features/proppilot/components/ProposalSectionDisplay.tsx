'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Already added
import { Textarea } from '@/components/ui/textarea'; // To be added

interface ProposalSection {
  id: string;
  title: string;
  content: string;
}

const initialSections: ProposalSection[] = [
  {
    id: 'exec-summary',
    title: 'Executive Summary',
    content:
      'PropPilot offers an innovative AI-powered solution to streamline proposal generation, significantly reducing manual effort and improving compliance. Our platform leverages advanced NLP to extract requirements and generate tailored content, ensuring high-quality, winning proposals.',
  },
  {
    id: 'understanding-reqs',
    title: 'Understanding of Requirements',
    content:
      'We understand that the client requires a robust system for managing internal communications. This includes features such as real-time messaging, file sharing, and task management, all within a secure and user-friendly environment. Our proposed solution directly addresses these needs by providing a comprehensive suite of tools designed for effective team collaboration.',
  },
  {
    id: 'proposed-solution',
    title: 'Proposed Solution',
    content:
      'Our solution, "TeamConnect Hub", offers a centralized platform for all internal communications. Key features include: \n- Secure, end-to-end encrypted messaging channels. \n- Version-controlled file repository with granular access controls. \n- Integrated task management with progress tracking and notifications. \n- Customizable dashboards for project overview.',
  },
];

export default function ProposalSectionDisplay() {
  const [sections, setSections] = useState<ProposalSection[]>(initialSections);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [currentEditText, setCurrentEditText] = useState<string>('');

  const handleEdit = (section: ProposalSection) => {
    setEditingSectionId(section.id);
    setCurrentEditText(section.content);
  };

  const handleSave = (sectionId: string) => {
    setSections(
      sections.map((sec) =>
        sec.id === sectionId ? { ...sec, content: currentEditText } : sec
      )
    );
    setEditingSectionId(null);
    setCurrentEditText('');
  };

  const handleCancel = () => {
    setEditingSectionId(null);
    setCurrentEditText('');
  };

  // Helper to render content with newlines as <br> tags for display
  // For user input, it's better to rely on CSS `whitespace-pre-line` for display
  // and store raw text with newlines.
  const renderContent = (text: string) => {
    // Basic sanitization: escape HTML tags to prevent XSS if content were user-generated
    // For this mock, it's less critical as content is hardcoded.
    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    return escapedText.replace(/\n/g, '<br />');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Proposal Document Sections</CardTitle>
        <CardDescription>
          Review the generated proposal content below. Click &quot;Edit&quot; to make manual changes to a section.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 flex flex-row items-center justify-between py-3 px-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              {editingSectionId !== section.id && (
                <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {editingSectionId === section.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={currentEditText}
                    onChange={(e) => setCurrentEditText(e.target.value)}
                    rows={Math.max(5, currentEditText.split('\n').length + 1)}
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleSave(section.id)}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none whitespace-pre-line"
                  // Using CSS for newline rendering is safer than dangerouslySetInnerHTML
                  // dangerouslySetInnerHTML={{ __html: renderContent(section.content) }}
                >
                  {section.content}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
