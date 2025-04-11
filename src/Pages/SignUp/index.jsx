import { Button, Checkbox } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { HiLogin } from "react-icons/hi";
import { PiUserCirclePlusLight } from "react-icons/pi";
import LoadingButton from '@mui/lab/LoadingButton';
import { FcGoogle } from "react-icons/fc";
import { FaRegEyeSlash } from "react-icons/fa";
import FormControlLabel from '@mui/material/FormControlLabel';
import { FaRegEye } from "react-icons/fa";
import { useContext } from 'react';
import { MyContext } from '../../App';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../utils/api.js';
import toast from 'react-hot-toast';

import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseApp } from '../../firebase.jsx';
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const SignUp = () => {

    const context = useContext(MyContext);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [loadingFb, setLoadingFb] = useState(false);
    const [isPasswordShow, setIsPasswordShow] = useState(false);

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const [formFields, setFormFields] = useState({
        name: "",
        email: "",
        password: "",
    });

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((formFields) => ({
            ...formFields,
            [name]: value,
        }));
    };

    function handleClickGoogle() {
        setLoadingGoogle(true);
    }

    // function handleClickFb() {
    //     setLoadingFb(true);
    // }

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Array to store missing fields
        let missingFields = [];

        // Validate form fields
        if (!formFields.name) missingFields.push("Full Name");
        if (!formFields.email) missingFields.push("Email Id");
        if (!formFields.password) missingFields.push("Password");

        // If any required fields are missing, show a single alert and exit
        if (missingFields.length > 0) {
            const missingFieldsList = missingFields.join(", ").replace(/, ([^,]*)$/, " and $1");
            context.openAlertBox("error", `Please enter your ${missingFieldsList}`);
            if (!formFields.name) nameRef.current.focus();
            else if (!formFields.email) emailRef.current.focus();
            else if (!formFields.password) passwordRef.current.focus();
            return; // Stop further execution
        }

        // Check if an email already exists in localStorage
        const storedEmail = localStorage.getItem("User email");

        if (storedEmail) {
            if (storedEmail !== formFields.email) {
                // Notify the user about the conflict
                // Optionally, provide an option to clear the stored email
                const confirmSwitch = window.confirm("Another admin account already exists on this profile. Do you want to switch to a new admin account? This will clear the current admin data for this site.");

                if (confirmSwitch) {
                    localStorage.clear();
                    // Proceed with registration or login for the new user
                } else {
                    return; // Stop further execution if the user doesn't confirm the switch
                }
            }
        } else {
            // Continue with the registration or login process
        }

        // Start loading and disable the fields
        setIsLoading(true);

        try {
            // Wrap the registration API call inside a toast.promise
            const result = await toast.promise(
                postData("/api/user/register", formFields),
                {
                    loading: "Registering... Please wait.",
                    success: (res) => {
                        if (res && res.error === false) {
                            localStorage.setItem("User email", formFields.email);
                            setFormFields({ name: "", email: "", password: "" });
                            // Set OTP expiration time and trigger timer
                            const currentTime = Date.now();
                            const otpExpirationTime = currentTime + 5 * 60 * 1000; // OTP expires in 5 minutes
                            localStorage.setItem("OTP_EXPIRES", otpExpirationTime); // Store the OTP expiration time
                            navigate("/verify-account"); // Navigate to verification page
                            return res?.message;

                        } else {
                            throw new Error(res?.message || "Oops! Server is slow. Try again!");
                        }
                    },
                    error: (err) => {
                        return err.message || "An unexpected error occurred. Please try again.";
                    }
                }
            ).then((res) => {
                // Add any actions that you want after the promise resolves successfully here
                console.log("Registration successful:", res);
                // You could, for example, show an additional confirmation message, perform analytics tracking, etc.
            }).catch((err) => {
                // Handle any errors here if they weren't caught earlier in the toast.promise
                console.error("Error in registration:", err);
            });
        } catch (err) {
            if (!err.message.includes("Registration successful!")) {
                context.openAlertBox("error", err.message || "An error occurred during registration.");
            }
        } finally {
            setIsLoading(false);
        }
    };


    const authWithGoogle = () => {
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)

                const fields = {
                    name: user.providerData[0].displayName,
                    email: user.providerData[0].email,
                    password: null,
                    avatar: user.providerData[0].photoURL,
                    mobile: user.providerData[0].phoneNumber,
                    role: "ADMIN",
                }

                postData(`/api/user/authWithGoogle`, fields).then((res) => {
                    if (res?.error !== true) {
                        setIsLoading(false);
                        context.openAlertBox("success", res?.message);
                        localStorage.setItem("User email", fields.email);
                        localStorage.setItem("accessToken", res?.data?.accessToken);
                        localStorage.setItem("refreshToken", res?.data?.refreshToken);
                        context.setIsLogin(true);
                        navigate('/');
                    } else {
                        context.openAlertBox("error", res?.message);
                        setIsLoading(false);
                    }
                })

                console.log(user);
                // ...
            }).catch(() => {
                // // Handle Errors here.
                // const errorCode = error.code;
                // const errorMessage = error.message;
                // // The email of the user's account used.
                // const email = error.customData.email;
                // // The AuthCredential type that was used.
                // const credential = GoogleAuthProvider.credentialFromError(error);
                // // ...
            });
    }



    return (

        <section className='bg-white w-full h-full'>
            <img src="/pattern.webp" alt="bg_img" className='w-full h-full fixed top-0 left-0 opacity-5' />
            <header className='w-full py-2 px-10 fixed top-0 left-0 bg-blue-200 flex items-center justify-center sm:justify-between !z-[99]'>
                <Link to="/">
                    <img src="https://isomorphic-furyroad.vercel.app/_next/static/media/logo.a795e14a.svg" alt="" className='w-[150px] sm:w-[200px]' />
                </Link>
                <div className='hidden sm:flex items-center gap-2'>
                    <NavLink to="/sign-in" exact={true} activeClassName="isActive">
                        <Button className='!rounded-full !text-[rgba(0,0,0,0.8)] shadow flex items-center gap-1 !capitalize !px-4 !py-1'><HiLogin className='rotate-180 text-[16px]' />Sign In</Button>
                    </NavLink>
                    <NavLink to="/sign-up" exact={true} activeClassName="isActive">
                        <Button className='!rounded-full !text-white flex items-center gap-1 !capitalize !px-4 !py-1'><PiUserCirclePlusLight className='text-[16px]' />Sign Up</Button>
                    </NavLink>
                </div>
            </header>

            <div className='loginBox card w-full md:w-[600px] h-auto mx-auto pt-0 lg:pt-20 relative !z-50 pb-20'>
                <div className='text-center'>
                    <img src="https://isomorphic-furyroad.vercel.app/_next/static/media/logo-short.18ca02a8.svg" alt="" className='m-auto' />
                </div>
                <h1 className='mt-10 text-[18px] sm:text-[25px] md:text-[35px] font-bold leading-[24px] sm:leading-[35px] text-center'>Join us today! Get special <br />
                    benefits and stay up-to-date.
                </h1>

                <div className='flex items-center justify-center w-full mt-10 gap-6'>
                    <LoadingButton
                        size="small"
                        onClick={() => { handleClickGoogle(); authWithGoogle(); }}
                        startIcon={<FcGoogle />}
                        loading={loadingGoogle}
                        loadingPosition="start"
                        variant="outlined"
                        disabled={isLoading}
                        className="!normal-case w-[220px] h-[44px] !rounded-md !text-[rgba(0,0,0,0.8)] custom-credential-btn !text-[14px] sm:!text-[16px] hover:!border-[var(--bg-primary)]"
                    >
                        Sign Up with Google
                    </LoadingButton>
                </div>

                <div className="flex items-center justify-center w-full mt-10 gap-3 text-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-[14px] sm:text-[16px] text-[rgba(0,0,0,0.7)] font-medium whitespace-nowrap">
                        Or, Sign Up with your email
                    </span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>


                <form action='' className='w-full px-8 mt-3' onSubmit={handleSubmit}>
                    <div className='form-group mb-4 w-full'>
                        <h4 className='mt-5 text-[rgba(0,0,0,0.7)] font-medium text-[14px] sm:text-[16px]'>Fullname</h4>
                        <input type="name" placeholder='Enter your name' className='mt-2 w-full h-[50px] px-4 text-[14px] sm:text-[16px] font-medium border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:!border-[rgba(0,0,0,0.7)] focus:outline-none' name="name" ref={nameRef} value={formFields.name} disabled={isLoading} onChange={onChangeInput} />
                    </div>
                    <div className='form-group mb-4 w-full'>
                        <h4 className='mt-5 text-[rgba(0,0,0,0.7)] font-medium text-[14px] sm:text-[16px]'>Email</h4>
                        <input type="email" placeholder='Enter your email' className='mt-2 w-full h-[50px] px-4 text-[14px] sm:text-[16px] font-medium border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:!border-[rgba(0,0,0,0.7)] focus:outline-none' name="email" ref={emailRef} value={formFields.email} disabled={isLoading} onChange={onChangeInput} />
                    </div>
                    <div className='form-group mb-4 w-full'>
                        <h4 className='mt-5 text-[rgba(0,0,0,0.7)] font-medium text-[14px] sm:text-[16px]'>Password</h4>
                        <div className="relative w-full">
                            <input type={isLoading ? 'password' : (isPasswordShow ? 'text' : 'password')} placeholder='Enter your password' className='mt-2 w-full h-[50px] px-4 text-[14px] sm:text-[16px] font-medium border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:!border-[rgba(0,0,0,0.7)] focus:outline-none' name="password" ref={passwordRef} value={formFields.password} disabled={isLoading} onChange={onChangeInput} />
                            <Button className='!absolute !top-[15px] !right-[10px] z-50 !rounded-full !w-[35px] !h-[35px] !min-w-[35px] !text-[rgba(0,0,0,0.8)] !text-[18px]' disabled={isLoading} onClick={() => setIsPasswordShow(!isPasswordShow)}>
                                {
                                    isPasswordShow === true ? (<FaRegEye />) : (<FaRegEyeSlash />)
                                }
                            </Button>
                        </div>
                    </div>
                    <div className='form-group mb-4 w-full flex items-start justify-between'>
                        <FormControlLabel
                            control={<Checkbox {...label} />}
                            label={
                                <>
                                    <span className='!text-[rgba(0,0,0,0.7)] text-[12px] sm:text-[14px]'>
                                        By signing up you have agreed to our{' '}
                                        <Link href="/terms" className='font-semibold'>Terms</Link> &{' '}
                                        <Link href="/privacy-policy" className='font-semibold'>Privacy Policy</Link>
                                    </span>
                                </>}
                            disabled={isLoading}
                        />

                    </div>
                    <Button
                        type="submit"
                        className={`${isLoading === true ? "custom-btn-disabled" : "custom-btn"} w-full !capitalize !text-[14px] sm:!text-[16px] !font-semibold !mt-4`}
                        disabled={isLoading} // Disable submit button when loading
                    >
                        {
                            isLoading ? <CircularProgress color="inherit" /> : "Create Account"
                        }
                    </Button>
                    <Link to="/sign-in"><p className='flex items-center justify-center gap-2 text-[rgba(0,0,0,0.6)] text-[14px] sm:text-[16px] mt-5'>Already have an account?<span className='text-black font-semibold'>Sign In</span></p></Link>
                </form>

            </div>

        </section>
    )
}

export default SignUp
