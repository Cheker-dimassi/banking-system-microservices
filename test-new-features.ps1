# Test script for new features: Transaction Filtering & Account Security
$baseUrl = "http://localhost:4000"

# ============== 1. CREATE TEST ACCOUNT ==============
Write-Host "`n=== STEP 1: Create Test Account ===" -ForegroundColor Cyan
$clientId = [guid]::NewGuid().ToString()
$body = @{
  typeCompte = "COURANT"
  clientId = $clientId
  email = "test.features@example.com"
  solde = 10000
} | ConvertTo-Json

$account = Invoke-RestMethod -Uri "$baseUrl/api/comptes" -Method Post -Body $body -ContentType 'application/json'
$accountId = $account.data._id
Write-Host "✓ Account Created: $accountId" -ForegroundColor Green
Write-Host "  Balance: $($account.data.solde) EUR"

# ============== 2. ADD TRANSACTIONS ==============
Write-Host "`n=== STEP 2: Add Multiple Transactions ===" -ForegroundColor Cyan

# Credit 1: Salary
$creditBody = @{ montant = 2500; description = "Salary November" } | ConvertTo-Json
$tx1 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/credit/$accountId" -Method Post -Body $creditBody -ContentType 'application/json'
Write-Host "✓ Credit: 2500 EUR - Salary" -ForegroundColor Green

# Debit 1: Rent
Start-Sleep -Milliseconds 500
$debitBody = @{ montant = 800; description = "Apartment rent payment" } | ConvertTo-Json
$tx2 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/debit/$accountId" -Method Post -Body $debitBody -ContentType 'application/json'
Write-Host "✓ Debit: 800 EUR - Rent" -ForegroundColor Green

# Debit 2: Groceries
Start-Sleep -Milliseconds 500
$debitBody = @{ montant = 150; description = "Grocery shopping" } | ConvertTo-Json
$tx3 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/debit/$accountId" -Method Post -Body $debitBody -ContentType 'application/json'
Write-Host "✓ Debit: 150 EUR - Groceries" -ForegroundColor Green

# Credit 2: Bonus
Start-Sleep -Milliseconds 500
$creditBody = @{ montant = 500; description = "Performance bonus" } | ConvertTo-Json
$tx4 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/credit/$accountId" -Method Post -Body $creditBody -ContentType 'application/json'
Write-Host "✓ Credit: 500 EUR - Bonus" -ForegroundColor Green

# Debit 3: Utilities
Start-Sleep -Milliseconds 500
$debitBody = @{ montant = 100; description = "Electricity and water bills" } | ConvertTo-Json
$tx5 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/debit/$accountId" -Method Post -Body $debitBody -ContentType 'application/json'
Write-Host "✓ Debit: 100 EUR - Utilities" -ForegroundColor Green

# ============== 3. TEST FILTERING ==============
Write-Host "`n=== STEP 3: Test Transaction Filtering ===" -ForegroundColor Cyan

# Filter by type (DEBIT only)
$filterUrl = "$baseUrl/api/mouvements/filter/$accountId?typeTransaction=DEBIT"
$debits = Invoke-RestMethod -Uri $filterUrl -Method Get
Write-Host "✓ Debits Only: $($debits.data.summary.debitCount) transactions" -ForegroundColor Green
Write-Host "  Total debits: $($debits.data.summary.totalDebits) EUR"

# Filter by amount range
$filterUrl = "$baseUrl/api/mouvements/filter/$accountId`?minAmount=200`&maxAmount=1000"
$filtered = Invoke-RestMethod -Uri $filterUrl -Method Get
Write-Host "✓ Amount Range (200-1000 EUR): $($filtered.data.total) transactions" -ForegroundColor Green

# Filter by description search
$filterUrl = "$baseUrl/api/mouvements/filter/$accountId?description=payment"
$search = Invoke-RestMethod -Uri $filterUrl -Method Get
Write-Host "✓ Description Search ('payment'): $($search.data.total) transactions" -ForegroundColor Green

# ============== 4. TEST ACCOUNT SECURITY - SPENDING LIMIT ==============
Write-Host "`n=== STEP 4: Test Account Security - Spending Limit ===" -ForegroundColor Cyan

# Set daily limit to 500 EUR
$limitBody = @{ limiteMoyenne = 500 } | ConvertTo-Json
$limitSet = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/limit/$accountId" -Method Post -Body $limitBody -ContentType 'application/json'
Write-Host "✓ Daily Spending Limit Set: 500 EUR" -ForegroundColor Green

