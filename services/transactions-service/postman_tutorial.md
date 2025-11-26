# Postman Tutorial: Testing the Transaction Service

This tutorial will guide you step-by-step on how to use Postman to test your Banking Transaction Service.

## Prerequisites

1.  **Node.js** installed.
2.  **Postman** installed (Download from [postman.com](https://www.postman.com/downloads/)).
3.  **VS Code** open with your project.

---

## Step 1: Start Your Server

Before using Postman, your API must be running.

1.  Open the terminal in VS Code (`Ctrl+` `).
2.  Run the following command:
    ```bash
    node server.js
    ```
3.  You should see: `🚀 Transaction Service running on port 3000`.

---

## Step 2: Create a Postman Collection

A "Collection" groups your requests together.

1.  Open **Postman**.
2.  Click **Collections** in the left sidebar.
3.  Click the **+** (Plus) icon or **"Create new collection"**.
4.  Name it: `Transaction Service`.

---

## Step 3: Test Scenario 1 - Making a Deposit

Let's add money to an account.

1.  Right-click your new `Transaction Service` collection -> **Add Request**.
2.  Name the request: `1. Deposit Money`.
3.  Change the method from **GET** to **POST** (using the dropdown next to the URL bar).
4.  Enter the URL: `http://localhost:3000/transactions/deposit`
5.  Go to the **Body** tab (below the URL).
6.  Select **raw**.
7.  In the dropdown that says "Text", select **JSON**.
8.  Paste this JSON code:
    ```json
    {
      "type": "deposit",
      "toAccount": "ACC_123",
      "amount": 500,
      "currency": "TND",
      "description": "Initial Deposit"
    }
    ```
9.  Click **Send** (Blue button).
10. **Check the Response** (bottom pane):
    *   Status should be `201 Created`.
    *   You should see `"success": true` and the transaction details.

---

## Step 4: Test Scenario 2 - Checking Balance (History)

Let's see if the deposit worked by checking the account history.

1.  Right-click Collection -> **Add Request**.
2.  Name it: `2. Get Account History`.
3.  Method: **GET**.
4.  URL: `http://localhost:3000/transactions/account/ACC_123`
5.  Click **Send**.
6.  **Check Response**:
    *   You should see a list of transactions, including the one you just created.

---

## Step 5: Test Scenario 3 - Internal Transfer

Let's move money from User 1 (`ACC_123`) to User 2 (`ACC_456`).

1.  Right-click Collection -> **Add Request**.
2.  Name it: `3. Internal Transfer`.
3.  Method: **POST**.
4.  URL: `http://localhost:3000/transactions/internal-transfer`
5.  **Body** -> **raw** -> **JSON**:
    ```json
    {
      "type": "internal_transfer",
      "fromAccount": "ACC_123",
      "toAccount": "ACC_456",
      "amount": 100,
      "currency": "TND",
      "description": "Paying back lunch"
    }
    ```
6.  Click **Send**.
7.  **Check Response**:
    *   Status: `201 Created`.
    *   Note the `fees` and `commission` calculated in the response.

---

## Step 6: Test Scenario 4 - Testing Limits (Error Case)

Let's try to withdraw more than allowed to see if the system stops us.

1.  Right-click Collection -> **Add Request**.
2.  Name it: `4. Withdrawal Limit Test`.
3.  Method: **POST**.
4.  URL: `http://localhost:3000/transactions/withdrawal`
5.  **Body** -> **raw** -> **JSON**:
    ```json
    {
      "type": "withdrawal",
      "fromAccount": "ACC_123",
      "amount": 6000,
      "currency": "TND",
      "description": "Trying to take too much"
    }
    ```
    *(Note: The daily limit is 5000 TND)*
6.  Click **Send**.
7.  **Check Response**:
    *   Status should be `400 Bad Request`.
    *   Error message should say: `Daily withdrawal limit exceeded`.

---

## Step 7: Test Scenario 5 - Fraud Detection

Let's trigger a security alert.

1.  Right-click Collection -> **Add Request**.
2.  Name it: `5. Fraud Check`.
3.  Method: **POST**.
4.  URL: `http://localhost:3000/transactions/fraud-check`
5.  **Body** -> **raw** -> **JSON**:
    ```json
    {
      "type": "withdrawal",
      "fromAccount": "ACC_123",
      "amount": 15000,
      "currency": "TND"
    }
    ```
6.  Click **Send**.
7.  **Check Response**:
    *   `"isFraud": true`
    *   `"securityLevel": "high"`

---

## Summary

You have now successfully:
1.  Started the API.
2.  Configured Postman.
3.  Executed **Create** operations (Deposit, Transfer).
4.  Executed **Read** operations (History).
5.  Verified **Business Logic** (Limits, Fraud).
