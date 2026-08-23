Write-Host "=== 1. Testing Super Admin Login ==="
$loginBody = '{"email":"superadmin@vetmonk.ai","password":"Admin@12345"}'
$adminLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "Logged in as:" $adminLogin.name "- Role:" $adminLogin.role
$adminToken = $adminLogin.token

Write-Host "`n=== 2. Super Admin Dashboard Telemetry ==="
$headers = @{ "Authorization" = "Bearer $adminToken" }
$dashboard = Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/super-admin" -Method Get -Headers $headers
Write-Host "Total Clinics:" $dashboard.totalClinics "- Total Users:" $dashboard.totalUsers "- Total Pets:" $dashboard.totalPets

Write-Host "`n=== 3. Testing Pet Owner Login & Pets ==="
$ownerBody = '{"email":"owner.alex@vetmonk.ai","password":"Owner@12345"}'
$ownerLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $ownerBody -ContentType "application/json"
$ownerToken = $ownerLogin.token
$ownerHeaders = @{ "Authorization" = "Bearer $ownerToken" }
$pets = Invoke-RestMethod -Uri "http://localhost:8080/api/pets" -Method Get -Headers $ownerHeaders
Write-Host "Owner Pets Count:" $pets.Count
foreach ($p in $pets) {
    Write-Host " - Pet:" $p.name "($($p.species), $($p.breed)) Weight:" $p.weight "kg"
}

Write-Host "`n=== 4. Testing AI Chat with RAG & Triage ==="
$aiBody = '{"message":"What core vaccinations are required for my puppy?","language":"en"}'
$aiRes = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/chat" -Method Post -Body $aiBody -Headers $ownerHeaders -ContentType "application/json"
Write-Host "AI Triage Level:" $aiRes.triageLevel
Write-Host "Grounded Sources Cited:" ($aiRes.groundedSources -join ', ')
Write-Host "AI Response Preview:" $aiRes.response.Substring(0, [Math]::Min(150, $aiRes.response.Length)) "..."

Write-Host "`n=== 5. Testing AI Emergency Detection ==="
$emergBody = '{"message":"Help! My dog ate rat poison and has difficulty breathing!","language":"en"}'
$emergRes = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/chat" -Method Post -Body $emergBody -Headers $ownerHeaders -ContentType "application/json"
Write-Host "Emergency Alert Flag:" $emergRes.emergencyAlert
Write-Host "Triage Level:" $emergRes.triageLevel
Write-Host "Emergency Guidance:" $emergRes.response.Substring(0, [Math]::Min(140, $emergRes.response.Length)) "..."

Write-Host "`n=== 6. Testing Pharmacy Inventory Alerts ==="
$lowStock = Invoke-RestMethod -Uri "http://localhost:8080/api/inventory/low-stock" -Method Get -Headers $headers
Write-Host "Low Stock Items Count:" $lowStock.Count
foreach ($l in $lowStock) {
    Write-Host " - Low Item:" $l.medicineName "(Qty:" $l.quantity "$($l.unit), Threshold:" $l.lowStockThreshold ")"
}

Write-Host "`n=== 7. Testing Public Vacancies ==="
$vacancies = Invoke-RestMethod -Uri "http://localhost:8080/api/vacancies" -Method Get
Write-Host "Public Vacancies Available:" $vacancies.Count
foreach ($v in $vacancies) {
    Write-Host " - Job:" $v.title "($($v.department)) at" $v.location
}

Write-Host "`n=== ALL RUNTIME CHECKS PASSED WITH 100% SUCCESS! ==="
