"use client";

import React, { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Copy, Image as ImageIcon, Loader2, Mic, Square, Video, AudioLines } from "lucide-react";
import { analyzeComplaint, type AnalyzeComplaintOutput } from "@/ai/flows/analyze-complaint";
import { voiceToTextComplaintDescription } from "@/ai/flows/voice-to-text-complaint";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { complaintCategories } from "@/lib/definitions";
import type { Complaint } from "@/lib/definitions";
import { useComplaints } from "@/context/complaints-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const formSchema = z.object({
  trainNumber: z.string().regex(/^\d{5}$/, "Please enter a valid 5-digit train number."),
  category: z.enum(complaintCategories, {
    required_error: "Please select a category.",
  }),
  description: z
    .string()
    .min(20, "Please provide a detailed description (minimum 20 characters)."),
  imageEvidence: z.any().optional(),
  audioEvidence: z.any().optional(),
  videoEvidence: z.any().optional(),
});

type RecordingState = "idle" | "recording" | "transcribing";

const PriorityBadge = ({ priority }: { priority: number }) => {
  const config: { label: string; variant: "destructive" | "default" | "secondary" | "outline" } =
    {
      5: { label: "Critical", variant: "destructive" },
      4: { label: "High", variant: "default" },
      3: { label: "Medium", variant: "secondary" },
      2: { label: "Low", variant: "outline" },
      1: { label: "Feedback", variant: "outline" },
    }[priority] || { label: "Unknown", variant: "outline" };

  return <Badge variant={config.variant}>Priority: {config.label}</Badge>;
};

export function ComplaintForm() {
  const { toast } = useToast();
  const { addComplaint } = useComplaints();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [smartAssist, setSmartAssist] = useState<AnalyzeComplaintOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainNumber: "",
      description: "",
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
            setSmartAssist(result);
            const validCategories: string[] = [...complaintCategories];
            if (validCategories.includes(result.category)) {
              form.setValue("category", result.category, { shouldValidate: true });
            }
          }
        })
        .catch((error) => {
          console.error("Assist analysis failed:", error);
          toast({
            variant: "destructive",
            title: "Assist Unavailable",
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
            toast({
              variant: "destructive",
              title: "Transcription Failed",
              description: "Could not transcribe audio.",
            });
          } finally {
            setRecordingState("idle");
          }
        };
      };

      mediaRecorderRef.current.start();
      setRecordingState("recording");
    } catch (error) {
      console.error("Could not start recording:", error);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Could not access microphone.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const onFileChange =
    (name: "imageEvidence" | "audioEvidence" | "videoEvidence") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
        });
        form.setValue(name, undefined);
        if (event.target) event.target.value = "";
        return;
      }

      form.setValue(name, file, { shouldValidate: true });
    };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const complaintId = `RAIL${Date.now()}`;
    const newComplaint: Complaint = {
      id: complaintId,
      category: values.category,
      date: new Date().toISOString(),
      status: "Submitted",
      description: values.description,
      trainNo: values.trainNumber,
      submittedBy: "Current User",
      history: [
        {
          status: "Submitted",
          timestamp: new Date().toISOString(),
          remarks: "Complaint submitted successfully.",
        },
      ],
      aiSuggestedCategory: smartAssist?.category,
      aiPriority: smartAssist?.priority,
      aiReason: smartAssist?.reason,
    };

    addComplaint(newComplaint);

    toast({
      title: "Complaint Submitted Successfully",
      description: (
        <div className="grid gap-2 pt-2">
          <span>You can track your complaint using the ID below.</span>
          <div className="flex items-center justify-between gap-2 rounded-md bg-muted p-2">
            <code className="font-mono font-semibold">{complaintId}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1"
              onClick={() => {
                navigator.clipboard.writeText(complaintId);
                toast({
                  description: "Complaint ID copied to clipboard.",
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
    setSmartAssist(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="trainNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-4xl font-semibold text-foreground">Train Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 12345"
                  className="h-14 text-xl"
                  maxLength={5}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-4xl font-semibold text-foreground">Complaint Category *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-14 text-xl">
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-4xl font-semibold text-foreground">Complaint Description *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Describe your complaint in detail..."
                    className="min-h-[180px] pr-14 pt-4 text-xl"
                    {...field}
                  />
                  <div className="absolute right-3 top-3">
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

        {(isAnalyzing || smartAssist) && (
          <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
            <FormLabel className="text-lg font-semibold">Smart Assist</FormLabel>
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing your complaint...</span>
              </div>
            ) : (
              smartAssist && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <PriorityBadge priority={smartAssist.priority} />
                  <p className="text-sm italic text-muted-foreground">"{smartAssist.reason}"</p>
                </div>
              )
            )}
          </div>
        )}

        <div className="space-y-4 border-t pt-6">
          <h3 className="font-headline text-4xl font-semibold uppercase text-foreground">Attach Evidence (Optional)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="imageEvidence"
              render={({ field }) => {
                const { value, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xl">
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/jpeg,image/png,image/jpg" {...rest} onChange={onFileChange("imageEvidence")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="audioEvidence"
              render={({ field }) => {
                const { value, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xl">
                      <AudioLines className="h-4 w-4" />
                      Audio
                    </FormLabel>
                    <FormControl>
                      <Input type="file" accept="audio/*" {...rest} onChange={onFileChange("audioEvidence")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="videoEvidence"
              render={({ field }) => {
                const { value, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xl">
                      <Video className="h-4 w-4" />
                      Video
                    </FormLabel>
                    <FormControl>
                      <Input type="file" accept="video/mp4,video/*" {...rest} onChange={onFileChange("videoEvidence")} />
                    </FormControl>
                    <FormDescription>Max upload size per file: 10MB</FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-14 text-3xl font-headline uppercase tracking-wide"
            onClick={() => {
              form.reset();
              setSmartAssist(null);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="h-14 text-3xl font-headline uppercase tracking-wide" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Complaint"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
