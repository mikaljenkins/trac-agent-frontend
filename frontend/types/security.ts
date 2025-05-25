/**
 * 🔒 Security Type Definitions
 * 
 * Core types for the symbolic security system.
 * These types ensure consistent security event handling across the system.
 */

export interface SecurityIncident {
  timestamp: string;
  module: string;
  action: string;
  filePath: string;
  notes?: string[];
  vector?: string;
  symbolicImpact?: string;
  severity?: 'low' | 'medium' | 'high';
  context?: {
    previousIncidents?: number;
    affectedSymbols?: string[];
    symbolicImpact?: string;
  };
}

export interface TamperEvent extends SecurityIncident {
  locked: true;
  vector: string;  // Required for tamper events
  symbolicImpact: string;  // Required for tamper events
} 