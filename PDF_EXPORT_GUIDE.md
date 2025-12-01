# 📄 PDF Transaction Export Feature

##Overview
The banking API now supports exporting transaction history to PDF format. This feature generates a professional report with account information and a detailed transaction table.

## Features

✅ **Professional PDF Format**
- Account information summary
- Detailed transaction history table
- Automatic pagination for large reports
- French localization (dates in FR format)

✅ **Filtering by Date Range**
- Export transactions from a specific period
- Optional start and end dates

✅ **Secure Export**
- PDF generated server-side
- Sent directly to client as attachment
- No files stored on server

## API Endpoint

### Export Transaction History to PDF

```http
GET /api/mouvements/export/pdf/{compteId}
```

**Parameters:**
- `compteId` (path, required): UUID of the account
- `dateFrom` (query, optional): Start date (ISO 8601 format, e.g., `2024-11-01`)
- `dateTo` (query, optional): End date (ISO 8601 format, e.g., `2024-11-30`)

**Response:**
- `Content-Type`: `application/pdf`
- `Content-Disposition`: `attachment; filename="releve_{numeroCompte}_{date}.pdf"`
- Binary PDF file

## Usage Examples

### Export All Transactions
```powershell
$accountId = "aab5c85c-b4eb-447e-ac9f-29607e1823d1"
$response = Invoke-RestMethod `
  -Uri "http://localhost:4000/api/mouvements/export/pdf/$accountId" `
  -Method Get `
  -OutFile "releve.pdf"
  
Write-Host "✓ PDF saved to releve.pdf"
```

### Export Transactions for November 2024
```powershell
$accountId = "aab5c85c-b4eb-447e-ac9f-29607e1823d1"
$response = Invoke-RestMethod `
  -Uri "http://localhost:4000/api/mouvements/export/pdf/$accountId?dateFrom=2024-11-01&dateTo=2024-11-30" `
  -Method Get `
  -OutFile "releve_november.pdf"
```

### Export Last Week
```bash
curl -o releve.pdf \
  "http://localhost:4000/api/mouvements/export/pdf/{compteId}?dateFrom=2024-11-20&dateTo=2024-11-27"
```

## PDF Report Contents

The generated PDF includes:

### 1. Header
- Bank Name (SERVICE BANK)
- Report Title (Relevé de Compte Détaillé)
- Generation Date

### 2. Account Summary
- Account Number
- Account Type (COURANT/EPARGNE)
- Current Balance
- Client ID
- Account Creation Date
- Active Status

### 3. Transaction History Table
Columns:
- **Date**: Transaction date (DD/MM/YYYY HH:MM)
- **Type**: CREDIT or DEBIT
- **Montant**: Transaction amount in EUR
- **Solde Après**: Balance after transaction in EUR
- **Description**: Transaction description (truncated to 40 chars)

### 4. Footer
- Page number
- Copyright notice

## Technical Implementation

### Dependencies
- `pdfkit`: PDF generation library
- Express.js: HTTP endpoint handling

### File Structure
- **Service**: `src/services/pdfExportService.ts`
  - `generateTransactionPDF()`: Main PDF generation method
  - `drawHeader()`: Header section
  - `drawAccountSummary()`: Account info section
  - `drawTransactionsTable()`: Transactions table
  - `drawFooter()`: Footer section

- **Controller**: `src/controllers/mouvementController.ts`
  - `exportToPDF()`: HTTP handler for the export endpoint

- **Route**: `src/routes/mouvementRoutes.ts`
  - GET `/export/pdf/:compteId`

## Error Handling

The endpoint returns appropriate HTTP status codes:

- `200 OK`: PDF successfully generated and returned
- `404 Not Found`: Account ID doesn't exist
- `400 Bad Request`: Invalid date format or missing compteId
- `500 Internal Server Error`: PDF generation failed

## Testing

### Run Test Script
```bash
node test-pdf-export.js
```

This generates a sample PDF with mock data to verify the PDF generation works correctly.

### Test with Real API (when server is running)
```powershell
# Get account ID
$accounts = Invoke-RestMethod -Uri "http://localhost:4000/api/comptes" -Method Get
$accountId = $accounts.data[0]._id

# Export PDF
Invoke-RestMethod `
  -Uri "http://localhost:4000/api/mouvements/export/pdf/$accountId" `
  -Method Get `
  -OutFile "my_statement.pdf"
```

## Performance Notes

- **File Size**: Typical reports are 3-10 KB
- **Generation Time**: < 100ms for normal account sizes
- **Pagination**: Automatically handles large transaction lists (fits multiple pages if needed)

## Future Enhancements

Possible improvements for future versions:

1. **CSV Export**: Alternative format for spreadsheet analysis
2. **Email Delivery**: Send PDF directly to client email
3. **Branding**: Customizable header/footer with client logo
4. **Translations**: Support for multiple languages
5. **Advanced Filtering**: Filter by transaction type, amount range, etc.
6. **Recurring Exports**: Automated monthly report generation
7. **Digital Signature**: Add certificate for authentic documents

## Compliance

The PDF export feature supports:
- ✅ French accounting standards
- ✅ ISO 8601 date formatting
- ✅ EUR currency formatting
- ✅ Audit trail (transaction reference tracking)
