const User = require("../models/userModel");
const Post = require("../models/postModel")
const Bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getDataUri = require("../utils/datauri");
const cloudinary = require('../utils/cloudinary');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, Please check",
                success: false
            })
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "This email already registered",
                success: false
            })
        }
        const hashedPassword = await Bcrypt.hash(password, 10);

        await User.create({
            username,
            email,
            password: hashedPassword
        })

        return res.status(201).json({
            message: "Account created successfully",
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, Please check",
                success: false
            })
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false
            })
        }

        const isPasswordMatch = await Bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false
            })
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' })

        //populate each post
        const populatedPost = await Promise.all(user.posts.map(async (postId) => {
            const post = await Post.findById(postId);
            if(post.author.equals(user._id)){
                return post;
            }else{
                return null;
            }
        }))

        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            followers: user.followers,
            following: user.following,
            bio: user.bio,
            posts: user.posts
        }

        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        })

    } catch (error) {
        console.log(error);
    }
}

const logout = async (req, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

const getProfile = async (req, res) => {
    const userId = req.params.id;
    let user = await User.findById(userId)
        .populate({
            path: 'posts',
            options: { sort: { createdAt: -1 } }
        })
        .populate({
            path: 'bookmarks',
            model: 'Post',
            select: 'caption image likes comments _id'
        });
    if(!user){
        return res.status(404).json({
            message: "User not found",
            success: false
        })
    }

    return res.status(200).json({
        user,
        success: true
    })
}

const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        console.log(profilePicture)
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri)
        }
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url

        await user.save();
        return res.status(200).json({
            message: "Profile Updated",
            success: true,
            user
        })

    } catch (error) {
        console.log(error)
    }
}

const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: "Currently do not have any users",
                success: false
            })
        }
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error)
    }
}

const followOrUnfollow = async (req, res) => {
    try {
        const followerId = req.id;
        const followingId = req.params.id;
        if (followerId === followingId) {
            return res.status(400).json({
                message: "Currently do not have any users",
                success: false
            })
        }
        const user = await User.findById(followerId);
        const targetUser = await User.findById(followingId);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        //logic to check follow or unfollow
        const isFollowing = user.following.includes(followingId);
        if (isFollowing) {
            //already followed then unfollow
            await Promise.all([
                User.updateOne({ _id: followerId }, { $pull: { following: followingId } }),
                User.updateOne({ _id: followingId }, { $pull: { following: followerId } })
            ])

            return res.status(200).json({ messgae: "Unfollow successfully", success: true })

        } else {
            //follow logic
            await Promise.all([
                User.updateOne({ _id: followerId }, { $push: { following: followingId } }),
                User.updateOne({ _id: followingId }, { $push: { following: followerId } }),
            ])
            return res.status(200).json({ messgae: "Followed successfully", success: true})
        }



    } catch (error) {
        console.log(error)
    }
}

module.exports = {register,login,logout,getProfile,editProfile,getSuggestedUsers,followOrUnfollow}