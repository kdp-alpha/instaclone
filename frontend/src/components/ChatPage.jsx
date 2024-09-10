import { useDispatch, useSelector } from "react-redux"
import { AvatarImage, Avatar, AvatarFallback } from "./ui/avatar"
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircle, MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import store from "@/redux/store";
import { useEffect, useState } from "react";
import { setMessages } from "@/redux/chatSlice";
import axios from "axios";

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("") 
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth)
    const {onlineUsers,messages} = useSelector(store => store.chat);

    const dispatch = useDispatch(); 

    const sendMessagehandler = async (receiverId) => { 
        try {
            console.log(textMessage)
            const res = await axios.post(`https://instaclone-k0oc.onrender.com/api/v1/message/send/${receiverId}`,{textMessage},{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            })
            if(res.data.success){
                const updatedMessages = Array.isArray(messages) ? [...messages, res.data.newMessage] : [res.data.newMessage];
                dispatch(setMessages(updatedMessages));
                setTextMessage("")
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null)) // Fixed: Corrected typo in dispatch
        }
    },[])

    return (
        <div className="flex ml-[16%] h-screen">
            <section className="w-full md:w-1/4 my-8">
                <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
                <hr className="mb-4 border-gray-300" />
                <div className="overflow-y-auto h-[80vh]">
                    {
                        suggestedUsers.map((x) => {
                            const isOnline = onlineUsers.includes(x?._id)
                            return (
                                <div key={x._id} onClick={() => dispatch(setSelectedUser(x))} className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer">
                                    <Avatar className="w-14 h-14">
                                        <AvatarImage src={x?.profilePicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{x?.username}</span>
                                        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>{isOnline ? "Online" : "Offline"}</span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

            </section>
            {
                selectedUser ? (
                    <section className="flex-1 border-l border-l-gray-300 flex flex-col">
                        <div className="flex gap-3 items-center px-3 py-2 border-b border-gray-300 top-0 sticky z-10">
                            <Avatar>
                                <AvatarImage src={selectedUser?.profilePicture}>
                                </AvatarImage>
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span>{selectedUser?.username}</span>
                            </div>
                        </div>
                        <Messages message={selectedUser}/>
                        <div className="flex item-center p-4 border-t border-t-gray-300">
                            <Input 
                                value={textMessage} 
                                onChange={(e) => setTextMessage(e.target.value)} 
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        sendMessagehandler(selectedUser?._id);
                                    }
                                }}
                                type="text" 
                                className="flex-1 mr-2 focus-visible:ring-transparent" 
                                placeholder="Messages..." 
                            />
                            <Button onClick={() => sendMessagehandler(selectedUser?._id)}>Send</Button>
                        </div>
                    </section>

                ) : (
                    <div className="flex flex-col items-center justify-center mx-auto">
                        <MessageCircleCode className="w-32 h-32 my-4" />
                        <h1 className="font-medium text-xl">Your messages</h1>
                        <span>Send a message to start a chat.</span>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage