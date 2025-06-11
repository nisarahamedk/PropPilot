"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UploadCloud, MessageSquarePlus } from "lucide-react";
import { useRouter } from 'next/navigation'; // Added useRouter

interface NewProposalModalProps {
  children: React.ReactNode;
}

export default function NewProposalModal({ children }: NewProposalModalProps) {
  const router = useRouter(); // Initialize router
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // State to control dialog open/close for programmatic closing
  const [open, setOpen] = React.useState(false);

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      console.log("Selected file:", file.name);
    }
  };

  const handleStartFromScratch = () => {
    setOpen(false); // Close dialog
    router.push('/proposal/new-project');
  };

  const handleConfirmUpload = () => {
    if (fileName) {
      console.log("Confirming upload for:", fileName);
      setFileName(null);
      setOpen(false); // Close dialog
      router.push('/proposal/uploaded-project');
    }
  };

  const onDialogStateChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFileName(null); // Reset filename when dialog closes
    }
  };

  return (
    // Control dialog open state
    <Dialog open={open} onOpenChange={onDialogStateChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Start a New Proposal</DialogTitle>
          <DialogDescription>
            How would you like to begin?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={handleFileSelectClick}
          >
            <UploadCloud className="mr-2 h-4 w-4" /> Upload RFP/Requirements Document
          </Button>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          {fileName && (
            <div className="text-sm text-gray-500 pl-2">Selected file: {fileName}</div>
          )}

          <Button
            variant="secondary"
            className="w-full justify-start mt-2"
            onClick={handleStartFromScratch} // Updated onClick
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" /> Start from Scratch (Manual Entry)
          </Button>

          {fileName && (
             <Button onClick={handleConfirmUpload} className="w-full mt-4">Confirm Upload & Proceed</Button>
          )}
        </div>
        <DialogFooter>
          {/* DialogClose will work with the controlled open state */}
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
