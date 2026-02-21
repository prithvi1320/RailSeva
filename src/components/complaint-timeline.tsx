"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { CheckCircle2, Circle, Hourglass, Truck } from "lucide-react";
import type { Complaint, ComplaintStatus } from "@/lib/definitions";
import { cn } from "@/lib/utils";

const statusConfig = {
  Submitted: { icon: Circle, color: "text-blue-500" },
  Assigned: { icon: Truck, color: "text-yellow-500" },
  "In Progress": { icon: Hourglass, color: "text-orange-500" },
  Resolved: { icon: CheckCircle2, color: "text-green-500" },
};

const PriorityBadge = ({ priority }: { priority: number | undefined }) => {
    if (priority === undefined || priority === null) return null;

    const config: { label: string; variant: BadgeProps["variant"] } =
      {
        5: { label: 'Critical', variant: 'destructive' },
        4: { label: 'High', variant: 'default' },
        3: { label: 'Medium', variant: 'secondary' },
        2: { label: 'Low', variant: 'outline' },
        1: { label: 'Feedback', variant: 'outline' },
      }[priority] || { label: 'Unknown', variant: 'outline' };

    return <Badge variant={config.variant}>Priority: {config.label}</Badge>;
};

export function ComplaintTimeline({ complaint }: { complaint: Complaint }) {
  const getIcon = (status: ComplaintStatus) => {
    const Icon = statusConfig[status]?.icon || Circle;
    const color = statusConfig[status]?.color || "text-gray-500";
    return <Icon className={cn("h-5 w-5", color)} />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaint Details</CardTitle>
        <CardDescription>ID: {complaint.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground">{complaint.description}</p>
          </div>
          <div>
            <h3 className="font-semibold">Category</h3>
            <p className="text-muted-foreground">{complaint.category}</p>
          </div>
           {complaint.aiPriority !== undefined && complaint.aiReason && (
            <div className="space-y-2">
                <h3 className="font-semibold">AI Analysis</h3>
                <div className="flex items-center gap-4">
                    <PriorityBadge priority={complaint.aiPriority} />
                </div>
                <p className="text-sm text-muted-foreground italic">"{complaint.aiReason}"</p>
            </div>
          )}
          <div>
             <h3 className="font-semibold">History</h3>
            <div className="relative pl-8 mt-4">
              <div className="absolute left-3 top-2 h-full w-px bg-border" />
              {complaint.history.map((event, index) => (
                <div key={index} className="relative mb-8 flex items-start">
                  <div className="absolute left-[-1.6rem] top-0.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background">
                    {getIcon(event.status)}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{event.status}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.remarks && (
                      <p className="mt-1 text-sm text-muted-foreground italic">
                        "{event.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
