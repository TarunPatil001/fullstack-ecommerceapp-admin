import React, { useContext, useState } from 'react'
import { MyContext } from '../../App';
import { CircularProgress, Button, Radio } from '@mui/material';
import { FiEdit, FiUpload } from 'react-icons/fi';
import { useEffect } from 'react';
import { editData, fetchDataFromApi, postData, uploadImage } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Collapse } from 'react-collapse';
import { useRef } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { MdLockReset } from 'react-icons/md';



const Profile = () => {

    const context = useContext(MyContext);
    const navigate = useNavigate();
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const sellerNameRef = useRef(null);
    const oldPasswordRef = useRef(null);
    const newPasswordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const [preview, setPreview] = useState(null);  // Preview for image before uploading
    const [avatar, setAvatar] = useState(null);  // Actual avatar URL fetched from the server
    const [address, setAddress] = useState([]);
    const [selectedValue, setSelectedValue] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const [isLoading3, setIsLoading3] = useState(false);
    const [isChangePasswordFormShow, setIsChangePasswordFormShow] = useState(false);
    const [isShowPassword1, setIsShowPassword1] = useState(false);
    const [isShowPassword2, setIsShowPassword2] = useState(false);
    const [isShowPassword3, setIsShowPassword3] = useState(false);
    const [phone, setPhone] = useState('');
    const [userId, setUserId] = useState("");
    const [formFields, setFormFields] = useState({
        name: '',
        email: '',
        mobile: '',
        sellerName: '',
    })
    const [changePassword, setChangePassword] = useState({
        email: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    })



    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token !== undefined && token !== null && token !== '') {
            context?.setIsLogin(true);
        } else {
            navigate("/sign-in");
        }
    }, [context, navigate]);

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    useEffect(() => {
        // Directly set the avatar URL from context if available
        if (context?.userData?.avatar) {
            setAvatar(context?.userData?.avatar);
            setPreview(context?.userData?.avatar); // Set preview to the same value initially
        }
    }, [context?.userData?.avatar]); // Re-fetch when only the avatar in context changes


    useEffect(() => {
        // Only run the effect when user data is available
        if (context?.userData?._id) {

            // Fetch addresses when the component mounts or userData changes
            fetchDataFromApi(`/api/address/get-address?userId=${context?.userData?._id}`).then((res) => {
                setAddress(res.data); // Store the fetched addresses in state
                context?.setAddress(res.data); // Store the fetched addresses in context
            });

            // Set user data in state
            setUserId(context?.userData?._id);
            setFormFields({
                name: context?.userData?.name,
                email: context?.userData?.email,
                sellerName: context?.userData?.sellerName,
            });

            setChangePassword({
                email: context?.userData?.email,
            });

            const validPhone = context?.userData?.mobile ? String(context?.userData?.mobile) : "";
            setPhone(validPhone);
            // setPhone(`${context?.userData?.mobile}`);  // Set initial phone value from user data
        }
    }, [context?.userData]);  // Only re-run when context?.userData changes



    useEffect(() => {
        const safeAddress = address || [];  // Ensure address is an array (in case it's null or undefined)

        // Find the address that is selected
        const selectedAddress = safeAddress.find(addr => addr.selected === true);

        if (selectedAddress) {
            // Set the selected address ID
            setSelectedValue(selectedAddress._id);
        } else {
            // No address is selected, set a default value or handle as needed
            setSelectedValue(null);  // Example: Set selectedValue to null if no address is selected
        }
    }, [address]); // This effect runs whenever the address list changes



    const onChangeFile = async (e, apiEndPoint) => {
        try {
            const result = await toast.promise(
                (async () => {
                    const file = e.target.files[0];
                    if (!file) {
                        throw new Error("No file selected.");
                    }

                    const validFormats = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
                    if (!validFormats.includes(file.type)) {
                        throw new Error("Please select a valid image (JPEG/JPG/PNG/WEBP).");
                    }

                    const formData = new FormData();
                    formData.append("avatar", file);

                    setUploading(true);

                    const previewUrl = URL.createObjectURL(file);
                    setPreview(previewUrl); // Temporary preview

                    // Call the API and validate the response
                    const response = await uploadImage(apiEndPoint, formData);
                    console.log("API Response Debug:", response); // Debug API response

                    if (response?.avatar) {
                        setAvatar(response.avatar); // Update state with the final avatar URL
                        setPreview(response.avatar); // Update preview with the uploaded avatar
                        return "Avatar updated successfully!";
                    } else if (response?.message) {
                        console.error("Avatar removal issue:", response.message);
                        throw new Error(response.message); // Display specific error message
                    } else {
                        console.error("Unexpected response format:", response);
                        throw new Error("Failed to update avatar.");
                    }
                })(),
                {
                    loading: "Uploading image... Please wait.",
                    success: (message) => message,
                    error: (err) => {
                        console.error("Toast error handler debug:", err);
                        const errorMessage = err?.response?.data?.message || err.message || "An error occurred while uploading your image.";
                        return errorMessage;
                    },
                }
            );

            console.log("Result:", result); // Log success message
        } catch (error) {
            console.error("Error while uploading file:", error);
            // context.openAlertBox("error", error?.message || "An unexpected error occurred.");
        } finally {
            setUploading(false); // Stop spinner
        }
    };



    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((formFields) => ({
            ...formFields,
            [name]: value,
        }));
        setChangePassword((formFields) => ({
            ...formFields,
            [name]: value,
        }));

    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formFields.name === "") {
            context.openAlertBox("error", "Please enter your full name.");
            return;
        }

        if (formFields.email === "") {
            context.openAlertBox("error", "Please enter your email ID.");
            return;
        }

        if (formFields.mobile === "") {
            context.openAlertBox("error", "Please enter your mobile number.");
            return;
        }

        if (formFields.sellerName === "") {
            context.openAlertBox("error", "Please enter seller name.");
            return;
        }

        // Start a toast.promise for handling loading, success, and error states
        try {
            const result = await toast.promise(
                editData(`/api/user/${userId}`, formFields, { withCredentials: true }), {
                loading: "Updating profile... Please wait.",
                success: (res) => {
                    if (res?.success) {
                        navigate("/"); // Redirect to the home page
                        return res.message || "Profile updated successfully!";
                    } else {
                        throw new Error(res?.message || "An unexpected error occurred.");
                    }
                },
                error: (err) => {
                    // Check if err.response exists, else fallback to err.message
                    const errorMessage = err?.response?.data?.message || err.message || "Failed to update profile. Please try again.";
                    return errorMessage;
                },
            }
            );
            console.log("Result:", result);
        } catch (err) {
            console.error("Error:", err);
            toast.error(err?.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleSubmitChangePassword = async (e) => {
        e.preventDefault();

        // Array to store missing fields
        const missingFields = [];

        // Validate form fields
        if (context?.userData?.signUpWithGoogle === false && !changePassword.oldPassword) missingFields.push("Old Password");
        if (!changePassword.newPassword) missingFields.push("New Password");
        if (!changePassword.confirmPassword) missingFields.push("Confirm Password");
        if (changePassword.confirmPassword !== changePassword.newPassword) missingFields.push("New & Confirm Passwords correctly. They don't match.");

        // If any required fields are missing, show a single alert and exit
        if (missingFields.length > 0) {
            const missingFieldsList = missingFields.join(", ").replace(/, ([^,]*)$/, " and $1");
            context.openAlertBox("error", `Please enter your ${missingFieldsList}`);
            if (!changePassword.oldPassword) oldPasswordRef.current.focus();
            else if (!changePassword.newPassword) newPasswordRef.current.focus();
            else if (!changePassword.confirmPassword) confirmPasswordRef.current.focus();
            return; // Stop further execution
        }

        // Start loading and disable the fields
        setIsLoading2(true);

        try {

            // Login API call wrapped with toast.promise
            const result = await toast.promise(
                postData("/api/user/reset-password", changePassword, { withCredentials: true }),
                {
                    loading: "Updating password... Please wait.",
                    success: (res) => {
                        if (res && res.error === false) {
                            // Clear form fields and store tokens
                            setChangePassword({ oldPassword: "", newPassword: "", confirmPassword: "" });
                            // navigate("/"); // Navigate to home page
                            return res?.message;
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
            return err.message || "An error occurred during updating password.";
        } finally {
            setIsLoading2(false);
        }
    };


    const handleDeleteAddress = async (e, addressId) => {
        e.preventDefault();

        // Start loading and disable the fields
        setIsLoading2(true);

        try {
            // Delete address API call wrapped with toast.promise
            const result = await toast.promise(
                postData("/api/address/delete-address", {
                    userId: context?.userData?._id, // Replace with the actual userId
                    addressId: addressId, // Address ID to delete
                }, { withCredentials: true }),
                {
                    loading: "Deleting address... Please wait.",
                    success: (res) => {
                        if (res && res.error === false) {
                            // Handle success, e.g., remove the address from the state
                            setAddress(Array.isArray(address) ? address.filter(addr => addr._id !== addressId) : []);
                            return res?.message;
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
            return err.message || "An error occurred while deleting the address.";
        } finally {
            setIsLoading2(false);
        }
    };


    const handleEditAddress = (userId, addressId) => {
        console.log("User ID in Profile:", userId);

        context.setIsOpenFullScreenPanel({
            open: true,
            model: "Address Details",
            userId: userId,  // Check if userId is valid here
            addressId: addressId,
        });
    };


    const handleSelectAddress = async (event) => {
        const addressId = event.target.value;
        const selected = event.target.checked;

        try {
            const result = await toast.promise(
                editData("/api/address/select-address", {
                    addressId: addressId,
                    userId: context?.userData?._id,
                    selected: selected,
                }, { withCredentials: true }),
                {
                    loading: "Updating address selection... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            const updatedAddresses = context?.address?.map((address) =>
                                address._id === addressId
                                    ? { ...address, selected: selected }
                                    : address
                            );

                            context?.setAddress(updatedAddresses);
                            setSelectedValue(addressId); // Set selected value to the newly selected address
                            return res.message || "Address selection updated successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        const errorMessage = err?.response?.data?.message || err.message || "Failed to update address selection.";
                        return errorMessage;
                    },
                }
            );

            console.log("Select Address Result:", result);
        } catch (err) {
            console.error("Error in handleSelectAddress:", err);
            toast.error(err?.message || "An unexpected error occurred.");
        }
    };


    return (
        <>
            <div className="card my-4 mt-14 bg-white border rounded-md p-5">

                <div className="grid grid-cols-1 sm:grid-cols-8 mb-3 gap-4">
                    <div className='hidden sm:block sm:col-span-1'></div>
                    <div className='col-span-1 sm:col-span-7 flex flex-col sm:flex-row items-start sm:items-center justify-between'>
                        <h2 className="font-bold text-lg text-gray-700 text-center sm:text-left">User Profile</h2>
                        <Button
                            className='!mt-2 sm:!mt-0 !w-full sm:!w-auto !capitalize !px-4 !bg-slate-50 !shadow !text-black !flex !items-center !justify-center !gap-2'
                            onClick={() => setIsChangePasswordFormShow(!isChangePasswordFormShow)}
                        >
                            <MdLockReset className='!text-lg hidden sm:!block' /> Change password?
                        </Button>
                    </div>
                </div>

                <hr className="!my-3" />

                <div className="grid grid-cols-1 sm:grid-cols-8 gap-4">
                    <div className='!flex !items-start !justify-center col-span-2 sm:!col-span-2 lg:!col-span-1'>
                        <div className='!w-[110px] !h-[110px] !min-w-[110px] !min-h-[110px] !border !p-1 !rounded-full !overflow-hidden !shadow-xl !flex !items-center !justify-center'>
                            <div className="!w-full !h-full !overflow-hidden group !rounded-full !relative !shadow !flex !items-center !justify-center !border !bg-gray-300">
                                {uploading ? (
                                    <CircularProgress color="inherit" />
                                ) : (
                                    <img
                                        src={preview || avatar || `https://static-00.iconduck.com/assets.00/profile-default-icon-1024x1023-4u5mrj2v.png`}
                                        alt="profile" className="!w-full !h-full !object-cover"
                                    />
                                )}
                                <div className="overlay !w-full !h-full !absolute !top-0 !left-0 !bg-black !bg-opacity-50 !flex !items-center !justify-center !opacity-0 group-hover:!opacity-100 !transition-all">
                                    <FiUpload className="!text-white !text-lg group-hover:!scale-125 !transition-all" />
                                    <input
                                        type="file" className="!absolute !top-0 !left-0 !w-full !h-full !opacity-0 !cursor-pointer"
                                        accept="image/*" onChange={(e) => onChangeFile(e, "/api/user/user-avatar")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='!col-span-1 sm:!col-span-6 lg:!col-span-7'>
                        <form onSubmit={handleSubmit} className="!space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 !gap-4">
                                <div>
                                    <label className='!text-sm !font-medium !text-gray-700'>Full Name</label>
                                    <input type="text" className="!w-full !h-[40px] !border !border-gray-300 !rounded-md !p-3 !text-md !outline-none focus:!border-gray-600" placeholder='Full Name' ref={nameRef} name="name" value={formFields?.name} disabled={isLoading} onChange={onChangeInput} />
                                </div>
                                <div>
                                    <label className='!text-sm !font-medium !text-gray-700'>Email</label>
                                    <input type="email" className="!w-full !h-[40px] !border !border-gray-300 !rounded-md !p-3 !text-md !outline-none focus:!border-gray-600" placeholder='Email' ref={emailRef} name="email" value={formFields?.email} disabled onChange={onChangeInput} />
                                </div>
                                <div>
                                    <label className='!text-sm !font-medium !text-gray-700'>Mobile No.</label>
                                    <PhoneInput defaultCountry="in" name='mobile' value={phone} onChange={(phone) => setPhone(phone)} className='!w-full' disabled={isLoading} />
                                </div>
                                <div>
                                    <label className='!text-sm !font-medium !text-gray-700'>Seller Name</label>
                                    <input type="text" className="!w-full !h-[40px] !border !border-gray-300 !rounded-md !p-3 !text-md !outline-none focus:!border-gray-600" placeholder='Seller Name' ref={sellerNameRef} name="sellerName" value={formFields?.sellerName} disabled={isLoading} onChange={onChangeInput} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 !gap-4">
                                <Button type='submit' className={`!bg-blue-600 !text-white !p-2 !rounded-md !w-full hover:!bg-blue-700 !capitalize ${isLoading ? "!opacity-50 !cursor-not-allowed" : ""}`} disabled={isLoading}>
                                    {isLoading ? <CircularProgress color="inherit" /> : "Save"}
                                </Button>
                                <Button type='reset' className="!bg-gray-200 !text-black !p-2 !rounded-md !w-full hover:!bg-gray-300 !capitalize" disabled={isLoading}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


            <div className="card my-4 bg-white border rounded-md p-5">
                {/* Header */}
                <div className="grid grid-cols-1 sm:grid-cols-8 gap-4 mb-3">
                    <div className="hidden sm:block sm:col-span-1"></div>
                    <div className="col-span-1 sm:col-span-7 flex items-center justify-between">
                        <h2 className="font-bold text-[18px] text-gray-700">Address Details</h2>
                    </div>
                </div>

                <hr className="my-3" />

                {/* Address Section */}
                <div className="grid grid-cols-1 sm:grid-cols-8 gap-4 mb-3">
                    <div className="hidden sm:block sm:col-span-1"></div>
                    <div className="col-span-1 sm:col-span-7">
                        <h3 className="text-[14px] font-medium mb-1 text-gray-700">Address</h3>
                        <div
                            className={`w-full h-[40px] bg-blue-50 flex items-center justify-center border-2 border-dashed rounded-md p-3 text-md cursor-pointer transition ${isLoading ? "cursor-not-allowed opacity-50" : "hover:border-blue-300 hover:bg-blue-100"
                                }`}
                            onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: "Address Details" })}
                            disabled={isLoading}
                        >
                            <span className="text-gray-700 text-center">
                                {isLoading3 ? <CircularProgress color="inherit" /> : "Add Address"}
                            </span>
                        </div>

                        {/* Address List */}
                        <div className="flex flex-col gap-4 mt-4">
                            {Array.isArray(address) && address.length > 0 ? (
                                address.map((address, index) => {
                                    const fullAddress = `${address?.address_line1}, ${address?.city}, ${address?.state}, ${address?.pincode}, ${address?.country}, ${address?.mobile}`;

                                    return (
                                        <label
                                            key={index}
                                            className="border-2 border-dashed addressBox w-full flex flex-col  sm:flex-row items-start sm:items-center justify-between rounded-md cursor-pointer p-3 gap-2 sm:gap-4"
                                        >
                                            <div className="flex items-center w-full">
                                                <Radio
                                                    name="address"
                                                    checked={selectedValue === address?._id}
                                                    value={address?._id}
                                                    onChange={handleSelectAddress}
                                                />
                                                <span className="ml-2">{fullAddress}</span>
                                            </div>
                                            <div className="flex items-start gap-2 pl-12">
                                                <Button
                                                    className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full flex items-center justify-center"
                                                    onClick={() => handleEditAddress(address?.userId, address?._id)}
                                                >
                                                    <FiEdit className="text-lg" />
                                                </Button>
                                                <Button
                                                    className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full flex items-center justify-center"
                                                    onClick={(e) => handleDeleteAddress(e, address?._id)}
                                                >
                                                    <RiDeleteBin6Line className="text-lg" />
                                                </Button>
                                            </div>
                                        </label>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500">No addresses found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            <Collapse isOpened={isChangePasswordFormShow}>
            {/* <Collapse isOpened={true}> */}
                <div className="card bg-white p-5 shadow-md rounded-md" >
                    <div className="grid grid-cols-8 mb-3 gap-4">
                        <div className='hidden sm:block sm:col-span-1'></div>
                        <div className='col col-span-7'>
                            <h2 className="pb-0 font-bold text-[18px] text-gray-700">Edit Password</h2>
                        </div>
                    </div>
                    <hr />
                    <br />
                    <div className="grid grid-cols-1 sm:grid-cols-8 mb-3 gap-4">
                        <div className="hidden sm:block sm:col-span-1"></div>
                        <div className="col-span-1 sm:col-span-7">
                            <form action="" onSubmit={handleSubmitChangePassword}>

                                <div className="grid grid-cols-1 sm:grid-cols-2 mb-3 gap-4">
                                    {
                                        context?.userData?.signUpWithGoogle === false &&

                                        <div className='col relative'>
                                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Old Password</h3>
                                            <input type={isLoading2 ? 'password' : (isShowPassword1 ? 'text' : 'password')} className={`w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-md ${isLoading === true ? "cursor-not-allowed" : ""}`} placeholder='Old Password' ref={oldPasswordRef} name="oldPassword" value={changePassword?.oldPassword} disabled={isLoading2} onChange={onChangeInput} />
                                            <Button className="!absolute bottom-[3px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-[rgba(0,0,0,0.7)]" onClick={() => setIsShowPassword1(!isShowPassword1)} disabled={isLoading} >
                                                {
                                                    isShowPassword1 === false ?
                                                        <FaRegEyeSlash className="text-[20px]" />
                                                        :
                                                        <FaRegEye className="text-[20px]" />
                                                }
                                            </Button>
                                        </div>
                                    }

                                    <div className="col relative">
                                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>New Password</h3>
                                        <input type={isLoading2 ? 'password' : (isShowPassword2 ? 'text' : 'password')} className={`w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-md ${isLoading === true ? "cursor-not-allowed" : ""}`} placeholder='New Password' ref={newPasswordRef} name="newPassword" value={changePassword?.newPassword} disabled={isLoading2} onChange={onChangeInput} />
                                        <Button className="!absolute bottom-[3px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-[rgba(0,0,0,0.7)]" onClick={() => setIsShowPassword2(!isShowPassword2)} disabled={isLoading} >
                                            {
                                                isShowPassword2 === false ?
                                                    <FaRegEyeSlash className="text-[20px]" />
                                                    :
                                                    <FaRegEye className="text-[20px]" />
                                            }
                                        </Button>
                                    </div>

                                    <div className="col relative">
                                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Confirm Password</h3>
                                        <input type={isLoading2 ? 'password' : (isShowPassword3 ? 'text' : 'password')} className={`w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-md ${isLoading === true ? "cursor-not-allowed" : ""}`} placeholder='New Password' ref={confirmPasswordRef} name="confirmPassword" value={changePassword?.confirmPassword} disabled={isLoading2} onChange={onChangeInput} />
                                        <Button className="!absolute bottom-[3px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-[rgba(0,0,0,0.7)]" onClick={() => setIsShowPassword3(!isShowPassword3)} disabled={isLoading} >
                                            {
                                                isShowPassword3 === false ?
                                                    <FaRegEyeSlash className="text-[20px]" />
                                                    :
                                                    <FaRegEye className="text-[20px]" />
                                            }
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-5 gap-4">
                                    <div className="col">
                                        <Button type='submit' className={`${isLoading2 === true ? "custom-btn-disabled" : "custom-btn"} !capitalize w-full`} disabled={isLoading2}>
                                            {
                                                isLoading2 ? <CircularProgress color="inherit" /> : "Change Password"
                                            }
                                        </Button>
                                    </div>
                                    <div className="col">
                                        <Button type='reset' className="custom-btn w-full !capitalize" disabled={isLoading2} onClick={() => setIsChangePasswordFormShow(!isChangePasswordFormShow)}>Cancel</Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Collapse >

        </>
    )
}

export default Profile
