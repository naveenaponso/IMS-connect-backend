const reportModel = require("../models/reportModel");

// Generate Idea Report
exports.generateIdeaReport = (req, res) => {
    const { startDate, endDate, status } = req.query;

    reportModel.getIdeaReport(startDate, endDate, status, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Error generating report", error: err.message });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "No data available for the selected filters" });
        }
        res.json(data);
    });
};

// Generate Collaboration Report
exports.generateCollaborationReport = (req, res) => {
    const { startDate, endDate } = req.query;

    reportModel.getCollaborationReport(startDate, endDate, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Error generating report", error: err.message });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "No data available for the selected filters" });
        }
        res.json(data);
    });
};
