/**
 * Google Sheets Service
 * Writes lead data to Google Sheets CRM using secure service account authentication
 * 
 * Environment Variables (supports two approaches):
 * 
 * Approach 1 - Full JSON (recommended):
 * - GOOGLE_SERVICE_ACCOUNT_JSON: Full JSON string of service account credentials
 * - GOOGLE_SHEET_ID: Google Spreadsheet ID
 * 
 * Approach 2 - Separate secrets:
 * - GOOGLE_SHEETS_CLIENT_EMAIL: Service account email from JSON
 * - GOOGLE_SHEETS_PRIVATE_KEY: Private key from JSON (include full key with BEGIN/END markers)
 * - GOOGLE_SHEETS_SPREADSHEET_ID: Google Spreadsheet ID
 * 
 * Security: Never logs credentials or sheet ID
 */

import { google } from 'googleapis';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  accredited: boolean;
  capitalRange: string;
  timeline: string;
  interest: string;
}

/**
 * Append a lead to Google Sheets "Leads" tab
 * 
 * @param leadData - The lead data to append
 * @returns Promise<void>
 * 
 * Columns (A-K):
 * A: Created At (ISO timestamp)
 * B: Name
 * C: Email
 * D: Phone
 * E: Accredited ("Yes" or "No")
 * F: Capital Range
 * G: Investment Timeline
 * H: Primary Interest
 * I: Status (always "New")
 * J: Notes (empty string)
 * K: Source (always "Meta")
 */
export async function appendLeadToSheet(leadData: LeadData): Promise<void> {
  // Support two approaches:
  // 1. Full JSON string in GOOGLE_SERVICE_ACCOUNT_JSON
  // 2. Separate secrets: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_SPREADSHEET_ID
  
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON 
    || process.env.GOOGLE_SHEETS_CREDENTIALS;
  
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  
  const sheetId = process.env.GOOGLE_SHEET_ID 
    || process.env.GOOGLE_SHEETS_ID
    || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  // Check if we have credentials (either full JSON or separate parts)
  const hasFullJson = !!credentialsJson;
  const hasSeparateParts = !!(clientEmail && privateKey);
  const hasSheetId = !!sheetId;

  if ((!hasFullJson && !hasSeparateParts) || !hasSheetId) {
    console.warn("Google Sheets not configured. Skipping sheet update.");
    console.warn(`GOOGLE_SERVICE_ACCOUNT_JSON: ${hasFullJson ? 'SET' : 'NOT SET'}`);
    console.warn(`GOOGLE_SHEETS_CLIENT_EMAIL: ${clientEmail ? 'SET' : 'NOT SET'}`);
    console.warn(`GOOGLE_SHEETS_PRIVATE_KEY: ${privateKey ? 'SET' : 'NOT SET'}`);
    console.warn(`GOOGLE_SHEET_ID / GOOGLE_SHEETS_SPREADSHEET_ID: ${hasSheetId ? 'SET' : 'NOT SET'}`);
    console.warn("Available env vars with 'GOOGLE':", Object.keys(process.env).filter(k => k.includes('GOOGLE')));
    return;
  }

  try {
    // Build credentials object from either full JSON or separate parts
    let credentials;
    
    if (hasFullJson) {
      // Approach 1: Parse full JSON string
      try {
        credentials = typeof credentialsJson === 'string' 
          ? JSON.parse(credentialsJson) 
          : credentialsJson;
      } catch (parseError: any) {
        console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', parseError.message);
        throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON');
      }
    } else {
      // Approach 2: Construct from separate secrets
      credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_SHEETS_PROJECT_ID || 'default-project',
        private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID || '',
        private_key: privateKey,
        client_email: clientEmail,
        client_id: process.env.GOOGLE_SHEETS_CLIENT_ID || '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: '',
      };
    }

    // Validate required credential fields
    if (!credentials.client_email || !credentials.private_key) {
      console.error('Missing required fields in service account credentials');
      throw new Error('Service account credentials missing client_email or private_key');
    }

    // Authenticate using GoogleAuth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize Sheets API v4
    const sheets = google.sheets({ version: 'v4', auth });

    // Target the "Leads" tab
    const tabName = 'Leads';

    // Prepare row data according to exact column requirements
    const createdAt = new Date().toISOString();
    const row = [
      createdAt,                                    // A: Created At
      leadData.name,                                 // B: Name
      leadData.email,                               // C: Email
      leadData.phone,                               // D: Phone
      leadData.accredited ? 'Yes' : 'No',          // E: Accredited
      leadData.capitalRange,                        // F: Capital Range
      leadData.timeline,                            // G: Investment Timeline
      leadData.interest,                           // H: Primary Interest
      'New',                                        // I: Status
      '',                                           // J: Notes
      'Meta',                                       // K: Source
    ];

    // Append row to "Leads" tab
    // Using A1 as the range - Google Sheets will automatically append to the next available row
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tabName}!A1`, // Start from A1, Sheets will append to next row
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    console.log('Lead appended to Google Sheets successfully');
  } catch (error: any) {
    // Log error without exposing credentials or sheet ID
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.code || 'NO_CODE';
    const errorStatus = error?.response?.status || 'NO_STATUS';
    
    console.error('Error appending to Google Sheets:', {
      message: errorMessage,
      code: errorCode,
      status: errorStatus,
      // Log if it's a credentials issue
      isAuthError: errorCode === 'ENOTFOUND' || errorCode === 'UNAUTHENTICATED' || errorStatus === 401 || errorStatus === 403,
      // Log if it's a sheet not found issue
      isNotFoundError: errorStatus === 404,
    });
    
    // Don't throw - we don't want to fail the form submission if Sheets fails
    // The error is logged but won't block the form submission
    throw error; // Re-throw so the caller can see it in logs, but we'll catch it in routes.ts
  }
}

