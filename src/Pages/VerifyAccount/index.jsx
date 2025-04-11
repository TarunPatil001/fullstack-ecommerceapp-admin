import { Button, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { HiLogin } from "react-icons/hi";
import { PiUserCirclePlusLight } from "react-icons/pi";
import OtpBox from '../../Components/OtpBox';
import { useContext } from 'react';
import { MyContext } from '../../App';
import toast from 'react-hot-toast';
import { postData } from '../../utils/api';


const VerifyAccount = () => {

    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(0); // Initial timer state
    const [isOtpResent, setIsOtpResent] = useState(false); // Track if OTP has been resent
    const email = localStorage.getItem("User email") || "your-email@example.com"; // Get email from localStorage or use default
    const [name, domain] = email.split("@"); // Split email into name and domain
    const maskedName =
        name.length > 3
            ? name.slice(0, 2) + "*****" + name.slice(-2) // Mask part of the name
            : name; // If name is short, show it as is
    const maskedEmail = `${maskedName}@${domain}`; // Combine masked name with domain

    const handleOtpChange = (value) => {
        setOtp(value)
    };

    const actionType = localStorage.getItem("actionType");

    useEffect(() => {
        // Get the OTP expiration time from localStorage
        const otpExpiresTime = localStorage.getItem("OTP_EXPIRES");

        if (otpExpiresTime) {
            const currentTime = Date.now();
            const remainingTime = Math.max(0, Math.floor((otpExpiresTime - currentTime) / 1000)); // Calculate the remaining time in seconds
            setTimer(remainingTime);
        }

        // Handle timer countdown
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => {
                    const newTimer = prevTimer - 1;
                    if (newTimer <= 0) {
                        // If the timer reaches 0, remove OTP expiration from localStorage
                        localStorage.removeItem("OTP_EXPIRES");
                    }
                    return Math.max(newTimer, 0); // Ensure timer doesn't go below 0
                });
            }, 1000);
        }

        // Cleanup on component unmount
        return () => clearInterval(interval);
    }, [timer]); // Re-run effect whenever timer changes


    const sendOtp = async (e) => {
        e.preventDefault();

        console.log("Resending OTP to: ", localStorage.getItem("User email"));

        if (actionType !== "forgot-password") {
            toast.promise(
                postData("/api/user/resend-otp", {
                    email: localStorage.getItem("User email"),
                }),
                {
                    loading: "Resending OTP...",
                    success: (res) => {
                        console.log("OTP resend response: ", res); // Log response data
                        if (res?.success) {
                            // Set new expiration time (e.g., 5 minutes from now)
                            const newExpirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
                            localStorage.setItem("OTP_EXPIRES", newExpirationTime);

                            // Reset timer
                            setTimer(300); // 5 minutes in seconds

                            setIsOtpResent(true); // Update OTP resend state
                            return res?.message;
                        } else {
                            console.error("Failed to resend OTP:", res?.message); // Log failure
                            throw new Error(res?.message || "Failed to resend OTP.");
                        }
                    },
                    error: (err) => {
                        console.error("Error resending OTP:", err); // Log error
                        return err.message || "An error occurred while resending OTP.";
                    },
                }
            );

        } else {
            toast.promise(
                postData("/api/user/forgot-password", {
                    email: localStorage.getItem("User email"),
                }),
                {
                    loading: "Resending OTP...",
                    success: (res) => {
                        console.log("OTP resend response: ", res); // Log response data
                        if (res?.success) {
                            // Set new expiration time (e.g., 5 minutes from now)
                            const newExpirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
                            localStorage.setItem("OTP_EXPIRES", newExpirationTime);

                            // Reset timer
                            setTimer(300); // 5 minutes in seconds

                            setIsOtpResent(true); // Update OTP resend state
                            return res?.message;
                        } else {
                            console.error("Failed to resend OTP:", res?.message); // Log failure
                            throw new Error(res?.message || "Failed to resend OTP.");
                        }
                    },
                    error: (err) => {
                        console.error("Error resending OTP:", err); // Log error
                        return err.message || "An error occurred while resending OTP.";
                    },
                }
            );
        }

    };


    const verifyOTP = async (e) => {
        e.preventDefault();

        if (actionType !== "forgot-password") {
            // Use toast.promise to handle loading, success, and error states
            toast.promise(
                postData("/api/user/verifyEmail", {
                    email: localStorage.getItem("User email"),
                    otp: otp,
                }),
                {
                    loading: "Verifying OTP... Please wait.",
                    success: (res) => {
                        if (res?.error === false) {
                            // Navigate to login if verification is successful
                            localStorage.removeItem("User email");
                            localStorage.removeItem("OTP_EXPIRES");
                            navigate("/sign-in"); // Use navigate for redirection
                            return res?.message;  // Success message shown in toast
                        } else {
                            // Throw an error to be handled by the error section
                            throw new Error(res?.message || "Verification failed. Please try again.");
                        }
                    },
                    error: (err) => {
                        return err.message || "An unexpected error occurred. Please try again."; // This will display the toast error message
                    },
                }
            ).then((res) => {
                // Add any additional actions after the promise resolves (if needed)
                console.log("OTP Verification Completed:", res);

            }).catch((err) => {
                // Add any additional actions for handling errors here
                console.error("OTP Verification Error:", err);
            });
        } else {
            // Use toast.promise to handle loading, success, and error states
            toast.promise(
                postData("/api/user/verify-forgot-password-otp", {
                    email: localStorage.getItem("User email"),
                    otp: otp,
                }),
                {
                    loading: "Verifying OTP... Please wait.",
                    success: (res) => {
                        if (res?.error === false) {
                            // Navigate to login if verification is successful
                            localStorage.removeItem("OTP_EXPIRES");
                            navigate("/change-password"); // Use navigate for redirection
                            return res?.message;  // Success message shown in toast
                        } else {
                            // Throw an error to be handled by the error section
                            throw new Error(res?.message || "Verification failed. Please try again.");
                        }
                    },
                    error: (err) => {
                        return err.message || "An unexpected error occurred. Please try again."; // This will display the toast error message
                    },
                }
            ).then((res) => {
                // Add any additional actions after the promise resolves (if needed)
                console.log("OTP Verification Completed:", res);
            }).catch((err) => {
                // Add any additional actions for handling errors here
                console.error("OTP Verification Error:", err);
            });
        }
    };

    return (

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

            {/* <div className='loginBox card w-full sm:w-[600px] h-auto mx-auto pt-0 lg:pt-20 relative !z-50 pb-20'> */}
            <div className='loginBox card w-full sm:w-[600px] h-auto mx-auto pt-20 relative !z-50 pb-20'>
                <div className='text-center'>
                    <img src="http://localhost:5173/securityLogo.png" alt="" className='m-auto' />
                </div>
                <h1 className='mt-10 text-[24px] sm:text-[34px] md:text-[44px] font-bold leading-[34px] sm:leading-[44px] md:leading-[54px] text-center'>OTP Verification <br />
                    Please verify your email
                </h1>
                <br />
                <p className='text-center flex flex-col sm:flex-row items-center justify-center'>OTP has been sent to&nbsp;<span className='font-semibold text-[var(--text-active)]'>{maskedEmail}</span></p>
                <br />
                <form action="" onSubmit={verifyOTP}>
                    <div className="py-4">
                        <OtpBox length={6} onChange={handleOtpChange} />
                    </div>
                    <div className="flex justify-center w-[300px] m-auto mt-4">
                        <Button type="submit" className={`${isLoading === true ? "custom-btn-disabled" : "custom-btn"} w-full !capitalize flex gap-1`} disabled={isLoading}>
                            {isLoading ? <CircularProgress color="inherit" /> : "Verify OTP"}
                        </Button>
                    </div>
                </form>
                <br />
                {/* <p className="text-center pt-2 text-[14px]">Didn&apos;t get the code? <Link to=""><span className="font-semibold underline underline-offset-2 cursor-pointer link" onClick={sendOtp}>Resend code</span></Link></p> */}
                <p className="text-center pt-2 text-[14px]">
                    Didn&apos;t get the code?{" "}
                    <span
                        className={`font-semibold cursor-pointer ${timer > 0 ? 'text-gray-500' : ''}`}
                        onClick={sendOtp}
                        disabled={timer > 0} // Disable resend button if OTP is being resent
                    >
                        <span>
                            {timer > 0
                                ? <>
                                    <span className="link underline underline-offset-4 transition-all">Resend code</span> in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                                </>
                                : <span className="link underline underline-offset-4 transition-all">Resend code</span>
                            }
                        </span>
                    </span>
                </p>


            </div>

        </section>
    )
}

export default VerifyAccount
