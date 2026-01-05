/**
 * Google Sheets Service
 * Writes lead data to Google Sheets
 */

interface LeadData {
  fullName: string;
  email: string;
  phone: string;
  isAccredited: boolean;
  capitalRange: string;
  investmentTimeline: string;
  primaryInterest: string;
  timestamp?: string;
}

/**
 * Append a lead to Google Sheets
 * 
 * @param leadData - The lead data to append
 * @returns Promise<void>
 * 
 * Setup Instructions:
 * 1. Create a Google Service Account:
 *    - Go to https://console.cloud.google.com/
 *    - Create a new project or select existing
 *    - Enable Google Sheets API
 *    - Create a Service Account
 *    - Download the JSON key file
 * 
 * 2. Share your Google Sheet with the service account email:
 *    - Open your Google Sheet
 *    - Click Share
 *    - Add the service account email (found in the JSON key file, looks like: name@project-id.iam.gserviceaccount.com)
 *    - Give it "Editor" permissions
 * 
 * 3. Get your Sheet ID from the URL:
 *    - URL format: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
 *    - Copy the SHEET_ID part
 * 
 * 4. Set environment variables:
 *    - GOOGLE_SHEETS_CREDENTIALS: JSON string of service account credentials
 *    - GOOGLE_SHEETS_ID: Your Google Sheet ID
 *    - GOOGLE_SHEETS_RANGE: Range to append to (e.g., "Sheet1!A1" or "Leads!A1")
 */
export async function appendLeadToSheet(leadData: LeadData): Promise<void> {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS;
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE || "Sheet1!A1";

  if (!credentialsJson || !sheetId) {
    console.warn("Google Sheets not configured. Skipping sheet update.");
    return;
  }

  try {
    // Parse credentials
    const credentials = typeof credentialsJson === 'string' 
      ? JSON.parse(credentialsJson) 
      : credentialsJson;

    // Import googleapis dynamically (to avoid requiring it if not needed)
    const { google } = await import('googleapis');
    
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Check if sheet needs headers (only check first cell to avoid reading entire sheet)
    try {
      const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${range.split('!')[0]}!A1`, // Get just the sheet name and A1
      });

      // If sheet is empty, add headers first
      if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
        const headers = [
          'Timestamp',
          'Full Name',
          'Email',
          'Phone',
          'Accredited Investor',
          'Capital Range',
          'Investment Timeline',
          'Primary Interest',
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${range.split('!')[0]}!A1:H1`, // Update first row with headers
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers],
          },
        });
      }
    } catch (headerError) {
      // If we can't check headers, continue anyway - might be a permissions issue
      console.warn('Could not check/initialize headers:', headerError);
    }

    // Prepare row data
    const timestamp = leadData.timestamp || new Date().toISOString();
    const row = [
      timestamp,
      leadData.fullName,
      leadData.email,
      leadData.phone,
      leadData.isAccredited ? 'Yes' : 'No',
      leadData.capitalRange,
      leadData.investmentTimeline,
      leadData.primaryInterest,
    ];

    // Append row to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    console.log('Lead appended to Google Sheets successfully');
  } catch (error: any) {
    console.error('Error appending to Google Sheets:', error);
    // Don't throw - we don't want to fail the form submission if Sheets fails
    // The error is logged but won't block the form submission
  }
}

/**
 * Initialize Google Sheets with headers if the sheet is empty
 * Call this once to set up your sheet with column headers
 */
export async function initializeSheetHeaders(): Promise<void> {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS;
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE || "Sheet1!A1";

  if (!credentialsJson || !sheetId) {
    return;
  }

  try {
    const credentials = typeof credentialsJson === 'string' 
      ? JSON.parse(credentialsJson) 
      : credentialsJson;

    const { google } = await import('googleapis');
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Check if sheet has data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    // If sheet is empty or first row doesn't have headers, add them
    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        'Timestamp',
        'Full Name',
        'Email',
        'Phone',
        'Accredited Investor',
        'Capital Range',
        'Investment Timeline',
        'Primary Interest',
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });

      console.log('Google Sheets headers initialized');
    }
  } catch (error: any) {
    console.error('Error initializing Google Sheets headers:', error);
  }
}

