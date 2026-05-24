import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://samirkha4575_db_user:startUpDoing@cluster0.eegndv8.mongodb.net/userData";

async function clearDatabase() {
  console.log("Connecting to database...");
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Database connected successfully!");

    const db = mongoose.connection.db;
    const collectionsList = await db.listCollections().toArray();
    const collectionNames = collectionsList.map(c => c.name);
    console.log("Found collections in DB:", collectionNames);

    for (const name of collectionNames) {
      if (name.includes("user")) {
        console.log(`Keeping user collection: ${name}`);
        continue;
      }
      
      console.log(`Clearing collection: ${name}...`);
      await db.collection(name).deleteMany({});
      console.log(`Cleared ${name} successfully!`);
    }

    console.log("Seeding test coupons...");
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 2); // Expiry in 2 years

    const testCoupons = [
      {
        code: "TEESX50",
        discountPercentage: 50,
        maxDiscount: 1000,
        minCartAmount: 500,
        expiryDate: expiry,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "WELCOME10",
        discountPercentage: 10,
        maxDiscount: 500,
        minCartAmount: 300,
        expiryDate: expiry,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection("coupondatas").insertMany(testCoupons);
    console.log("Successfully seeded 2 premium checkout coupons (TEESX50, WELCOME10)! 🎫");

    console.log("Database cleanup and prep completed successfully! ✨");
  } catch (error) {
    console.error("Database cleanup/seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  }
}

clearDatabase();
