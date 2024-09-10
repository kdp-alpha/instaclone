import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Link } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";

const RightSidebar = () => {
    const { user } = useSelector(store => store.auth)
    return (
        <div className="w-[300px] my-10 pr-32">
            <div className="flex items-center gap-2">
                <Link to={`/profile/${user._id}`}>
                    <Avatar>
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </Link>

                <div>
                    <h1 className="font-bold text-md"><Link to={`/profile/${user._id}`}>{user?.username}</Link></h1>
                    <span className="text-gray-600">{user?.bio || 'Bio Here...'}</span>
                </div>

            </div>

            <SuggestedUser />

        </div>
    )
}

export default RightSidebar;