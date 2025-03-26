#!/bin/bash
# Script to run all API tests

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "\033[36m======================================\033[0m"
echo -e "\033[36m  Running All Bookstore API Tests     \033[0m"
echo -e "\033[36m======================================\033[0m"

# Make all scripts executable
chmod +x "$SCRIPT_DIR"/*.sh

# Book tests
echo -e "\n\033[35mRunning Book API Tests...\033[0m"
"$SCRIPT_DIR/test-book-create.sh"
echo -e "\n"
"$SCRIPT_DIR/test-book-list.sh"
echo -e "\n"
"$SCRIPT_DIR/test-book-get.sh"
echo -e "\n"
"$SCRIPT_DIR/test-book-update.sh"
echo -e "\n"
"$SCRIPT_DIR/test-book-remove.sh"

# Order tests
echo -e "\n\033[35mRunning Order API Tests...\033[0m"
"$SCRIPT_DIR/test-order-create.sh"
echo -e "\n"
"$SCRIPT_DIR/test-order-list.sh"
echo -e "\n"
"$SCRIPT_DIR/test-order-get.sh"
echo -e "\n"
"$SCRIPT_DIR/test-order-update-status.sh"

echo -e "\n\033[36m======================================\033[0m"
echo -e "\033[36m  All API Tests Completed              \033[0m"
echo -e "\033[36m======================================\033[0m" 