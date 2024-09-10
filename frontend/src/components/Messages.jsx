import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { useSelector } from "react-redux"
import useGetAllMessage from "@/hooks/useGetAllMessage"
import { useEffect } from "react"
import useGetRTM from "@/hooks/useGetRTM"

const Messages = ({ message }) => {
    useGetRTM()
    useGetAllMessage(); // This hook will fetch messages when the component mounts

    const { messages } = useSelector(store => store.chat)
    const {user} = useSelector(store => store.auth)
    return (
        <div className="overflow-y-auto flex-1 p-4">
            <div className="flex justify-center">
                <div className="flex flex-col items-center justify-center">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={message?.profilePicture} alt='profile' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span>{message?.username}</span>
                    <Link to={`/profile/${message._id}`}><Button className="h-8 my-2" variant="secondary">View Profile</Button></Link>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {messages?.map((x) => {
                    return(
                        <div key={x._id} className={`flex ${x.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-2 rounded-lg  max-w-xs break-words ${x.senderId === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                                {x.message}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Messages