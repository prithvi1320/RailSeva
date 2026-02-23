'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceToTextComplaintInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data for transcription, as a data URI that must include a MIME type (e.g., 'audio/webm') and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VoiceToTextComplaintInput = z.infer<
  typeof VoiceToTextComplaintInputSchema
>;

const VoiceToTextComplaintOutputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text from the audio.'),
});
export type VoiceToTextComplaintOutput = z.infer<
  typeof VoiceToTextComplaintOutputSchema
>;

export async function voiceToTextComplaintDescription(
  input: VoiceToTextComplaintInput
): Promise<VoiceToTextComplaintOutput> {
  try {
    return await voiceToTextComplaintDescriptionFlow(input);
  } catch (error) {
    console.error("voiceToTextComplaintDescription failed:", error);
    return {
      transcribedText: "",
    };
  }
}

const transcribePrompt = ai.definePrompt({
  name: 'transcribeComplaintAudioPrompt',
  input: {schema: VoiceToTextComplaintInputSchema},
  output: {schema: VoiceToTextComplaintOutputSchema},
  prompt: `Transcribe the following audio into text. Focus on capturing the full complaint description.

Audio: {{media url=audioDataUri}}`,
});

const voiceToTextComplaintDescriptionFlow = ai.defineFlow(
  {
    name: 'voiceToTextComplaintDescriptionFlow',
    inputSchema: VoiceToTextComplaintInputSchema,
    outputSchema: VoiceToTextComplaintOutputSchema,
  },
  async input => {
    const {output} = await transcribePrompt(input);
    return output ?? { transcribedText: "" };
  }
);
