import mongoose from "mongoose";

import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  level: { 
    type: Number, 
    enum: [100, 200, 300, 400],
    required: true 
  },
  semester: { 
    type: Number, 
    enum: [1, 2],
    required: true 
  },
  levelSemesterTag: { 
    type: String,
    enum: ["100/1", "100/2", "200/1", "200/2", "300/1", "300/2", "400/1", "400/2"], 
    required: true 
  }, 
  role: { 
    type: String, 
    enum: ["student", "admin"], 
    default: "student" },
  progress: [
    {
      courseCode: String, // e.g., "CSC212"
      modules: [
        {
          moduleId: String,
          completed: { type: Boolean, default: false }
        },
      ],
      quizzes: [
        {
          quizId: String,
          score: Number,
          passed: { type: Boolean, default: false }
        },
      ],
      lastAccessedModuleId: String,
    },
  ]},
  { timestamps: true }
);

// presave hook to hash password before saving to the to database
UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch(err){
        next(err)
    }
})

// compare passwords
UserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)    
}

const User = mongoose.model("User", UserSchema);
export default User;