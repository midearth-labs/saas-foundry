# PowerShell script to test the Update Book feature

$apiUrl = "http://localhost:3005/api/trpc"

Write-Host "Testing Update Book Feature" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

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
    $originalBook = $books[0]
    
    Write-Host "Found book to update: $($originalBook.title) (ID: $bookId)" -ForegroundColor Yellow
    
    # Prepare update data
    $updateData = @{
        id = $bookId
        data = @{
            title       = "$($originalBook.title) - Updated"
            description = "This book was updated by the test script at $(Get-Date)"
            price       = [math]::Round($originalBook.price * 1.1, 2)  # Increase price by 10%
        }
    }
    
    $params = @{
        Uri         = "$apiUrl/bookstore.book.update"
        Method      = "Post"
        Body        = ($updateData | ConvertTo-Json)
        ContentType = "application/json"
        ErrorAction = "Stop"
    }
    
    Write-Host "Updating book with the following data:" -ForegroundColor Yellow
    $updateData.data | ForEach-Object { $_ } | Format-Table -AutoSize
    
    $updateResponse = Invoke-RestMethod @params
    $updatedBookResult = $updateResponse.result.data
    
    Write-Host "Book updated successfully!" -ForegroundColor Green
    
    # Verify the book was updated by retrieving it
    Write-Host "Verifying book update by retrieving it..." -ForegroundColor Yellow
    
    # Create the input JSON and URL encode it
    $inputJson = "{`"id`":`"$bookId`"}"
    $encodedInput = [System.Web.HttpUtility]::UrlEncode($inputJson)
    
    $getResponse = Invoke-RestMethod -Uri "$apiUrl/bookstore.book.get?input=$encodedInput" -Method Get
    $updatedBook = $getResponse.result.data
    
    Write-Host "Updated book details:" -ForegroundColor Green
    if ($updatedBook -and $updatedBook.PSObject.Properties) {
        $updatedBook.PSObject.Properties | ForEach-Object { 
            Write-Host "  $($_.Name): $($_.Value)" 
        }
    } else {
        Write-Host "  $updatedBook"
    }
    
    Write-Host "Update Book test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error updating book: $_" -ForegroundColor Red
    
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