# PowerShell script to test the Book List feature

$apiUrl = "http://localhost:3005/api/trpc"

Write-Host "Testing Book List Feature" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

try {
    Write-Host "Listing all books..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$apiUrl/bookstore.book.list" -Method Get
    
    # Extract the actual data from the tRPC response
    $books = $response.result.data
    
    if ($books -and $books.Count -gt 0) {
        Write-Host "Found $($books.Count) books:" -ForegroundColor Green
        
        # Create a custom table with the most important properties
        $booksTable = $books | ForEach-Object {
            [PSCustomObject]@{
                ID = $_.id
                Title = $_.title
                Author = $_.author
                ISBN = $_.isbn
                Status = $_.status
                Price = "$" + $_.price
            }
        }
        
        $booksTable | Format-Table -AutoSize
    } else {
        Write-Host "No books found or empty response received." -ForegroundColor Yellow
        Write-Host "Response structure: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
    }
    
    Write-Host "Book List test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error listing books: $_" -ForegroundColor Red
    
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