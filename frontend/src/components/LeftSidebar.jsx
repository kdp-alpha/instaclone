import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Home, Search, TrendingUp, MessageCircle, Heart, PlusSquare, LogOut } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { useState } from "react";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { PopoverContent, PopoverTrigger, Popover } from "./ui/popover";



const LeftSidebar = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth)
    const { likeNotification } = useSelector(store => store.realTimeNotification)

    const logoutHandler = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/v1/user/logout", { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(""))
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
            // toast.error(error.response.data.message)
        }
    }

    const sidebarHandler = async (textType) => {
        if (textType === 'Logout') {
            logoutHandler()
        } else if (textType === 'Create') {
            setOpen(true)
        } else if (textType === 'Profile') {
            navigate(`/profile/${user?._id}`)
        } else if (textType === 'Home') {
            navigate("/")
        } else if (textType === 'Message') {
            navigate("/chat")
        }
    }

    const SidebarItems = [
        {
            icon: <Home />,
            text: "Home"
        },
        {
            icon: <Search />,
            text: "Search"
        },
        {
            icon: <TrendingUp />,
            text: "Explore"
        },
        {
            icon: <MessageCircle />,
            text: "Message"
        },
        {
            icon: <Heart />,
            text: "Notifications"
        },
        {
            icon: <PlusSquare />,
            text: "Create"
        },
        {
            icon: (<Avatar className="w-7 h-7">
                <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>),
            text: "Profile"
        },
        {
            icon: <LogOut />,
            text: "Logout"
        },


    ]

    return (
        <div className="fixed top-0 px-4 z-10 left-0 border-r border-gray-300 w-[16%] h-screen">
            <div className="flex flex-col">

                <div>
                    {
                        SidebarItems.map((items, index) => (
                            <div onClick={() => sidebarHandler(items.text)} key={index} className="flex items-center gap-4 hover:bg-gray-300 cursor-pointer rounded-lg p-4 my-3">
                                {items.icon}
                                <span className="text-2xl">{items.text}</span>
                                {
                                    items.text === "Notifications" && likeNotification.length > 0 && (
                                        <Popover>
                                            <PopoverTrigger asChild>

                                                <Button size='icon' className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute left-11">{likeNotification.length}</Button>

                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <div>
                                                    {
                                                        likeNotification.length === 0 ? (<p>No new Notification</p>) : (
                                                            likeNotification?.map((notification) => {
                                                                return (
                                                                    <div key={notification.userId} className="flex items-center gap-2">
                                                                        <Avatar>
                                                                            <AvatarImage src={notification.userDetails?.profilePicture} />
                                                                            <AvatarFallback>CN</AvatarFallback>
                                                                        </Avatar>
                                                                        <p className="text-sm"><span className="font-bold">{notification.userDetails?.username}</span>Liked your post</p>
                                                                    </div>
                                                                )
                                                            })
                                                        )
                                                    }
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )
                                }
                            </div>
                        ))
                    }
                </div>
            </div>
            <CreatePost open={open} setOpen={setOpen} />

        </div>
    )
}

export default LeftSidebar;