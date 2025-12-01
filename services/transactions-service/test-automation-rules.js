const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAutomationRules() {
    console.log('🤖 Testing Automation Rules (Métier 4)\n');
    console.log('='.repeat(50));
    console.log('\n');

    try {
        // Test 1: Create an automation rule
        console.log('1️⃣  Creating automation rule: Auto-Save 10% of deposits');
        const createRuleResponse = await axios.post(`${BASE_URL}/transactions/auto-rules`, {
            accountId: 'ACC_123',
            name: 'Auto-Save 10%',
            description: 'Automatically save 10% of every deposit',
            type: 'save_percentage',
            trigger: 'on_deposit',
            action: {
                targetAccount: 'ACC_456',
                actionType: 'save',
                percentage: 10,
                description: 'Automatic savings'
            }
        });

        console.log('✅ Rule created successfully!');
        const ruleId = createRuleResponse.data.rule.ruleId;
        console.log(`   Rule ID: ${ruleId}`);
        console.log(`   Name: ${createRuleResponse.data.rule.name}`);
        console.log('');

        // Test 2: Get all rules for account
        console.log('2️⃣  Getting all automation rules for ACC_123');
        const getRulesResponse = await axios.get(`${BASE_URL}/transactions/auto-rules/ACC_123`);
        console.log(`✅ Found ${getRulesResponse.data.count} rule(s)`);
        console.log('');

        // Test 3: Make a deposit to trigger the rule
        console.log('3️⃣  Making a deposit of 1000 TND to ACC_123 (should trigger automation)');
        const depositResponse = await axios.post(`${BASE_URL}/transactions/deposit`, {
            toAccount: 'ACC_123',
            amount: 1000,
            description: 'Test deposit to trigger automation'
        });

        console.log('✅ Deposit completed');
        console.log(`   Transaction ID: ${depositResponse.data.transaction.transactionId}`);
        console.log('   ⏳ Waiting 2 seconds for automation to execute...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('');

        // Test 4: Check if automation executed
        console.log('4️⃣  Checking automation rule statistics');
        const statsResponse = await axios.get(`${BASE_URL}/transactions/auto-rules/${ruleId}/statistics`);
        console.log('✅ Rule statistics:');
        console.log(`   Total executions: ${statsResponse.data.statistics.totalExecutions}`);
        console.log(`   Total amount processed: ${statsResponse.data.statistics.totalAmountProcessed} TND`);
        console.log(`   Last executed: ${statsResponse.data.statistics.lastExecuted || 'Never'}`);
        console.log('');

        // Test 5: Check execution history
        console.log('5️⃣  Getting automation rule execution history');
        const historyResponse = await axios.get(`${BASE_URL}/transactions/auto-rules/${ruleId}/history`);
        console.log(`✅ Execution history: ${historyResponse.data.count} transaction(s)`);
        if (historyResponse.data.count > 0) {
            console.log(`   Latest automated transaction: ${historyResponse.data.transactions[0].transactionId}`);
            console.log(`   Amount: ${historyResponse.data.transactions[0].amount} TND`);
        }
        console.log('');

        // Test 6: Toggle rule (disable)
        console.log('6️⃣  Toggling automation rule (disabling)');
        const toggleResponse = await axios.patch(`${BASE_URL}/transactions/auto-rules/${ruleId}/toggle`);
        console.log(`✅ ${toggleResponse.data.message}`);
        console.log(`   Is active: ${toggleResponse.data.rule.isActive}`);
        console.log('');

        // Test 7: Make another deposit (should NOT trigger)
        console.log('7️⃣  Making another deposit (rule is disabled, should NOT trigger)');
        await axios.post(`${BASE_URL}/transactions/deposit`, {
            toAccount: 'ACC_123',
            amount: 500,
            description: 'Deposit with rule disabled'
        });
        console.log('✅ Deposit completed (no automation should have triggered)');
        console.log('');

        // Test 8: Re-enable the rule
        console.log('8️⃣  Re-enabling the automation rule');
        await axios.patch(`${BASE_URL}/transactions/auto-rules/${ruleId}/toggle`);
        console.log('✅ Rule re-enabled');
        console.log('');

        // Test 9: Update the rule
        console.log('9️⃣  Updating rule to save 15% instead of 10%');
        await axios.put(`${BASE_URL}/transactions/auto-rules/${ruleId}`, {
            action: {
                targetAccount: 'ACC_456',
                actionType: 'save',
                percentage: 15,
                description: 'Updated to 15% savings'
            }
        });
        console.log('✅ Rule updated successfully');
        console.log('');

        // Test 10: Final statistics
        console.log('🔟 Final automation rule statistics');
        const finalStatsResponse = await axios.get(`${BASE_URL}/transactions/auto-rules/${ruleId}/statistics`);
        console.log('✅ Final statistics:');
        console.log(`   Total executions: ${finalStatsResponse.data.statistics.totalExecutions}`);
        console.log(`   Total saved: ${finalStatsResponse.data.statistics.totalAmountProcessed} TND`);
        console.log('');

        // Cleanup: Delete the rule
        console.log('🧹 Cleaning up: Deleting the automation rule');
        await axios.delete(`${BASE_URL}/transactions/auto-rules/${ruleId}`);
        console.log('✅ Rule deleted');
        console.log('');

        console.log('='.repeat(50));
        console.log('✨ All automation rules tests completed successfully!');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error('   Error:', error.response?.data || error.message);
        if (error.response?.data?.errors) {
            console.error('   Validation errors:', error.response.data.errors);
        }
    }
}

// Run the tests
console.log('\n');
console.log('🚀 Starting Automation Rules Test Suite');
console.log('Make sure the server is running on http://localhost:3001\n');

testAutomationRules();
