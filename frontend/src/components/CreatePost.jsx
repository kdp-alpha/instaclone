import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DialogHeader, Dialog, DialogContent } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {

    const imageRef = useRef();
    const [file, setFile] = useState("");
    const [caption, setCaption] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);
    const {user} = useSelector(store => store.auth);
    const {posts} = useSelector(store => store.post)
    const dispatch = useDispatch();

    const createPostHandler = async (e) => {
        console.log("Hello")
        const formData = new FormData();
        formData.append("caption", caption);
        if (imagePreview) formData.append("image", file)

        try {
            setLoading(true)
            const res = await axios.post("https://instaclone-k0oc.onrender.com/api/v1/post/addpost", formData, {
                headers: {
                    'Content-Type': "multipart/form-data"
                },
                withCredentials: true
            });
            if(res.data.success){
                dispatch(setPosts([res.data.post,...posts]))
                toast.success(res.data.message)
                setOpen(false)
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            setLoading(false)
        }
    }

    const fileChangeHandler = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const datUrl = await readFileAsDataURL(file);
            setImagePreview(datUrl)
        }
    }

    return (
        <div>
            <Dialog open={open}>
                <DialogContent onInteractOutside={() => setOpen(false)}>
                    <DialogHeader className="font-semibold text-center">Create New Header</DialogHeader>
                    <div className="flex gap-3 items-center">
                        <Avatar>
                            <AvatarImage src={user?.profilePicture} alt="img" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-semibold text-xs">{user?.username}</h1>
                            <span className="text-gray-600 text-xs">Bio Here..</span>
                        </div>
                    </div>
                    <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="focus-visible:ring-transparent border-none" placeholder="Write a caption..." />
                    {
                        imagePreview && (
                            <div className="flex items-center justify-center w-full">
                                <img src={imagePreview} alt="preview" className="object-cover h-[300px] w-full rounded-md " />
                            </div>
                        )
                    }
                    <input ref={imageRef} type="file" className="hidden" onChange={fileChangeHandler} />
                    <Button onClick={() => imageRef.current.click()} className="w-fit mx-auto bg-[#0095F6] hover:bg-[#0095F6]">Select from computer</Button>
                    {
                        imagePreview && (
                            loading ? (
                                <Button>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please Wait
                                </Button>
                            ) : (
                                <Button onClick={createPostHandler} type="submit" className="w-full">Post</Button>
                            )
                        )

                    }
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CreatePost;