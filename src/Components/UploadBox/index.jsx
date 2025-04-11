// import { useDropzone } from "react-dropzone";
// import { FaRegImages } from "react-icons/fa6";
// import { toast } from "react-hot-toast";
// import { uploadImagePost } from "../../utils/api";
// import { useState } from "react";
// import { CircularProgress } from '@mui/material';
// import { PropTypes } from 'prop-types';

// const UploadBox = (props) => {
//   const [isLoading, setIsLoading] = useState(false);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: {
//       "image/jpeg": [],
//       "image/png": [],
//       "image/gif": [],
//       "image/webp": [],
//     },
//     multiple: props.multiple !== undefined ? props.multiple : false,
//     onDrop: (acceptedFiles) => {
//       // This onDrop will just trigger the onChangeFile function for uploading
//       if (acceptedFiles && acceptedFiles.length > 0) {
//         acceptedFiles.forEach((file) => {
//           // Simulate the file change event for each dropped file
//           onChangeFile({ target: { files: [file] } }, props.url);
//         });
//       }
//     },
//   });


//   const onChangeFile = async (e, apiEndPoint, isBanner) => {
//     if (!props.setPreviewFun) {
//       console.error("setPreviewFun is not provided!");
//       return;
//     }

//     try {
//       const files = e.target.files;
//       if (!files || files.length === 0) {
//         throw new Error("No file selected.");
//       }

//       const validFormats = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
//       let invalidFileFound = false;
//       const formData = new FormData();
//       const previewUrls = [];

//       for (let i = 0; i < files.length; i++) {
//         if (!validFormats.includes(files[i].type)) {
//           invalidFileFound = true;
//           break;
//         }
//         previewUrls.push(URL.createObjectURL(files[i])); // Generate preview
//         formData.append(isBanner ? "bannerImages" : "images", files[i]);
//       }

//       if (invalidFileFound) {
//         toast.error("Please select valid image formats (JPEG, JPG, PNG, WEBP).");
//         return;
//       }

//       if (props?.productIdNo) {
//         formData.append("productId", props?.productIdNo);
//       }

//       setIsLoading(true);

//       const result = await toast.promise(
//         (async () => {
//           const response = await uploadImagePost(apiEndPoint, formData);

//           if (!response) {
//             throw new Error("Failed to upload images.");
//           }

//           let newImageList = [...(props.existingImages || [])];

//           if (isBanner) {
//             // Handle banner images separately
//             const existingBannerUrls = new Set(newImageList);
//             const newBannerImages = response.bannerImages?.filter((url) => !existingBannerUrls.has(url)) || [];
//             newImageList = [...newImageList, ...newBannerImages];
//           } else {
//             // Handle product images
//             const existingImageUrls = new Set(newImageList);
//             const newImages = response.images?.filter((url) => !existingImageUrls.has(url)) || [];
//             newImageList = [...newImageList, ...newImages];
//           }

//           props.setPreviewFun(newImageList); // ✅ Update preview state

//           return response?.data?.message || "Images uploaded successfully!";
//         })(),
//         {
//           loading: "Uploading image... Please wait.",
//           success: (message) => message,
//           error: (err) =>
//             err?.response?.data?.message ||
//             err.message ||
//             "An error occurred while uploading your image.",
//         }
//       );

//       console.log("Upload result:", result);
//     } catch (error) {
//       console.error("Error while uploading file:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };






//   return (
//     <div
//       {...getRootProps()}
//       className={`uploadBox p-3 rounded-md overflow-hidden border-2 border-dashed 
//       ${isDragActive ? "border-blue-500" : "border-gray-300"} 
//       hover:border-blue-300 h-[200px] bg-white cursor-pointer hover:bg-gray-100 transition-all 
//       flex flex-col items-center justify-center relative`}
//     >
//       {isLoading ? (
//         <>
//           <CircularProgress color="inherit" />
//           <h4 className="text-[14px] text-center font-medium">
//             <span className="text-blue-500">Uploading...</span>
//           </h4>
//         </>
//       ) : (
//         <>
//           <FaRegImages className="text-[40px] opacity-35 relative" />
//           <h4 className="text-[14px] text-center font-medium">
//             Drop your image here or{" "}
//             <span className="text-blue-500">click to browse</span>
//           </h4>
//           <input
//             {...getInputProps()} // Keep other Dropzone props
//             className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-50"
//             type="file"
//             accept="image/*"
//             name={props?.name}
//             multiple={props?.multiple ?? false} // Ensure safe check
//             onChange={(e) => onChangeFile(e, props?.url, props?.isBanner || false)} // Support banner uploads
//           />
//         </>
//       )}
//     </div>

