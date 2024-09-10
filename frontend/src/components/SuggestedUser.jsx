import { AvatarFallback,Avatar,AvatarImage } from "./ui/avatar";

import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const SuggestedUser = () => {
    const { suggestedUsers } = useSelector(store => store.auth);
    console.log(suggestedUsers)
    return (
        <div className="my-10">
            <div className="flex items-center justify-between text-sm">
                <h1 className="font-semibold text-gray-600">Suggested for you</h1>
                <span className="font-medium cursor-pointer">See All</span>
            </div>
            {
                suggestedUsers.map((user) => {
                    return (
                        <div key={user._id} className="flex items-center justify-between my-5">
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
                            <span className="text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]">Follow</span>
                        </div>

                    )
                })
            }
        </div>
    )
}

export default SuggestedUser;