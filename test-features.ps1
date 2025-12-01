$baseUrl = "http://localhost:4000"

Write-Host "`n=== STEP 1: Create Test Account ===" -ForegroundColor Cyan
$clientId = [guid]::NewGuid().ToString()
$body = @{
  typeCompte = "COURANT"
  clientId = $clientId
  email = "test.features@example.com"
  solde = 10000
} | ConvertTo-Json

$account = Invoke-RestMethod -Uri "$baseUrl/api/comptes" -Method Post -Body $body -ContentType "application/json"
$accountId = $account.data._id
Write-Host "Account Created: $accountId" -ForegroundColor Green
Write-Host "  Balance: $($account.data.solde) EUR"

Write-Host "`n=== STEP 2: Add Multiple Transactions ===" -ForegroundColor Cyan

$creditBody = @{ montant = 2500; description = "Salary November" } | ConvertTo-Json
$tx1 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/credit/$accountId" -Method Post -Body $creditBody -ContentType "application/json"
Write-Host "Credit: 2500 EUR - Salary" -ForegroundColor Green

Start-Sleep -Milliseconds 500
$debitBody = @{ montant = 800; description = "Apartment rent payment" } | ConvertTo-Json
$tx2 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/debit/$accountId" -Method Post -Body $debitBody -ContentType "application/json"
Write-Host "Debit: 800 EUR - Rent" -ForegroundColor Green

Start-Sleep -Milliseconds 500
$debitBody = @{ montant = 150; description = "Grocery shopping" } | ConvertTo-Json
$tx3 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/debit/$accountId" -Method Post -Body $debitBody -ContentType "application/json"
Write-Host "Debit: 150 EUR - Groceries" -ForegroundColor Green

Start-Sleep -Milliseconds 500
$creditBody = @{ montant = 500; description = "Performance bonus" } | ConvertTo-Json
$tx4 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/credit/$accountId" -Method Post -Body $creditBody -ContentType "application/json"
Write-Host "Credit: 500 EUR - Bonus" -ForegroundColor Green

Start-Sleep -Milliseconds 500
$debitBody = @{ montant = 100; description = "Electricity and water bills" } | ConvertTo-Json
$tx5 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/debit/$accountId" -Method Post -Body $debitBody -ContentType "application/json"
Write-Host "Debit: 100 EUR - Utilities" -ForegroundColor Green

Write-Host "`n=== STEP 3: Test Transaction Filtering ===" -ForegroundColor Cyan

$filterUrl = "$baseUrl/api/mouvements/filter/$accountId`?typeTransaction=DEBIT"
$debits = Invoke-RestMethod -Uri $filterUrl -Method Get
Write-Host "Debits Only: $($debits.data.summary.debitCount) transactions" -ForegroundColor Green
Write-Host "  Total debits: $($debits.data.summary.totalDebits) EUR"

$filterUrl = "$baseUrl/api/mouvements/filter/$accountId`?minAmount=200`&maxAmount=1000"
$filtered = Invoke-RestMethod -Uri $filterUrl -Method Get
Write-Host "Amount Range (200-1000 EUR): $($filtered.data.total) transactions" -ForegroundColor Green

$filterUrl = "$baseUrl/api/mouvements/filter/$accountId`?description=payment"
$search = Invoke-RestMethod -Uri $filterUrl -Method Get
Write-Host "Description Search: $($search.data.total) transactions" -ForegroundColor Green

Write-Host "`n=== STEP 4: Set Spending Limit ===" -ForegroundColor Cyan

$limitBody = @{ limiteMoyenne = 500 } | ConvertTo-Json
$limitSet = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/limit/$accountId" -Method Post -Body $limitBody -ContentType "application/json"
Write-Host "Daily Limit Set: 500 EUR" -ForegroundColor Green

$status = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/status/$accountId" -Method Get
Write-Host "Security Status:" -ForegroundColor Green
Write-Host "  - Is Frozen: $($status.data.estGele)"
Write-Host "  - Daily Limit: $($status.data.limiteMoyenne) EUR"

Write-Host "`n=== STEP 5: Test Account Freeze ===" -ForegroundColor Cyan

$freezeBody = @{ raison = "Suspicious activity detected" } | ConvertTo-Json
$frozen = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/freeze/$accountId" -Method Post -Body $freezeBody -ContentType "application/json"
Write-Host "Account Frozen: $($frozen.data.compte.estGele)" -ForegroundColor Green
Write-Host "  Reason: $($frozen.data.compte.raison_gel)"

Write-Host "`nTrying debit on frozen account..." -ForegroundColor Yellow
try {
  $debitBody = @{ montant = 50; description = "Test" } | ConvertTo-Json
  Invoke-RestMethod -Uri "$baseUrl/api/mouvements/debit/$accountId" -Method Post -Body $debitBody -ContentType "application/json" -ErrorAction Stop
  Write-Host "ERROR: Should have failed!" -ForegroundColor Red
} catch {
  Write-Host "Transaction correctly rejected!" -ForegroundColor Green
}

$unfreeze = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/unfreeze/$accountId" -Method Post
Write-Host "Account Unfrozen" -ForegroundColor Green

Write-Host "`n=== STEP 6: Whitelist Management ===" -ForegroundColor Cyan

$whitelistBody = @{ adresse = "trusted@bank.com" } | ConvertTo-Json
$added = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/whitelist/add/$accountId" -Method Post -Body $whitelistBody -ContentType "application/json"
Write-Host "Address Added: $($added.data.listeBlanche[0])" -ForegroundColor Green

$whitelistBody = @{ adresse = "family@bank.com" } | ConvertTo-Json
$added2 = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/security/whitelist/add/$accountId" -Method Post -Body $whitelistBody -ContentType "application/json"
Write-Host "Total whitelisted: $($added2.data.listeBlanche.Count) addresses" -ForegroundColor Green

Write-Host "`n=== STEP 7: Monthly Statistics ===" -ForegroundColor Cyan

$stats = Invoke-RestMethod -Uri "$baseUrl/api/mouvements/statistics/monthly/$accountId" -Method Get
Write-Host "Monthly Statistics Retrieved:" -ForegroundColor Green
foreach ($month in $stats.data.PSObject.Properties) {
  Write-Host "  $($month.Name): Credits=$($month.Value.totalCredits) EUR, Debits=$($month.Value.totalDebits) EUR"
}

Write-Host "`n=== STEP 8: Paginated Filtering ===" -ForegroundColor Cyan

$paginatedUrl = "$baseUrl/api/mouvements/filter-paginated/$accountId`?page=1`&limit=2`&typeTransaction=DEBIT"
$paginated = Invoke-RestMethod -Uri $paginatedUrl -Method Get
Write-Host "Paginated Results: $($paginated.data.transactions.Count) of $($paginated.data.total) debits" -ForegroundColor Green

Write-Host "`n=== ALL TESTS COMPLETED! ===" -ForegroundColor Cyan
Write-Host "Features Tested:" -ForegroundColor Yellow
Write-Host "  * Transaction Filtering (type, amount, description)"
Write-Host "  * Account Freezing/Unfreezing"
Write-Host "  * Daily Spending Limits"
Write-Host "  * Whitelist Management"
Write-Host "  * Monthly Statistics"
Write-Host "  * Paginated Filtering`n"
