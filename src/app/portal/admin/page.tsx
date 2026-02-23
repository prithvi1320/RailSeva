"use client";

import React, { useState, useMemo } from "react";
import { useComplaints } from "@/context/complaints-context";
import { complaintCategories, complaintStatuses } from "@/lib/definitions";
import type { Complaint, ComplaintCategory, ComplaintStatus } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, X } from "lucide-react";

const PriorityBadge = ({ priority }: { priority: number | undefined }) => {
    if (priority === undefined || priority === null) return <Badge variant="outline">N/A</Badge>;

    const config: { label: string; variant: BadgeProps["variant"] } =
      {
        5: { label: 'Critical', variant: 'destructive' },
        4: { label: 'High', variant: 'default' },
        3: { label: 'Medium', variant: 'secondary' },
        2: { label: 'Low', variant: 'outline' },
        1: { label: 'Feedback', variant: 'outline' },
      }[priority] || { label: 'Unknown', variant: 'outline' };

    return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function AdminPage() {
  const { complaints } = useComplaints();
  const [filters, setFilters] = useState<{
    status: ComplaintStatus | "all";
    category: ComplaintCategory | "all";
  }>({
    status: "all",
    category: "all",
  });

  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const statusMatch = filters.status === "all" || complaint.status === filters.status;
      const categoryMatch = filters.category === "all" || complaint.category === filters.category;
      return statusMatch && categoryMatch;
    }).sort((a, b) => (b.aiPriority || 0) - (a.aiPriority || 0));
  }, [complaints, filters]);

  const handleFilterChange = (filterType: "status" | "category") => (value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value as any }));
  };

  const clearFilters = () => {
    setFilters({ status: "all", category: "all" });
  };
  
  const getBadgeVariant = (status: ComplaintStatus): BadgeProps["variant"] => {
    switch (status) {
      case "Submitted": return "default";
      case "In Progress": return "secondary";
      case "Assigned": return "outline";
      case "Resolved": return "destructive";
      default: return "default";
    }
  }

  return (
    <div className="w-full mx-auto">
      <h1 className="mb-2 font-headline text-6xl font-semibold uppercase text-foreground">Admin Dashboard</h1>
      <p className="mb-8 text-2xl text-muted-foreground">
        View, manage, and resolve passenger complaints.
      </p>

      <Card className="rounded-2xl border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline text-4xl uppercase">All Complaints</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Select onValueChange={handleFilterChange("status")} value={filters.status}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {complaintStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleFilterChange("category")} value={filters.category}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {complaintCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No complaints found.
                  </TableCell>
                </TableRow>
              )}
              {filteredComplaints.map(complaint => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">{complaint.id}</TableCell>
                  <TableCell>{complaint.category}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={complaint.aiPriority} />
                  </TableCell>
                  <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(complaint.status)}>{complaint.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem>Assign</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
