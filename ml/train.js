// This is the correct line
require("dotenv").config();
const natural = require("natural");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Feedback = require("../models/feedback.model");
const initialData = require("./dataset.json");

const trainModel = async () => {
  console.log("Starting model training...");

  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for training.");

    // 2. Load feedback data from DB
    const feedbackData = await Feedback.find({});
    console.log(
      `Loaded ${feedbackData.length} feedback documents from the database.`,
    );

    const feedbackDocuments = feedbackData.map((item) => ({
      text: item.emailContent,
      label: item.correctLabel,
    }));

    // 3. Combine initial dataset with feedback data
    const allData = [...initialData, ...feedbackDocuments];
    console.log(`Total training documents: ${allData.length}`);

    // 4. Create and train the classifier
    const classifier = new natural.BayesClassifier();
    allData.forEach((item) => {
      classifier.addDocument(item.text, item.label);
    });

    console.log("Training classifier...");
    classifier.train();
    console.log("Training complete.");

    // 5. Save the trained model to a file
    const modelPath = path.join(__dirname, "classifier.json");
    classifier.save(modelPath, (err) => {
      if (err) {
        console.error("Error saving the classifier:", err);
      } else {
        console.log(`Classifier saved successfully to ${modelPath}`);
      }
      // 6. Close DB connection and exit
      mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("An error occurred during training:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

trainModel();
