import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Message {
  role: string;
  content: string;
}

export async function handleChat(messages: Message[], model: string): Promise<any> {
  try {
    // Get the last user message
    const lastMessage = messages.filter(m => m.role === 'user').pop();
    
    if (!lastMessage) {
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: 'No user message found in the conversation.'
          }
        }]
      };
    }

    const userInput = lastMessage.content;

    // Simple command detection for shell execution
    if (userInput.trim().startsWith('$') || userInput.toLowerCase().includes('execute') || userInput.toLowerCase().includes('run command')) {
      try {
        const command = userInput.replace(/^\$/, '').trim();
        const { stdout, stderr } = await execAsync(command);
        
        const response = {
          choices: [{
            message: {
              role: 'assistant',
              content: `Command executed successfully:\n\n**Command:** ${command}\n\n**Output:**\n${stdout || '(no output)'}\n${stderr ? `\n**Errors:**\n${stderr}` : ''}`
            }
          }]
        };
        
        return response;
      } catch (error: any) {
        return {
          choices: [{
            message: {
              role: 'assistant',
              content: `Command failed: ${error.message}`
            }
          }]
        };
      }
    }

    // General AI response (placeholder - you can integrate with actual AI models here)
    const response = {
      choices: [{
        message: {
          role: 'assistant',
          content: `I understand you're asking about: "${userInput}". I'm the Rina Agent, ready to help with shell commands, file operations, and system tasks. Try asking me to execute a command by starting with "$" or saying "execute" followed by your command.`
        }
      }]
    };

    return response;

  } catch (error: any) {
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: `Error processing request: ${error.message}`
        }
      }]
    };
  }
}
