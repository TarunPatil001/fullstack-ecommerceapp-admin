import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import UploadBox from '../../Components/UploadBox';
import { deleteImages, editData, fetchDataFromApi, postData } from '../../utils/api';
import { useContext } from 'react';
import { MyContext } from '../../App';
import { toast } from 'react-hot-toast';
import { CircularProgress } from '@mui/material';
import { RiResetLeftFill } from 'react-icons/ri';
import { FiEdit } from 'react-icons/fi';
import { IoIosSave } from 'react-icons/io';



const AddCategory = () => {

  const context = useContext(MyContext);
  const formRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  // const [isLoading3, setIsLoading3] = useState(false);
  const [multiple, setMultiple] = useState(false);

  // Consolidated states for category files
  const [categoryFiles, setCategoryFiles] = useState({
    uploadedFiles: [],
    previews: [],
    removedFiles: []
  });

  const [categoryIdNo, setCategoryIdNo] = useState(undefined);

  const [formFields, setFormFields] = useState({
    name: '',
    images: [],
  });

  useEffect(() => {
    const { categoryId, categoryName } = context.isOpenFullScreenPanel || {};
    console.log("AddNewCatPage - Category ID :", categoryId);
    console.log("AddNewCatPage - Category Name :", categoryName);

    // Early return for new address (addressId is not present)
    if (!categoryId) {
      // context.setCategoryIdNo(categoryId)
      setCategoryIdNo(undefined);
      setCategoryFiles({
        uploadedFiles: [],
        previews: [],
        removedFiles: []
      });

      setFormFields({
        name: "",
        images: [],
      });
      return; // Exit early if it's a new address
    }

    // If addressId is available (editing existing address)
    if (categoryId && categoryName) {
      // context.setCategoryIdNo(categoryId);
      setCategoryIdNo(categoryId);

      const fetchCategoryData = async () => {
        try {
          const response = await fetchDataFromApi(
            `/api/category/${categoryId}`);

          // Check if the response was successful
          if (response.success && response.data) {
            const category = response.data;
            console.log("Response Data:", category); // Log response to check status

            // Populate the form fields with the fetched data
            setCategoryFiles({
              uploadedFiles: category?.images || [],
              previews: category?.images || [],
              removedFiles: []
            });

            // setPreviews(category?.images || []); // Update previews state
            setFormFields((prev) => ({
              ...prev,
              name: category?.name || "",
              images: category?.images || [], // Set images directly
            }));

            console.log("Populated form fields:", category);
          }
          else {
            console.error("Category data not found or response unsuccessful.");
          }
        } catch (error) {
          console.error("Error fetching category:", error);
        }
      };

      fetchCategoryData();
    }
  }, [context, context.isOpenFullScreenPanel, setCategoryIdNo]);


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
      setCategoryFiles((prev) => ({
        ...prev,
        removedFiles: []
      }));
    }
  }, [context?.isOpenFullScreenPanel?.open]);


  // Cleanup image previews when the component unmounts or images change
  useEffect(() => {
    return () => {
      categoryFiles.previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [categoryFiles.previews]);


  // Handle file selection for product images
  const handleCategoryFileChange = (newFiles) => {
    // Ensure newFiles is an array
    const filesArray = Array.isArray(newFiles) ? newFiles : Array.from(newFiles);


    // Filter out duplicate files (check by name & size)
    const filteredFiles = filesArray.filter((newFile) => {
      return !categoryFiles.uploadedFiles.some(
        (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
      );
    });

    if (filteredFiles.length === 0) {
      toast.error("Oops! File already exists."); // Optional alert
      return;
    }

    setCategoryFiles((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...filteredFiles], // Append new images
    }));

    // Generate previews for new files
    filteredFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryFiles((prev) => ({
          ...prev,
          previews: [...prev.previews, reader.result], // Append preview
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle image removal dynamically
  const handleRemoveImage = (index) => {
    setCategoryFiles((prev) => {
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

    if (!formFields.name.trim()) return toast.error("Please enter category name.");
    if (categoryFiles.uploadedFiles.length === 0) return toast.error("Please upload at least one category image.");

    setIsLoading(true);

    try {
      const formData = new FormData();

      // ✅ Append text fields
      formData.append("name", formFields.name);

      // ✅ Append each image file
      categoryFiles.uploadedFiles.forEach((file) => {
        formData.append("images", file); // Ensure field name matches backend expectation
      });

      // ✅ Debugging: Log FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // ✅ Submit the request
      await toast.promise(
        postData(`/api/category/create-category`, formData, { withCredentials: true }),
        {
          loading: "Adding category... Please wait.",
          success: (res) => {
            if (res?.success) {
              context?.forceUpdate();
              setTimeout(() => {
                context.setIsOpenFullScreenPanel({ open: false, model: "Category Details" });
              }, 500);
              return res.message || "Category added successfully!";
            } else {
              throw new Error(res?.message || "Error occurred.");
            }
          },
          error: (err) => {
            toast.error(err?.message || "Failed to add category.");
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

    if (!formFields.name.trim()) return toast.error("Please enter category name.");
    if (formFields.images.length === 0 && categoryFiles.uploadedFiles.length === 0) {
      context.openAlertBox("error", "Please upload image");
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
      categoryFiles.uploadedFiles.forEach((file) => {
        formData.append("newCategoryImages", file);
      });

      console.log("Category image appended:", formData);

      // ✅ Filter removed files (only keep Cloudinary URLs)
      const cloudinaryFilesToRemove = categoryFiles.removedFiles.filter(
        (file) => typeof file === "string" && file.startsWith("https://res.cloudinary.com")
      );
      console.log("cloudinaryFilesToRemove:", cloudinaryFilesToRemove);

      if (cloudinaryFilesToRemove.length > 0) {
        formData.append("removedFiles", JSON.stringify(cloudinaryFilesToRemove));
      }

      formData.append("userId", context?.userData?._id);
      formData.append("categoryId", categoryIdNo);

      console.log("Final FormData before sending:", formData);

      // Call API
      const result = await toast.promise(

        editData(`/api/category/${categoryIdNo}`, formData),
        {
          // loading: "Updating product... Please wait.",
          loading: "Updating category... Please wait.",
          success: (res) => {
            if (res?.success) {
              context?.forceUpdate();
              setTimeout(() => {
                context.setIsOpenFullScreenPanel({ open: false, model: "Category Details" });
              }, 500);
              return res.message || "Category updated successfully!";
            } else {
              throw new Error(res?.message || "An unexpected error occurred.");
            }
          },

          error: (err) => {
            const errorMessage = err?.response?.data?.message || err.message || "Failed to update category. Please try again.";
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

  };


  const handleDiscard = async () => {
    context.setIsOpenFullScreenPanel({ open: false, model: "Category Details" });
  };


  return (
    <div>
      <section className='p-8'>
        <form
          action="#"
          ref={formRef}
          onSubmit={handleFormSubmit}
          className='form py-3'>
          <h3 className='text-[24px] font-bold mb-2'>{categoryIdNo === undefined ? ("Create ") : ("Update ")}Product</h3>

          <h3 className='text-[18px] font-bold mb-2'>Basic Information</h3>
          <div className="grid grid-cols-1 border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
            <div className='col'>
              <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Category Name</h3>
              <input type="text" className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm' placeholder='Category title' name="name" value={formFields?.name || ''} onChange={onChangeInput} />
            </div>
          </div>


          <h3 className="text-[18px] font-bold mb-2">Media & Images</h3>
          <div className="border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
            <span className="opacity-50 col-span-full text-[14px]">
              Choose category photos or simply drag and drop
            </span>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              {/* Uploaded Image Previews */}
              {categoryFiles.uploadedFiles.length > 0 &&
                categoryFiles.previews.map((preview, index) => (
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

              {/* Upload Box – visible always if multiple is allowed */}
              {(multiple || categoryFiles.uploadedFiles.length === 0) && (
                <div className={`h-[150px] w-full ${categoryFiles.uploadedFiles.length > 0 ? "" : "col-span-8"}`}>
                  <UploadBox multiple={multiple} onFileChange={handleCategoryFileChange} />
                </div>
              )}
            </div>

            <p className="text-sm mt-2 text-gray-600 col-span-full">
              {categoryFiles.uploadedFiles.length > 0
                ? `${categoryFiles.uploadedFiles.length} category photo${categoryFiles.uploadedFiles.length > 1 ? "s" : ""} ready for upload`
                : "No category image uploaded yet."}
            </p>
          </div>


          {/* <div className='!overflow-x-hidden w-full h-[70px] fixed bottom-0 right-0 bg-white flex items-center justify-end px-10 gap-4 z-[49] border-t border-[rgba(0,0,0,0.1)] custom-shadow'>
            {
              context.categoryIdNo === undefined ? (
                <>
                  <Button
                    type="reset"
                    onClick={handleDiscard}
                    className={`${isLoading2 === true ? "!bg-red-300" : "!bg-red-500"} !text-white w-[150px] h-[40px] flex items-center justify-center gap-2`} disabled={isLoading2}
                  >
                    {
                      isLoading2 ? <CircularProgress color="inherit" /> : <><RiResetLeftFill className='text-[20px]' />Discard</>
                    }
                  </Button>
                  <Button type='submit' className={`${isLoading === true ? "custom-btn-disabled" : "custom-btn"}  w-[150px] h-[40px] flex items-center justify-center gap-2`} disabled={isLoading}>
                    {
                      isLoading ? <CircularProgress color="inherit" /> : <><IoIosSave className='text-[20px]' />Create</>
                    }
                  </Button>
                </>
              ) : (
                <Button type='submit' className={`${isLoading === true ? "custom-btn-update-disabled" : "custom-btn-update"}  w-[150px] h-[40px] flex items-center justify-center gap-2`} disabled={isLoading} onClick={handleUpdate}>
                  {
                    isLoading ? <CircularProgress color="inherit" /> : <><FiEdit className='text-[20px]' />Update</>
                  }
                </Button>
              )
            }

          </div> */}
          <div className='sticky bottom-0 left-0 z-10 mt-2.5 flex w-full items-center justify-end rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4'>

            <Button
              type="reset"
              onClick={handleDiscard}
              className='!bg-red-500 !text-white !capitalize w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2 '
            >
              <RiResetLeftFill className='text-[18px] hidden sm:block' />Cancel
            </Button>

            {
              categoryIdNo === undefined ? (
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

export default AddCategory;
