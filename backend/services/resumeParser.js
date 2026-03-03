const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs");

/**
 * Extracts raw text from a PDF or DOCX file.
 * @param {string} filePath - Absolute path to the uploaded file
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<string>} - Extracted plain text
 */
async function extractText(buffer, mimetype) {

    if (mimetype === "application/pdf") {
        const data = await pdfParse(buffer);
        return data.text;
    }

    if (
        mimetype === "application/msword" ||
        mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }

    throw new Error("Unsupported file type. Please upload a PDF or Word document.");
}

module.exports = { extractText };
