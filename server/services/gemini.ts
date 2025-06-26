import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export async function explainRepository(
  readmeContent: string, 
  repoUrl: string, 
  repoStructure: string, 
  keyFiles: { [key: string]: string }
): Promise<string> {
  
  const keyFilesInfo = Object.entries(keyFiles)
    .map(([filename, content]) => `### ${filename}\n\`\`\`\n${content.slice(0, 2000)}\`\`\``)
    .join('\n\n');

  const prompt = `You are an expert software engineer and technical writer with deep knowledge of modern development practices.

Analyze this GitHub repository comprehensively using all available information:

**Repository URL:** ${repoUrl}

**README Content:**
${readmeContent}

**Repository Structure:**
${repoStructure}

**Key Configuration & Project Files:**
${keyFilesInfo}

Provide a detailed, professional analysis in this format:

## 🎯 Project Overview
Provide a clear, concise summary of what this project does and its main purpose.

## 🏗️ Architecture & Technology Stack
Based on the files and structure, identify:
- Programming languages used
- Frameworks and libraries
- Build tools and configuration
- Database or storage solutions
- Deployment and infrastructure setup

## 📁 Project Structure
Explain the key directories and their purposes based on the file structure.

## 🔧 Key Dependencies & Tools
List and explain important dependencies from package.json, requirements.txt, or similar files.

## 🚀 Getting Started
Explain how to set up and run this project locally.

## 💡 Notable Features & Implementation Details
Highlight interesting technical decisions, patterns, or unique aspects of the codebase.

## 🎨 Development Workflow
Based on configuration files, explain the development, testing, and deployment process.

Write in a professional, informative tone that would be valuable for developers wanting to understand or contribute to this project. Focus on technical accuracy and practical insights.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "I couldn't generate an explanation for this repository. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate repository explanation. Please check your API key and try again.");
  }
}

export async function chatWithContext(
  message: string, 
  repoContext?: string, 
  repoStructure?: string, 
  keyFiles?: { [key: string]: string }
): Promise<string> {
  
  let contextInfo = '';
  if (repoContext) {
    contextInfo += `**Repository README:**\n${repoContext}\n\n`;
  }
  if (repoStructure) {
    contextInfo += `**Repository Structure:**\n${repoStructure}\n\n`;
  }
  if (keyFiles && Object.keys(keyFiles).length > 0) {
    const keyFilesInfo = Object.entries(keyFiles)
      .map(([filename, content]) => `### ${filename}\n\`\`\`\n${content.slice(0, 1000)}\`\`\``)
      .join('\n\n');
    contextInfo += `**Key Files:**\n${keyFilesInfo}\n\n`;
  }

  const systemPrompt = contextInfo 
    ? `You are ReEx, an AI assistant specialized in explaining code repositories. You have comprehensive context about a GitHub repository:

${contextInfo}

Answer the user's question about this repository with detailed, technical insights. Use the file contents and structure to provide specific, accurate information.`
    : `You are ReEx, an AI assistant specialized in explaining code repositories. Answer the user's question about software development, GitHub repositories, or coding in general.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\nUser question: ${message}`,
    });

    return response.text || "I'm sorry, I couldn't process your question. Please try asking in a different way.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process your message. Please try again.");
  }
}
