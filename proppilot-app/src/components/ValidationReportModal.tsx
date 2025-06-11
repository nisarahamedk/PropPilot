"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ValidationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockValidationData = [
  { id: "req1", requirement: "Must include Executive Summary", status: "Addressed", sectionLink: "exec-summary" },
  { id: "req2", requirement: "Solution must address scalability", status: "Addressed", sectionLink: "proposed-solution" },
  { id: "req3", requirement: "Timeline must be clearly defined", status: "Partially Addressed", sectionLink: "timeline" },
  { id: "req4", requirement: "Budget breakdown required", status: "Not Addressed", sectionLink: null },
  { id: "req5", requirement: "Compliance with GDPR mentioned", status: "Addressed", sectionLink: "understanding-reqs" },
];

export default function ValidationReportModal({ isOpen, onClose }: ValidationReportModalProps) {
  // if (!isOpen) return null; // This is not needed if using AlertDialog's open prop correctly

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Proposal Validation Report</AlertDialogTitle>
          <AlertDialogDescription>
            Review of the proposal against key requirements. (This is a static mock-up)
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requirement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockValidationData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.requirement}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "Addressed" ? "default" :
                        item.status === "Partially Addressed" ? "secondary" : "destructive"
                      }
                      // Custom styling for badges to ensure visibility if default/secondary are too subtle
                      className={
                        item.status === "Addressed" ? "bg-green-600 hover:bg-green-700 text-white" :
                        item.status === "Partially Addressed" ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                        item.status === "Not Addressed" ? "bg-red-600 hover:bg-red-700 text-white" : ""
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.sectionLink ? (
                      <a href={`#${item.sectionLink}`} onClick={onClose} className="text-sm text-blue-600 hover:underline">
                        Go to Section
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
          {/* <AlertDialogAction>Continue</AlertDialogAction> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
