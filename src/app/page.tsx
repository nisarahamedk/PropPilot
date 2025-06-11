import NewProposalModal from "@/components/NewProposalModal";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to PropPilot</h1>
        <NewProposalModal />
      </div>
    </main>
  );
}
