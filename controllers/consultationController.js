import Consultation from "../models/Consultation.js";
import User from "../models/User.js";
import Billing from "../models/Billing.js"; 


export const createConsultation = async (req, res) => {
  try {
    const {
      patient,
      services,
      details,
      temperature,
      weight,
      consultationDate,
      consultationTime,
      health,
      bmi,
    } = req.body;

    if (
      !patient ||
      !services?.length ||
      !details ||
      !temperature ||
      !weight ||
      !consultationDate ||
      !consultationTime
    ) {
      return res.status(400).json({ msg: "All required fields must be filled" });
    }

    // Get last consultation to determine next ID
    const lastConsultation = await Consultation.findOne()
      .sort({ createdAt: -1 })
      .select("consultationId")
      .exec();

    let nextIdNumber = 1001;
    if (lastConsultation?.consultationId) {
      const lastIdNumber = parseInt(lastConsultation.consultationId.split("-")[1]);
      nextIdNumber = lastIdNumber + 1;
    }

    const consultationId = `CONS-${nextIdNumber}`;

    const consultation = new Consultation({
      consultationId,
      patient,
      services,
      details,
      temperature,
      weight,
      consultationDate: new Date(consultationDate),
      consultationTime,
      health,
      bmi,
      createdBy: req.user.id,
    });

    await consultation.save();

    res.status(201).json({ msg: "Consultation created successfully", consultation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


export const getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate("patient", "name patientId") 
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });


    return res.status(200).json({
      msg: "Consultations fetched successfully",
      consultations,
    });
  } catch (err) {
    console.error("Error fetching consultations:", err);
    return res.status(500).json({
      msg: "Server error while fetching consultations",
      error: err.message,
    });
  }
};


export const getConsultationBilling = async (req, res) => {
  try {
    const billings = await Billing.find()
      .populate("patientId", "name") // populate patient's name
      .populate("doctor", "name") // populate doctor's name
      .sort({ date: -1 }); // optional: latest first

    // Format the response
    const response = billings.map((bill) => ({
      consultationId: bill.billId,
      patient: bill.patientId?.name || "N/A",
      doctor: bill.doctor?.name || "N/A",
      department: bill.service,
      date: bill.date.toISOString().split("T")[0], 
      method: "N/A", 
      amount: bill.amount,
      status: bill.status,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching billing:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getBillingSummary = async (req, res) => {
  try {
    const records = await Consultation.find();

    const totalConsultations = records.length;

    const totalCollected = records
      .filter(r => r.status === 'Paid')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingCollection = records
      .filter(r => r.status === 'Pending')
      .reduce((sum, r) => sum + r.amount, 0);

    res.status(200).json({
      totalConsultations,
      totalCollected,
      pendingCollection
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching billing summary' });
  }
};


export const getPaymentSummary = async (req, res) => {
  try {
    const records = await Consultation.find();

    // Payment distribution
    const paidCount = records.filter(r => r.status === 'Paid').length;
    const pendingCount = records.filter(r => r.status === 'Pending').length;

    const paymentDistribution = {
      Paid: paidCount,
      Pending: pendingCount,
    };

    // Revenue by department (Paid only)
    const revenueByDepartment = records.reduce((acc, record) => {
      if (record.status === 'Paid') {
        acc[record.department] = (acc[record.department] || 0) + record.amount;
      }
      return acc;
    }, {});

    res.status(200).json({
      paymentDistribution,
      revenueByDepartment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching payment summary' });
  }
};


