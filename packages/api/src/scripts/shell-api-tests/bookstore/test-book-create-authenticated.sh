#!/bin/bash
# Shell script to test the Create Book feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Create Book Feature\033[0m"
echo -e "\033[36m==========================\033[0m"

# Generate a unique ISBN to avoid conflicts
RANDOM_ISBN="978$(( RANDOM % 9000000000 + 1000000000 ))"

# Create book data
TITLE="Test Book $(date +%Y%m%d%H%M%S)"
AUTHOR="Test Author"
ISBN="$RANDOM_ISBN"
STATUS="AVAILABLE"
DESCRIPTION="A test book created by shell script"
PRICE=$(echo "scale=2; ($(( RANDOM % 4500 + 500 )) / 100)" | bc)
PAGE_COUNT=$(( RANDOM % 400 + 100 ))
PUBLISHER="Test Publisher"
PUBLISHED_YEAR=$(( RANDOM % 33 + 1990 ))

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

echo -e "\033[33mCreating a new book with the following data:\033[0m"
echo "Title: $TITLE"
echo "Author: $AUTHOR"
echo "ISBN: $ISBN"
echo "Status: $STATUS"
echo "Description: $DESCRIPTION"
echo "Price: $PRICE"
echo "Page Count: $PAGE_COUNT"
echo "Publisher: $PUBLISHER"
echo "Published Year: $PUBLISHED_YEAR"

# Prompt for authorization token
read -sp "Enter your Bearer token: " AUTH_TOKEN
echo

# Prompt for set-auth-token
read -sp "Enter your BetterAuth Bearer Token (set-auth-token; same as Bearer token): " SET_AUTH_TOKEN
echo

# Prompt for JWT (set-auth-jwt)
read -sp "Enter your BetterAuth JWT (set-auth-jwt): " SET_AUTH_JWT
echo

# Send the create request
echo -e "\033[33mSending request to create book...\033[0m"
RESPONSE=$(curl -s -X POST "$API_URL/bookstore.book.create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "set-auth-token: $SET_AUTH_TOKEN" \
  -H "set-auth-jwt: $SET_AUTH_JWT" \
  -d "$JSON_DATA")

# Check if the request was successful
if echo "$RESPONSE" | grep -q "\"id\":"; then
  # Extract the book ID using grep and sed
  BOOK_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"//')
  
  echo -e "\033[32mCreated new book with ID: $BOOK_ID\033[0m"
  
  # Verify the book was created by retrieving it
  echo -e "\033[33mVerifying book creation by retrieving it...\033[0m"
  
  # URL encode the input JSON
  INPUT_JSON="{\"id\":\"$BOOK_ID\"}"
  ENCODED_INPUT=$(echo "$INPUT_JSON" | jq -sRr @uri)
  
  GET_RESPONSE=$(curl -s "$API_URL/bookstore.book.get?input=$ENCODED_INPUT")
  
  echo -e "\033[32mBook created successfully with the following details:\033[0m"
  echo "$GET_RESPONSE" | jq '.result.data'
  
  echo -e "\033[32mCreate Book test completed successfully!\033[0m"
else
  echo -e "\033[31mError: Received invalid response from server\033[0m"
  echo "Response: $RESPONSE"
fi 