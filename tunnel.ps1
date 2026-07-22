$subdomain = "table-tennis-showcase-backend"
$port = 5000
$tunnelUrl = "https://$subdomain.loca.lt"

# Kill any existing localtunnel instances
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*lt.js --port*" } | Stop-Process -Force

Write-Host "Starting localtunnel self-healing service..."
$ltPath = "C:\Users\Abdullah Saleem\.gemini\antigravity-ide\scratch\table-tennis-showcase\backend\node_modules\localtunnel\bin\lt.js"
$ltProcess = Start-Process -FilePath "node" -ArgumentList """$ltPath"" --port $port --subdomain $subdomain" -PassThru -NoNewWindow

Start-Sleep -Seconds 5

while ($true) {
    try {
        # Ping health endpoint
        $res = Invoke-RestMethod -Uri "$tunnelUrl/health" -Method GET -Headers @{"Bypass-Tunnel-Reminder"="true"} -TimeoutSec 5
        if ($res.status -eq "OK") {
            # Active keep-alive
        } else {
            throw "Invalid status response"
        }
    } catch {
        # Kill current lt process
        if ($ltProcess -and -not $ltProcess.HasExited) {
            Stop-Process -Id $ltProcess.Id -Force
        }
        
        # Restart lt process
        $ltProcess = Start-Process -FilePath "node" -ArgumentList """$ltPath"" --port $port --subdomain $subdomain" -PassThru -NoNewWindow
        Start-Sleep -Seconds 8
    }
    Start-Sleep -Seconds 15
}
