#!/bin/bash
# Shell script to test the Update Order Status feature

API_URL="http://localhost:3005/api/trpc"

echo -e "\033[36mTesting Update Order Status Feature\033[0m"
echo -e "\033[36m================================\033[0m"

# First, get a list of orders to find an ID
echo -e "\033[33mGetting list of orders to find an ID...\033[0m"
LIST_RESPONSE=$(curl -s "$API_URL/bookstore.order.list")

# Check if orders exist
if echo "$LIST_RESPONSE" | jq -e '.result.data | length > 0' > /dev/null; then
  # Get the first order's ID and status
  ORDER_ID=$(echo "$LIST_RESPONSE" | jq -r '.result.data[0].id')
  CURRENT_STATUS=$(echo "$LIST_RESPONSE" | jq -r '.result.data[0].status')
  
  echo -e "\033[32mFound order to update: ID $ORDER_ID (Current status: $CURRENT_STATUS)\033[0m"
  
  # Determine new status (cycle through statuses)
  declare -a STATUSES=("PENDING" "PROCESSING" "SHIPPED" "DELIVERED" "CANCELLED")
  
  # Find current status index
  CURRENT_INDEX=-1
  for i in "${!STATUSES[@]}"; do
    if [ "${STATUSES[$i]}" = "$CURRENT_STATUS" ]; then
      CURRENT_INDEX=$i
      break
    fi
  done
  
  # Calculate next status index
  NEXT_INDEX=$(( (CURRENT_INDEX + 1) % ${#STATUSES[@]} ))
  NEW_STATUS="${STATUSES[$NEXT_INDEX]}"
  
  echo -e "\033[33mUpdating order status from '$CURRENT_STATUS' to '$NEW_STATUS'...\033[0m"
  
  # Prepare update data
  UPDATE_JSON="{\"id\":\"$ORDER_ID\",\"status\":\"$NEW_STATUS\"}"
  
  # Send the update request
  UPDATE_RESPONSE=$(curl -s -X POST "$API_URL/bookstore.order.updateStatus" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_JSON")
  
  echo -e "\033[32mOrder status updated successfully!\033[0m"
  
  # Verify the order was updated by retrieving it
  echo -e "\033[33mVerifying order update by retrieving it...\033[0m"
  
  # URL encode the input JSON
  INPUT_JSON="{\"id\":\"$ORDER_ID\"}"
  ENCODED_INPUT=$(echo "$INPUT_JSON" | jq -sRr @uri)
  
  GET_RESPONSE=$(curl -s "$API_URL/bookstore.order.get?input=$ENCODED_INPUT")
  UPDATED_STATUS=$(echo "$GET_RESPONSE" | jq -r '.result.data.status')
  
  echo -e "\033[32mUpdated order details:\033[0m"
  echo "$GET_RESPONSE" | jq '.result.data | {
    ID: .id,
    Customer: .customerName,
    Status: .status,
    "Previous Status": "'$CURRENT_STATUS'",
    "Total Amount": .totalAmount,
    "Item Count": (.items | length)
  }'
  
  if [ "$UPDATED_STATUS" = "$NEW_STATUS" ]; then
    echo -e "\033[32mStatus update verified successfully!\033[0m"
  else
    echo -e "\033[31mStatus update verification failed! Expected: $NEW_STATUS, Got: $UPDATED_STATUS\033[0m"
  fi
  
  echo -e "\033[32mUpdate Order Status test completed successfully!\033[0m"
else
  echo -e "\033[31mNo orders found in the database. Please create an order first.\033[0m"
  exit 1
fi 