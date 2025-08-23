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

    // Extra fields for EditProfile
    profile: {
      dob: Date,
      placeOfBirth: String,
      gender: String,
      phoneNumber: String,
      emergencyPhoneNumber: String,

      // PERSONAL INFO
      showPersonalInfo: { type: String, enum: ["yes", "no"], default: "no" },
      religion: String,
      nationality: String,
      homeAddress: String,
      spouseName: String,
      spousePhone: String,
      fatherName: String,
      fatherPhone: String,
      motherName: String,
      motherPhone: String,

      // EDUCATION
      hasEducationalInfo: { type: String, enum: ["yes", "no"], default: "no" },
      educationLevel: String,
      institutionName: String,
      graduationYear: String,
      fieldOfStudy: String,

      // ACCOUNT INFO
      hasAccountInfo: { type: String, enum: ["yes", "no"], default: "no" },
      accountNumber: String,
      bankName: String,
      accountType: String,
      accountStatus: String,

      // USER ACCESS CONTROL
      accessRole: String,
      accessStatus: String,

      // SYSTEM ACCOUNT
      photo: String, // store image URL (Cloudinary)
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
