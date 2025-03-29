# PowerShell script to test the Update Order Status feature

$apiUrl = "http://localhost:3005/api/trpc"

Write-Host "Testing Update Order Status Feature" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

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
    $originalOrder = $orders[0]
    
    Write-Host "Found order to update: ID $orderId (Current status: $($originalOrder.status))" -ForegroundColor Yellow
    
    # Determine new status (cycle through statuses)
    $statuses = @("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED")
    $currentStatusIndex = $statuses.IndexOf($originalOrder.status)
    $newStatusIndex = ($currentStatusIndex + 1) % $statuses.Count
    $newStatus = $statuses[$newStatusIndex]
    
    # Prepare update data
    $updateData = @{
        id = $orderId
        status = $newStatus
    }
    
    $params = @{
        Uri         = "$apiUrl/bookstore.order.updateStatus"
        Method      = "Post"
        Body        = ($updateData | ConvertTo-Json)
        ContentType = "application/json"
        ErrorAction = "Stop"
    }
    
    Write-Host "Updating order status from '$($originalOrder.status)' to '$newStatus'..." -ForegroundColor Yellow
    
    $updateResponse = Invoke-RestMethod @params
    $updatedOrderResult = $updateResponse.result.data
    
    Write-Host "Order status updated successfully!" -ForegroundColor Green
    
    # Verify the order was updated by retrieving it
    Write-Host "Verifying order update by retrieving it..." -ForegroundColor Yellow
    
    # Create the input JSON and URL encode it
    $inputJson = "{`"id`":`"$orderId`"}"
    $encodedInput = [System.Web.HttpUtility]::UrlEncode($inputJson)
    
    $getResponse = Invoke-RestMethod -Uri "$apiUrl/bookstore.order.get?input=$encodedInput" -Method Get
    $updatedOrder = $getResponse.result.data
    
    Write-Host "Updated order details:" -ForegroundColor Green
    Write-Host "  ID: $($updatedOrder.id)"
    Write-Host "  Customer: $($updatedOrder.customerName) ($($updatedOrder.customerEmail))"
    Write-Host "  Status: $($updatedOrder.status) (was: $($originalOrder.status))"
    Write-Host "  Total Amount: $($updatedOrder.totalAmount)"
    Write-Host "  Items: $($updatedOrder.items.Count)"
    
    if ($updatedOrder.status -eq $newStatus) {
        Write-Host "Status update verified successfully!" -ForegroundColor Green
    } else {
        Write-Host "Status update verification failed! Expected: $newStatus, Got: $($updatedOrder.status)" -ForegroundColor Red
    }
    
    Write-Host "Update Order Status test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error updating order status: $_" -ForegroundColor Red
    
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