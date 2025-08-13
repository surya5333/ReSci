import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ResearchMethod {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  citations: string[];
  feasibility: "High" | "Moderate" | "Low";
  confidence: number;
}

export interface MethodsRecommendation {
  primaryMethods: ResearchMethod[];
  alternativeMethod: ResearchMethod;
  searchQuery: string;
  confidence: number;
}

export interface VerificationResult {
  status: "supported" | "partially_supported" | "not_supported";
  confidence: number;
  supportingEvidence: {
    title: string;
    authors: string;
    year: string;
    journal: string;
    match: number;
    quote: string;
    impactFactor?: number;
  }[];
  considerations: string[];
  aiAnalysis: string;
}

export async function generateMethodsRecommendation(
  hypothesis: string,
  variables: string,
  constraints?: string
): Promise<MethodsRecommendation> {
  try {
    const systemPrompt = `You are RESAI, an AI research planning assistant specializing in methodology recommendation.
    
Your task is to recommend research methods based on the provided hypothesis, variables, and constraints.
You should provide 1-2 primary methods and 1 alternative method.

For each method, provide:
- Title (concise method name)
- Description (detailed explanation)
- Pros (3-4 advantages)
- Cons (3-4 disadvantages)
- Citations (real author names and years)
- Feasibility (High/Moderate/Low)
- Confidence (0-100)

Consider practical constraints like budget, timeline, and ethical considerations.
Base recommendations on established research methodologies with literature support.`;

    const prompt = `Research Context:
Hypothesis: ${hypothesis}
Variables: ${variables}
Constraints: ${constraints || 'None specified'}

Generate research method recommendations with the following structure:
{
  "primaryMethods": [
    {
      "title": "Method name",
      "description": "Detailed description",
      "pros": ["advantage 1", "advantage 2", "advantage 3"],
      "cons": ["disadvantage 1", "disadvantage 2", "disadvantage 3"],
      "citations": ["Author et al. (2020)", "Smith & Jones (2019)"],
      "feasibility": "High|Moderate|Low",
      "confidence": 90
    }
  ],
  "alternativeMethod": {
    "title": "Alternative method name",
    "description": "Description for backup option",
    "pros": ["advantage 1", "advantage 2"],
    "cons": ["disadvantage 1", "disadvantage 2"],
    "citations": ["Reference 1", "Reference 2"],
    "feasibility": "High|Moderate|Low",
    "confidence": 75
  },
  "searchQuery": "relevant search terms",
  "confidence": 85
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    throw new Error(`Failed to generate methods recommendation: ${error}`);
  }
}

export async function verifyCitation(claim: string): Promise<VerificationResult> {
  try {
    const systemPrompt = `You are RESAI, an AI research assistant specializing in citation verification.
    
Analyze the given research claim and determine if it's supported by scientific literature.
Provide a verification status, confidence level, supporting evidence, and analysis.

Return results in this format:
{
  "status": "supported|partially_supported|not_supported",
  "confidence": 85,
  "supportingEvidence": [
    {
      "title": "Paper title",
      "authors": "Author, A. et al.",
      "year": "2020",
      "journal": "Journal Name",
      "match": 95,
      "quote": "Relevant quote from the paper",
      "impactFactor": 4.8
    }
  ],
  "considerations": ["Additional considerations or caveats"],
  "aiAnalysis": "Detailed analysis of the claim verification"
}`;

    const prompt = `Verify this research claim:
"${claim}"

Analyze the claim and provide verification results with supporting evidence from scientific literature.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    throw new Error(`Failed to verify citation: ${error}`);
  }
}

export async function generateProtocolContent(
  methods: any[],
  sampleSize?: any,
  includeCitations: boolean = true,
  includeEquipment: boolean = true,
  includeCostEstimates: boolean = false
): Promise<any> {
  try {
    const systemPrompt = `You are RESAI, an AI research assistant that generates detailed research protocols.
    
Generate a comprehensive research protocol document based on the provided methods and parameters.
Include all necessary sections for a lab-ready protocol.`;

    const prompt = `Generate a research protocol with these specifications:

Methods: ${JSON.stringify(methods)}
Sample Size: ${sampleSize ? JSON.stringify(sampleSize) : 'Not specified'}
Include Citations: ${includeCitations}
Include Equipment: ${includeEquipment}
Include Cost Estimates: ${includeCostEstimates}

Structure the protocol with:
1. Title and Overview
2. Objectives
3. Methods and Procedures
4. Sample Size Justification
5. Equipment and Materials (if requested)
6. Statistical Analysis Plan
7. References (if requested)
8. Cost Estimates (if requested)

Return as structured JSON for document generation.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return {
      content: response.text,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to generate protocol content: ${error}`);
  }
}
