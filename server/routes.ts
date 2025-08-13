import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMethodSchema, insertSampleSizeCalculationSchema, insertCitationVerificationSchema, insertProtocolSchema, insertHypothesisSchema } from "@shared/schema";
import { generateMethodsRecommendation, verifyCitation, generateProtocolContent, generateHypothesis } from "./services/gemini";
import { searchPubMed } from "./services/pubmed";
import { calculateSampleSize } from "./services/statistics";
import { exportProtocol, getExportMimeType, getExportFilename } from "./services/export";
import { z } from "zod";

const DEFAULT_USER_ID = "default-user";

export async function registerRoutes(app: Express): Promise<Server> {
  // Hypothesis Generator endpoints
  app.post("/api/hypotheses", async (req, res) => {
    try {
      const { domain, question, variables, constraints, searchQuery } = req.body;
      
      if (!domain || !question || !variables) {
        return res.status(400).json({ message: "Domain, question, and variables are required" });
      }

      // Generate hypothesis using Gemini AI
      const generatedContent = await generateHypothesis(domain, question, variables, constraints, searchQuery);
      
      // Store the hypothesis
      const hypothesisData = {
        userId: DEFAULT_USER_ID,
        domain,
        question,
        variables,
        constraints,
        generatedContent
      };

      const hypothesis = await storage.createHypothesis(hypothesisData);
      
      res.json({
        id: hypothesis.id,
        hypothesis: generatedContent, // For compatibility
        domain: hypothesis.domain,
        question: hypothesis.question,
        variables: hypothesis.variables,
        constraints: hypothesis.constraints,
        generatedContent: hypothesis.generatedContent,
        createdAt: hypothesis.createdAt
      });
    } catch (error) {
      console.error("Hypothesis generation error:", error);
      res.status(500).json({ message: "Failed to generate hypothesis" });
    }
  });

  // Get user's hypotheses
  app.get("/api/hypotheses", async (req, res) => {
    try {
      const hypotheses = await storage.getHypothesesByUser(DEFAULT_USER_ID);
      res.json(hypotheses);
    } catch (error) {
      console.error("Get hypotheses error:", error);
      res.status(500).json({ message: "Failed to get hypotheses" });
    }
  });

  // Methods Recommender endpoint
  app.post("/api/methods/recommend", async (req, res) => {
    try {
      const { hypothesis, variables, constraints } = req.body;
      
      if (!hypothesis || !variables) {
        return res.status(400).json({ message: "Hypothesis and variables are required" });
      }

      const recommendation = await generateMethodsRecommendation(hypothesis, variables, constraints);
      
      // Store the recommendation
      const methodData = {
        userId: DEFAULT_USER_ID,
        hypothesis,
        variables,
        constraints,
        primaryMethods: recommendation.primaryMethods,
        alternativeMethod: recommendation.alternativeMethod,
        confidence: recommendation.confidence
      };

      const method = await storage.createMethod(methodData);
      
      res.json({
        id: method.id,
        ...recommendation
      });
    } catch (error) {
      console.error("Methods recommendation error:", error);
      res.status(500).json({ message: "Failed to generate methods recommendation" });
    }
  });

  // Sample Size Calculator endpoint
  app.post("/api/sample-size/calculate", async (req, res) => {
    try {
      const { testType, effectSize, power, alpha } = req.body;
      
      if (!testType || effectSize === undefined || power === undefined || alpha === undefined) {
        return res.status(400).json({ message: "All parameters are required for sample size calculation" });
      }

      const result = calculateSampleSize({ testType, effectSize, power, alpha });
      
      // Store the calculation
      const calculationData = {
        userId: DEFAULT_USER_ID,
        testType,
        effectSize,
        power,
        alpha,
        sampleSize: result.sampleSize,
        totalSampleSize: result.totalSampleSize,
        adjustedSampleSize: result.adjustedSampleSize,
        formula: result.formula,
        assumptions: result.assumptions.join("; ")
      };

      const calculation = await storage.createSampleSizeCalculation(calculationData);
      
      res.json({
        id: calculation.id,
        ...result
      });
    } catch (error) {
      console.error("Sample size calculation error:", error);
      res.status(500).json({ message: "Failed to calculate sample size" });
    }
  });

  // Citation Verifier endpoint
  app.post("/api/citations/verify", async (req, res) => {
    try {
      const { claim } = req.body;
      
      if (!claim) {
        return res.status(400).json({ message: "Research claim is required" });
      }

      const verification = await verifyCitation(claim);
      
      // Store the verification
      const verificationData = {
        userId: DEFAULT_USER_ID,
        claim,
        verificationStatus: verification.status,
        confidence: verification.confidence,
        supportingEvidence: verification.supportingEvidence,
        aiAnalysis: verification.aiAnalysis
      };

      const storedVerification = await storage.createCitationVerification(verificationData);
      
      res.json({
        id: storedVerification.id,
        ...verification
      });
    } catch (error) {
      console.error("Citation verification error:", error);
      res.status(500).json({ message: "Failed to verify citation" });
    }
  });

  // Protocol Exporter endpoint
  app.post("/api/protocols/export", async (req, res) => {
    try {
      const { methodIds, title, format, includeCitations, includeEquipment, includeCostEstimates } = req.body;
      
      if (!methodIds || !Array.isArray(methodIds) || methodIds.length === 0) {
        return res.status(400).json({ message: "At least one method ID is required" });
      }

      if (!title || !format) {
        return res.status(400).json({ message: "Title and format are required" });
      }

      // Get methods data
      const methods = await Promise.all(
        methodIds.map(id => storage.getMethod(id))
      );

      const validMethods = methods.filter(m => m !== undefined);
      
      if (validMethods.length === 0) {
        return res.status(404).json({ message: "No valid methods found" });
      }

      // Generate protocol content
      const protocolContent = await generateProtocolContent(
        validMethods,
        undefined,
        includeCitations,
        includeEquipment,
        includeCostEstimates
      );

      const protocolData = {
        title,
        methods: validMethods,
        content: protocolContent
      };

      const exportOptions = {
        format,
        includeCitations: includeCitations || false,
        includeEquipment: includeEquipment || false,
        includeCostEstimates: includeCostEstimates || false
      };

      // Generate export
      const exportedContent = await exportProtocol(protocolData, exportOptions);
      
      // Store protocol record
      const protocolRecord = {
        userId: DEFAULT_USER_ID,
        methodIds,
        title,
        format,
        content: protocolData,
        includeCitations: includeCitations || false,
        includeEquipment: includeEquipment || false,
        includeCostEstimates: includeCostEstimates || false
      };

      const protocol = await storage.createProtocol(protocolRecord);

      // Set response headers for download
      const mimeType = getExportMimeType(format);
      const filename = getExportFilename(title, format);
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (typeof exportedContent === 'string') {
        res.send(exportedContent);
      } else {
        res.send(exportedContent);
      }
    } catch (error) {
      console.error("Protocol export error:", error);
      res.status(500).json({ message: "Failed to export protocol" });
    }
  });

  // Get user's methods
  app.get("/api/methods", async (req, res) => {
    try {
      const methods = await storage.getMethodsByUser(DEFAULT_USER_ID);
      res.json(methods);
    } catch (error) {
      console.error("Get methods error:", error);
      res.status(500).json({ message: "Failed to get methods" });
    }
  });

  // Get user's sample size calculations
  app.get("/api/sample-size", async (req, res) => {
    try {
      const calculations = await storage.getSampleSizeCalculationsByUser(DEFAULT_USER_ID);
      res.json(calculations);
    } catch (error) {
      console.error("Get calculations error:", error);
      res.status(500).json({ message: "Failed to get calculations" });
    }
  });

  // Get user's citation verifications
  app.get("/api/citations", async (req, res) => {
    try {
      const verifications = await storage.getCitationVerificationsByUser(DEFAULT_USER_ID);
      res.json(verifications);
    } catch (error) {
      console.error("Get verifications error:", error);
      res.status(500).json({ message: "Failed to get verifications" });
    }
  });

  // Get user's protocols
  app.get("/api/protocols", async (req, res) => {
    try {
      const protocols = await storage.getProtocolsByUser(DEFAULT_USER_ID);
      res.json(protocols);
    } catch (error) {
      console.error("Get protocols error:", error);
      res.status(500).json({ message: "Failed to get protocols" });
    }
  });

  // PubMed search endpoint
  app.get("/api/pubmed/search", async (req, res) => {
    try {
      const { query, maxResults } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const results = await searchPubMed(query as string, parseInt(maxResults as string) || 10);
      res.json(results);
    } catch (error) {
      console.error("PubMed search error:", error);
      res.status(500).json({ message: "Failed to search PubMed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
