import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: String,

    role: {
      type: String,
      enum: [
        "superAdmin",
        "companyAdmin",
        "doctor",
        "labTechnician",
        "patient",
        "accountant",
      ],
      required: true,
    },

    vaccineDoses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "VaccinationDose" },
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    registrationNo: {
      type: String,
      required: function () {
        return this.role === "doctor";
      },
    },

    patientId: { type: String, unique: true },

    // Extra fields for EditProfile
    profile: {
      dob: Date,
      placeOfBirth: String,
      gender: String,
      phoneNumber: String,
      emergencyPhoneNumber: String,
      religion: String,
      nationality: String,
      homeAddress: String,
      spouseName: String,
      spousePhone: String,
      fatherName: String,
      fatherPhone: String,
      motherName: String,
      motherPhone: String,
      educationLevel: String,
      institutionName: String,
      graduationYear: String,
      fieldOfStudy: String,
      accountNumber: String,
      bankName: String,
      accountType: String,
      accountStatus: String,
      accessRole: String,
      accessStatus: String,
      photo: String,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    otp: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
