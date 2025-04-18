import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    profileImage:{
        type: String,
        default :""
    }
},{timestamps: true});

//hash password before saving to database
userSchema.pre ("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        next(error);
    }
})

//compare password
userSchema.methods.comparePassword = async function(userPassword){
    try {
        return await bcrypt.compare(userPassword, this.password);
    } catch (error) {
        throw error;
    }
}

const User = mongoose.model("User", userSchema);

export default User;