"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Mic, Square, Loader2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  complaintCategories,
  journeyDetailsOptions,
} from "@/lib/definitions";
import type { Complaint } from "@/lib/definitions";
import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { analyzeComplaint, type AnalyzeComplaintOutput } from "@/ai/flows/analyze-complaint";
import { voiceToTextComplaintDescription } from "@/ai/flows/voice-to-text-complaint";
import { useComplaints } from "@/context/complaints-context";

const formSchema = z.object({
  mobileNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  journeyDetailType: z.enum(journeyDetailsOptions, {
    required_error: "Please select a journey detail type.",
  }),
  journeyDetailValue: z
    .string()
    .min(1, "This field is required."),
  description: z
    .string()
    .min(20, "Please provide a detailed description (min. 20 characters)."),
  incidentDate: z.date({ required_error: "Please select a date." }),
  category: z.enum(complaintCategories, {
    required_error: "Please select a category.",
  }),
  file: z.any().optional(),
});

type RecordingState = "idle" | "recording" | "transcribing";

const PriorityBadge = ({ priority }: { priority: number }) => {
    const config: { label: string; variant: "destructive" | "default" | "secondary" | "outline" } =
      {
        5: { label: 'Critical', variant: 'destructive' },
        4: { label: 'High', variant: 'default' },
        3: { label: 'Medium', variant: 'secondary' },
        2: { label: 'Low', variant: 'outline' },
        1: { label: 'Feedback', variant: 'outline' },
      }[priority] || { label: 'Unknown', variant: 'outline' };

    return <Badge variant={config.variant}>Priority: {config.label}</Badge>;
};


