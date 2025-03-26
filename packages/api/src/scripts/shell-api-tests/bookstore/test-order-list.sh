#!/bin/bash
# Shell script to test the Order List feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Order List Feature\033[0m"
echo -e "\033[36m========================\033[0m"

echo -e "\033[33mListing all orders...\033[0m"
RESPONSE=$(curl -s "$API_URL/bookstore.order.list")

# Check if orders exist
if echo "$RESPONSE" | jq -e '.result.data | length > 0' > /dev/null; then
  ORDERS_COUNT=$(echo "$RESPONSE" | jq '.result.data | length')
  
  echo -e "\033[32mFound $ORDERS_COUNT orders:\033[0m"
  
  # Display orders in a table-like format
  echo "$RESPONSE" | jq -r '.result.data[] | "ID: \(.id) | Customer: \(.customerName) | Email: \(.customerEmail) | Status: \(.status) | Total: $\(.totalAmount) | Items: \(.items | length)"'
else
  echo -e "\033[33mNo orders found or empty response received.\033[0m"
  echo "Response structure: $(echo "$RESPONSE" | jq '.')"
fi

echo -e "\033[32mOrder List test completed successfully!\033[0m" 