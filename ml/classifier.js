const natural = require("natural");
const path = require("path");

const modelPath = path.join(__dirname, "classifier.json");

let classifier;

// Load the classifier synchronously.
// In a real-world app, you might do this asynchronously at startup.
try {
  const classifierData = require("./classifier.json");
  classifier = natural.BayesClassifier.restore(classifierData);
} catch (error) {
  console.error("Could not load classifier.json, creating a new one.", error);
  classifier = new natural.BayesClassifier();
}

const classify = (text) => {
  return classifier.classify(text);
};

module.exports = { classify };
