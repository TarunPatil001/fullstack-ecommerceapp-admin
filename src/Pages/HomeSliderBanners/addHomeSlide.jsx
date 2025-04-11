import { Button, CircularProgress } from '@mui/material'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FaCloudUploadAlt } from 'react-icons/fa'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { IoClose } from 'react-icons/io5'
import UploadBox from '../../Components/UploadBox'
import { MyContext } from '../../App'
import { deleteImages, editData, fetchDataFromApi, postData } from '../../utils/api'
import toast from 'react-hot-toast'
import { RiResetLeftFill } from 'react-icons/ri'
import { IoIosSave } from 'react-icons/io'
import { FiEdit } from 'react-icons/fi'

const AddHomeSlide = () => {

  const context = useContext(MyContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  // const [homeSlideIdNo, setHomeSlideIdNo] = useState(null);
  const [homeSlideIdNo, setHomeSlideIdNo] = useState(undefined);
  const [multiple, setMultiple] = useState(false);  // Default: Single upload

  // Consolidated states for product and banner files
  const [homeSlideFiles, setHomeSlideFiles] = useState({
    uploadedFiles: [],
    previews: [],
    removedFiles: []
  });


  const [formFields, setFormFields] = useState({
    images: [],
  });

  useEffect(() => {
    const { homeSlideId } = context.isOpenFullScreenPanel || {};
    console.log("AddNewHomeSlidePage - HomeSlide ID :", homeSlideId);

    // Early return for new address (addressId is not present)
    if (!homeSlideId) {
      setHomeSlideIdNo(undefined)
      setHomeSlideFiles({
        uploadedFiles: [],
        previews: [],
        removedFiles: []
      });

      return; // Exit early if it's a new address
    }

    // If addressId is available (editing existing address)
    if (homeSlideId) {
      setHomeSlideIdNo(homeSlideId)
      console.log("Id Received");

      const fetchHomeSlideData = async () => {
        try {
          const response = await fetchDataFromApi(
            `/api/homeSlides/${homeSlideId}`, { withCredentials: true });

          // Check if the response was successful
          if (response.success && response.data) {
            const homeSlide = response.data;
            console.log("Response Data:", homeSlide); // Log response to check status

            setHomeSlideFiles({
              uploadedFiles: homeSlide?.images || [],
              previews: homeSlide?.images || [],
              removedFiles: []
            });

            // Populate the form fields with the fetched data
            setFormFields((prev) => ({
              ...prev,
              images: homeSlide?.images || [], // Set images directly
            }));

            console.log("Populated form fields:", homeSlide);
          }
          else {
            console.error("HomeSlide data not found or response unsuccessful.");
          }
        } catch (error) {
          console.error("Error fetching homeSlide:", error);
        }
      };

      fetchHomeSlideData();
    }
  }, [context.isOpenFullScreenPanel?.homeSlideId]);

  useEffect(() => {
    fetchDataFromApi("/api/homeSlides").then((res) => {
      console.log(res?.data);
      context?.setHomeSlideData(res?.data);
    })
  }, [context?.setHomeSlideData, context?.isReducer]);

  // Effect to reset removed files when panel closes
  useEffect(() => {
    if (context?.isOpenFullScreenPanel?.open === false) {
      setHomeSlideFiles((prev) => ({
        ...prev,
        removedFiles: []
      }));
    }
  }, [context?.isOpenFullScreenPanel?.open]);

  // Cleanup image previews when the component unmounts or images change
  useEffect(() => {
    return () => {
      homeSlideFiles.previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [homeSlideFiles.previews]);


  // Handle file selection for product images
  const handleHomeSlideFileChange = (newFiles) => {
    // Ensure newFiles is an array
    const filesArray = Array.isArray(newFiles) ? newFiles : Array.from(newFiles);


    // Filter out duplicate files (check by name & size)
    const filteredFiles = filesArray.filter((newFile) => {
      return !homeSlideFiles.uploadedFiles.some(
        (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
      );
    });

    if (filteredFiles.length === 0) {
      toast.error("Oops! File already exists."); // Optional alert
      return;
    }

    setHomeSlideFiles((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...filteredFiles], // Append new images
    }));

    // Generate previews for new files
    filteredFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHomeSlideFiles((prev) => ({
          ...prev,
          previews: [...prev.previews, reader.result], // Append preview
        }));
      };
      reader.readAsDataURL(file);
    });
  };


  // Handle image removal dynamically
  const handleRemoveImage = (index) => {
    setHomeSlideFiles((prev) => {
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

    if (homeSlideFiles.uploadedFiles.length === 0) {
      return toast.error("Please upload at least one banner image.");
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Append all uploaded files
      homeSlideFiles.uploadedFiles.forEach((file) => {
        formData.append("images", file); // Match this to your backend expectation
      });

      // Append any other form fields if needed
      Object.keys(formFields).forEach((key) => {
        if (key !== "images") { // Skip images since we're handling them separately
          formData.append(key, formFields[key]);
        }
      });

      // Debug FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // ✅ Submit the request WITH FORMDATA
      await toast.promise(
        postData(`/api/homeSlides/add-homeSlide`, formData), // Send formData instead of formFields
        {
          loading: "Adding homeSlide... Please wait.",
          success: (res) => {
            if (res?.success) {
              context?.forceUpdate();
              setTimeout(() => {
                context.setIsOpenFullScreenPanel({ open: false, model: "Home Banner Details" });
              }, 500);
              return res.message || "HomeSlide added successfully!";
            } else {
              throw new Error(res?.message || "Error occurred.");
            }
          },
          error: (err) => {
            toast.error(err?.message || "Failed to add homeSlide.");
          },
        }
      );
    } catch (err) {
      toast.error(err?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formFields.images.length === 0 && homeSlideFiles.uploadedFiles.length === 0) {
      context.openAlertBox("error", "Please select homeSlide image.");
      return;
    }

    try {
      setIsLoading(true);

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
      homeSlideFiles.uploadedFiles.forEach((file) => {
        formData.append("newHomeSlideImages", file);
      });

      console.log("Product images appended:", formData);

      // ✅ Filter removed files (only keep Cloudinary URLs)
      const cloudinaryFilesToRemove = homeSlideFiles.removedFiles.filter(
        (file) => typeof file === "string" && file.startsWith("https://res.cloudinary.com")
      );
      console.log("cloudinaryFilesToRemove:", cloudinaryFilesToRemove);

      if (cloudinaryFilesToRemove.length > 0) {
        formData.append("removedFiles", JSON.stringify(cloudinaryFilesToRemove));
      }


      formData.append("userId", context?.userData?._id);
      formData.append("homeSlideId", homeSlideIdNo);

      console.log("Final FormData before sending:", formData);

      // Call API
      const result = await toast.promise(
        // editData(`/api/product/updateProduct/${productIdNo}`, formData),
        editData(`/api/homeSlides/${homeSlideIdNo}`, formData, { withCredentials: true }),
        {
          loading: "Updating homeSlide... Please wait.",
          success: (res) => {
            if (res?.success) {
              context?.forceUpdate();
              setTimeout(() => {
                context.setIsOpenFullScreenPanel({ open: false, model: "HomeSlide Details" });
              }, 500);
              return res.message || "HomeSlide updated successfully!";
            } else {
              throw new Error(res?.message || "An unexpected error occurred.");
            }

          },
          error: (err) => {
            return err?.response?.data?.message || err.message || "Failed to update homeSlide. Please try again.";
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

  };


  const handleDiscard = async () => {
    context.setIsOpenFullScreenPanel({ open: false, model: "Product Details" });
  };



  return (
    <div>
      <section className='p-8'>
        <form action="#"
          onSubmit={handleFormSubmit}
          className='form py-3'>
          <h3 className='text-[20px] sm:text-[24px] font-bold mb-2'>{homeSlideIdNo === undefined ? ("Create ") : ("Update ")}Home Slide Banner</h3>

          <h3 className="text-[16px] sm:text-[18px] font-bold mb-2">Media & Images</h3>

          {/* <div className="grid grid-cols-8 border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
            <span className='opacity-50 col-span-full text-[14px]'>Choose a banner photo or simply drag and drop</span>

            {homeSlideFiles.uploadedFiles.map((file, index) => (
              <div
                key={file.name}
                className="border p-2 rounded-md flex flex-col items-center bg-white h-[150px] w-full relative cursor-grab"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("index", index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const dragIndex = parseInt(e.dataTransfer.getData("index"), 10);
                  if (!isNaN(dragIndex) && dragIndex !== index) {
                    handleRearrangeImages(dragIndex, index);
                  }
                }}
              > */}
          {/* Remove Button */}
          {/* <span
                  className="absolute -top-[5px] -right-[5px] bg-white w-[15px] h-[15px] rounded-full border border-red-600 flex items-center justify-center cursor-pointer hover:scale-125 transition-all"
                  onClick={() => handleRemoveImage(index)}
                  aria-label="Remove Image"
                >
                  <IoClose className="text-[15px] text-red-600" />
                </span> */}

          {/* Image Preview */}
          {/* <div className="w-full h-[150px] overflow-hidden">
                  <img
                    src={homeSlideFiles.previews[index]}
                    alt={`Uploaded file: ${file.name}`}
                    className="w-full h-full object-cover rounded-md cursor-grab transition-transform duration-300 ease-in-out"
                    draggable={false}
                  />
                </div>

              </div>
            ))}


            <div className={"col-span-8"}>
              <UploadBox multiple={false} onFileChange={handleHomeSlideFileChange} />
            </div>

            <p className="text-sm mt-2 text-gray-600 col-span-full">
              {homeSlideFiles.uploadedFiles.length > 0 ? `Files uploaded: ${homeSlideFiles.uploadedFiles.length}` : "No files uploaded yet."}
            </p>
          </div> */}

          <div className="border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
            <span className="opacity-50 col-span-full text-[14px]">
              Choose a banner photo or simply drag and drop
            </span>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              {/* Uploaded Images */}
              {homeSlideFiles.uploadedFiles.length > 0 &&
                homeSlideFiles.previews.map((preview, index) => (
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
              {(multiple || homeSlideFiles.uploadedFiles.length === 0) && (
                <div className={`h-[150px] w-full ${homeSlideFiles.uploadedFiles.length > 0 ? "" : "col-span-8"}`}>
                  <UploadBox multiple={multiple} onFileChange={handleHomeSlideFileChange} />
                </div>
              )}
            </div>

            <p className="text-sm mt-2 text-gray-600 col-span-full">
              {homeSlideFiles.uploadedFiles.length > 0
                ? `${homeSlideFiles.uploadedFiles.length} banner photo${homeSlideFiles.uploadedFiles.length > 1 ? "s" : ""} ready for upload`
                : "No banner photo uploaded yet."}
            </p>
          </div>

          <div className='sticky bottom-0 left-0 z-10 mt-2.5 flex w-full items-center justify-end rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4'>

            <Button type="reset" onClick={handleDiscard} className='!capitalize !bg-red-500 !text-white !px-5 w-full sm:w-[150px] h-[40px] flex items-center justify-center gap-2 '><RiResetLeftFill className='text-[18px] hidden sm:block' />Cancel</Button>
            {homeSlideIdNo === undefined ? (
              <Button type='submit' className={`${isLoading ? "custom-btn-disabled" : "custom-btn"} !capitalize !px-5 w-full sm:w-[150px] h-[40px] flex items-center justify-center gap-2`} disabled={isLoading}>
                {isLoading ? <CircularProgress color="inherit" /> : <><IoIosSave className='text-[20px] hidden sm:block' />Create</>}
              </Button>
            ) : (
              <Button type='submit' className={`${isLoading ? "custom-btn-update-disabled" : "custom-btn-update"} !capitalize !px-5 w-full sm:w-[150px] h-[40px] flex items-center justify-center gap-2`} disabled={isLoading} onClick={handleUpdate}>
                {isLoading ? <CircularProgress color="inherit" /> : <><FiEdit className='text-[20px] hidden sm:block' />Update</>}
              </Button>
            )}

          </div>
        </form>
      </section>

    </div>
  )
}

export default AddHomeSlide
