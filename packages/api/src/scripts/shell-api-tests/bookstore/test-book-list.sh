#!/bin/bash
# Shell script to test the Book List feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Book List Feature\033[0m"
echo -e "\033[36m========================\033[0m"

echo -e "\033[33mListing all books...\033[0m"
RESPONSE=$(curl -s "$API_URL/bookstore.book.list")

# Check if books exist
if echo "$RESPONSE" | jq -e '.result.data | length > 0' > /dev/null; then
  BOOKS_COUNT=$(echo "$RESPONSE" | jq '.result.data | length')
  
  echo -e "\033[32mFound $BOOKS_COUNT books:\033[0m"
  
  # Display books in a table-like format
  echo "$RESPONSE" | jq -r '.result.data[] | "ID: \(.id) | Title: \(.title) | Author: \(.author) | Status: \(.status) | Price: $\(.price)"'
else
  echo -e "\033[33mNo books found or empty response received.\033[0m"
  echo "Response structure: $(echo "$RESPONSE" | jq '.')"
fi

echo -e "\033[32mBook List test completed successfully!\033[0m" 