#!/bin/bash
# Shell script to test the Create Order feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Create Order Feature\033[0m"
echo -e "\033[36m==========================\033[0m"

# First, get a list of available books to order
echo -e "\033[33mGetting list of available books...\033[0m"
BOOKS_RESPONSE=$(curl -s "$API_URL/bookstore.book.list")

# Check if books exist
if echo "$BOOKS_RESPONSE" | jq -e '.result.data | length > 0' > /dev/null; then
  # Filter for available books
  AVAILABLE_BOOKS=$(echo "$BOOKS_RESPONSE" | jq '.result.data[] | select(.status == "AVAILABLE")')
  
  if [ -z "$AVAILABLE_BOOKS" ]; then
    echo -e "\033[31mNo available books found. Please add available books first.\033[0m"
    exit 1
  fi
  
  # Count available books
  AVAILABLE_COUNT=$(echo "$AVAILABLE_BOOKS" | jq -s 'length')
  echo -e "\033[32mFound $AVAILABLE_COUNT available books\033[0m"
  
  # Select up to 2 books for the order
  BOOKS_TO_ORDER=$(echo "$AVAILABLE_BOOKS" | jq -s 'if length > 2 then .[0:2] else . end')
  
  # Create order items
  ORDER_ITEMS=$(echo "$BOOKS_TO_ORDER" | jq 'map({
    bookId: .id,
    quantity: (1 + (Random % 3)),
    unitPrice: .price
  })')
  
  # Calculate total amount
  TOTAL_AMOUNT=$(echo "$ORDER_ITEMS" | jq 'map(.quantity * .unitPrice) | add')
  
  # Create order data
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  ORDER_JSON=$(cat <<EOF
{
  "customerName": "Test Customer $TIMESTAMP",
  "customerEmail": "test$TIMESTAMP@example.com",
  "shippingAddress": "123 Main St, Anytown, USA",
  "status": "PENDING",
  "totalAmount": $TOTAL_AMOUNT,
  "items": $ORDER_ITEMS
}
EOF
)

  echo -e "\033[33mCreating a new order with the following data:\033[0m"
  echo "Customer: Test Customer $TIMESTAMP (test$TIMESTAMP@example.com)"
  echo "Status: PENDING"
  echo "Total Amount: $TOTAL_AMOUNT"
  echo "Items: $(echo "$ORDER_ITEMS" | jq 'length')"
  
  # Send the create request
  RESPONSE=$(curl -s -X POST "$API_URL/bookstore.order.create" \
    -H "Content-Type: application/json" \
    -d "$ORDER_JSON")
  
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
    
    echo -e "\033[32mOrder created successfully with the following details:\033[0m"
    echo "$GET_RESPONSE" | jq '.result.data'
    
    echo -e "\033[32mCreate Order test completed successfully!\033[0m"
  else
    echo -e "\033[31mError: Received invalid response from server\033[0m"
    echo "Response: $RESPONSE"
  fi
else
  echo -e "\033[31mNo books found in the database. Please add books first.\033[0m"
  exit 1
fi 