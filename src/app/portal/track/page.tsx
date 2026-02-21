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
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-headline font-bold mb-2">Track Complaint Status</h1>
      <p className="text-muted-foreground mb-8">
        Enter your complaint ID to view its current status and history.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4">
            <Input
              placeholder="Enter Complaint ID (e.g., RAIL12345)"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" className="w-full sm:w-auto">
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
