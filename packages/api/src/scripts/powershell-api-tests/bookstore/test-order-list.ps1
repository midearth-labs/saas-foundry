# PowerShell script to test the Order List feature

$apiUrl = "http://localhost:3005/api/trpc"

Write-Host "Testing Order List Feature" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

try {
    Write-Host "Listing all orders..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$apiUrl/bookstore.order.list" -Method Get
    
    # Extract the actual data from the tRPC response
    $orders = $response.result.data
    
    if ($orders -and $orders.Count -gt 0) {
        Write-Host "Found $($orders.Count) orders:" -ForegroundColor Green
        
        # Create a custom table with the most important properties
        $ordersTable = $orders | ForEach-Object {
            [PSCustomObject]@{
                ID = $_.id
                Customer = $_.customerName
                Email = $_.customerEmail
                Status = $_.status
                Total = "$" + $_.totalAmount
                Items = $_.items.Count
            }
        }
        
        $ordersTable | Format-Table -AutoSize
    } else {
        Write-Host "No orders found or empty response received." -ForegroundColor Yellow
        Write-Host "Response structure: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
    }
    
    Write-Host "Order List test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error listing orders: $_" -ForegroundColor Red
    
    # Try to extract more detailed error information
    if ($_.ErrorDetails.Message) {
        try {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Error details: $($errorDetails | ConvertTo-Json -Depth 3)" -ForegroundColor Red
        } catch {
            Write-Host "Raw error response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
} 