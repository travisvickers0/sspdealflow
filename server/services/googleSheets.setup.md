# Google Sheets Integration Setup Guide

This guide will help you connect the qualification form to Google Sheets so that every form submission is automatically added to a spreadsheet.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Name it something like "SSP Deal Flow" or "SSP Sheets Integration"

## Step 2: Enable Google Sheets API

1. In your Google Cloud project, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click on it and click **Enable**

## Step 3: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Give it a name (e.g., "ssp-sheets-service")
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

## Step 4: Create and Download Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Download the JSON file (keep it secure!)

## Step 5: Create Your Google Sheet

1. Create a new Google Sheet (or use an existing one)
2. Name it something like "SSP Investor Leads" or "Qualification Form Leads"
3. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
   - The `SHEET_ID` is the long string between `/d/` and `/edit`
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## Step 6: Share Sheet with Service Account

1. Open your Google Sheet
2. Click the **Share** button (top right)
3. Find the service account email in your downloaded JSON file:
   - Open the JSON file
   - Look for `"client_email"` field
   - It looks like: `ssp-sheets-service@your-project-id.iam.gserviceaccount.com`
4. Paste that email into the Share dialog
5. Give it **Editor** permissions
6. Click **Send** (you can uncheck "Notify people" if you want)

## Step 7: Set Up Environment Variables

You need to set these environment variables in your Replit project:

### Option A: Using Replit Secrets (Recommended)

1. In Replit, click the **Secrets** tab (lock icon) in the left sidebar
2. Add these secrets:

**GOOGLE_SHEETS_CREDENTIALS**
- Value: Copy the entire contents of your downloaded JSON file
- Example: `{"type":"service_account","project_id":"your-project",...}`

**GOOGLE_SHEETS_ID**
- Value: Your Google Sheet ID (from Step 5)
- Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

**GOOGLE_SHEETS_RANGE** (Optional)
- Value: The range where data should be appended
- Default: `Sheet1!A1`
- Examples:
  - `Sheet1!A1` - First sheet, starting at A1
  - `Leads!A1` - Sheet named "Leads", starting at A1
  - `A1` - Current sheet, starting at A1

### Option B: Using .env file (Development only)

Create a `.env` file in your project root:

```env
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"your-project",...}'
GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SHEETS_RANGE=Sheet1!A1
```

**⚠️ Important:** Never commit the `.env` file to git! The JSON credentials contain sensitive information.

## Step 8: Test the Integration

1. Submit a test form at `/qualify`
2. Check your Google Sheet - you should see a new row with:
   - Timestamp
   - Full Name
   - Email
   - Phone
   - Accredited Investor (Yes/No)
   - Capital Range
   - Investment Timeline
   - Primary Interest

## Troubleshooting

### "Error appending to Google Sheets"
- Check that the service account email has Editor access to the sheet
- Verify the Sheet ID is correct
- Check that the JSON credentials are valid and properly formatted
- Make sure Google Sheets API is enabled in your Google Cloud project

### "Google Sheets not configured"
- This is a warning, not an error - the form will still work
- It means the environment variables are not set
- The form will still save to the database and send emails

### Data not appearing in sheet
- Check the `GOOGLE_SHEETS_RANGE` - make sure it points to the correct sheet
- Verify the service account has Editor permissions
- Check server logs for specific error messages

## Column Order

The data is appended in this order:
1. Timestamp
2. Full Name
3. Email
4. Phone
5. Accredited Investor
6. Capital Range
7. Investment Timeline
8. Primary Interest

You can add headers manually in row 1 of your sheet, or the system will auto-detect if the sheet is empty.

## Security Notes

- Keep your service account JSON file secure
- Never commit credentials to version control
- The service account only needs access to the specific sheet you're using
- You can revoke access at any time by removing the service account from the sheet's sharing settings

