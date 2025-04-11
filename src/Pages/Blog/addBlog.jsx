import { Button, CircularProgress } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react'
import { FiEdit } from 'react-icons/fi';
import { IoIosSave } from 'react-icons/io';
import { RiResetLeftFill } from 'react-icons/ri';
import UploadBox from '../../Components/UploadBox';
import { IoClose } from 'react-icons/io5';
import { MyContext } from '../../App';
import toast from 'react-hot-toast';
import { editData, fetchDataFromApi, postData } from '../../utils/api';
import Editor from 'react-simple-wysiwyg';

const AddBlog = () => {

    const context = useContext(MyContext);
    const [isLoading, setIsLoading] = useState(false);

    const titleInputRef = useRef(null);
    const descriptionInputRef = useRef(null);
    const [description, setDescription] = useState('');
    const [multiple, setMultiple] = useState(false);  // Default: Single upload
    const [blogIdNo, setBlogIdNo] = useState(undefined);  // Default: Single upload


    const [formFields, setFormFields] = useState({
        title: '',
        images: [],
        description: '',
    });

    // Consolidated states for banner files
    const [blogFiles, setBlogFiles] = useState({
        uploadedFiles: [],
        previews: [],
        removedFiles: []
    });


    useEffect(() => {
        const { blogId } = context.isOpenFullScreenPanel || {};
        console.log("Add Blog Id - BlogId:", blogId);

        if (!blogId) {
            console.log("No blogId found, resetting state.");
            setBlogIdNo(undefined);
            setBlogFiles({
                uploadedFiles: [],
                previews: [],
                removedFiles: []
            });

            setFormFields({
                title: '',
                images: [],
                description: '',
            });

            setDescription('');
            return;
        }

        // If addressId is available (editing existing address)
        if (blogId) {
            setBlogIdNo(blogId);

            const fetchBlogData = async () => {
                try {

                    const response = await fetchDataFromApi(`/api/blog/${blogId}`);
                    console.log("API Response:", response);

                    if (response?.success && response?.data) {
                        const blog = response.data;
                        console.log("Blog Data:", blog);

                        setBlogFiles({
                            uploadedFiles: blog.images || [],
                            previews: blog.images || [],
                            removedFiles: []
                        });

                        setDescription(blog.description || "");
                        setFormFields((prev) => ({
                            ...prev,
                            title: blog.title || "",
                            images: blog.images || [],
                            description: blog.description || "",
                        }));

                    } else {
                        console.error("Blog data not found or response unsuccessful.");
                    }
                } catch (error) {
                    console.error("Error fetching blog:", error);
                }
            };

            fetchBlogData();

        }
    }, [context.isOpenFullScreenPanel?.blogId]); // Depend only on `blogId`



    // Ensure both input and editor update state properly
    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (name === "description") setDescription(value); // Sync description state
    };

    function onChangeDescription(e) {
        setDescription(e.target.value);
        setFormFields((prev) => ({
            ...prev,
            description: e.target.value,
        }));
    }


    // Effect to reset removed files when panel closes
    useEffect(() => {
        if (context?.isOpenFullScreenPanel?.open === false) {
            setBlogFiles((prev) => ({
                ...prev,
                removedFiles: []
            }));
        }
    }, [context?.isOpenFullScreenPanel?.open]);


    // Cleanup image previews when the component unmounts or images change
    useEffect(() => {
        return () => {
            blogFiles.previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [blogFiles.previews]);


    // Handle file selection for product images
    const handleBlogFileChange = (newFiles) => {
        // Ensure newFiles is an array
        const filesArray = Array.isArray(newFiles) ? newFiles : Array.from(newFiles);


        // Filter out duplicate files (check by name & size)
        const filteredFiles = filesArray.filter((newFile) => {
            return !blogFiles.uploadedFiles.some(
                (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
            );
        });

        if (filteredFiles.length === 0) {
            toast.error("Oops! File already exists."); // Optional alert
            return;
        }

        setBlogFiles((prev) => ({
            ...prev,
            uploadedFiles: [...prev.uploadedFiles, ...filteredFiles], // Append new images
        }));

        // Generate previews for new files
        filteredFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBlogFiles((prev) => ({
                    ...prev,
                    previews: [...prev.previews, reader.result], // Append preview
                }));
            };
            reader.readAsDataURL(file);
        });
    };


    // Handle image removal dynamically
    const handleRemoveImage = (index) => {
        setBlogFiles((prev) => {
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


    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (formFields.title === "") {
            context.openAlertBox("error", "Please enter Blog Title");
            titleInputRef.current?.focus();
            return;
        }

        if (formFields.description === "") {
            context.openAlertBox("error", "Please enter description");
            descriptionInputRef.current?.focus();
            return;
        }


        if (blogFiles.uploadedFiles.length === 0) {
            context.openAlertBox("error", "Please upload images");
            return;
        }

        setIsLoading(true);
        // Start a toast.promise for handling loading, success, and error states
        try {

            const formData = new FormData();

            // Append all form fields
            formData.append("title", formFields.title);
            formData.append("description", formFields.description);

            // Append each image file
            blogFiles.uploadedFiles.forEach((file) => {
                formData.append("images", file);
            });

            // Debugging: Log FormData contents
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const result = await toast.promise(
                postData(`/api/blog/add`, formData), {
                loading: "Adding banners... Please wait.",
                success: (res) => {
                    if (res?.success) {
                        context?.forceUpdate();
                        setTimeout(() => {
                            context.setIsOpenFullScreenPanel({ open: false, model: "Blog Details" });
                        }, 500);
                        return res.message || "Blog added successfully!";
                    } else {
                        throw new Error(res?.message || "An unexpected error occurred.");
                    }
                },
                error: (err) => {
                    // Check if err.response exists, else fallback to err.message
                    const errorMessage = err?.response?.data?.message || err.message || "Failed to add blog. Please try again.";
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
    }

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (formFields.title === "") {
            context.openAlertBox("error", "Please enter Blog Title");
            titleInputRef.current?.focus();
            return;
        }

        if (formFields.description === "") {
            context.openAlertBox("error", "Please enter description");
            descriptionInputRef.current?.focus();
            return;
        }


        if (blogFiles.uploadedFiles.length === 0) {
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
            blogFiles.uploadedFiles.forEach((file) => {
                formData.append("newBlogImages", file);
            });

            console.log("Blog image appended:", formData);

            // ✅ Filter removed files (only keep Cloudinary URLs)
            const cloudinaryFilesToRemove = blogFiles.removedFiles.filter(
                (file) => typeof file === "string" && file.startsWith("https://res.cloudinary.com")
            );
            console.log("cloudinaryFilesToRemove:", cloudinaryFilesToRemove);

            if (cloudinaryFilesToRemove.length > 0) {
                formData.append("removedFiles", JSON.stringify(cloudinaryFilesToRemove));
            }

            formData.append("userId", context?.userData?._id);
            formData.append("blogId", blogIdNo);

            console.log("Final FormData before sending:", formData);

            const result = await toast.promise(
                editData(`/api/blog/${blogIdNo}`, formData),
                {
                    loading: "Updating blog... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            context?.forceUpdate();
                            setTimeout(() => {
                                context.setIsOpenFullScreenPanel({ open: false, model: "Blog Details" });
                            }, 500);
                            return res.message || "Blog updated successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        const errorMessage = err?.response?.data?.message || err.message || "Failed to update blog. Please try again.";
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
        context.setIsOpenFullScreenPanel({ open: false, model: "Blog Details" });
    };



    return (
        <div>
            <section className='p-8'>
                <form
                    action="#"
                    onSubmit={handleFormSubmit}
                    className='form py-3'>
                    <h3 className='text-[20px] sm:text-[24px] font-bold mb-2'>{!blogIdNo ? "Create " : "Update "}Blog</h3>

                    <h3 className='text-[16px] sm:text-[18px] font-bold mb-2'>Basic Information</h3>
                    <div className="grid grid-cols-3 gap-4 border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 mb-4">
                        <div className='col col-span-full'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Blog Title</h3>
                            <input type="text" className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm' placeholder='Blog heading' name="title" ref={titleInputRef} value={formFields?.title || ''} onChange={onChangeInput} />
                        </div>

                        <div className='col col-span-full'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Blog Description</h3>
                            <Editor
                                containerProps={{
                                    style: {
                                        resize: 'vertical',
                                        minHeight: '150px', // Adjust as needed
                                    }
                                }}
                                value={description}
                                placeholder='Blog description'
                                name="description"
                                ref={descriptionInputRef}
                                onChange={onChangeDescription}
                            />
                        </div>


                    </div>


                    <h3 className="text-[18px] font-bold mb-2">Media & Images</h3>
                    <div className="border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
                        <span className='opacity-50 text-[14px]'>
                            {blogFiles.uploadedFiles.length > 0 ? "Blog photo uploaded" : "Choose a blog photo or simply drag and drop"}
                        </span>

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
                            {/* Uploaded Images */}
                            {blogFiles.uploadedFiles.length > 0 &&
                                blogFiles.previews.map((image, index) => (
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
                                            <img src={image} alt={`Uploaded file ${index}`} className="w-full h-full object-cover rounded-md" />
                                        </div>
                                    </div>
                                ))}

                            {(multiple || blogFiles.uploadedFiles.length === 0) && (
                                <div className={`h-[150px] w-full ${blogFiles.uploadedFiles.length > 0 ? "" : "col-span-8"}`}>
                                    <UploadBox multiple={multiple} onFileChange={handleBlogFileChange} />
                                </div>
                            )}
                        </div>

                        <p className="text-sm mt-2 text-gray-600">
                            {blogFiles.uploadedFiles.length > 0 ? `${blogFiles.uploadedFiles.length} blog photo${blogFiles.uploadedFiles.length > 1 ? "s" : ""} ready for upload` : "No blog photo uploaded yet."}
                        </p>
                    </div>


                    <div className="!sticky !bottom-0 !left-0 z-10 mt-2.5 flex w-full items-center justify-end rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4">

                        <Button
                            type="reset"
                            onClick={handleDiscard}
                            className='!bg-red-500 !text-white !capitalize w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2 '
                        >
                            <RiResetLeftFill className='text-[18px] hidden sm:block' />Cancel
                        </Button>

                        {
                            blogIdNo === undefined ? (
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

export default AddBlog
