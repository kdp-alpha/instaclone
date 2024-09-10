import { useDispatch, useSelector } from "react-redux"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { useRef, useState } from "react"
import { Textarea } from "./ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import { Loader2 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { setAuthUser } from "@/redux/authSlice"

const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth)
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        profilePicture: user?.profilePicture,
        bio: user?.bio,
        gender: user?.gender
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fileChangeHandler = (e) => {
        const file = e?.target?.files?.[0];
            

            if (file) {
            setInput({
                ...input,
                profilePicture: file
            });

        }
    }

    const selectChangeHandler = (value) => {
        setInput({ ...input, gender: value })
    }

    const editProfileHandler = async () => {
        const formData = new FormData();
        formData.append("bio", input.bio);
        formData.append("gender", input.gender);
        if (input.profilePicture) {
            formData.append("profilePicture", input.profilePicture);
        }
        try {
            setLoading(true)
            const res = await axios.post("http://localhost:8000/api/v1/user/profile/edit", formData, {
                headers: {
                    'Content-Type': "multipart/form-data"
                },
                withCredentials: true
            });
            if(res?.data?.success){
                const updatedData = {
                    ...user,
                    bio:res.data.user?.bio,
                    profilePicture:res.data.user?.profilePicture,
                    gender:res.data.user?.gender
                }
                dispatch(setAuthUser(updatedData));
                navigate(`/profile/${user?._id}`)
                toast.success(res.data.message);
            }

        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className="flex max-w-2xl mx-auto pl-10">
            <section className="flex flex-col gap-6 w-full my-8">
                <h1 className="font-bold text-xl">Edit Profile</h1>
                <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${user._id}`}>
                            <Avatar>
                                <AvatarImage src={user?.profilePicture} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </Link>

                        <div>
                            <h1 className="font-bold text-md">{user?.username}</h1>
                            <span className="text-gray-600">{user?.bio || 'Bio Here...'}</span>
                        </div>
                    </div>
                    <input onChange={fileChangeHandler} ref={imageRef} type="file" className="hidden" />
                    <Button onClick={() => imageRef.current.click()} className="bg-[#0095F6] h-8 hover:bg-[#30719c]">Change Photo</Button>


                </div>
                <div>
                    <h1 className="font-bold text-xl mb-2">Bio</h1>
                    <Textarea value={input.bio} onChange={(e) => setInput({ ...input, bio: e.target.value })} name="bio" className="focus-visible:ring-transparent" />
                </div>
                <div>
                    <h1 className="font-bold text-xl mb-2v">Gender</h1>
                    <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end">
                    {
                        loading ? (
                            <Button className="w-fit bg-[#0095F6] h-8 hover:bg-[#30719c]">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please Wait
                            </Button>
                        ) : (
                            <Button onClick={editProfileHandler} className="w-fit bg-[#0095F6] h-8 hover:bg-[#30719c]">Submit</Button>
                        )
                    }

                </div>
            </section>
        </div>
    )
}

export default EditProfile