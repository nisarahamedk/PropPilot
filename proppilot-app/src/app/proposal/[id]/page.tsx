"use client";
import React, { useState, useEffect } from "react";
import ChatView from "@/components/ChatView";
import ChatInput from "@/components/ChatInput";
import StaticDocumentView, { ProposalContent, ProposalSection } from "@/components/StaticDocumentView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Added Button import
import ValidationReportModal from "@/components/ValidationReportModal"; // Added ValidationReportModal import

const initialProposalContent: ProposalContent = {
  title: "Project Phoenix: Next-Generation Web Platform",
  sections: [
    {
      id: "exec-summary",
      title: "Executive Summary",
      paragraphs: [
        "Project Phoenix aims to develop a state-of-the-art web platform designed to enhance user engagement and streamline content delivery for XYZ Corp. This proposal outlines our approach to delivering a scalable, secure, and intuitive solution that addresses key business objectives and provides a significant return on investment.",
        "Our team of experienced developers and designers will leverage modern technologies and agile methodologies to ensure timely and high-quality project completion."
      ]
    },
    {
      id: "understanding-reqs",
      title: "Understanding of Requirements",
      paragraphs: [
        "We understand XYZ Corp requires a platform that can handle high traffic volumes, integrate seamlessly with existing CRMs, and provide a personalized user experience. Key compliance requirements include GDPR and CCPA adherence, which will be integral to our design and development process.",
        "The platform must also feature a robust content management system (CMS) allowing for easy updates and content scheduling by non-technical staff."
      ]
    },
    {
      id: "proposed-solution",
      title: "Proposed Solution",
      paragraphs: [
        "Our proposed solution involves a three-tiered architecture: a React-based frontend for dynamic user interfaces, a Node.js/Express backend for API services, and a PostgreSQL database for data persistence. We will utilize a microservices approach for key functionalities to ensure scalability and maintainability.",
        "Key features will include: User Authentication & Authorization, Personalized Content Feeds, Integrated Analytics Dashboard, and a WYSIWYG CMS Interface. We will also incorporate [Compliance Keyword Placeholder: e.g., 'ISO 27001 best practices'] throughout the development lifecycle."
      ]
    },
     {
      id: "timeline",
      title: "Project Timeline",
      paragraphs: [
        "Phase 1 (Discovery & Design - 4 Weeks): Detailed requirements gathering, UX/UI design, and technical architecture finalization.",
        "Phase 2 (Development - 10 Weeks): Agile sprints covering frontend and backend development, CMS integration.",
        "Phase 3 (Testing & Deployment - 4 Weeks): Comprehensive QA, UAT, security audits, and production deployment."
      ]
    }
  ]
};

interface Message { id: string; sender: "user" | "ai"; message: string; }

export default function ProposalWorkspacePage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", message: `Hello! I'm PropPilot for project ${params.id}. How can I help you refine this proposal? Try commands like 'make executive summary shorter'.` },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [documentContent, setDocumentContent] = useState<ProposalContent>(initialProposalContent);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false); // State for validation modal

  const handleSendMessage = (newMessageText: string) => {
    const newUserMessage: Message = {
      id: String(Date.now()),
      sender: "user",
      message: newMessageText,
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setIsAiTyping(true);

    let newDocumentContent = JSON.parse(JSON.stringify(documentContent));
    let aiResponseMessage = `I've received your message: "${newMessageText}". I'm not sure how to handle that yet. Try one of the example commands.`;

    const command = newMessageText.toLowerCase().trim();

    if (command === "make executive summary shorter") {
      aiResponseMessage = "Okay, I've shortened the Executive Summary. Take a look.";
      const execSummarySection = newDocumentContent.sections.find((s: ProposalSection) => s.id === "exec-summary");
      if (execSummarySection) {
        execSummarySection.paragraphs = ["This is a much shorter executive summary focusing only on the key deliverables for Project Phoenix, ensuring clarity and conciseness."];
      }
    } else if (command === "add a point about security to proposed solution") {
      aiResponseMessage = "I've added a point about security to the Proposed Solution section.";
      const solutionSection = newDocumentContent.sections.find((s: ProposalSection) => s.id === "proposed-solution");
      if (solutionSection) {
        solutionSection.paragraphs.push("Security is paramount. We will implement end-to-end encryption using industry-standard protocols, conduct regular vulnerability assessments, adhere to OWASP Top 10 guidelines, and ensure proactive threat monitoring to safeguard all sensitive data and maintain platform integrity.");
      }
    } else if (command === "change timeline to 6 weeks for phase 1") {
        aiResponseMessage = "Alright, I've updated the timeline for Phase 1 to 6 weeks.";
        const timelineSection = newDocumentContent.sections.find((s: ProposalSection) => s.id === "timeline");
        if (timelineSection) {
            timelineSection.paragraphs = timelineSection.paragraphs.map((p: string) =>
                p.startsWith("Phase 1") ? "Phase 1 (Discovery & Design - 6 Weeks): Detailed requirements gathering, UX/UI design, technical architecture finalization, and initial prototyping." : p
            );
        }
    }

    setTimeout(() => {
      const aiResponse: Message = {
        id: String(Date.now() + 1),
        sender: "ai",
        message: aiResponseMessage,
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
      setDocumentContent(newDocumentContent);
      setIsAiTyping(false);
    }, 1500);
  };

  return (
    <>
      <div className="flex h-screen p-4 gap-4 bg-muted/40">
        <div className="flex-grow-[2] h-full flex flex-col">
          <StaticDocumentView content={documentContent} />
        </div>
        <div className="flex-grow-[1] h-full flex flex-col max-h-screen">
          <Card className="flex-grow flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>PropPilot Assistant</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsValidationModalOpen(true)}>
                  Validate Proposal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col overflow-hidden">
              <div className="flex-grow overflow-y-auto">
                <ChatView messages={messages} />
              </div>
              <ChatInput onSendMessage={handleSendMessage} isLoading={isAiTyping} />
            </CardContent>
          </Card>
        </div>
      </div>
      <ValidationReportModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
      />
    </>
  );
}
