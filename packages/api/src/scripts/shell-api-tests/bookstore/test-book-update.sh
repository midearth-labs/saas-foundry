#!/bin/bash
# Shell script to test the Update Book feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Update Book Feature\033[0m"
echo -e "\033[36m=========================\033[0m"

# First, get a list of books to find an ID
echo -e "\033[33mGetting list of books to find an ID...\033[0m"
LIST_RESPONSE=$(curl -s "$API_URL/bookstore.book.list")

# Check if books exist
if echo "$LIST_RESPONSE" | jq -e '.result.data | length > 0' > /dev/null; then
  # Get the first book
  BOOK_ID=$(echo "$LIST_RESPONSE" | jq -r '.result.data[0].id')
  ORIGINAL_TITLE=$(echo "$LIST_RESPONSE" | jq -r '.result.data[0].title')
  ORIGINAL_PRICE=$(echo "$LIST_RESPONSE" | jq -r '.result.data[0].price')
  
  echo -e "\033[33mFound book to update: $ORIGINAL_TITLE (ID: $BOOK_ID)\033[0m"
  
  # Calculate new price (10% increase)
  NEW_PRICE=$(echo "scale=2; $ORIGINAL_PRICE * 1.1" | bc)
  
  # Prepare update data
  UPDATE_JSON=$(cat <<EOF
{
  "id": "$BOOK_ID",
  "data": {
    "title": "$ORIGINAL_TITLE - Updated",
    "description": "This book was updated by the test script at $(date)",
    "price": $NEW_PRICE
  }
}
EOF
)

  echo -e "\033[33mUpdating book with the following data:\033[0m"
  echo "Title: $ORIGINAL_TITLE - Updated"
  echo "Description: This book was updated by the test script at $(date)"
  echo "Price: $NEW_PRICE"
  
  # Send the update request
  UPDATE_RESPONSE=$(curl -s -X POST "$API_URL/bookstore.book.update" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_JSON")
  
  echo -e "\033[32mBook updated successfully!\033[0m"
  
  # Verify the book was updated by retrieving it
  echo -e "\033[33mVerifying book update by retrieving it...\033[0m"
  
  # URL encode the input JSON
  INPUT_JSON="{\"id\":\"$BOOK_ID\"}"
  ENCODED_INPUT=$(echo "$INPUT_JSON" | jq -sRr @uri)
  
  GET_RESPONSE=$(curl -s "$API_URL/bookstore.book.get?input=$ENCODED_INPUT")
  
  echo -e "\033[32mUpdated book details:\033[0m"
  echo "$GET_RESPONSE" | jq '.result.data'
  
  echo -e "\033[32mUpdate Book test completed successfully!\033[0m"
else
  echo -e "\033[31mNo books found in the database. Please add a book first.\033[0m"
  exit 1
fi 