const Course = require("../model/course")
const Affiliate = require("../model/affiliate")



const generateaffiliatelink = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId } = req.body;
        const course = await Course.findById(courseId);
        const affiliate = await Affiliate.findById(userId);

        if (!course || !affiliate) {
            return res.status(404).send('Course or affiliate not found');
        }

        const affiliateLink = `https://fathiabams-task.vercel.app/${courseId}?affiliate=${userId}`;
        affiliate.courses.push({ courseId, affiliateLink });
        course.affiliates.push({ affiliateId: userId, affiliateLink });
        await affiliate.save();
        await course.save();

        res.send({ affiliateLink });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

// Track affiliate referral for course
const affiliatereferrals = async (req, res) => {
    try {
        const { courseId, affiliateId } = req.params;
        const course = await Course.findById(courseId);
        const affiliate = await Affiliate.findById(affiliateId);

        if (!course || !affiliate) {
            return res.status(404).send('Course or affiliate not found');
        }

        // Track referral
        const referral = new Referral({
            course: course._id,
            affiliate: affiliate._id,
            referredUser: req.query.referredUser,
        });
        await referral.save();

        res.send('Referral tracked successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

const affiliatesales = async (req, res) => {
    try {
        const { courseId, affiliateId, saleAmount } = req.body;
        const course = await Course.findById(courseId);
        const affiliate = await Affiliate.findById(affiliateId);

        if (!course || !affiliate) {
            return res.status(404).send('Course or affiliate not found');
        }

        // Update course sales
        course.sales += 1;
        await course.save();

        // Update affiliate sales metrics
        affiliate.todaySales += 1;
        affiliate.overallSales += 1;
        affiliate.todayAffiliateEarnings += saleAmount;
        affiliate.overallAffiliateEarnings += saleAmount;
        affiliate.availableAffiliateEarnings += saleAmount - affiliate.withdrawalFee;
        await affiliate.save();

        res.send('Sale tracked successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

// Get affiliate links for affiliate
const affiliatedlinks = async (req, res) => {
    try {
        const { affiliateId } = req.params;
        const affiliate = await Affiliate.findById(affiliateId).populate('courses.courseId');

        if (!affiliate) {
            return res.status(404).send('Affiliate not found');
        }

        const affiliateLinks = affiliate.courses.map((course) => ({
            courseId: course.courseId._id,
            title: course.courseId.title,
            affiliateLink: course.affiliateLink,
        }));

        res.send(affiliateLinks);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


const affiliatesalesmetrics = async (req, res) => {
    try {
        const { affiliateId } = req.params;
        const affiliate = await Affiliate.findById(affiliateId);

        if (!affiliate) {
            return res.status(404).send('Affiliate not found');
        }

        const salesMetrics = {
            todaySales: affiliate.todaySales,
            overallSales: affiliate.overallSales,
            todayAffiliateEarnings: affiliate.todayAffiliateEarnings,
            overallAffiliateEarnings: affiliate.overallAffiliateEarnings,
            availableAffiliateEarnings: affiliate.availableAffiliateEarnings,
        };

        res.send(salesMetrics);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    affiliatereferrals,
    generateaffiliatelink,
    affiliatesales,
    affiliatedlinks,
    affiliatesalesmetrics

}