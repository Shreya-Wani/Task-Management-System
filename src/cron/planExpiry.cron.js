import cron from "node-cron";
import Company from "../models/company.model.js";

const planExpiryCron = () => {

  cron.schedule("0 0 * * *", async () => {
    console.log("Running plan expiry check...");

    const now = new Date();

    const expiredCompanies = await Company.find({
      planExpiry: { $lt: now },
      isActive: true
    });

    for (const company of expiredCompanies) {
      company.isActive = false;
      await company.save();
    }

    console.log(`Expired companies disabled: ${expiredCompanies.length}`);
  });

};

export default planExpiryCron;