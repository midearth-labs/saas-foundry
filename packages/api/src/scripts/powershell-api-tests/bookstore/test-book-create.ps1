# PowerShell script to test the Create Book feature

$apiUrl = "http://localhost:3005/api/trpc"

Write-Host "Testing Create Book Feature" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Generate a unique ISBN to avoid conflicts
$randomIsbn = "978" + (Get-Random -Minimum 1000000000 -Maximum 9999999999)

# Create book data
$bookData = @{
    title         = "Test Book $(Get-Date -Format 'yyyyMMddHHmmss')"
    author        = "Test Author"
    isbn          = $randomIsbn
    status        = "AVAILABLE"
    description   = "A test book created by PowerShell script"
    price         = [math]::Round((Get-Random -Minimum 500 -Maximum 5000) / 100, 2)  # Generate price between 5.00 and 50.00
    pageCount     = (Get-Random -Minimum 100 -Maximum 500)
    publisher     = "Test Publisher"
    publishedYear = (Get-Random -Minimum 1990 -Maximum 2023)
}

# Prepare request parameters
$params = @{
    Uri         = "$apiUrl/bookstore.book.create"
    Method      = "Post"
    Body        = ($bookData | ConvertTo-Json)
    ContentType = "application/json"
    ErrorAction = "Stop"  # Make sure errors are caught properly
}

try {
    Write-Host "Creating a new book with the following data:" -ForegroundColor Yellow
    $bookData.GetEnumerator() | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" }
    
    # Send the create request
    $response = Invoke-RestMethod @params
    
    # Extract the actual data from the tRPC response
    $bookResult = $response.result.data
    
    if ($bookResult -and $bookResult.id) {
        Write-Host "Created new book with ID: $($bookResult.id)" -ForegroundColor Green
        
        # Verify the book was created by retrieving it
        Write-Host "Verifying book creation by retrieving it..." -ForegroundColor Yellow
        $getParams = @{
            Uri         = "$apiUrl/bookstore.book.get?input=%7B%22id%22%3A%22$($bookResult.id)%22%7D"
            Method      = "Get"
            ErrorAction = "Stop"
        }
        
        $getResponse = Invoke-RestMethod @getParams
        $createdBook = $getResponse.result.data
        
        Write-Host "Book created successfully with the following details:" -ForegroundColor Green
        if ($createdBook -and $createdBook.PSObject.Properties) {
            $createdBook.PSObject.Properties | ForEach-Object { 
                Write-Host "  $($_.Name): $($_.Value)" 
            }
        } else {
            Write-Host "  $createdBook"
        }
        
        Write-Host "Create Book test completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error: Received invalid response from server" -ForegroundColor Red
        Write-Host "Response structure: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error creating book: $_" -ForegroundColor Red
    
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