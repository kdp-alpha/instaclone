const User = require("../models/userModel");
const Post = require("../models/postModel");
const sharp = require("sharp")
const cloudinary = require('../utils/cloudinary');
const Comment = require("../models/commentModel");
const {io, getreceiverSocketId} = require('../socket/socket')

const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(400).json({
                message: "Image Required",
                success: false
            })
        }

        const optimizedImage = await sharp(image.buffer).resize({ width: 800, height: 800, fit: 'inside' }).toFormat('jpeg', { quality: 80 }).toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImage.toString('base64')}`
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        })

        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: "New post added",
            post,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

const getallPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({ path: 'author', select: 'username profilePicture' }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        })

        return res.status(200).json({
            posts,
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}

const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            popuate: {
                path: 'author',
                select: 'username profilePicture'
            }
        })

        return res.status(200).json({
            posts,
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}

const likePost = async (req, res) => {
    try {
        const likeUserId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found", success: false })
        }

        await post.updateOne({ $addToSet: { likes: likeUserId } })

        await post.save();

        //implment realtime socket 
        const user = await User.findById(likeUserId).select('username profilePicture');
        const postOwnerId =  post.author.toString();
        if(postOwnerId !== likeUserId){
            const notification = {
                type:'like',
                userId: likeUserId,
                userDetails:user,
                postId,
                message:"Your post was liked"
            }

            const postOwnerSocketId = getreceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification)
        }
        


        return res.status(200).json({ message: "Post Liked", success: true })
    } catch (error) {
        console.log(error)
    }
}

const dislikePost = async (req, res) => {
    try {
        const likeUserId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found", success: false })
        }

        await post.updateOne({ $pull: { likes: likeUserId } })

        await post.save();

        //implment realtime socket 
        const user = await User.findById(likeUserId).select('username profilePicture');
        const postOwnerId =  post.author.toString();
        if(postOwnerId !== likeUserId){
            const notification = {
                type:'dislike',
                userId: likeUserId,
                userDetails:user,
                postId,
                message:"Your post was dislike"
            }

            const postOwnerSocketId = getreceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification)
        }


        return res.status(200).json({ message: "Post disliked", success: true })
    } catch (error) {
        console.log(error)
    }
}

const addComment = async (req,res) => {
    try {
        const postId = req.params.id;
        const commentUserId = req.id;

        const {text} = req.body;
        const post = await Post.findById(postId);
        if(!text){
            return res.status(400).json({message:"text is required", success:false});
        }
        const comment = await Comment.create({
            text,
            author:commentUserId,
            post:postId
        })

        await comment.populate({
             path:"author",
            select:"username profilePicture"
        })

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message:"Comment Added",
            comment,
            success:true
        })

    } catch (error) {
        console.log(error)
    }
}

const getAllComments = async (req,res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');

        if(!comments){
            return res.status(404).json({message:"No comments found for this post", success:false});
        }

        return res.status(200).json({success:true,comments})

    } catch (error) {
        console.log(error)
    }
}

const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:"Post not found", success:false});
        }

        if(post.author.toString() !== authorId){
            return res.status(403).json({message:"Unauthorized", success:false});
        }

        await Post.findByIdAndDelete(postId);

        //removed the postId from user
        let user = await User.findById(authorId);

        user.posts = user.posts.filter(id => id.toString() !== postId);

        await user.save();

        //delete associated all the  coment with that post
        await Comment.deleteMany({post:postId});

        return res.status(200).json({message:"Post deleted", success:true});

    } catch (error) {
        console.log(error)
    }
}

const bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:"Post not found", success:false});
        }
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmarked
            await user.updateOne({$pull:{bookmarks:post._id}})
            await user.save();
            return res.status(200).json({type:"unsaved", message:"Post removed from bookmark", success:true})
        }else{
            await user.updateOne({$addToSet:{bookmarks:post._id}})
            await user.save();
            return res.status(200).json({type:"saved", message:"Post bookmarked", success:true})
        }

    } catch (error) {
        console.log(error)
    }
}

module.exports = { addNewPost, getallPost, getUserPost, likePost,dislikePost,addComment,bookmarkPost,deletePost,getAllComments }