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

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/lab-tests", labTestRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/stockItem", stockItemRoutes);
app.use("/api/reports", patientReportRoutes);
app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
