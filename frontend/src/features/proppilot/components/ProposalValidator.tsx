'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // To be added
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // To be added
// Assuming lucide-react icons like CheckCircle, XCircle, AlertTriangle are available
// If not, they might need to be explicitly installed or managed if shadcn doesn't bundle them.
// For now, we'll use text/emoji placeholders if icons aren't rendering.
// import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';


interface ValidationFinding {
  id: string;
  text: string;
  status: 'pass' | 'fail' | 'warning';
  details?: string;
}

const mockValidationFindings: ValidationFinding[] = [
  { id: 'val1', text: 'All RFP sections covered', status: 'pass', details: 'All mandatory sections from the RFP appear to be addressed in the proposal.' },
  { id: 'val2', text: 'Pricing consistency', status: 'pass', details: 'Pricing information is consistent across all relevant sections.' },
  { id: 'val3', text: 'Executive summary length (Warning)', status: 'warning', details: 'Executive summary is slightly over the recommended word count. Consider condensing for better impact (recommended: 250 words, actual: 310 words).' },
  { id: 'val4', text: 'Compliance keyword "ISO 27001" present', status: 'pass', details: 'The compliance keyword "ISO 27001" was found.'},
  { id: 'val5', text: 'Clarity of technical solution (Fail)', status: 'fail', details: 'Section 3.2 ("Technical Approach") could be clearer. Consider adding more specific details about the implementation timeline.' },
];

export default function ProposalValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationFinding[] | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleValidateProposal = () => {
    setIsValidating(true);
    setValidationResults(null);

    // Simulate validation delay
    setTimeout(() => {
      setValidationResults(mockValidationFindings);
      setIsValidating(false);
      setShowDialog(true); // Open dialog once validation is "complete"
    }, 1500);
  };

  const getStatusIcon = (status: ValidationFinding['status']) => {
    // Using text-based icons for simplicity, lucide-react icons can be swapped in.
    if (status === 'pass') return <span className="text-green-500 mr-2 font-bold">✓</span>;
    if (status === 'fail') return <span className="text-red-500 mr-2 font-bold">✗</span>;
    if (status === 'warning') return <span className="text-yellow-500 mr-2 font-bold">⚠️</span>;
    return null;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Proposal Validator</CardTitle>
          <CardDescription>
            Check your proposal against common pitfalls and RFP requirements (simulated).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleValidateProposal} disabled={isValidating} className="w-full">
            {isValidating ? 'Validating Proposal...' : 'Run Validation Check'}
          </Button>

          {isValidating && (
            <div className="text-center py-4">
              <p className="text-sm text-primary animate-pulse">Running validation checks, please wait...</p>
              {/* Consider adding a spinner component here from lucide-react, e.g. <Loader2 className="animate-spin" /> */}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Validation Report</AlertDialogTitle>
            <AlertDialogDescription>
              This is a simulated validation report. Review the findings below.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {validationResults && validationResults.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto p-1 pr-3 space-y-3"> {/* Added pr-3 for scrollbar space */}
              {validationResults.map((finding) => (
                <Alert key={finding.id} variant={finding.status === 'fail' ? 'destructive' : 'default'} className={
                  finding.status === 'pass' ? 'border-green-500 dark:border-green-700' :
                  finding.status === 'warning' ? 'border-yellow-500 dark:border-yellow-700' :
                  '' // Destructive variant handles its own border
                }>
                  <div className="flex items-start"> {/* Flex container for icon and text */}
                    <div className="pt-0.5">{getStatusIcon(finding.status)}</div> {/* Icon container */}
                    <div className="flex-grow"> {/* Text container */}
                      <AlertTitle className="font-semibold">{finding.text}</AlertTitle>
                      {finding.details && <AlertDescription className="text-xs mt-1">{finding.details}</AlertDescription>}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          <AlertDialogFooter className="mt-4"> {/* Added margin top for spacing */}
            <AlertDialogAction onClick={() => setShowDialog(false)}>Close Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
