"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileEdit } from "lucide-react";

export interface ProposalSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface ProposalContent {
  title: string;
  sections: ProposalSection[];
}

interface StaticDocumentViewProps {
  content: ProposalContent | null;
}

export default function StaticDocumentView({ content }: StaticDocumentViewProps) {
  if (!content) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardHeader>
          <CardTitle>No Content</CardTitle>
          <CardDescription>The proposal content is not available or is being loaded.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please wait or ensure content is provided.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="relative"> {/* Added relative for potential absolute positioning of button */}
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{content.title}</CardTitle>
                <CardDescription>Generated Proposal Draft</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Manual edit mode would be enabled here. Full editing coming soon!")}
              className="ml-auto shrink-0" // Added shrink-0 to prevent button from growing too much
            >
                <FileEdit className="mr-2 h-4 w-4" /> Manual Edit
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            {content.sections.map((section) => (
              <section key={section.id} id={section.id}> {/* Added id attribute for anchor links */}
                <h2 className="text-2xl font-semibold mb-3 pb-2 border-b">{section.title}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="mb-3 text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
