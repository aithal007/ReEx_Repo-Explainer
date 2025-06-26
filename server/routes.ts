import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { explainRepoSchema, chatMessageSchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { explainRepository, chatWithContext } from "./services/gemini";
import { parseGitHubUrl, fetchReadme, validateRepository } from "./services/github";

export async function registerRoutes(app: Express): Promise<Server> {
  // Explain repository endpoint
  app.post("/api/explain", async (req, res) => {
    try {
      const { url, conversationId } = explainRepoSchema.parse(req.body);
      
      // Parse GitHub URL
      const { owner, repo } = parseGitHubUrl(url);
      
      // Validate repository exists
      const isValid = await validateRepository(owner, repo);
      if (!isValid) {
        return res.status(404).json({ message: "Repository not found or is private" });
      }
      
      // Fetch README
      const readmeContent = await fetchReadme(owner, repo);
      
      // Generate explanation using Gemini
      const explanation = await explainRepository(readmeContent, url);
      
      // Create or get conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
      } else {
        const repoName = `${owner}/${repo}`;
        conversation = await storage.createConversation({ title: repoName });
      }
      
      // Save user message
      await storage.createMessage({
        conversationId: conversation.id,
        content: url,
        isUser: true,
      });
      
      // Save AI response
      await storage.createMessage({
        conversationId: conversation.id,
        content: explanation,
        isUser: false,
      });
      
      res.json({
        explanation,
        conversationId: conversation.id,
        repoContext: readmeContent,
      });
      
    } catch (error) {
      console.error("Explain repository error:", error);
      const message = error instanceof Error ? error.message : "Failed to explain repository";
      res.status(500).json({ message });
    }
  });

  // Chat endpoint for follow-up questions
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId, repoContext } = chatMessageSchema.parse(req.body);
      
      // Verify conversation exists
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Save user message
      await storage.createMessage({
        conversationId,
        content: message,
        isUser: true,
      });
      
      // Generate AI response
      const response = await chatWithContext(message, repoContext);
      
      // Save AI response
      await storage.createMessage({
        conversationId,
        content: response,
        isUser: false,
      });
      
      res.json({ response });
      
    } catch (error) {
      console.error("Chat error:", error);
      const message = error instanceof Error ? error.message : "Failed to process chat message";
      res.status(500).json({ message });
    }
  });

  // Get conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const { title } = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation({ title });
      res.json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
