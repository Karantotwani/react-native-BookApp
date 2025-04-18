import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (userId)=>{
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '15d'})
}

router.post('/register', async (req, res) => {
   try {
    
    const {username, email, password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({message:"All fields are required"});
    }

    if(password.length <6){
        return res.status(400).json({message:"Password must be at least 6 characters"});
    }

    if(!email.includes('@')){
        return res.status(400).json({message:"Email is not valid"});
    }

    if(username.length < 3){
        return res.status(400).json({message:"Username must be at least 3 characters"});
    }

    // check if user exists

    const existingEmail = await User.findOne({email});
   if(existingEmail){
    return res.status(400).json({message:"Email already exists"});
   }

   const existingUsername = await User.findOne({username});
   if(existingUsername){
    return res.status(400).json({message:"Username already exists"});
   }

   // avatar image
   const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

   const user = new User({
    username,
    email,
    password,
    profileImage
   })

   await user.save();
   const token = generateToken(user._id);
   res.status(201)
   .json({
    token, 
    user :{
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
        }
    })

   } catch (error) {
    console.error("Error in registration", error);
    res.status(500).json({ message: 'Server error' });
   }
});


router.post('/login', async (req, res) => {
try {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message:"All fields are required"});
    }

    if(!email.includes('@')){
        return res.status(400).json({message:"Email is not valid"});
    }

    //check if user exists
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message:"Invalid credentials"});
    }
    //compare password
    const passwordMatch = await user.comparePassword(password);
    if(!passwordMatch){
        return res.status(400).json({message:"Invalid credentials"});
    }

    const token = generateToken(user._id);
    res.status(200).json({
        token,
        user:{
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage
        }
    })
} catch (error) {
    console.error("Error in login", error);
    res.status(500).json({ message: 'Server error' });
}
});

export default router;