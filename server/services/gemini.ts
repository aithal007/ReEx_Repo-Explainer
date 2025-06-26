import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export async function explainRepository(readmeContent: string, repoUrl: string): Promise<string> {
  const prompt = `You are an expert software engineer and technical writer.

Please analyze the following GitHub repository and its README file, then provide a comprehensive explanation in a conversational, easy-to-understand format.

Repository URL: ${repoUrl}

README Content:
${readmeContent}

Please explain the following in a friendly, developer-to-developer tone:

🎯 **What is this project?** (TL;DR in 2-3 sentences)

📚 **What does it do and how does it work?** (Main functionality and approach)

🗂️ **Key components and files** (Important directories, files, or modules)

🚀 **Getting started** (How someone would use or contribute to this project)

💡 **Notable features or technologies** (What makes this project interesting or unique)

Format your response with clear sections using markdown formatting, emojis for visual appeal, and bullet points where appropriate. Keep it engaging and informative, as if you're explaining it to a fellow developer who wants to quickly understand the project.`;

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

export async function chatWithContext(message: string, repoContext?: string): Promise<string> {
  const systemPrompt = repoContext 
    ? `You are ReEx, an AI assistant specialized in explaining code repositories. You have context about a GitHub repository. Here's what you know about the current repository:

${repoContext}

Now answer the user's question about this repository in a helpful, conversational tone.`
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
