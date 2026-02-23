import { ComplaintForm } from "@/components/complaint-form";
import { FileText } from "lucide-react";

export default function LodgeComplaintPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative rounded-2xl border bg-white p-6 shadow-sm md:p-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-accent p-4 text-white">
          <FileText className="h-8 w-8" />
        </div>
        <div className="mb-10 mt-6 text-center">
          <h1 className="font-headline text-6xl font-semibold uppercase text-foreground">Lodge Complaint</h1>
          <p className="mt-2 text-2xl text-muted-foreground">Submit your railway complaint with supporting evidence</p>
        </div>
        <ComplaintForm />
      </div>
    </div>
  );
}
