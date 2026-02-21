import { ComplaintForm } from "@/components/complaint-form";

export default function LodgeComplaintPage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-headline font-bold mb-2">Lodge a Complaint or Suggestion</h1>
      <p className="text-muted-foreground mb-8">
        We are here to help. Please provide the details of your grievance or suggestion below.
      </p>
      <ComplaintForm />
    </div>
  );
}
