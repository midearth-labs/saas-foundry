# PowerShell script to test the Create Order feature

$apiUrl = "http://localhost:3005/api/trpc"

Write-Host "Testing Create Order Feature" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

try {
    # First, get a list of available books to order
    Write-Host "Getting list of available books..." -ForegroundColor Yellow
    $booksResponse = Invoke-RestMethod -Uri "$apiUrl/bookstore.book.list" -Method Get
    $books = $booksResponse.result.data
    
    if ($books -eq $null -or $books.Count -eq 0) {
        Write-Host "No books found in the database. Please add books first." -ForegroundColor Red
        exit
    }
    
    # Filter for available books
    $availableBooks = $books | Where-Object { $_.status -eq "AVAILABLE" }
    
    if ($availableBooks.Count -eq 0) {
        Write-Host "No available books found. Please add available books first." -ForegroundColor Red
        exit
    }
    
    Write-Host "Found $($availableBooks.Count) available books" -ForegroundColor Green
    
    # Select up to 2 books for the order
    $booksToOrder = $availableBooks | Select-Object -First ([Math]::Min(2, $availableBooks.Count))
    
    # Create order items
    $orderItems = $booksToOrder | ForEach-Object {
        $quantity = Get-Random -Minimum 1 -Maximum 3
        @{
            bookId = $_.id
            quantity = $quantity
            unitPrice = $_.price
        }
    }
    
    # Calculate total amount
    $totalAmount = ($orderItems | ForEach-Object { $_.quantity * $_.unitPrice } | Measure-Object -Sum).Sum
    
    # Create order data
    $orderData = @{
        customerName = "Test Customer $(Get-Date -Format 'yyyyMMddHHmmss')"
        customerEmail = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
        shippingAddress = "123 Main St, Anytown, USA"
        status = "PENDING"
        totalAmount = $totalAmount
        items = $orderItems
    }
    
    # Prepare request parameters
    $params = @{
        Uri         = "$apiUrl/bookstore.order.create"
        Method      = "Post"
        Body        = ($orderData | ConvertTo-Json -Depth 3)
        ContentType = "application/json"
        ErrorAction = "Stop"
    }
    
    Write-Host "Creating a new order with the following data:" -ForegroundColor Yellow
    Write-Host "  Customer: $($orderData.customerName) ($($orderData.customerEmail))"
    Write-Host "  Status: $($orderData.status)"
    Write-Host "  Total Amount: $($orderData.totalAmount)"
    Write-Host "  Items: $($orderData.items.Count)"
    $orderData.items | ForEach-Object {
        $book = $books | Where-Object { $_.id -eq $_.bookId }
        Write-Host "    - Book ID: $($_.bookId) - Quantity: $($_.quantity) - Unit Price: $($_.unitPrice)"
    }
    
    # Send the create request
    $response = Invoke-RestMethod @params
    
    # Extract the actual data from the tRPC response
    $orderResult = $response.result.data
    
    if ($orderResult -and $orderResult.id) {
        Write-Host "Created new order with ID: $($orderResult.id)" -ForegroundColor Green
        
        # Verify the order was created by retrieving it
        Write-Host "Verifying order creation by retrieving it..." -ForegroundColor Yellow
        
        # Create the input JSON and URL encode it
        $inputJson = "{`"id`":`"$($orderResult.id)`"}"
        $encodedInput = [System.Web.HttpUtility]::UrlEncode($inputJson)
        
        $getParams = @{
            Uri         = "$apiUrl/bookstore.order.get?input=$encodedInput"
            Method      = "Get"
            ErrorAction = "Stop"
        }
        
        $getResponse = Invoke-RestMethod @getParams
        $createdOrder = $getResponse.result.data
        
        Write-Host "Order created successfully with the following details:" -ForegroundColor Green
        Write-Host "  ID: $($createdOrder.id)"
        Write-Host "  Customer: $($createdOrder.customerName) ($($createdOrder.customerEmail))"
        Write-Host "  Status: $($createdOrder.status)"
        Write-Host "  Total Amount: $($createdOrder.totalAmount)"
        Write-Host "  Items: $($createdOrder.items.Count)"
        $createdOrder.items | ForEach-Object {
            Write-Host "    - Book ID: $($_.bookId) - Quantity: $($_.quantity) - Unit Price: $($_.unitPrice)"
        }
        
        Write-Host "Create Order test completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error: Received invalid response from server" -ForegroundColor Red
        Write-Host "Response structure: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error creating order: $_" -ForegroundColor Red
    
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