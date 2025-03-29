# PowerShell script to test the Get Order feature

$apiUrl = "http://localhost:3005/api/trpc"

Write-Host "Testing Get Order Feature" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

# First, get a list of orders to find an ID
try {
    Write-Host "Getting list of orders to find an ID..." -ForegroundColor Yellow
    $listResponse = Invoke-RestMethod -Uri "$apiUrl/bookstore.order.list" -Method Get
    $orders = $listResponse.result.data
    
    if ($orders -eq $null -or $orders.Count -eq 0) {
        Write-Host "No orders found in the database. Please create an order first." -ForegroundColor Red
        exit
    }
    
    # Get the first order's ID
    $orderId = $orders[0].id
    Write-Host "Found order with ID: $orderId" -ForegroundColor Green
    
    # Create the input JSON and URL encode it
    $inputJson = "{`"id`":`"$orderId`"}"
    $encodedInput = [System.Web.HttpUtility]::UrlEncode($inputJson)
    
    Write-Host "Getting order details for ID: $orderId..." -ForegroundColor Yellow
    $getResponse = Invoke-RestMethod -Uri "$apiUrl/bookstore.order.get?input=$encodedInput" -Method Get
    $order = $getResponse.result.data
    
    Write-Host "Order details:" -ForegroundColor Green
    Write-Host "  ID: $($order.id)"
    Write-Host "  Customer: $($order.customerName) ($($order.customerEmail))"
    Write-Host "  Status: $($order.status)"
    Write-Host "  Total Amount: $($order.totalAmount)"
    Write-Host "  Items: $($order.items.Count)"
    $order.items | ForEach-Object {
        Write-Host "    - Book ID: $($_.bookId) - Quantity: $($_.quantity) - Unit Price: $($_.unitPrice)"
    }
    
    Write-Host "Get Order test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error getting order: $_" -ForegroundColor Red
    
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