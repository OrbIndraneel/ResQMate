
'use server';
/**
 * @fileOverview This file defines a Genkit flow to match volunteers with relief tasks
 * and generate a notification message if a suitable match is found.
 *
 * - volunteerTaskMatchingNotification - A function that handles the volunteer-task matching process.
 * - VolunteerTaskMatchingNotificationInput - The input type for the volunteerTaskMatchingNotification function.
 * - VolunteerTaskMatchingNotificationOutput - The return type for the volunteerTaskMatchingNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VolunteerTaskMatchingNotificationInputSchema = z.object({
  volunteerSkills: z
    .array(z.string())
    .describe('A list of skills the volunteer possesses (e.g., "first aid", "driving", "heavy lifting").'),
  volunteerLocation: z
    .string()
    .describe(
      'The volunteer\'s current geographical location (e.g., "latitude,longitude" or a descriptive address like "downtown San Francisco").'
    ),
  taskTitle: z.string().describe('The title of the relief task.'),
  taskDescription: z.string().describe('A detailed description of the relief task.'),
  taskRequiredSkills: z
    .array(z.string())
    .describe('A list of skills required for the task (e.g., "medical", "logistics", "communications").'),
  taskLocation: z
    .string()
    .describe(
      'The geographical location of the relief task (e.g., "latitude,longitude" or a descriptive address like "city hall, San Francisco").'
    ),
});
export type VolunteerTaskMatchingNotificationInput = z.infer<
  typeof VolunteerTaskMatchingNotificationInputSchema
>;

const VolunteerTaskMatchingNotificationOutputSchema = z.object({
  isMatch: z
    .boolean()
    .describe('True if the task is a good match for the volunteer based on skills and location, otherwise false.'),
  matchReason: z
    .string()
    .describe('An explanation of why the task is or is not a good match for the volunteer, detailing skill and location considerations.'),
  notificationMessage: z
    .string()
    .describe('A concise message to notify the volunteer about the task, only present if isMatch is true.'),
});
export type VolunteerTaskMatchingNotificationOutput = z.infer<
  typeof VolunteerTaskMatchingNotificationOutputSchema
>;

export async function volunteerTaskMatchingNotification(
  input: VolunteerTaskMatchingNotificationInput
): Promise<VolunteerTaskMatchingNotificationOutput> {
  return volunteerTaskMatchingNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'volunteerTaskMatchingNotificationPrompt',
  // Reconfigured to use Google AI Gemini model with API key
  model: 'googleai/gemini-1.5-flash',
  input: {schema: VolunteerTaskMatchingNotificationInputSchema},
  output: {schema: VolunteerTaskMatchingNotificationOutputSchema},
  prompt: `You are an intelligent AI assistant specialized in matching volunteers with humanitarian relief tasks. Your primary goal is to assess whether a given relief task is a suitable match for a volunteer, considering their reported skills and geographical location. If a match is found, you must generate an engaging and informative notification message.

Here is the volunteer's profile and the task details:

Volunteer's Skills: {{{volunteerSkills}}}
Volunteer's Current Location: {{{volunteerLocation}}}

Task Title: {{{taskTitle}}}
Task Description: {{{taskDescription}}}
Task Required Skills: {{{taskRequiredSkills}}}
Task Location: {{{taskLocation}}}

Carefully evaluate the volunteer's skills against the task's required skills. Also, consider the proximity or general area overlap between the volunteer's current location and the task's location. Make a determination for 'isMatch'.

If the task is a good match (based on both skills and location):
- Set 'isMatch' to true.
- Provide a clear 'matchReason' explaining how the volunteer's skills and location align with the task requirements.
- Generate a compelling 'notificationMessage' to inform the volunteer about this matching task. The message should be encouraging and include the task title and location.

If the task is NOT a good match:
- Set 'isMatch' to false.
- Provide a 'matchReason' explaining why it's not a match (e.g., missing skills, significant location mismatch).
- Set 'notificationMessage' to an empty string.

Ensure your output adheres strictly to the defined JSON schema.
`,
});

const volunteerTaskMatchingNotificationFlow = ai.defineFlow(
  {
    name: 'volunteerTaskMatchingNotificationFlow',
    inputSchema: VolunteerTaskMatchingNotificationInputSchema,
    outputSchema: VolunteerTaskMatchingNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error("Failed to match volunteer");
    return output;
  }
);
