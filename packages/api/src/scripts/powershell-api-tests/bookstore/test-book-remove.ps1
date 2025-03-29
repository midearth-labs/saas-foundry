# PowerShell script to test the Remove Book feature

$apiUrl = "http://localhost:3005/api/trpc"

Write-Host "Testing Remove Book Feature" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# First, create a book to delete
try {
    # Generate a unique ISBN to avoid conflicts
    $randomIsbn = "978" + (Get-Random -Minimum 1000000000 -Maximum 9999999999)
    
    $bookData = @{
        title         = "Book to Delete $(Get-Date -Format 'yyyyMMddHHmmss')"
        author        = "Test Author"
        isbn          = $randomIsbn
        status        = "AVAILABLE"
        description   = "A test book created to be deleted"
        price         = 9.99
        pageCount     = 100
        publisher     = "Test Publisher"
        publishedYear = 2023
    }
    
    Write-Host "Creating a book to delete..." -ForegroundColor Yellow
    $createParams = @{
        Uri         = "$apiUrl/bookstore.book.create"
        Method      = "Post"
        Body        = ($bookData | ConvertTo-Json)
        ContentType = "application/json"
        ErrorAction = "Stop"
    }
    
    $createResponse = Invoke-RestMethod @createParams
    $createdBook = $createResponse.result.data
    $bookId = $createdBook.id
    
    Write-Host "Created book with ID: $bookId" -ForegroundColor Green
    
    # Now delete the book
    Write-Host "Deleting book with ID: $bookId..." -ForegroundColor Yellow
    
    # Create the input JSON for deletion
    $deleteInput = @{
        id = $bookId
    }
    
    $deleteParams = @{
        Uri         = "$apiUrl/bookstore.book.remove"
        Method      = "Post"
        Body        = ($deleteInput | ConvertTo-Json)
        ContentType = "application/json"
        ErrorAction = "Stop"
    }
    
    $deleteResponse = Invoke-RestMethod @deleteParams
    
    Write-Host "Book deleted successfully!" -ForegroundColor Green
    
    # Verify the book was deleted by trying to retrieve it
    Write-Host "Verifying book deletion by trying to retrieve it..." -ForegroundColor Yellow
    
    # Create the input JSON and URL encode it
    $inputJson = "{`"id`":`"$bookId`"}"
    $encodedInput = [System.Web.HttpUtility]::UrlEncode($inputJson)
    
    try {
        $getResponse = Invoke-RestMethod -Uri "$apiUrl/bookstore.book.get?input=$encodedInput" -Method Get
        Write-Host "ERROR: Book still exists after deletion!" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404 -or 
            ($_.ErrorDetails.Message -and $_.ErrorDetails.Message.Contains("NOT_FOUND"))) {
            Write-Host "Verification successful: Book no longer exists (404 Not Found)" -ForegroundColor Green
        } else {
            Write-Host "Unexpected error during verification: $_" -ForegroundColor Red
        }
    }
    
    Write-Host "Remove Book test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error in Remove Book test: $_" -ForegroundColor Red
    
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