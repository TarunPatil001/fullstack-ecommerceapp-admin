import { Button, CircularProgress, MenuItem, Select } from '@mui/material';
import  { useContext, useEffect, useRef, useState } from 'react'
import { FiEdit } from 'react-icons/fi';
import { IoIosSave } from 'react-icons/io';
import { RiResetLeftFill } from 'react-icons/ri';
import UploadBox from '../../Components/UploadBox';
import { IoClose } from 'react-icons/io5';
import { MyContext } from '../../App';
import toast from 'react-hot-toast';
import { editData, fetchDataFromApi, postData } from '../../utils/api';

const AddBannersV1 = () => {

    const context = useContext(MyContext);
    const [isLoading, setIsLoading] = useState(false);
    // const [isLoading2, setIsLoading2] = useState(false);
    // const [isLoading3, setIsLoading3] = useState(false);
    // const [previews, setPreviews] = useState([]);

    // Consolidated states for banner files
    const [bannerFiles, setBannerFiles] = useState({
        uploadedFiles: [],
        previews: [],
        removedFiles: []
    });

    const [bannerIdNo, setBannerIdNo] = useState(undefined);

    const nameInputRef = useRef(null);
    const priceInputRef = useRef(null);
    const categorySelectRef = useRef(null);
    const categorySelectRef2 = useRef(null);
    const categorySelectRef3 = useRef(null);

    const [productCategory, setProductCategory] = useState('');
    const [productCategory2, setProductCategory2] = useState('');
    const [productCategory3, setProductCategory3] = useState('');
    const [alignInfo, setAlignInfo] = useState('');
    // const [isLoadingReset1, setIsLoadingReset1] = useState(false);
    // const [isLoadingSave1, setIsLoadingSave1] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]); // ✅ Ensures default is an empty array
    const [multiple, setMultiple] = useState(false);  // Default: Single upload


    const [formFields, setFormFields] = useState({
        bannerTitle: '',
        images: [],
        parentCategoryId: '',
        subCategoryId: '',
        thirdSubCategoryId: '',
        price: '',
        alignInfo: '',
    });


    useEffect(() => {
        const { bannerId } = context.isOpenFullScreenPanel || {};
        console.log("AddNewBannerPage - Banner ID :", bannerId);

        // Early return for new address (addressId is not present)
        if (!bannerId) {
            console.log("No bannerId found, resetting state.");
            // context.setBannerIdNo(undefined);
            setBannerIdNo(undefined);
            // setPreviews([]);
            setBannerFiles({
                uploadedFiles: [],
                previews: [],
                removedFiles: []
            });

            setFormFields({
                bannerTitle: '',
                images: [],
                parentCategoryId: '',
                subCategoryId: '',
                thirdSubCategoryId: '',
                price: '',
                alignInfo: '',
            });
            setProductCategory('');
            setProductCategory2('');
            setProductCategory3('');
            setFilteredCategories([]);
            setFilteredSubCategories([]);
            setAlignInfo('');
            return;
        }

        // If addressId is available (editing existing address)
        if (bannerId) {
            // context.setCategoryIdNo(categoryId);
            // setCategoryIdNo(categoryId);
            setBannerIdNo(bannerId);

            const fetchCategoryData = async () => {
                try {

                    const response = await fetchDataFromApi(`/api/bannersV1/${bannerId}`);
                    console.log("API Response:", response);

                    // Check if the response was successful
                    if (response.success && response.data) {
                        const banner = response.data;
                        console.log("Banner Data:", banner);

                        // setPreviews(banner.images || []);
                        setAlignInfo(banner.alignInfo || []);

                        setBannerFiles({
                            uploadedFiles: banner.images || [],
                            previews: banner.images || [],
                            removedFiles: []
                        });

                        setFormFields((prev) => ({
                            ...prev,
                            bannerTitle: banner.bannerTitle || "",
                            images: banner.images || [],
                            parentCategoryId: banner.parentCategoryId || "",
                            subCategoryId: banner.subCategoryId || "",
                            thirdSubCategoryId: banner.thirdSubCategoryId || "",
                            price: banner.price || "",
                            alignInfo: banner.alignInfo || "",
                        }));

                        // Automatically populate categories
                        setProductCategory(banner?.parentCategoryId || "");
                        setProductCategory2(banner?.subCategoryId || "");
                        setProductCategory3(banner?.thirdSubCategoryId || "");

                        // Set filtered categories based on existing selections
                        const selectedCategory = context?.catData?.find(cat => cat._id === banner?.parentCategoryId);
                        setFilteredCategories(selectedCategory?.children || []);

                        const selectedSubCategory = selectedCategory?.children?.find(cat => cat._id === banner?.subCategoryId);
                        setFilteredSubCategories(selectedSubCategory?.children || []);
                    } else {
                        console.error("Banner data not found or response unsuccessful.");
                    }
                } catch (error) {
                    console.error("Error fetching banner:", error);
                }
            };

            fetchCategoryData();
        }

    }, [context.isOpenFullScreenPanel?.bannerId]); // Depend only on `bannerId`


    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((formFields) => ({
            ...formFields,
            [name]: value,
        }));
    };


    // Effect to reset removed files when panel closes
    useEffect(() => {
        if (context?.isOpenFullScreenPanel?.open === false) {
            setBannerFiles((prev) => ({
                ...prev,
                removedFiles: []
            }));
        }
    }, [context?.isOpenFullScreenPanel?.open]);


    // Cleanup image previews when the component unmounts or images change
    useEffect(() => {
        return () => {
            bannerFiles.previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [bannerFiles.previews]);


    const selectedCatFun = (categoryId, categoryName) => {
        setFormFields({
            ...formFields,
            categoryName: categoryName,
            parentCategoryId: categoryId,
        });
        setProductCategory(categoryId);
        setProductCategory2(""); // Reset second dropdown when first changes
        setProductCategory3(""); // Reset third dropdown when first changes

        // Find selected category and set its children for Level 2
        const selectedCategory = context?.catData?.find(cat => cat._id === categoryId);
        setFilteredCategories(selectedCategory?.children || []);
        setFilteredSubCategories([]); // Clear Level 3 when Level 1 changes
    };


    const selectedCatFun2 = (categoryId2) => {
        setFormFields((prev) => ({
            ...prev,
            subCategoryId: categoryId2,  // ✅ Make sure subCategoryId is set
        }));
        setProductCategory2(categoryId2);
        setProductCategory3(""); // Reset third dropdown when second changes

        const selectedSubCategory = filteredCategories.find(cat => cat._id === categoryId2);
        setFilteredSubCategories(selectedSubCategory?.children || []);
    };


    const selectedCatFun3 = (categoryId3) => {
        setFormFields((prev) => ({
            ...prev,
            thirdSubCategoryId: categoryId3,  // ✅ Ensure thirdSubCategoryId is set
        }));
        setProductCategory3(categoryId3);
    };


    const handleChangeProductCategory = (event) => {
        const selectedCategoryId = event.target.value;
        setProductCategory(selectedCategoryId);
        setProductCategory2(""); // Reset second dropdown when first changes
        setProductCategory3(""); // Reset third dropdown when first changes

        // Find selected category and set its children for Level 2
        const selectedCategory = context?.catData?.find(
            (cat) => cat._id === selectedCategoryId
        );
        setFilteredCategories(selectedCategory?.children || []);
        setFilteredSubCategories([]); // Reset Level 3 when Level 1 changes
    };


    const handleChangeProductCategory2 = (event) => {
        const selectedCategoryId2 = event.target.value;
        setProductCategory2(selectedCategoryId2);
        setProductCategory3(""); // Reset third dropdown when second changes

        // Find selected category and set its children for Level 3
        const selectedCategory2 = filteredCategories.find(
            (cat) => cat._id === selectedCategoryId2
        );
        setFilteredSubCategories(selectedCategory2?.children || []);
    };


    const handleChangeProductCategory3 = (event) => {
        const selectedCategoryId3 = event.target.value;
        if (filteredSubCategories.some(cat => cat._id === selectedCategoryId3)) {
            setProductCategory3(selectedCategoryId3);
        } else {
            setProductCategory3(""); // Reset if the value is invalid
        }
    };


    useEffect(() => {
        setFormFields((prev) => ({
            ...prev,
            parentCategoryId: productCategory,
            subCategoryId: productCategory2,
            thirdSubCategoryId: productCategory3,
        }));
    }, [productCategory, productCategory2, productCategory3]);


    // const setPreviewFun = (previewArr) => {
    //     // Update the previews state to reflect the new image array
    //     setPreviews(previewArr);

    //     // Update formFields.images state properly without direct mutation
    //     setFormFields((prevFormFields) => ({
    //         ...prevFormFields,
    //         images: previewArr, // Assign the previewArr to images
    //     }));
    // };


    const handleAlignInfoChange = (event) => {
        const value = event.target.value;
        setAlignInfo(value); // Update status in local state
        setFormFields((prevState) => ({
            ...prevState,
            alignInfo: value, // Update the form fields
        }));
    };

    // Handle file selection for product images
    const handleBannerFileChange = (newFiles) => {
        // Ensure newFiles is an array
        const filesArray = Array.isArray(newFiles) ? newFiles : Array.from(newFiles);


        // Filter out duplicate files (check by name & size)
        const filteredFiles = filesArray.filter((newFile) => {
            return !bannerFiles.uploadedFiles.some(
                (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
            );
        });

        if (filteredFiles.length === 0) {
            toast.error("Oops! File already exists."); // Optional alert
            return;
        }

        setBannerFiles((prev) => ({
            ...prev,
            uploadedFiles: [...prev.uploadedFiles, ...filteredFiles], // Append new images
        }));

        // Generate previews for new files
        filteredFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerFiles((prev) => ({
                    ...prev,
                    previews: [...prev.previews, reader.result], // Append preview
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    // Handle image removal dynamically
    const handleRemoveImage = (index) => {
        setBannerFiles((prev) => {
            const updatedFiles = [...prev.uploadedFiles];
            const updatedPreviews = [...prev.previews];
            const removedFile = updatedFiles[index]; // Store removed file

            updatedFiles.splice(index, 1);
            updatedPreviews.splice(index, 1);

            return {
                ...prev,
                uploadedFiles: updatedFiles,
                previews: updatedPreviews,
                removedFiles: [...prev.removedFiles, removedFile], // Add to removed files
            };
        });
    };


    // const handleFormSubmit = async (e) => {
    //     e.preventDefault();

    //     if (formFields.bannerTitle === "") {
    //         context.openAlertBox("error", "Please enter Banner Title");
    //         nameInputRef.current?.focus();
    //         return;
    //     }

    //     if (formFields.price === "") {
    //         context.openAlertBox("error", "Please enter price");
    //         priceInputRef.current?.focus();
    //         return;
    //     }

    //     if (!productCategory) {
    //         context.openAlertBox("error", "Please select a parent category.");
    //         categorySelectRef.current?.focus();
    //         return;
    //     }

    //     if (!productCategory2) {
    //         context.openAlertBox("error", "Please select a 2nd-sub-category.");
    //         categorySelectRef2.current?.focus();
    //         return;
    //     }

    //     if (!productCategory3) {
    //         context.openAlertBox("error", "Please select a third-child-category.");
    //         categorySelectRef3.current?.focus();
    //         return;
    //     }

    //     if (formFields.images.length === 0) {
    //         context.openAlertBox("error", "Please upload images");
    //         return;
    //     }

    //     setIsLoading(true);
    //     // Start a toast.promise for handling loading, success, and error states
    //     try {
    //         const formData = new FormData();

    //         // ✅ Append text fields
    //         formData.append("bannerTitle", formFields.bannerTitle);
    //         formData.append("price", formFields.price);
    //         formData.append("productCategory", formFields.productCategory);
    //         formData.append("name", formFields.name);
    //         formData.append("name", formFields.name);

    //         // ✅ Append each image file
    //         bannerFiles.uploadedFiles.forEach((file) => {
    //             formData.append("images", file); // Ensure field name matches backend expectation
    //         });

    //         // ✅ Debugging: Log FormData contents
    //         for (let pair of formData.entries()) {
    //             console.log(pair[0], pair[1]);
    //         }

    //         const result = await toast.promise(
    //             postData(`/api/bannersV1/add`, formFields), {
    //             loading: "Adding banners... Please wait.",
    //             success: (res) => {
    //                 if (res?.success) {
    //                     context?.forceUpdate();
    //                     return res.message || "Banner added successfully!";
    //                 } else {
    //                     throw new Error(res?.message || "An unexpected error occurred.");
    //                 }
    //             },
    //             error: (err) => {
    //                 // Check if err.response exists, else fallback to err.message
    //                 const errorMessage = err?.response?.data?.message || err.message || "Failed to add banner. Please try again.";
    //                 return errorMessage;
    //             },
    //         }
    //         );
    //         console.log("Result:", result);
    //     } catch (err) {
    //         console.error("Error:", err);
    //         toast.error(err?.message || "An unexpected error occurred.");
    //     } finally {
    //         setTimeout(() => {
    //             setIsLoading(false);
    //             context.setIsOpenFullScreenPanel({ open: false, model: "BannerV1 Details" });
    //         }, 500);
    //     }
    // }

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (formFields.bannerTitle === "") {
            context.openAlertBox("error", "Please enter Banner Title");
            nameInputRef.current?.focus();
            return;
        }

        if (formFields.price === "") {
            context.openAlertBox("error", "Please enter price");
            priceInputRef.current?.focus();
            return;
        }

        if (!productCategory) {
            context.openAlertBox("error", "Please select a parent category.");
            categorySelectRef.current?.focus();
            return;
        }

        if (!productCategory2) {
            context.openAlertBox("error", "Please select a 2nd-sub-category.");
            categorySelectRef2.current?.focus();
            return;
        }

        if (!productCategory3) {
            context.openAlertBox("error", "Please select a third-child-category.");
            categorySelectRef3.current?.focus();
            return;
        }

        if (bannerFiles.uploadedFiles.length === 0) {
            context.openAlertBox("error", "Please upload images");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();

            // Append all form fields
            formData.append("bannerTitle", formFields.bannerTitle);
            formData.append("price", formFields.price);
            formData.append("parentCategoryId", productCategory);
            formData.append("subCategoryId", productCategory2);
            formData.append("thirdSubCategoryId", productCategory3);
            formData.append("alignInfo", formFields.alignInfo);

            // Append each image file
            bannerFiles.uploadedFiles.forEach((file) => {
                formData.append("images", file);
            });

            // Debugging: Log FormData contents
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const result = await toast.promise(
                postData(`/api/bannersV1/add`, formData), {
                loading: "Adding banners... Please wait.",
                success: (res) => {
                    if (res?.success) {
                        context?.forceUpdate();
                        setTimeout(() => {
                            context.setIsOpenFullScreenPanel({ open: false, model: "BannerV1 Details" });
                        }, 500);
                        return res.message || "Banner added successfully!";
                    } else {
                        throw new Error(res?.message || "An unexpected error occurred.");
                    }
                },
                error: (err) => {
                    const errorMessage = err?.response?.data?.message || err.message || "Failed to add banner. Please try again.";
                    return errorMessage;
                },
            });

            console.log("Result:", result);
        } catch (err) {
            console.error("Error:", err);
            toast.error(err?.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (formFields.bannerTitle === "") {
            context.openAlertBox("error", "Please enter Banner Title");
            nameInputRef.current?.focus();
            return;
        }

        if (formFields.price === "") {
            context.openAlertBox("error", "Please enter price");
            priceInputRef.current?.focus();
            return;
        }

        if (!productCategory) {
            context.openAlertBox("error", "Please select a parent category.");
            categorySelectRef.current?.focus();
            return;
        }

        if (!productCategory2) {
            context.openAlertBox("error", "Please select a 2nd-sub-category.");
            categorySelectRef2.current?.focus();
            return;
        }

        if (!productCategory3) {
            context.openAlertBox("error", "Please select a third-child-category.");
            categorySelectRef3.current?.focus();
            return;
        }

        if (formFields.images.length === 0) {
            context.openAlertBox("error", "Please upload images");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();

            // Append all form fields
            Object.keys(formFields).forEach((key) => {
                if (Array.isArray(formFields[key])) {
                    formFields[key].forEach((item) => formData.append(key, item));
                } else {
                    formData.append(key, formFields[key]);
                }
            });

            console.log("Form fields after appending:", formFields);

            // Append new product images
            bannerFiles.uploadedFiles.forEach((file) => {
                formData.append("newBannerImages", file);
            });

            console.log("Category image appended:", formData);

            // ✅ Filter removed files (only keep Cloudinary URLs)
            const cloudinaryFilesToRemove = bannerFiles.removedFiles.filter(
                (file) => typeof file === "string" && file.startsWith("https://res.cloudinary.com")
            );
            console.log("cloudinaryFilesToRemove:", cloudinaryFilesToRemove);

            if (cloudinaryFilesToRemove.length > 0) {
                formData.append("removedFiles", JSON.stringify(cloudinaryFilesToRemove));
            }

            formData.append("userId", context?.userData?._id);
            formData.append("categoryId", bannerIdNo);

            console.log("Final FormData before sending:", formData);

            // Call API
            const result = await toast.promise(
                editData(`/api/bannersV1/${bannerIdNo}`, formData),
                {
                    loading: "Updating banner... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            context?.forceUpdate();
                            setTimeout(() => {
                                context.setIsOpenFullScreenPanel({ open: false, model: "BannerV1 Details" });
                            }, 500);
                            return res.message || "Banner updated successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        const errorMessage = err?.response?.data?.message || err.message || "Failed to update banner. Please try again.";
                        return errorMessage;
                    },
                }
            );

            console.log("Update Result:", result);
        } catch (err) {
            console.error("Error in handleUpdate:", err);
            toast.error(err?.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }


    const handleDiscard = async () => {
        context.setIsOpenFullScreenPanel({ open: false, model: "BannerV1 Details" });
    };


    return (
        <div>
            <section className='p-8'>
                <form
                    action="#"
                    onSubmit={handleFormSubmit}
                    className='form py-3'>
                    {/* <h3 className='text-[24px] font-bold mb-2'>{!bannerIdNo ? "Create New Banner" : "Edit"}</h3> */}
                    <h3 className='text-[20px] sm:text-[24px] font-bold mb-2'>{bannerIdNo === undefined ? ("Create ") : ("Update ")}Banner</h3>

                    <h3 className='text-[16px] sm:text-[18px] font-bold mb-2'>Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 mb-4">
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Banner Title</h3>
                            <input type="text" className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm' placeholder='Content to display on banner...' name="bannerTitle" ref={nameInputRef} value={formFields?.bannerTitle || ''} onChange={onChangeInput} />
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Align Info</h3>
                            <Select
                                size="small"
                                value={alignInfo}
                                onChange={handleAlignInfoChange}
                                className="w-full !text-[14px]"
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                            >
                                <MenuItem value="" disabled>
                                    Where to align info?
                                </MenuItem>
                                <MenuItem value="right">Right</MenuItem>
                                <MenuItem value="left">Left</MenuItem>
                                {/* <MenuItem value="center">Center</MenuItem> */}
                            </Select>
                        </div>


                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Price</h3>
                            <input
                                type="number"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm"
                                placeholder="Enter price"
                                min="0"
                                onKeyDown={(e) => {
                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                        e.preventDefault();
                                    }
                                }}
                                name="price" value={formFields.price} onChange={onChangeInput} ref={priceInputRef}
                            />
                        </div>


                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Parent Category</h3>

                            <Select
                                labelId="productCategoryDropDownLabel"
                                id="productCategoryDropDown"
                                size="small"
                                value={productCategory}
                                onChange={handleChangeProductCategory}
                                className="w-full !text-[14px]"
                                displayEmpty
                                inputRef={categorySelectRef}
                                inputProps={{ 'aria-label': 'Without label' }}
                            >
                                <MenuItem value="" disabled>
                                    Select parent category
                                </MenuItem>
                                {
                                    context?.catData?.map((item) => (
                                        <MenuItem key={item._id} value={item._id} onClick={() => selectedCatFun(item._id, item.name)}>
                                            {item.name}
                                        </MenuItem>
                                    ))
                                }
                            </Select>

                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Sub-Category (2<sup>nd</sup> Level)</h3>

                            <div className='flex gap-2'>

                                <Select
                                    labelId="productCategoryDropDownLabel2"
                                    id="productCategoryDropDown2"
                                    size="small"
                                    value={productCategory2}
                                    onChange={handleChangeProductCategory2} // Update second dropdown value
                                    className="w-full !text-[14px]"
                                    displayEmpty
                                    inputRef={categorySelectRef2}
                                    inputProps={{ 'aria-label': 'Without label' }}
                                >
                                    <MenuItem value="" disabled>
                                        Select sub-category (2<sup>nd</sup> Level)
                                    </MenuItem>

                                    {filteredCategories.length > 0 && filteredCategories.map((item2, index_) => (
                                        <MenuItem key={index_} value={item2._id} onClick={() => selectedCatFun2(item2._id, item2.name)}>
                                            {item2.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Child Category (3<sup>rd</sup> Level)</h3>

                            <div className='flex gap-2'>

                                <Select
                                    labelId="productCategoryDropDownLabel3" // FIXED: Unique ID
                                    id="productCategoryDropDown3" // FIXED: Unique ID
                                    size="small"
                                    value={productCategory3}
                                    onChange={handleChangeProductCategory3} // FIXED: Now correctly updates the third dropdown
                                    className="w-full !text-[14px]"
                                    displayEmpty
                                    inputRef={categorySelectRef3}
                                    inputProps={{ 'aria-label': 'Without label' }}
                                >
                                    <MenuItem value="" disabled>
                                        Select child category (3<sup>rd</sup> Level)
                                    </MenuItem>

                                    {filteredSubCategories.length > 0 && filteredSubCategories.map((item3, index__) => (
                                        <MenuItem key={index__} value={item3._id} onClick={() => selectedCatFun3(item3._id, item3.name)}>
                                            {item3.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>


                    <h3 className="text-[18px] font-bold mb-2">Media & Images</h3>


                    {/* <div className="border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
                        <span className='opacity-50 text-[14px]'>
                            {bannerFiles.uploadedFiles.length > 0
                                ? "Banner image uploaded"
                                : "Choose a banner image or simply drag and drop"}
                        </span>

                        {bannerFiles.uploadedFiles.length > 0 ? (
                            <div className="mt-2 border p-2 rounded-md flex flex-col items-center bg-white h-[150px] w-full relative"> */}
                    {/* Remove Button */}
                    {/* <span
                                    className="absolute -top-[5px] -right-[5px] bg-white w-[15px] h-[15px] rounded-full border border-red-600 flex items-center justify-center cursor-pointer hover:scale-125 transition-all"
                                    onClick={() => handleRemoveImage(0)}
                                    aria-label="Remove Image"
                                >
                                    <IoClose className="text-[15px] text-red-600" />
                                </span> */}

                    {/* Image Preview */}
                    {/* <div className=" h-full overflow-hidden">
                                    <img
                                        src={bannerFiles.previews[0]}
                                        alt={`Uploaded file: ${bannerFiles.uploadedFiles[0].name}`}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <UploadBox multiple={false} onFileChange={handleBannerFileChange} />
                            </div>
                        )}

                        <p className="text-sm mt-2 text-gray-600">
                            {bannerFiles.uploadedFiles.length > 0
                                ? "Category image uploaded"
                                : "No category image uploaded yet."}
                        </p>
                    </div> */}

                    <div className="border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
                        <span className='opacity-50 text-[14px]'>
                            {bannerFiles.uploadedFiles.length > 0
                                ? "Banner image uploaded"
                                : "Choose a banner image or simply drag and drop"}
                        </span>

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
                            {/* Uploaded Images */}
                            {bannerFiles.uploadedFiles.length > 0 &&
                                bannerFiles.previews.map((preview, index) => (
                                    <div key={index} className="relative border p-2 rounded-md bg-white h-[150px] w-full">
                                        {/* Remove Button */}
                                        <span
                                            className="absolute -top-[5px] -right-[5px] bg-white w-[15px] h-[15px] rounded-full border border-red-600 flex items-center justify-center cursor-pointer hover:scale-125 transition-all"
                                            onClick={() => handleRemoveImage(index)}
                                            aria-label="Remove Image"
                                        >
                                            <IoClose className="text-[15px] text-red-600" />
                                        </span>

                                        {/* Image Preview */}
                                        <div className="h-full overflow-hidden">
                                            <img
                                                src={preview}
                                                alt={`Uploaded file ${index}`}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        </div>
                                    </div>
                                ))}

                            {/* Upload Box should be in the same row */}
                            {/* <div className={`h-[150px] w-full ${bannerFiles.uploadedFiles.length > 0 ? "" : "col-span-8"}`}>
                                <UploadBox multiple={false} onFileChange={handleBannerFileChange} />
                            </div> */}
                            {(multiple || bannerFiles.uploadedFiles.length === 0) && (
                                <div className={`h-[150px] w-full ${bannerFiles.uploadedFiles.length > 0 ? "" : "col-span-8"}`}>
                                    <UploadBox multiple={multiple} onFileChange={handleBannerFileChange} />
                                </div>
                            )}

                        </div>


                        <p className="text-sm mt-2 text-gray-600">
                            {bannerFiles.uploadedFiles.length > 0
                                ? `${bannerFiles.uploadedFiles.length} banner image${bannerFiles.uploadedFiles.length > 1 ? "s" : ""} ready for upload`
                                : "No banner image uploaded yet."}
                        </p>
                    </div>



                    <div className='sticky bottom-0 left-0 z-10 mt-2.5 flex w-full items-center justify-end rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4'>

                        <Button
                            type="reset"
                            onClick={handleDiscard}
                            className='!bg-red-500 !text-white !capitalize w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2 '
                        >
                            <RiResetLeftFill className='text-[18px] hidden sm:block' />Cancel
                        </Button>

                        {
                            bannerIdNo === undefined ? (
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
    )
}

export default AddBannersV1
