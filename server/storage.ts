import { type User, type InsertUser, type Hypothesis, type InsertHypothesis, type Method, type InsertMethod, type SampleSizeCalculation, type InsertSampleSizeCalculation, type CitationVerification, type InsertCitationVerification, type Protocol, type InsertProtocol } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createHypothesis(hypothesis: InsertHypothesis): Promise<Hypothesis>;
  getHypothesesByUser(userId: string): Promise<Hypothesis[]>;
  
  createMethod(method: InsertMethod): Promise<Method>;
  getMethodsByUser(userId: string): Promise<Method[]>;
  getMethod(id: string): Promise<Method | undefined>;
  
  createSampleSizeCalculation(calculation: InsertSampleSizeCalculation): Promise<SampleSizeCalculation>;
  getSampleSizeCalculationsByUser(userId: string): Promise<SampleSizeCalculation[]>;
  
  createCitationVerification(verification: InsertCitationVerification): Promise<CitationVerification>;
  getCitationVerificationsByUser(userId: string): Promise<CitationVerification[]>;
  
  createProtocol(protocol: InsertProtocol): Promise<Protocol>;
  getProtocolsByUser(userId: string): Promise<Protocol[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private hypotheses: Map<string, Hypothesis>;
  private methods: Map<string, Method>;
  private sampleSizeCalculations: Map<string, SampleSizeCalculation>;
  private citationVerifications: Map<string, CitationVerification>;
  private protocols: Map<string, Protocol>;

  constructor() {
    this.users = new Map();
    this.hypotheses = new Map();
    this.methods = new Map();
    this.sampleSizeCalculations = new Map();
    this.citationVerifications = new Map();
    this.protocols = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createHypothesis(insertHypothesis: InsertHypothesis & { userId?: string }): Promise<Hypothesis> {
    const id = randomUUID();
    const hypothesis: Hypothesis = { 
      ...insertHypothesis, 
      id, 
      userId: insertHypothesis.userId || "default-user",
      createdAt: new Date(),
      constraints: insertHypothesis.constraints || null
    };
    this.hypotheses.set(id, hypothesis);
    return hypothesis;
  }

  async getHypothesesByUser(userId: string): Promise<Hypothesis[]> {
    return Array.from(this.hypotheses.values()).filter(h => h.userId === userId);
  }

  async createMethod(insertMethod: InsertMethod & { userId?: string }): Promise<Method> {
    const id = randomUUID();
    const method: Method = { 
      ...insertMethod, 
      id, 
      userId: insertMethod.userId || "default-user",
      createdAt: new Date(),
      constraints: insertMethod.constraints || null,
      hypothesisId: insertMethod.hypothesisId || null,
      alternativeMethod: insertMethod.alternativeMethod || null,
      confidence: insertMethod.confidence || null
    };
    this.methods.set(id, method);
    return method;
  }

  async getMethodsByUser(userId: string): Promise<Method[]> {
    return Array.from(this.methods.values()).filter(m => m.userId === userId);
  }

  async getMethod(id: string): Promise<Method | undefined> {
    return this.methods.get(id);
  }

  async createSampleSizeCalculation(insertCalculation: InsertSampleSizeCalculation & { userId?: string }): Promise<SampleSizeCalculation> {
    const id = randomUUID();
    const calculation: SampleSizeCalculation = { 
      ...insertCalculation, 
      id, 
      userId: insertCalculation.userId || "default-user",
      createdAt: new Date() 
    };
    this.sampleSizeCalculations.set(id, calculation);
    return calculation;
  }

  async getSampleSizeCalculationsByUser(userId: string): Promise<SampleSizeCalculation[]> {
    return Array.from(this.sampleSizeCalculations.values()).filter(c => c.userId === userId);
  }

  async createCitationVerification(insertVerification: InsertCitationVerification & { userId?: string }): Promise<CitationVerification> {
    const id = randomUUID();
    const verification: CitationVerification = { 
      ...insertVerification, 
      id, 
      userId: insertVerification.userId || "default-user",
      createdAt: new Date() 
    };
    this.citationVerifications.set(id, verification);
    return verification;
  }

  async getCitationVerificationsByUser(userId: string): Promise<CitationVerification[]> {
    return Array.from(this.citationVerifications.values()).filter(v => v.userId === userId);
  }

  async createProtocol(insertProtocol: InsertProtocol & { userId?: string }): Promise<Protocol> {
    const id = randomUUID();
    const protocol: Protocol = { 
      ...insertProtocol, 
      id, 
      userId: insertProtocol.userId || "default-user",
      exportedAt: new Date(),
      includeCitations: insertProtocol.includeCitations || null,
      includeEquipment: insertProtocol.includeEquipment || null,
      includeCostEstimates: insertProtocol.includeCostEstimates || null
    };
    this.protocols.set(id, protocol);
    return protocol;
  }

  async getProtocolsByUser(userId: string): Promise<Protocol[]> {
    return Array.from(this.protocols.values()).filter(p => p.userId === userId);
  }
}

export const storage = new MemStorage();
