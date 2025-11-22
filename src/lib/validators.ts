import { z } from 'zod';
import DOMPurify from 'dompurify';

// Email validation
export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email format (example: user@domain.com)" })
  .max(255, { message: "Email must be less than 255 characters" })
  .transform(val => DOMPurify.sanitize(val.toLowerCase()));

// Password validation with complexity requirements
export const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must include at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must include at least one number" })
  .regex(/[@$!%*?&]/, { message: "Password must include at least one special character (@$!%*?&)" });

// Name validation
export const nameSchema = z.string()
  .trim()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(100, { message: "Name must be less than 100 characters" })
  .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens, and apostrophes" })
  .transform(val => DOMPurify.sanitize(val));

// Phone number validation (E.164 format)
export const phoneSchema = z.string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format. Use international format (e.g., +1234567890)" });

// Batch number validation
export const batchNumberSchema = z.string()
  .trim()
  .min(1, { message: "Batch number is required" })
  .max(50, { message: "Batch number must be less than 50 characters" })
  .regex(/^[A-Z0-9-]+$/i, { message: "Invalid batch number format. Use only letters, numbers, and hyphens" })
  .transform(val => DOMPurify.sanitize(val.toUpperCase()));

// Medicine name validation
export const medicineNameSchema = z.string()
  .trim()
  .min(2, { message: "Medicine name must be at least 2 characters" })
  .max(200, { message: "Medicine name must be less than 200 characters" })
  .transform(val => DOMPurify.sanitize(val));

// Dosage validation
export const dosageSchema = z.string()
  .trim()
  .min(1, { message: "Dosage is required" })
  .max(50, { message: "Dosage must be less than 50 characters" })
  .transform(val => DOMPurify.sanitize(val));

// Generic text input sanitization
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
};

// SQL injection pattern detection
export const hasSQLInjectionPattern = (input: string): boolean => {
  const sqlPatterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(;|\-\-|\/\*|\*\/)/,
    /(\bOR\b.*=.*|'\s*OR\s*'1'\s*=\s*'1)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// XSS pattern detection
export const hasXSSPattern = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// Validate and sanitize complex input
export const validateAndSanitize = (input: string, schema: z.ZodSchema): { success: boolean; data?: string; error?: string } => {
  // Check for malicious patterns first
  if (hasSQLInjectionPattern(input)) {
    return { success: false, error: "Input contains potentially malicious SQL patterns" };
  }
  
  if (hasXSSPattern(input)) {
    return { success: false, error: "Input contains potentially malicious script patterns" };
  }
  
  // Validate with schema
  const result = schema.safeParse(input);
  
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.issues[0].message 
    };
  }
  
  return { success: true, data: result.data as string };
};
