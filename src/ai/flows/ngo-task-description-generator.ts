
'use server';
/**
 * @fileOverview An AI assistant that generates comprehensive task descriptions for NGO Admins.
 *
 * - generateNGOTaskDescription - A function that handles the task description generation process.
 * - NGOTaskDescriptionGeneratorInput - The input type for the generator.
 * - NGOTaskDescriptionGeneratorOutput - The return type for the generator.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NGOTaskDescriptionGeneratorInputSchema = z.object({
  briefDescription: z.string().describe('A brief overview of the task.'),
  requiredSkills: z.array(z.string()).optional(),
  location: z.string().optional(),
  urgency: z.enum(['normal', 'urgent', 'emergency']).optional(),
  expectedDuration: z.string().optional(),
  materialsNeeded: z.array(z.string()).optional(),
});
export type NGOTaskDescriptionGeneratorInput = z.infer<typeof NGOTaskDescriptionGeneratorInputSchema>;

const NGOTaskDescriptionGeneratorOutputSchema = z.object({
  detailedDescription: z.string().describe('A comprehensive, clear, and well-structured task description.'),
});
export type NGOTaskDescriptionGeneratorOutput = z.infer<typeof NGOTaskDescriptionGeneratorOutputSchema>;

/**
 * Generates a detailed task description using Genkit AI.
 */
export async function generateNGOTaskDescription(
  input: NGOTaskDescriptionGeneratorInput
): Promise<NGOTaskDescriptionGeneratorOutput> {
  return ngoTaskDescriptionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ngoTaskDescriptionPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: NGOTaskDescriptionGeneratorInputSchema },
  output: { schema: NGOTaskDescriptionGeneratorOutputSchema },
  prompt: `You are an expert humanitarian operations coordinator. Your goal is to expand a brief task summary into a professional, compelling, and highly detailed mission description.

Focus on clarity, impact, and safety protocols. Use professional yet encouraging language.

Input Details:
- Task: {{{briefDescription}}}
{{#if requiredSkills}}- Required Skills: {{#each requiredSkills}}{{{this}}}, {{/each}}{{/if}}
{{#if location}}- Location: {{{location}}}{{/if}}
{{#if urgency}}- Priority: {{{urgency}}}{{/if}}
{{#if expectedDuration}}- Duration: {{{expectedDuration}}}{{/if}}

Structure your response with these sections (using bold headings):
1. **Mission Overview**: A 2-sentence summary of the goal.
2. **Key Responsibilities**: Specific actions the volunteer will perform.
3. **Required Expertise**: Why the selected skills are critical.
4. **Safety & Logistics**: Essential instructions for responders on-site.
5. **Humanitarian Impact**: How this specific task saves lives or supports the community.`,
});

const ngoTaskDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'ngoTaskDescriptionGeneratorFlow',
    inputSchema: NGOTaskDescriptionGeneratorInputSchema,
    outputSchema: NGOTaskDescriptionGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("Failed to generate description");
    return output;
  }
);
