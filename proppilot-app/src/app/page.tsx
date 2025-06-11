import NewProposalModal from "@/components/NewProposalModal";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to PropPilot</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Your AI-powered proposal generation assistant.
        </p>
        <NewProposalModal>
          <Button size="lg">Create New Proposal</Button>
        </NewProposalModal>
      </div>
    </main>
  );
}
