#!/bin/bash
# Shell script to test the Create Order feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Create Order Feature\033[0m"
echo -e "\033[36m===========================\033[0m"

# First, get a list of available books to order
echo -e "\033[33mGetting list of available books...\033[0m"
BOOKS_RESPONSE=$(curl -s "$API_URL/bookstore.book.list")
BOOKS=$(echo "$BOOKS_RESPONSE" | jq '.result.data')

if [ -z "$BOOKS" ] || [ "$(echo "$BOOKS" | jq 'length')" -eq 0 ]; then
  echo -e "\033[31mNo books found in the database. Please add books first.\033[0m"
  exit 1
fi

# Filter for available books
AVAILABLE_BOOKS=$(echo "$BOOKS" | jq '[.[] | select(.status == "AVAILABLE")]')

if [ "$(echo "$AVAILABLE_BOOKS" | jq 'length')" -eq 0 ]; then
  echo -e "\033[31mNo available books found. Please add available books first.\033[0m"
  exit 1
fi

echo -e "\033[32mFound $(echo "$AVAILABLE_BOOKS" | jq 'length') available books\033[0m"

# Select up to 2 books for the order
BOOKS_TO_ORDER=$(echo "$AVAILABLE_BOOKS" | jq '.[0:2]')

# Create order items
ORDER_ITEMS=$(echo "$BOOKS_TO_ORDER" | jq -c --argjson random "$RANDOM" 'map({
  bookId: .id,
  quantity: (1 + ($random % 3)),
  unitPrice: .price
})')

# Calculate total amount
TOTAL_AMOUNT=$(echo "$ORDER_ITEMS" | jq 'map(.quantity * .unitPrice) | add')

# Create order data
TIMESTAMP=$(date +%Y%m%d%H%M%S)

ORDER_DATA=$(jq -n \
  --arg name "Test Customer $TIMESTAMP" \
  --arg email "test$TIMESTAMP@example.com" \
  --arg addr "123 Main St, Anytown, USA" \
  --argjson total "$TOTAL_AMOUNT" \
  --argjson items "$ORDER_ITEMS" \
  '{
    "customerName": $name,
    "customerEmail": $email,
    "shippingAddress": $addr,
    "status": "PENDING",
    "totalAmount": $total,
    "items": $items
  }')

echo -e "\033[33mCreating a new order with the following data:\033[0m"
echo "$ORDER_DATA" | jq '.'

# Send the create request
RESPONSE=$(curl -s -X POST "$API_URL/bookstore.order.create" \
  -H "Content-Type: application/json" \
  -d "$ORDER_DATA")

# Extract the order ID
ORDER_ID=$(echo "$RESPONSE" | jq -r '.result.data.id')

if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
  echo -e "\033[32mCreated new order with ID: $ORDER_ID\033[0m"
  
  # Verify the order was created by retrieving it
  echo -e "\033[33mVerifying order creation by retrieving it...\033[0m"
  
  # URL encode the input JSON
  INPUT_JSON="{\"id\":\"$ORDER_ID\"}"
  ENCODED_INPUT=$(echo "$INPUT_JSON" | jq -sRr @uri)
  
  GET_RESPONSE=$(curl -s "$API_URL/bookstore.order.get?input=$ENCODED_INPUT")
  CREATED_ORDER=$(echo "$GET_RESPONSE" | jq '.result.data')
  
  echo -e "\033[32mOrder created successfully with the following details:\033[0m"
  echo "  ID: $(echo "$CREATED_ORDER" | jq -r '.id')"
  echo "  Customer: $(echo "$CREATED_ORDER" | jq -r '.customerName') ($(echo "$CREATED_ORDER" | jq -r '.customerEmail'))"
  echo "  Status: $(echo "$CREATED_ORDER" | jq -r '.status')"
  echo "  Total Amount: $(echo "$CREATED_ORDER" | jq -r '.totalAmount')"
  echo "  Items: $(echo "$CREATED_ORDER" | jq -r '.items | length')"
  echo "$CREATED_ORDER" | jq -r '.items[] | "    - Book ID: \(.bookId) - Quantity: \(.quantity) - Unit Price: \(.unitPrice)"'
  
  echo -e "\033[32mCreate Order test completed successfully!\033[0m"
else
  echo -e "\033[31mError: Received invalid response from server\033[0m"
  echo "Response: $RESPONSE"
fi 