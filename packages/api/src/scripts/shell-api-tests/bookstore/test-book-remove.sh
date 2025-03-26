#!/bin/bash
# Shell script to test the Remove Book feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Remove Book Feature\033[0m"
echo -e "\033[36m=========================\033[0m"

# First, create a book to delete
echo -e "\033[33mCreating a book to delete...\033[0m"

# Generate a unique ISBN to avoid conflicts
RANDOM_ISBN="978$(( RANDOM % 9000000000 + 1000000000 ))"

# Create book data
TITLE="Book to Delete $(date +%Y%m%d%H%M%S)"
AUTHOR="Test Author"
ISBN="$RANDOM_ISBN"
STATUS="AVAILABLE"
DESCRIPTION="A test book created to be deleted"
PRICE="9.99"
PAGE_COUNT="100"
PUBLISHER="Test Publisher"
PUBLISHED_YEAR="2023"

# Prepare JSON data
JSON_DATA=$(cat <<EOF
{
  "title": "$TITLE",
  "author": "$AUTHOR",
  "isbn": "$ISBN",
  "status": "$STATUS",
  "description": "$DESCRIPTION",
  "price": $PRICE,
  "pageCount": $PAGE_COUNT,
  "publisher": "$PUBLISHER",
  "publishedYear": $PUBLISHED_YEAR
}
EOF
)

# Send the create request
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/bookstore.book.create" \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA")

# Extract the book ID
BOOK_ID=$(echo "$CREATE_RESPONSE" | jq -r '.result.data.id')

echo -e "\033[32mCreated book with ID: $BOOK_ID\033[0m"

# Now delete the book
echo -e "\033[33mDeleting book with ID: $BOOK_ID...\033[0m"

# Create the input JSON for deletion
DELETE_JSON="{\"id\":\"$BOOK_ID\"}"

# Send the delete request
DELETE_RESPONSE=$(curl -s -X POST "$API_URL/bookstore.book.remove" \
  -H "Content-Type: application/json" \
  -d "$DELETE_JSON")

echo -e "\033[32mBook deleted successfully!\033[0m"

# Verify the book was deleted by trying to retrieve it
echo -e "\033[33mVerifying book deletion by trying to retrieve it...\033[0m"

# URL encode the input JSON
INPUT_JSON="{\"id\":\"$BOOK_ID\"}"
ENCODED_INPUT=$(echo "$INPUT_JSON" | jq -sRr @uri)

# Try to get the deleted book
GET_RESPONSE=$(curl -s "$API_URL/bookstore.book.get?input=$ENCODED_INPUT")

# Check if the book was actually deleted
if echo "$GET_RESPONSE" | grep -q "NOT_FOUND"; then
  echo -e "\033[32mVerification successful: Book no longer exists (404 Not Found)\033[0m"
else
  echo -e "\033[31mERROR: Book still exists after deletion!\033[0m"
  echo "$GET_RESPONSE"
fi

echo -e "\033[32mRemove Book test completed successfully!\033[0m" 