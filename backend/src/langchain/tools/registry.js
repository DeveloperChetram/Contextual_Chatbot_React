// ============================
// Tool Registry
// All tools are registered here
// ============================

// Utility & General Tools
const calculator = require("./calculator.tool");
const currentDateTime = require("./general/currentDate.tool");
const uuidGenerator = require("./general/uuid.tool");
const passwordGenerator = require("./general/passwordGenerator.tool");
const hashGenerator = require("./general/hashGenerator.tool");
const base64 = require("./general/base64.tool");
const jsonFormatter = require("./general/jsonFormatter.tool");
const regexTester = require("./general/regexTester.tool");
const unitConverter = require("./general/unitConverter.tool");
const currencyConverter = require("./general/currencyConverter.tool");
const dateDifference = require("./general/dateDifference.tool");
const addSubtractDays = require("./general/addSubtractDays.tool");

// Developer Utilities (jwt, yaml, random, qr)
const { jwtDecoderTool, yamlValidatorTool, randomNumberTool, qrCodeTool } = require("./general/devUtils.tool");

// Web Tools
const weather = require("./web/weather.tool");
const visitWebpage = require("./web/visitWebpage.tool");
const httpRequest = require("./web/httpRequest.tool");
const webSearch = require("./web/webSearch.tool");
const cryptoPrice = require("./web/cryptoPrice.tool");
const { geocodingTool, distanceTool } = require("./web/geocoding.tool");

// GitHub & Developer Tools
const githubUser = require("./github/githubUser.tool");
const githubRepoSearch = require("./github/githubRepo.tool");
const githubIssues = require("./github/githubIssues.tool");
const githubCommits = require("./github/githubCommits.tool");
const npmSearch = require("./github/npmSearch.tool");

// AI Helper Tools
const summarizer = require("./ai/summarize.tool");
const { translatorTool, grammarFixerTool, rewriterTool, sentimentAnalysisTool, keywordExtractorTool } = require("./ai/aiHelpers.tool");

// Export all tools by name
// Each key here is the name that agents can select from the UI
module.exports = {
    // Utility
    calculator,
    current_datetime: currentDateTime,
    uuid_generator: uuidGenerator,
    password_generator: passwordGenerator,
    hash_generator: hashGenerator,
    base64,
    json_formatter: jsonFormatter,
    regex_tester: regexTester,
    random_number: randomNumberTool,
    qr_code_generator: qrCodeTool,

    // Time & Date
    date_difference: dateDifference,
    add_subtract_days: addSubtractDays,

    // Conversion
    unit_converter: unitConverter,
    currency_converter: currencyConverter,

    // Developer Tools
    jwt_decoder: jwtDecoderTool,
    yaml_validator: yamlValidatorTool,

    // Web Tools
    weather,
    visit_webpage: visitWebpage,
    http_request: httpRequest,
    web_search: webSearch,
    crypto_price: cryptoPrice,
    geocoding: geocodingTool,
    distance_calculator: distanceTool,

    // GitHub Tools
    github_user: githubUser,
    github_repo_search: githubRepoSearch,
    github_issues: githubIssues,
    github_commits: githubCommits,
    npm_search: npmSearch,

    // AI Tools
    summarizer,
    translator: translatorTool,
    grammar_fixer: grammarFixerTool,
    rewriter: rewriterTool,
    sentiment_analysis: sentimentAnalysisTool,
    keyword_extractor: keywordExtractorTool,
};