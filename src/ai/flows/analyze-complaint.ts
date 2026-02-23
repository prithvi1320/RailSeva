'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { complaintCategories } from '@/lib/definitions';

const ComplaintCategorySchema = z.enum(complaintCategories);
export type ComplaintCategory = z.infer<typeof ComplaintCategorySchema>;


const AnalyzeComplaintInputSchema = z.object({
  complaintDescription: z.string().describe('The detailed description of the complaint.'),
});
export type AnalyzeComplaintInput = z.infer<
  typeof AnalyzeComplaintInputSchema
>;

const AnalyzeComplaintOutputSchema = z.object({
  category: ComplaintCategorySchema.describe(
    'The automatically suggested category for the complaint.'
  ),
  priority: z.number().min(1).max(5).describe('The priority of the complaint from 1 to 5.'),
  reason: z.string().describe('A short explanation for the assigned category and priority.'),
});
export type AnalyzeComplaintOutput = z.infer<
  typeof AnalyzeComplaintOutputSchema
>;

const priorityKeywords: { [key: number]: string[] } = {
    5: ['heart attack', 'bleeding', 'unconscious', 'fire', 'assault'],
    4: ['theft', 'harassment', 'broken door'],
};

function getPriorityFromKeywords(text: string): number | null {
    const lowerText = text.toLowerCase();
    for (const priority in priorityKeywords) {
        const keywords = priorityKeywords[priority as any];
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return parseInt(priority, 10);
        }
    }
    return null;
}


export async function analyzeComplaint(
  input: AnalyzeComplaintInput
): Promise<AnalyzeComplaintOutput> {
  try {
    return await analyzeComplaintFlow(input);
  } catch (error) {
    console.error("analyzeComplaint failed:", error);
    return fallbackAnalysis(input.complaintDescription);
  }
}

const analyzeComplaintPrompt = ai.definePrompt({
  name: 'analyzeComplaintPrompt',
  input: {schema: AnalyzeComplaintInputSchema},
  output: {schema: AnalyzeComplaintOutputSchema},
  prompt: `Analyze the following railway passenger complaint and return ONLY valid JSON:

{
  "category": "one of [${ComplaintCategorySchema.options.map(c => `'${c}'`).join(', ')}]",
  "priority": 1-5,
  "reason": "short explanation"
}

Complaint:
{{{complaintDescription}}}`,
});

const analyzeComplaintFlow = ai.defineFlow(
  {
    name: 'analyzeComplaintFlow',
    inputSchema: AnalyzeComplaintInputSchema,
    outputSchema: AnalyzeComplaintOutputSchema,
  },
  async input => {
    const { output } = await analyzeComplaintPrompt(input);
    const keywordPriority = getPriorityFromKeywords(input.complaintDescription);

    if (!output) {
      return fallbackAnalysis(input.complaintDescription);
    }

    const finalPriority = keywordPriority ?? output.priority;

    return {
      ...output,
      priority: finalPriority,
    };
  }
);

function fallbackAnalysis(text: string): AnalyzeComplaintOutput {
  const keywordPriority = getPriorityFromKeywords(text);
  return {
    category: "Other",
    priority: keywordPriority ?? 3,
    reason: "Automatic assist is temporarily unavailable. Category set to Other by fallback mode.",
  };
}
