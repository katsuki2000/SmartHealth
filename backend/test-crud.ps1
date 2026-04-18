# Test CRUD Patient API

$baseUrl = "http://localhost:3000"

# 1. CREATE Patient
Write-Host "1. Testing POST /patients (CREATE)" -ForegroundColor Green
$createBody = @{
    firstName = "Jean"
    lastName = "Dupont"
    birthDate = "1990-05-15"
    gender = "M"
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "$baseUrl/patients" -Method POST -Body $createBody -ContentType "application/json"
    $patient = $createResponse.Content | ConvertFrom-Json
    $patientId = $patient.id
    Write-Host "Created patient: $patientId" -ForegroundColor Green
    Write-Host $createResponse.Content | ConvertFrom-Json | Format-Table -AutoSize
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# 2. GET all patients
Write-Host "`n2. Testing GET /patients (READ ALL)" -ForegroundColor Green
try {
    $getResponse = Invoke-WebRequest -Uri "$baseUrl/patients" -Method GET
    Write-Host $getResponse.Content | ConvertFrom-Json | Format-Table -AutoSize
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 3. GET single patient
Write-Host "`n3. Testing GET /patients/:id (READ ONE)" -ForegroundColor Green
try {
    $getSingleResponse = Invoke-WebRequest -Uri "$baseUrl/patients/$patientId" -Method GET
    Write-Host $getSingleResponse.Content | ConvertFrom-Json | Format-Table -AutoSize
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 4. UPDATE patient
Write-Host "`n4. Testing PUT /patients/:id (UPDATE)" -ForegroundColor Green
$updateBody = @{
    firstName = "Jean-Pierre"
    lastName = "Dupont"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-WebRequest -Uri "$baseUrl/patients/$patientId" -Method PUT -Body $updateBody -ContentType "application/json"
    Write-Host "Updated patient" -ForegroundColor Green
    Write-Host $updateResponse.Content | ConvertFrom-Json | Format-Table -AutoSize
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 5. DELETE patient
Write-Host "`n5. Testing DELETE /patients/:id (DELETE)" -ForegroundColor Green
try {
    $deleteResponse = Invoke-WebRequest -Uri "$baseUrl/patients/$patientId" -Method DELETE
    Write-Host "Deleted patient" -ForegroundColor Green
    Write-Host $deleteResponse.Content | ConvertFrom-Json | Format-Table -AutoSize
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 6. Verify deletion
Write-Host "`n6. Verifying deletion - GET /patients" -ForegroundColor Green
try {
    $finalResponse = Invoke-WebRequest -Uri "$baseUrl/patients" -Method GET
    Write-Host $finalResponse.Content | ConvertFrom-Json | Format-Table -AutoSize
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Cyan
