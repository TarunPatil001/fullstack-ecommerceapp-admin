import { useState, useEffect, useRef } from 'react';
import { Button } from '@mui/material'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { HiLogin } from "react-icons/hi";
import { PiUserCirclePlusLight } from "react-icons/pi";
import { useContext } from 'react';
import { MyContext } from '../../App';
import CircularProgress from '@mui/material/CircularProgress';
import toast from 'react-hot-toast';
import { postData } from '../../utils/api';


const ForgotPassword = () => {

    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0); // Initial timer state
    const [isOtpResent, setIsOtpResent] = useState(false); // Track if OTP has been resent
    const [formFields, setFormFields] = useState({
        email: '',
    });

    const emailRef = useRef(null);


    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((formFields) => ({
            ...formFields,
            [name]: value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Array to store missing fields
        let missingFields = [];

        // Validate form fields
        if (!formFields.email) missingFields.push("Email Id");

        // If any required fields are missing, show a single alert and exit
        if (missingFields.length > 0) {
            const missingFieldsList = missingFields.join(", ").replace(/, ([^,]*)$/, " and $1");
            context.openAlertBox("error", `Please enter your ${missingFieldsList}`);
            if (!formFields.email) emailRef.current.focus();
            return; // Stop further execution
        }


        setIsLoading(true);

        try {
            // Validate form fields
            if (!formFields.email) {
                context.openAlertBox("error", "Email Id is required.");
                return;
            }

            // Login API call wrapped with toast.promise
            const result = await toast.promise(
                postData("/api/user/forgot-password", formFields, { withCredentials: true }),
                {
                    loading: "OTP is sending... Please wait.",
                    success: (res) => {
                        if (res && res.error === false) {
                            localStorage.setItem("User email", formFields.email);
                            localStorage.setItem("actionType", "forgot-password");
                            // Set OTP expiration time and trigger timer
                            const currentTime = Date.now();
                            const otpExpirationTime = currentTime + 5 * 60 * 1000; // OTP expires in 5 minutes
                            localStorage.setItem("OTP_EXPIRES", otpExpirationTime); // Store the OTP expiration time

                            // Clear form fields and store tokens
                            setFormFields({ email: "", password: "" });
                            navigate("/verify-account"); // Navigate to the verify page


                        } else {
                            throw new Error(res?.message || "Oops! Server is slow. Try again!");
                        }
                    },
                    error: (err) => {
                        // Ensure err.response exists and check the message structure
                        const errorMessage = err?.response?.data?.message || err.message || "An unexpected error occurred. Please try again.";
                        return errorMessage;
                    },
                }
            ).then((res) => {
                console.log(res);
                // Add any additional success actions here
            }).catch((err) => {
                console.error(err);
            });
        } catch (err) {
            // Final fallback for unexpected errors
            return err.message || "An error occurred during reset password";
        } finally {
            setIsLoading(false);
        }
    }


    return (

        // <section className='bg-white w-full h-[100vh]'>
        //     <header className='w-full py-2 px-10 fixed top-5 left-0 flex items-center justify-between !z-50'>
        //         <Link to="/">
        //             <img src="https://isomorphic-furyroad.vercel.app/_next/static/media/logo.a795e14a.svg" alt="" className='w-[200px]' />
        //         </Link>
        //         <div className='flex items-center gap-2'>
        //             <NavLink to="/sign-in" exact={true} activeClassName="isActive">
        //                 <Button className='!rounded-full !text-[rgba(0,0,0,0.8)] flex items-center gap-1 !capitalize !px-4 !py-1'><HiLogin className='rotate-180 text-[16px]' />Login</Button>
        //             </NavLink>
        //             <NavLink to="/sign-up" exact={true} activeClassName="isActive">
        //                 <Button className='!rounded-full !text-[rgba(0,0,0,0.8)] flex items-center gap-1 !capitalize !px-4 !py-1 '><PiUserCirclePlusLight className='text-[16px]' />Sign Up</Button>
        //             </NavLink>
        //         </div>
        //     </header>
        //     <img src="/pattern.webp" alt="bg_img" className='w-full fixed top-0 left-0 opacity-5 z-0' />

        //     <div className='loginBox card w-[600px] h-auto mx-auto pt-20 relative !z-50 pb-20'>
        //         <div className='text-center'>
        //             <img src="https://isomorphic-furyroad.vercel.app/_next/static/media/logo-short.18ca02a8.svg" alt="" className='m-auto' />
        //         </div>
        //         <h1 className='mt-10 text-[44px] font-bold leading-[54px] text-center'>Having trouble to sign in?
        //             <br />
        //             Reset your password.
        //         </h1>

        //         <form action='#' className='w-full px-8 mt-3' onSubmit={handleSubmit}>
        //             <div className='form-group mb-4 w-full'>
        //                 <h4 className='mt-5 text-[rgba(0,0,0,0.7)] font-medium text-[16px]'>Email</h4>
        //                 <input type="email" placeholder='Enter your email' className='mt-2 w-full h-[50px] px-4 text-[16px] font-medium border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:!border-[rgba(0,0,0,0.7)] focus:outline-none' name="email" ref={emailRef} value={formFields.email} disabled={isLoading} onChange={onChangeInput} />
        //             </div>
        //             <Button
        //                 type="submit"
        //                 className={`${isLoading === true ? "custom-btn-disabled" : "custom-btn"} w-full !capitalize !text-[15px]`}
        //                 disabled={isLoading} // Disable submit button when loading
        //             >
        //                 {
        //                     isLoading ? <CircularProgress color="inherit" /> : "Change Password"
        //                 }
        //             </Button>
        //             <Link to="/sign-in"><p className='flex items-center justify-center gap-2 text-[rgba(0,0,0,0.6)] text-[16px] mt-5'>Don’t want to reset?<span className='text-black font-semibold'>Sign In</span></p></Link>
        //         </form>

        //     </div>

        // </section>
        <section className='bg-white w-full min-h-screen'>
            <img src="/pattern.webp" alt="bg_img" className='w-full h-full fixed top-0 left-0 opacity-5' />
            <header className='w-full py-2 px-10 fixed top-0 left-0 !bg-blue-200 flex items-center justify-center sm:justify-between !z-[99]'>
                <Link to="/">
                    <img src="https://isomorphic-furyroad.vercel.app/_next/static/media/logo.a795e14a.svg" alt="" className='w-[150px] sm:w-[200px]' />
                </Link>
                <div className='hidden sm:flex items-center gap-2'>
                    <NavLink to="/sign-in" exact={true} activeClassName="isActive">
                        <Button className='!rounded-full !text-[rgba(0,0,0,0.8)] shadow flex items-center gap-1 !capitalize !px-4 !py-1'><HiLogin className='rotate-180 text-[16px]' />Sign In</Button>
                    </NavLink>
                    <NavLink to="/sign-up" exact={true} activeClassName="isActive">
                        <Button className='!rounded-full !text-[rgba(0,0,0,0.8)] shadow flex items-center gap-1 !capitalize !px-4 !py-1 '><PiUserCirclePlusLight className='text-[16px]' />Sign Up</Button>
                    </NavLink>
                </div>
            </header>

            <div className='loginBox card w-full sm:w-[600px] h-auto mx-auto pt-0 lg:pt-20 relative !z-50 pb-20'>
                <div className='text-center'>
                    <img src="https://isomorphic-furyroad.vercel.app/_next/static/media/logo-short.18ca02a8.svg" alt="" className='m-auto' />
                </div>

                <h1 className='mt-10 text-[20px] sm:text-[25px] md:text-[35px] font-bold leading-[24px] sm:leading-[35px] text-center'>
                    Having trouble to sign in? <br /> Reset your password.
                </h1>

                <form action='#' className='w-full px-8 mt-6' onSubmit={handleSubmit}>
                    <div className='form-group mb-4 w-full'>
                        <h4 className='mt-5 text-[rgba(0,0,0,0.7)] font-medium text-[14px] sm:text-[16px]'>Email</h4>
                        <input
                            type="email"
                            placeholder='Enter your email'
                            className='mt-2 w-full h-[50px] px-4 text-[14px] sm:text-[16px] font-medium border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:!border-[rgba(0,0,0,0.7)] focus:outline-none'
                            name="email"
                            ref={emailRef}
                            value={formFields.email}
                            disabled={isLoading}
                            onChange={onChangeInput}
                        />
                    </div>

                    <Button
                        type="submit"
                        className={`${isLoading ? "custom-btn-disabled" : "custom-btn"} w-full !capitalize !text-[14px] sm:!text-[16px] !font-semibold !mt-2`}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress color="inherit" /> : "Change Password"}
                    </Button>

                    <Link to="/sign-in">
                        <p className='flex items-center justify-center gap-2 text-[rgba(0,0,0,0.6)] text-[14px] sm:text-[16px] mt-5'>
                            Don’t want to reset? <span className='text-black font-semibold'>Sign In</span>
                        </p>
                    </Link>
                </form>
            </div>

        </section>

    )
}

export default ForgotPassword
