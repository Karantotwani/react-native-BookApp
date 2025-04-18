import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import protectRoute from '../middleware/auth.middleware.js';
import Book from '../models/Book.js'

const router = express.Router();

router.post("/", protectRoute ,async (req,res )=>{
    try {
        const {title, caption, rating, image} = req.body;

        if(!title || !caption || !rating || !image) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //upload image to cloudinary
        const imageResponse = await cloudinary.uploader.upload(image);
        const imageUrl = imageResponse.secure_url;

        //store book in database
        const book= new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id
        })

        await book.save();
        res.status(201).json({
            message: "Book created successfully",
            book: {
                _id: book._id,
                title: book.title,
                caption: book.caption,
                rating: book.rating,
                image: book.image,
                user: req.user._id
            }
        })

    } catch (error) {
        console.log("Error in creating book", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get("/", protectRoute, async (req, res)=>{
    try {

        //pagination 
        const page= req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page-1) * limit;

        const books = await Book.find()
        .sort({createdAt : -1})  //desc
        .skip(skip)
        .limit(limit)
        .populate("user","username profileImage");

        const totalBooks = await Book.countDocuments();

        res.status(200).json({
            books,
            currentPage : page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        });
        

    } catch (error) {
        console.log("Error in creating book", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete("/:id", protectRoute, async (req, res)=>{
    try {
        
        const book = await Book.findById(req.params.id);
        if(!book){
            res.status(404).json({message:"Book not found"});
        }
       
        //check if book belongs to the user
        if(book.user.toString() !== req.user._id.toString()){
            return res.status(401).json({message:"Not authorized"});
        }

        //delete image from cloudinary
        try {
            if(book.image && book.image.includes("cloudinary")){
                const publicId = book.image.split("/").pop().split(".")[0]; //extract public id from url
                await cloudinary.uploader.destroy(publicId); //delete image from cloudinary
            }
        } catch (error) {
            console.log("Error in deleting image from cloudinary", error.message);
            return res.status(500).json({message:"Server error"});

        }

        await book.deleteOne();
        res.status(200).json({message:"Book deleted successfully"});

    } catch (error) {
        console.log("Error in deleting book", error.message);
        res.status(500).json({message:"Server error"});
    }
})

router.get("/user",protectRoute, async (req, res)=>{
  
    try {
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.status(200).json(books);
        
    } catch (error) {
        console.log("Error in getting user books", error.message);
        res.status(500).json({message:"Server error"});
    }
})

export default router;