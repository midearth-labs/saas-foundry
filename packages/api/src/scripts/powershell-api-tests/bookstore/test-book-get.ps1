# PowerShell script to test the Get Book feature

$apiUrl = "http://localhost:3005/api/trpc"

Write-Host "Testing Get Book Feature" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

# First, get a list of books to find an ID
try {
    Write-Host "Getting list of books to find an ID..." -ForegroundColor Yellow
    $listResponse = Invoke-RestMethod -Uri "$apiUrl/bookstore.book.list" -Method Get
    $books = $listResponse.result.data
    
    if ($books -eq $null -or $books.Count -eq 0) {
        Write-Host "No books found in the database. Please add a book first." -ForegroundColor Red
        exit
    }
    
    # Get the first book's ID
    $bookId = $books[0].id
    Write-Host "Found book with ID: $bookId" -ForegroundColor Green
    
    # Create the input JSON and URL encode it
    $inputJson = "{`"id`":`"$bookId`"}"
    $encodedInput = [System.Web.HttpUtility]::UrlEncode($inputJson)
    
    Write-Host "Getting book details for ID: $bookId..." -ForegroundColor Yellow
    $getResponse = Invoke-RestMethod -Uri "$apiUrl/bookstore.book.get?input=$encodedInput" -Method Get
    $book = $getResponse.result.data
    
    Write-Host "Book details:" -ForegroundColor Green
    Write-Host "  Title: $($book.title)"
    Write-Host "  Author: $($book.author)"
    Write-Host "  ISBN: $($book.isbn)"
    Write-Host "  Price: $$($book.price)"
    Write-Host "  Status: $($book.status)"
    Write-Host "  Description: $($book.description)"
    
    Write-Host "Get Book test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error getting book: $_" -ForegroundColor Red
    
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