import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import clinicRoutes from "./routes/clinicRoutes.js";
import drugRoutes from "./routes/drugRoutes.js";
import labTestRoutes from "./routes/labTestRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import vaccinationRoutes from "./routes/vaccinationRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import stockItemRoutes from "./routes/stockItemRoutes.js";
import patientReportRoutes from "./routes/patientReportRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import stockOutRoutes from "./routes/stockOutRoutes.js";
import stockCategoryRoutes from "./routes/stockCategoryRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import activityFeedRoutes from "./routes/activityFeedRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import medicalServiceRoutes from './routes/medicalServiceRoutes.js';
import billRoutes from "./routes/billRoutes.js";
import PendingTaskRoutes from "./routes/pendingTaskRoutes.js";
import prescriptionsettingRoutes from "./routes/prescriptionsettingRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js"



dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "*", // Allow only frontend URL
    credentials: true, // Allow cookies and authentication headers
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/lab-tests", labTestRoutes);
app.use("/api/consultation", consultationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/stockItem", stockItemRoutes);
app.use("/api/reports", patientReportRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/stockOut", stockOutRoutes);
app.use("/api/stockCategory", stockCategoryRoutes);
app.use("/api/activity-feed", activityFeedRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/progress", progressRoutes);
app.use('/api/medical', medicalServiceRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/pendingTask", PendingTaskRoutes);
app.use("/api/prescriptionsettings", prescriptionsettingRoutes);
app.use("/api/doctor", doctorRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