//   );
// };


// UploadBox.propTypes = {
//   multiple: PropTypes.bool,
//   url: PropTypes.string.isRequired,
//   setPreviewFun: PropTypes.func.isRequired,
//   productIdNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   existingImages: PropTypes.arrayOf(PropTypes.string),
//   isBanner: PropTypes.bool,
//   name: PropTypes.string,
// };


// export default UploadBox;


// import { useDropzone } from "react-dropzone";
// import { FaRegImages } from "react-icons/fa6";
// import { useState } from "react";
// import { CircularProgress } from "@mui/material";
// import PropTypes from "prop-types";

// const UploadBox = ({ multiple, onFileChange }) => {
//     const [isLoading, setIsLoading] = useState(false);

//     const { getRootProps, getInputProps, isDragActive } = useDropzone({
//         accept: {
//             "image/jpeg": [],
//             "image/png": [],
//             "image/gif": [],
//             "image/webp": [],
//         },
//         multiple: multiple ?? false,
//         onDrop: (acceptedFiles) => {
//             if (acceptedFiles.length > 0) {
//                 // Pass only the files, no wrapping in { target: { files: ... } }
//                 onFileChange(acceptedFiles);
//             }
//         },
//     });

//     return (
//         <div
//             {...getRootProps()}
//             className={`uploadBox p-3 rounded-md overflow-hidden border-2 border-dashed 
//             ${isDragActive ? "border-blue-500" : "border-gray-300"} 
//             hover:border-blue-300 h-[150px] bg-white cursor-pointer hover:bg-gray-100 transition-all 
//             flex flex-col items-center justify-center relative`}
//         >
//             {isLoading ? (
//                 <>
//                     <CircularProgress color="inherit" />
//                     <h4 className="text-[14px] text-center font-medium">
//                         <span className="text-blue-500">Uploading...</span>
//                     </h4>
//                 </>
//             ) : (
//                 <>
//                     <FaRegImages className="text-[40px] opacity-35 relative" />
//                     <h4 className="text-[14px] text-center font-medium">
//                         Drop your image here or{" "}
//                         <span className="text-blue-500">click to browse</span>
//                     </h4>
//                     <input
//                         {...getInputProps()}
//                         className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-50"
//                         type="file"
//                         accept="image/*"
//                         multiple={multiple}
//                         onChange={(e) => onFileChange(e.target.files)} // Pass directly the files array
//                     />
//                 </>
//             )}
//         </div>
//     );
// };

// UploadBox.propTypes = {
//     multiple: PropTypes.bool,
//     onFileChange: PropTypes.func.isRequired,
// };

// export default UploadBox;

import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { FaRegImages } from "react-icons/fa6";
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import PropTypes from "prop-types";

const UploadBox = ({ multiple, onFileChange, onDragStart, onDragEnd }) => {
    const [isLoading, setIsLoading] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/gif": [],
            "image/webp": [],
        },
        multiple: multiple ?? false,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                onFileChange(acceptedFiles);
            }
        },
    });

    return (
        <motion.div
            {...getRootProps()}
            className={`uploadBox p-3 rounded-md overflow-hidden border-2 border-dashed 
    ${isDragActive ? "border-blue-500" : "border-gray-300"} 
    hover:border-blue-300 h-[150px] bg-white cursor-pointer hover:bg-gray-100 transition-all 
    flex flex-col items-center justify-center relative`}
            onMouseDown={onDragStart} // Pass drag event to parent
            onMouseUp={onDragEnd} // Stop dragging parent
        >
            {isLoading ? (
                <>
                    <CircularProgress color="inherit" />
                    <h4 className="text-[14px] text-center font-medium">
                        <span className="text-blue-500">Uploading...</span>
                    </h4>
                </>
            ) : (
                <>
                    <FaRegImages className="text-[40px] opacity-35 relative" />
                    <h4 className="text-[14px] text-center font-medium">
                        Drop your image here or{" "}
                        <span className="text-blue-500">click to browse</span>
                    </h4>
                    <input
                        {...getInputProps()}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-50"
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        onChange={(e) => onFileChange(e.target.files)}
                    />
                </>
            )}
        </motion.div>

    );
};

UploadBox.propTypes = {
    multiple: PropTypes.bool,
    onFileChange: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
};

export default UploadBox;