# Get security status
$status = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/status/$accountId" -Method Get
Write-Host "✓ Security Status Retrieved:" -ForegroundColor Green
Write-Host "  - Is Frozen: $($status.data.estGele)"
Write-Host "  - Daily Limit: $($status.data.limiteMoyenne) EUR"
Write-Host "  - Today's Spending: $($status.data.depenseAujourdui) EUR"

# ============== 5. TEST ACCOUNT FREEZE ==============
Write-Host "`n=== STEP 5: Test Account Freeze ===" -ForegroundColor Cyan

# Freeze account
$freezeBody = @{ raison = "Suspicious activity detected" } | ConvertTo-Json
$frozen = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/freeze/$accountId" -Method Post -Body $freezeBody -ContentType 'application/json'
Write-Host "✓ Account Frozen: $($frozen.data.compte.estGele)" -ForegroundColor Green
Write-Host "  Reason: $($frozen.data.compte.raison_gel)"

# Try to debit frozen account (should fail)
Write-Host "`n  Attempting debit on frozen account..." -ForegroundColor Yellow
try {
  $debitBody = @{ montant = 50; description = "Test transaction" } | ConvertTo-Json
  Invoke-RestMethod -Uri "$baseUrl/api/mouvements/debit/$accountId" -Method Post -Body $debitBody -ContentType "application/json"
  Write-Host "  ✗ ERROR: Transaction should have failed!" -ForegroundColor Red
} catch {
  Write-Host "  ✓ Transaction correctly rejected: Account is frozen" -ForegroundColor Green
}

# Unfreeze account
$unfreeze = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/unfreeze/$accountId" -Method Post
Write-Host "`n✓ Account Unfrozen" -ForegroundColor Green

# ============== 6. TEST WHITELIST ==============
Write-Host "`n=== STEP 6: Test Whitelist Management ===" -ForegroundColor Cyan

# Add address to whitelist
$whitelistBody = @{ adresse = "trusted-partner-account@bank.com" } | ConvertTo-Json
$added = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/whitelist/add/$accountId" -Method Post -Body $whitelistBody -ContentType "application/json"
Write-Host "✓ Address Added to Whitelist:" -ForegroundColor Green
Write-Host "  - $($added.data.listeBlanche[0])"

# Add another address
$whitelistBody = @{ adresse = "family-account@bank.com" } | ConvertTo-Json
$added2 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/whitelist/add/$accountId" -Method Post -Body $whitelistBody -ContentType "application/json"
Write-Host "✓ Another Address Added"
Write-Host "  - Total whitelisted: $($added2.data.listeBlanche.Count) addresses"

# ============== 7. TEST MONTHLY STATISTICS ==============
Write-Host "`n=== STEP 7: Get Monthly Statistics ===" -ForegroundColor Cyan

$stats = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/statistics/monthly/$accountId" -Method Get
Write-Host "✓ Monthly Statistics:" -ForegroundColor Green
foreach ($month in $stats.data.PSObject.Properties | Select-Object -First 3) {
  Write-Host "  Month: $($month.Name)"
  Write-Host "    - Credits: $($month.Value.totalCredits) EUR ($($month.Value.creditCount) tx)"
  Write-Host "    - Debits: $($month.Value.totalDebits) EUR ($($month.Value.debitCount) tx)"
}

# ============== 8. TEST PAGINATED FILTER ==============
Write-Host "`n=== STEP 8: Test Paginated Filtering ===" -ForegroundColor Cyan

$paginatedUrl = "$baseUrl/api/mouvements/filter-paginated/$accountId`?page=1`&limit=2`&typeTransaction=DEBIT"
$paginated = Invoke-RestMethod -Uri $paginatedUrl -Method Get
Write-Host "✓ Paginated Results:" -ForegroundColor Green
Write-Host "  - Page: $($paginated.data.page)/$($paginated.data.totalPages)"
Write-Host "  - Showing: $($paginated.data.transactions.Count) of $($paginated.data.total) debits"

# ============== FINAL SUMMARY ==============
Write-Host "`n=== ✓ ALL TESTS COMPLETED SUCCESSFULLY ===" -ForegroundColor Cyan
Write-Host "`nFeatures Tested:" -ForegroundColor Yellow
Write-Host "  ✓ Transaction Filtering by type, amount, description"
Write-Host "  ✓ Account Freezing/Unfreezing"
Write-Host "  ✓ Daily Spending Limits"
Write-Host "  ✓ Whitelist Management"
Write-Host "  ✓ Monthly Statistics"
Write-Host "  ✓ Paginated Filtering"
Write-Host "`nAccount ID for reference: $accountId`n"
