const { Course } = require('./models/Course'); // Import the Course model

// Controller to fetch courses assigned to a specific Gmail
const fetchUserCourses = async (req, res) => {
    const { email } = req.query;

    try {
        // Validate email input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required to fetch courses.",
            });
        }

        // Find courses associated with the provided Gmail
        const courses = await Course.find({ ownerEmail: email });

        // If no courses are found
        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found for this email.",
            });
        }

        // Return the courses
        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully.",
            courses,
        });
    } catch (error) {
        console.error("Error fetching user courses:", error.message);
        // Internal server error
        res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};

module.exports = { fetchUserCourses };
