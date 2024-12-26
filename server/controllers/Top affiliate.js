const Sale = require('../models/Sale');
const Affiliate = require('../models/Affiliate');

exports.getTopAffiliate = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Aggregate sales to find the top affiliate
    const topAffiliate = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$affiliate',
          totalSales: { $sum: '$amount' },
        },
      },
      {
        $sort: { totalSales: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    if (topAffiliate.length === 0) {
      return res.status(404).json({ message: 'No sales data found for the specified period' });
    }

    // Populate affiliate details
    const affiliateDetails = await Affiliate.findById(topAffiliate[0]._id);

    res.json({
      month,
      year,
      topAffiliate: {
        name: affiliateDetails.name,
        email: affiliateDetails.email,
        totalSales: topAffiliate[0].totalSales,
      },
    });
  } catch (error) {
    console.error('Error fetching top affiliate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
