$loginBody = '{"email":"owner.alex@vetmonk.ai","password":"Owner@12345"}'
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$headers = @{ "Authorization" = "Bearer $($login.token)" }
$aiBody = '{"message":"What is the core vaccination for dogs?","language":"en"}'
try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/chat" -Method Post -Body $aiBody -Headers $headers -ContentType "application/json"
    Write-Host "Success:" ($res | ConvertTo-Json)
} catch {
    Write-Host "HTTP Status:" $_.Exception.Response.StatusCode
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Response Body:" $reader.ReadToEnd()
}
