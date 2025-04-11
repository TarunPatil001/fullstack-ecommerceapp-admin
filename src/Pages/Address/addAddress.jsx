import { Button, CircularProgress, MenuItem, Select } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import { MyContext } from '../../App';
import { PhoneInput } from 'react-international-phone';
import toast from 'react-hot-toast';
import { editData, fetchDataFromApi, postData } from '../../utils/api';
import { FiEdit } from 'react-icons/fi';
import { RiResetLeftFill } from 'react-icons/ri';
import { IoIosSave } from 'react-icons/io';

const AddAddress = () => {

    const context = useContext(MyContext);
    const formRef = useRef("");
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [userId, setUserId] = useState("");
    const [status, setStatus] = useState("");  // Default empty string

    const [formFields, setFormFields] = useState({
        address_line1: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        mobile: '',
        status: '',
        userId: '',
        selected: false,
    });


    useEffect(() => {
        setFormFields((prevState) => ({
            ...prevState,
            userId: context?.userData?._id,
        }));
    }, [context?.userData]);


    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((formFields) => ({
            ...formFields,
            [name]: value,
        }));
    };


    const handleStatusChange = (event) => {
        const value = event.target.value;
        setStatus(value); // Update status in local state
        setFormFields((prevState) => ({
            ...prevState,
            status: value, // Update the form fields
        }));
    };
    


    useEffect(() => {
        const { userId, addressId } = context.isOpenFullScreenPanel || {};
        console.log("User ID in addAddress page:", userId);
        console.log("Address ID in addAddress page:", addressId);

        // Early return for new address (addressId is not present)
        if (!addressId) {
            context.setAddressIdNo(addressId);
            setFormFields({
                address_line1: "",
                city: "",
                state: "",
                pincode: "",
                country: "",
                mobile: "",
                status: "", // Default status for new address
                userId: userId || context?.userData?._id, // Ensure userId is available
            });
            setPhone(""); // Blank phone for new address
            setStatus(""); // Clear status for new address
            return; // Exit early if it's a new address
        }

        // If addressId is available (editing existing address)
        if (addressId && userId) {
            context.setAddressIdNo(addressId);
            const fetchAddressData = async () => {
                try {
                    const response = await fetchDataFromApi(
                        `/api/address/get-single-address?userId=${userId}&_id=${addressId}`,
                        { withCredentials: true }
                    );

                    // Check if the response was successful
                    if (response.success && response.data) {
                        const address = response.data;
                        console.log("Response Data:", address); // Log response to check status

                        // Populate the form fields with the fetched data
                        setFormFields({
                            address_line1: address.address_line1 || "",
                            city: address.city || "",
                            state: address.state || "",
                            pincode: address.pincode || "",
                            country: address.country || "",
                            status: address.status || "", // Default to empty if undefined
                            userId: address.userId || userId,
                        });

                        // Set phone state from the fetched data
                        const validPhone = address.mobile ? String(address.mobile) : "";
                        setPhone(validPhone);

                        // Set the status based on fetched address data
                        const statusValue = address.status === true || address.status === false ? address.status : "";
                        setStatus(statusValue); // Ensure the status is set correctly
                        console.log("Status set to:", statusValue);


                        console.log("Populated form fields:", address);
                    } else {
                        console.error("Address data not found or response unsuccessful.");
                    }
                } catch (error) {
                    console.error("Error fetching address:", error);
                }
            };

            fetchAddressData();
        }
    }, [context.isOpenFullScreenPanel, context?.userData?._id, context.setAddressIdNo, context]);


    // Handle submit for adding/updating the address
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formFields.address_line1) {
            context.openAlertBox("error", "Please enter address line 1");
            return;
        }
        if (!formFields.city) {
            context.openAlertBox("error", "Please enter city");
            return;
        }
        if (!formFields.state) {
            context.openAlertBox("error", "Please enter state");
            return;
        }
        if (!formFields.pincode) {
            context.openAlertBox("error", "Please enter pincode");
            return;
        }
        if (!formFields.country) {
            context.openAlertBox("error", "Please enter country");
            return;
        }
        if (!phone) {
            context.openAlertBox("error", "Please enter mobile");
            return;
        }

        setIsLoading(true);

        try {
            const result = await toast.promise(
                postData("/api/address/add-address", formFields, { withCredentials: true }),
                {
                    loading: "Submitting address... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            // Handle success logic here
                            fetchDataFromApi(`/api/address/get-address?userId=${context?.userData?._id}`).then((res) => {
                                context?.setAddress(res.data); // Store the fetched addresses in state
                            });

                            context.setIsOpenFullScreenPanel({ open: false });
                            return res.message || "Address added successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        // Check if err.response exists, else fallback to err.message
                        const errorMessage = err?.response?.data?.message || err.message || "Failed to add address. Please try again.";
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

    
    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const result = await toast.promise(
                editData("/api/address/update-address", {
                    ...formFields, 
                    userId: context?.userData?._id, 
                    addressId: context?.addressIdNo,
                }, { withCredentials: true }),
                {
                    loading: "Updating address... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            const updatedAddresses = context?.address?.map((address) =>
                                address._id === context.addressIdNo
                                    ? { ...address, ...formFields }
                                    : address
                            );
                            context?.setAddress(updatedAddresses); // Update the address state
                            context.setIsOpenFullScreenPanel({ open: false });
                            return res.message || "Address updated successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        const errorMessage = err?.response?.data?.message || err.message || "Failed to update address. Please try again.";
                        return errorMessage;
                    },
                }
            );
            console.log("Update Result:", result);
        } catch (err) {
            console.error("Error in handleUpdate:", err);
            toast.error(err?.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false); // Hide the loading spinner
        }
    };


    const handleDiscard = () => {
        // Reset the form state and other variables
        setFormFields({
            address_line1: '',
            city: '',
            state: '',
            pincode: '',
            country: '',
            mobile: '',
            status: '',
            userId: '',
        });
        setPhone(''); // Reset phone separately
        setStatus(''); // Reset status
        if (formRef.current) {
            formRef.current.reset(); // Reset the form elements
        }
        console.log("Form fields have been reset.");
    };



    return (
        <div>
            <section className='p-8'>
                <form
                    action="#"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className='form py-3'>
                    <h3 className='text-[24px] font-bold mb-2'>{context.addressIdNo !== undefined ? "Update Address" : "Add New Address"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 py-5  pt-1 mb-4 gap-4">
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Address Line 1</h3>
                            <input
                                type="text"
                                name='address_line1'
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm'
                                placeholder='Add address line 1'
                                value={formFields?.address_line1 || ''}
                                disabled={isLoading}
                                onChange={onChangeInput}
                            />
                        </div>
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>City</h3>
                            <input
                                type="text"
                                name='city'
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm'
                                placeholder='Add city'
                                value={formFields?.city || ''}
                                disabled={isLoading}
                                onChange={onChangeInput}
                            />
                        </div>
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>State</h3>
                            <input
                                type="text"
                                name='state'
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm'
                                placeholder='Add state'
                                value={formFields?.state || ''}
                                disabled={isLoading}
                                onChange={onChangeInput}
                            />
                        </div>
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Country</h3>
                            <input
                                type="text"
                                name='country'
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm'
                                placeholder='Add country'
                                value={formFields?.country || ''}
                                disabled={isLoading}
                                onChange={onChangeInput}
                            />
                        </div>
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Pincode</h3>
                            <input
                                type="text"
                                name='pincode'
                                maxLength={6}
                                pattern='\d*'
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm'
                                placeholder='Add pincode'
                                value={formFields?.pincode || ''}
                                disabled={isLoading}
                                onChange={onChangeInput}
                            />
                        </div>
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Mobile No.</h3>
                            <PhoneInput
                                defaultCountry="in"
                                preferredCountries={["in"]}
                                value={phone || ''}  // Set value to the phone state
                                onChange={(phone) => {
                                    setPhone(phone); // Update phone state when the value changes
                                    setFormFields((prevState) => ({ ...prevState, mobile: phone })); // Also update formFields with the new phone
                                }}
                                className={`!w-full h-[40px] flex items-center ${isLoading === true ? "cursor-not-allowed pointer-events-none" : ""}`}
                                disabled={isLoading}
                            />

                        </div>
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Status</h3>
                            <Select
                                value={status}  // Ensure the status is converted to string
                                onChange={handleStatusChange}
                                displayEmpty
                                inputProps={{ "aria-label": "Without label" }}
                                className="w-full h-[40px]"
                            >
                                <MenuItem value="" disabled>Select Status</MenuItem>
                                <MenuItem value="true">Active</MenuItem>
                                <MenuItem value="false">Inactive</MenuItem>
                            </Select>
                        </div>
                    </div>

                    <div className="!sticky !bottom-0 !left-0 z-10 mt-2.5 flex w-full items-center justify-end rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4">
                        <Button
                            type="reset"
                            onClick={handleDiscard}
                            className='!bg-red-500 !text-white !capitalize w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2 '
                        >
                            <RiResetLeftFill className='text-[18px] hidden sm:block' />Discard
                        </Button>
                        {
                            context.addressIdNo === undefined ? (
                                <Button type='submit' className={`${isLoading === true ? "custom-btn-disabled" : "custom-btn"}  !capitalize w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2`} disabled={isLoading}>
                                    {
                                        isLoading ? <CircularProgress color="inherit" /> : <><IoIosSave className='text-[20px] hidden sm:block' />Create</>
                                    }
                                </Button>
                            ) : (
                                <Button type='submit' className={`${isLoading === true ? "custom-btn-update-disabled" : "custom-btn-update"}  !capitalize w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2`} disabled={isLoading} onClick={handleUpdate}>
                                    {
                                        isLoading ? <CircularProgress color="inherit" /> : <><FiEdit className='text-[20px] hidden sm:block' />Update</>
                                    }
                                </Button>
                            )
                        }


                    </div>
                </form>
            </section>
        </div>
    );
};

export default AddAddress;