export function ComplaintForm() {
  const { toast } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { addComplaint } = useComplaints();
  const [aiAnalysis, setAiAnalysis] = useState<AnalyzeComplaintOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      journeyDetailType: "PNR",
      journeyDetailValue: "",
      description: "",
      mobileNumber: "",
    },
  });

  const descriptionValue = form.watch("description");
  const debouncedDescription = useDebounce(descriptionValue, 1000);

  React.useEffect(() => {
    if (debouncedDescription && debouncedDescription.length > 20) {
      setIsAnalyzing(true);
      analyzeComplaint({ complaintDescription: debouncedDescription })
        .then((result) => {
          if (result) {
            setAiAnalysis(result);
            const validCategories: string[] = [...complaintCategories];
            if (validCategories.includes(result.category)) {
                form.setValue("category", result.category, {
                  shouldValidate: true,
                });
                toast({
                  title: "AI Analysis Complete",
                  description: `We've suggested a category and priority for your issue.`,
                });
            }
          }
        })
        .catch((error) => {
            console.error("AI analysis failed:", error)
            toast({
                variant: "destructive",
                title: "AI Analysis Failed",
                description: "Could not analyze the complaint description.",
            });
        })
        .finally(() => {
          setIsAnalyzing(false);
        });
    }
  }, [debouncedDescription, form, toast]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setRecordingState("transcribing");
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const result = await voiceToTextComplaintDescription({ audioDataUri: base64Audio });
            form.setValue("description", result.transcribedText, { shouldValidate: true });
          } catch (error) {
            console.error("Transcription failed:", error);
            toast({ variant: "destructive", title: "Transcription Failed", description: "Could not transcribe audio." });
          } finally {
            setRecordingState("idle");
          }
        };
      };

      mediaRecorderRef.current.start();
      setRecordingState("recording");
    } catch (error) {
      console.error("Could not start recording:", error);
      toast({ variant: "destructive", title: "Recording Error", description: "Could not access microphone." });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Please upload a file smaller than 5MB." });
        form.setValue("file", undefined);
        if (event.target) event.target.value = "";
      } else {
        form.setValue("file", file);
      }
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const complaintId = `RAIL${Date.now()}`;
    const newComplaint: Complaint = {
      id: complaintId,
      category: values.category,
      date: values.incidentDate.toISOString(),
      status: "Submitted",
      description: values.description,
      submittedBy: "Current User",
      history: [
        {
          status: "Submitted",
          timestamp: new Date().toISOString(),
          remarks: "Complaint submitted successfully.",
        },
      ],
      aiSuggestedCategory: aiAnalysis?.category,
      aiPriority: aiAnalysis?.priority,
      aiReason: aiAnalysis?.reason,
    };

    if (values.journeyDetailType === "PNR") newComplaint.pnr = values.journeyDetailValue;
    if (values.journeyDetailType === "Ticket No") newComplaint.ticketNo = values.journeyDetailValue;
    if (values.journeyDetailType === "Train No") newComplaint.trainNo = values.journeyDetailValue;
    if (values.journeyDetailType === "Station Name") newComplaint.stationName = values.journeyDetailValue;

    addComplaint(newComplaint);

    toast({
      title: "Success! Complaint Registered.",
      description: (
        <div className="grid gap-2 pt-2">
          <span>
            You can track your complaint using the ID below.
          </span>
          <div className="flex items-center justify-between gap-2 rounded-md bg-muted p-2">
            <code className="font-mono font-semibold">{complaintId}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1"
              onClick={() => {
                navigator.clipboard.writeText(complaintId);
                toast({
                  description: "Complaint ID copied to clipboard!",
                });
              }}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy Complaint ID</span>
            </Button>
          </div>
        </div>
      ),
      duration: 15000,
    });
    form.reset();
    setAiAnalysis(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                   <FormControl>
                    <div className="flex items-center">
                      <span className="h-10 flex items-center justify-center rounded-l-md border border-r-0 bg-muted px-3 text-sm">+91</span>
                      <Input 
                        placeholder="00000 00000" 
                        {...field} 
                        className="rounded-l-none"
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="incidentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Incident Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="journeyDetailType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Journey Details</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a detail type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {journeyDetailsOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="journeyDetailValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{form.watch("journeyDetailType") || "Detail"}</FormLabel>
                <FormControl>
                  <Input placeholder={`Enter ${form.watch("journeyDetailType")}`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grievance / Assistance Description</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Describe your issue in detail..."
                    className="min-h-[150px] pr-12"
                    {...field}
                  />
                  <div className="absolute top-2 right-2">
                    {recordingState === "idle" && (
                      <Button type="button" size="icon" variant="ghost" onClick={handleStartRecording}>
                        <Mic className="h-5 w-5" />
                      </Button>
                    )}
                    {recordingState === "recording" && (
                      <Button type="button" size="icon" variant="destructive" onClick={handleStopRecording}>
                        <Square className="h-5 w-5" />
                      </Button>
                    )}
                    {recordingState === "transcribing" && (
                       <Button type="button" size="icon" variant="ghost" disabled>
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </Button>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {(isAnalyzing || aiAnalysis) && (
            <div className="space-y-2 rounded-md border bg-muted/50 p-4">
                <FormLabel>AI Analysis</FormLabel>
                {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing your complaint...</span>
                    </div>
                ): aiAnalysis && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2">
                        <PriorityBadge priority={aiAnalysis.priority} />
                        <p className="text-sm text-muted-foreground italic">"{aiAnalysis.reason}"</p>
                    </div>
                )}
            </div>
        )}

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complaint Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {complaintCategories.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <FormDescription>A category may be suggested based on your description.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="file"
            render={({ field }) => {
              const { value, ...rest } = field;
              return (
                <FormItem>
                  <FormLabel>Upload File (Optional)</FormLabel>
                  <FormControl>
                    <Input type="file" {...rest} onChange={onFileChange} accept="application/pdf,image/jpeg,image/png,image/jpg,video/mp4"/>
                  </FormControl>
                  <FormDescription>
                    Attach a relevant file (PDF, JPG, PNG, MP4). Max size: 5MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

        <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
           {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Complaint"}
        </Button>
      </form>
    </Form>
  );
}
