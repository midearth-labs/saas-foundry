#!/bin/bash
# Shell script to test the Get Book feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Get Book Feature\033[0m"
echo -e "\033[36m=======================\033[0m"

# First, get a list of books to find an ID
echo -e "\033[33mGetting list of books to find an ID...\033[0m"
LIST_RESPONSE=$(curl -s "$API_URL/bookstore.book.list")

# Check if books exist
if echo "$LIST_RESPONSE" | jq -e '.result.data | length > 0' > /dev/null; then
  # Get the first book's ID
  BOOK_ID=$(echo "$LIST_RESPONSE" | jq -r '.result.data[0].id')
  
  echo -e "\033[32mFound book with ID: $BOOK_ID\033[0m"
  
  # Create the input JSON and URL encode it
  INPUT_JSON="{\"id\":\"$BOOK_ID\"}"
  ENCODED_INPUT=$(echo "$INPUT_JSON" | jq -sRr @uri)
  
  echo -e "\033[33mGetting book details for ID: $BOOK_ID...\033[0m"
  GET_RESPONSE=$(curl -s "$API_URL/bookstore.book.get?input=$ENCODED_INPUT")
  
  echo -e "\033[32mBook details:\033[0m"
  echo "$GET_RESPONSE" | jq '.result.data | {
    Title: .title,
    Author: .author,
    ISBN: .isbn,
    Price: .price,
    Status: .status,
    Description: .description
  }'
  
  echo -e "\033[32mGet Book test completed successfully!\033[0m"
else
  echo -e "\033[31mNo books found in the database. Please add a book first.\033[0m"
  exit 1
fi 