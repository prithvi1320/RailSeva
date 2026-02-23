"use client";

import React, { useState } from "react";
import { ComplaintTimeline } from "@/components/complaint-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useComplaints } from "@/context/complaints-context";
import type { Complaint } from "@/lib/definitions";
import { Search } from "lucide-react";

export default function TrackComplaintPage() {
  const [complaintId, setComplaintId] = useState("");
  const [foundComplaint, setFoundComplaint] = useState<Complaint | null>(null);
  const [searched, setSearched] = useState(false);
  const { complaints } = useComplaints();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const complaint = complaints.find(c => c.id.toLowerCase() === complaintId.toLowerCase()) || null;
    setFoundComplaint(complaint);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="mb-2 font-headline text-6xl font-semibold uppercase text-foreground">My Complaints</h1>
      <p className="mb-8 text-2xl text-muted-foreground">Enter your complaint ID to view status updates and history.</p>

      <Card className="mb-8 rounded-2xl border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline text-4xl uppercase">Track Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4">
            <Input
              placeholder="Enter Complaint ID (e.g., RAIL12345)"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              className="h-12 flex-grow text-lg"
            />
            <Button type="submit" className="h-12 w-full font-headline text-xl uppercase sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && (
        foundComplaint ? (
          <ComplaintTimeline complaint={foundComplaint} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No complaint found with the ID "{complaintId}". Please check the ID and try again.</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
