import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });

  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: `You are a helpful AI assistant for a mail management application called MailGPT. 
    
Your role is to help users with:
- Email management and organization
- Task extraction and prioritization from emails
- Email composition and response suggestions
- General productivity and workflow optimization

Be concise, helpful, and focus on email and task-related assistance.`,
    messages,
  });

  return result.toDataStreamResponse();
} 