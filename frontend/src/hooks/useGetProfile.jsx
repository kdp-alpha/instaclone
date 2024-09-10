import { setProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";


const useGetProfile = (userId) => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchProfile= async () => {
            try {
                const res = await axios.get(`https://instaclone-k0oc.onrender.com/api/v1/user/${userId}/profile`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setProfile(res.data.user));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchProfile();
    }, [userId]);
};
export default useGetProfile;