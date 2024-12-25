const express = require('express');
const app = express();
const { getWithdrawalsByUserId } = require('./models'); // You will need to implement this model
const port = 3000;

app.use(express.json());

// API endpoint to get withdrawals for a specific user
app.get('/api/withdrawals', async (req, res) => {
    const userId = req.query.userId;  // Get the userId from the query string

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        // Fetch withdrawals from the database (You need to implement this part)
        const withdrawals = await getWithdrawalsByUserId(userId);

        if (withdrawals.length > 0) {
            res.json({ success: true, data: withdrawals });
        } else {
            res.json({ success: true, data: [] });
        }
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
    }
});

// Assuming you have a function that interacts with your database
async function getWithdrawalsByUserId(userId) {
    // Replace this with actual database logic, e.g., querying your database
    // For demonstration, let's assume we return a static list of withdrawals

    const mockWithdrawals = [
        { amount: 100, status: 'Approved', bankName: 'Bank A', accountNumber: '1234567890', date: '2024-12-20' },
        { amount: 200, status: 'Pending', bankName: 'Bank B', accountNumber: '9876543210', date: '2024-12-21' },
    ];

    // Simulating data for the given userId
    return mockWithdrawals.filter((withdrawal) => withdrawal.userId === userId);
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
