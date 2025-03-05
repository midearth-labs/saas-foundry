#!/bin/bash
# Shell script to test the Get Order feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Get Order Feature\033[0m"
echo -e "\033[36m=======================\033[0m"

# First, get a list of orders to find an ID
echo -e "\033[33mGetting list of orders to find an ID...\033[0m"
LIST_RESPONSE=$(curl -s "$API_URL/bookstore.order.list")

# Check if orders exist
if echo "$LIST_RESPONSE" | jq -e '.result.data | length > 0' > /dev/null; then
  # Get the first order's ID
  ORDER_ID=$(echo "$LIST_RESPONSE" | jq -r '.result.data[0].id')
  
  echo -e "\033[32mFound order with ID: $ORDER_ID\033[0m"
  
  # Create the input JSON and URL encode it
  INPUT_JSON="{\"id\":\"$ORDER_ID\"}"
  ENCODED_INPUT=$(echo "$INPUT_JSON" | jq -sRr @uri)
  
  echo -e "\033[33mGetting order details for ID: $ORDER_ID...\033[0m"
  GET_RESPONSE=$(curl -s "$API_URL/bookstore.order.get?input=$ENCODED_INPUT")
  
  echo -e "\033[32mOrder details:\033[0m"
  echo "$GET_RESPONSE" | jq '.result.data | {
    ID: .id,
    Customer: .customerName,
    Email: .customerEmail,
    Status: .status,
    "Total Amount": .totalAmount,
    "Item Count": (.items | length)
  }'
  
  echo -e "\033[33mOrder items:\033[0m"
  echo "$GET_RESPONSE" | jq '.result.data.items[] | {
    "Book ID": .bookId,
    Quantity: .quantity,
    "Unit Price": .unitPrice
  }'
  
  echo -e "\033[32mGet Order test completed successfully!\033[0m"
else
  echo -e "\033[31mNo orders found in the database. Please create an order first.\033[0m"
  exit 1
fi 