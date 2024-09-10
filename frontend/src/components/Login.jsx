import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

const Login = () => {
    const [input, setInput] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {user} = useSelector(store => store.auth)

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }

    const loginHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8000/api/v1/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user))
                navigate("/")
                toast.success(res.data.message)
                setInput({
                    email: '',
                    password: ''
                })
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if(user){
            navigate("/");
        }
    },[])

    return (
        <div className='w-screen h-screen flex justify-center items-center'>
            <form onSubmit={loginHandler} className='shadow-lg flex flex-col gap-5 p-8'>
                <div>
                    <h1 className='font-bold text-center text-xl'>Logo</h1>
                    <p className='text-sm text-center my-2'>Login to see photos & videos from your friends</p>
                </div>
                <div>
                    <Label className="font-medium">Email</Label>
                    <Input type="text" name="email" value={input.email} onChange={changeEventHandler} className="focus-visible:ring-transparent my-2" />
                </div>
                <div>
                    <Label className="font-medium">Password</Label>
                    <Input type="password" name="password" value={input.password} onChange={changeEventHandler} className="focus-visible:ring-transparent my-2" />
                </div>
                {
                    loading ? (<Button><Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Please wait
                    </Button>) : (
                        <Button type="submit">Login</Button>
                    )
                }

                <span className='text-center'>Don't have an account? <Link to="/signup" className='text-blue-600'>Signup</Link></span>
            </form>
        </div>
    )
}

export default Login;