import { useContext, useEffect, useRef, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Button, Checkbox, CircularProgress, FormControl, FormControlLabel, ListItemText, Rating, styled, Switch } from '@mui/material';
import UploadBox from '../../Components/UploadBox';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { IoClose } from "react-icons/io5";
import { MyContext } from '../../App';
import toast from 'react-hot-toast';
import { editData, fetchDataFromApi, postData } from '../../utils/api';
import { RiResetLeftFill } from 'react-icons/ri';
import { IoIosSave } from 'react-icons/io';
import { FiEdit } from 'react-icons/fi';


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 120,
        },
    },
};

const IOSSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#65C466',
                opacity: 1,
                border: 0,
                ...theme.applyStyles('dark', {
                    backgroundColor: '#2ECA45',
                }),
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color: theme.palette.grey[100],
            ...theme.applyStyles('dark', {
                color: theme.palette.grey[600],
            }),
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.7,
            ...theme.applyStyles('dark', {
                opacity: 0.3,
            }),
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#E9E9EA',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
        ...theme.applyStyles('dark', {
            backgroundColor: '#39393D',
        }),
    },
}));



const AddProduct = () => {

    const context = useContext(MyContext);
    const formRef = useRef(null);

    const [productCategory, setProductCategory] = useState(""); // Broad category
    const [productCategory2, setProductCategory2] = useState(""); // Sub category
    const [productCategory3, setProductCategory3] = useState(""); // Specific category

    const [filteredCategories, setFilteredCategories] = useState([]); // Filtered second-level categories
    const [filteredSubCategories, setFilteredSubCategories] = useState([]); // Filtered third-level categories

    const [isFeatured, setIsFeatured] = useState('');
    const [productRamData, setProductRamData] = useState([]);
    const [productWeightData, setProductWeightData] = useState([]);
    const [productSizeData, setProductSizeData] = useState([]);
    const [productRams, setProductRams] = useState([]);
    const [productWeight, setProductWeight] = useState([]);
    const [productSize, setProductSize] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading3, setIsLoading3] = useState(false);

    const [productRating, setProductRating] = useState(0);
    const [productIdNo, setProductIdNo] = useState(undefined);
    const [multiple, setMultiple] = useState(true);
    const [multiple2, setMultiple2] = useState(false);


    // Consolidated states for product and banner files
    const [productFiles, setProductFiles] = useState({
        uploadedFiles: [],
        previews: [],
        removedFiles: []
    });

    const [bannerFiles, setBannerFiles] = useState({
        uploadedFiles: [],
        previews: [],
        removedFiles: []
    });

    const [isBannerVisible, setIsBannerVisible] = useState(false);

    const [formFields, setFormFields] = useState({
        name: '',
        description: '',
        images: [],
        isBannerVisible: false,
        bannerImages: [],
        bannerTitleName: '',
        brand: '',
        price: '',
        oldPrice: '',
        categoryName: '',
        categoryId: '',
        subCategoryName: '',
        subCategoryId: '',
        thirdSubCategoryName: '',
        thirdSubCategoryId: '',
        category: '',
        countInStock: '',
        rating: '',
        isFeatured: false,
        discount: '',
        productRam: [],
        size: [],
        productWeight: [],
        seller: {
            sellerId: context?.userData?._id, // Ensure seller ID exists
            sellerName: context?.userData?.sellerName, // Ensure sellerName is available
        },
    });


    useEffect(() => {
        const { productId, productName } = context.isOpenFullScreenPanel || {};
        console.log("AddNewProductPage - Seller ID:", context?.userData?._id);
        console.log("AddNewProductPage - Seller Name:", context?.userData?.sellerName);

        if (!productId) {
            setProductIdNo(undefined);
            setProductFiles({
                uploadedFiles: [],
                previews: [],
                removedFiles: []
            });
            setIsBannerVisible(false);
            setBannerFiles({
                uploadedFiles: [],
                previews: [],
                removedFiles: []
            });
            setProductRams([]);
            setProductSize([]);
            setProductWeight([]);
            setIsFeatured(false);
            setProductRating(0);

            setFormFields({
                name: '',
                description: '',
                images: [],
                isBannerVisible: false,
                bannerImages: [],
                bannerTitleName: '',
                brand: '',
                price: '',
                oldPrice: '',
                categoryName: '',
                categoryId: '',
                subCategoryName: '',
                subCategoryId: '',
                thirdSubCategoryName: '',
                thirdSubCategoryId: '',
                category: '',
                countInStock: '',
                rating: 0,
                isFeatured: false,
                discount: '',
                productRam: [],
                size: [],
                productWeight: [],
                seller: {
                    sellerId: context?.userData?._id, // Ensure seller ID exists
                    sellerName: context?.userData?.sellerName, // Ensure sellerName is available
                },
            });

            setProductCategory("");
            setProductCategory2("");
            setProductCategory3("");
            setFilteredCategories([]);
            setFilteredSubCategories([]);
            return;
        }

        if (productId && productName) {
            setProductIdNo(productId);

            const fetchProductData = async () => {
                try {
                    const response = await fetchDataFromApi(`/api/product/${productId}`, { withCredentials: true });

                    if (response.success && response.data) {
                        const product = response.data;

                        setProductFiles({
                            uploadedFiles: product?.images || [],
                            previews: product?.images || [],
                            removedFiles: []
                        });
                        setIsBannerVisible(product?.isBannerVisible || false);
                        setBannerFiles({
                            uploadedFiles: product?.bannerImages || [],
                            previews: product?.bannerImages || [],
                            removedFiles: []
                        });
                        setProductRams(product?.productRam || []);
                        setProductSize(product?.size || []);
                        setProductWeight(product?.productWeight || []);
                        setIsFeatured(product?.isFeatured || false);
                        setProductRating(product?.rating || 0);

                        setFormFields((prev) => ({
                            ...prev,
                            name: product?.name || "",
                            description: product?.description || "",
                            images: product?.images || [],
                            isBannerVisible: product?.isBannerVisible || false,
                            bannerImages: product?.bannerImages || [],
                            bannerTitleName: product?.bannerTitleName || "",
                            brand: product?.brand || "",
                            price: product?.price || "",
                            oldPrice: product?.oldPrice || "",
                            categoryName: product?.categoryName || "",
                            categoryId: product?.categoryId || "",
                            subCategoryName: product?.subCategoryName || "",
                            subCategoryId: product?.subCategoryId || "",
                            thirdSubCategoryName: product?.thirdSubCategoryName || "",
                            thirdSubCategoryId: product?.thirdSubCategoryId || "",
                            category: product?.category || "",
                            countInStock: product?.countInStock || "",
                            rating: product?.rating || 0,
                            isFeatured: product?.isFeatured || false,
                            discount: product?.discount || "",
                            productRam: product?.productRam || [],
                            size: product?.size || [],
                            productWeight: product?.productWeight || [],
                            seller: {
                                sellerId: product?.seller?._id || context?.userData?._id || null,
                                sellerName: product?.seller?.sellerName || context?.userData?.sellerName || "Unknown Seller",
                            },
                        }));

                        // Automatically populate categories
                        setProductCategory(product?.categoryId || "");
                        setProductCategory2(product?.subCategoryId || "");
                        setProductCategory3(product?.thirdSubCategoryId || "");

                        // Set filtered categories based on existing selections
                        const selectedCategory = context?.catData?.find(cat => cat._id === product?.categoryId);
                        setFilteredCategories(selectedCategory?.children || []);

                        const selectedSubCategory = selectedCategory?.children?.find(cat => cat._id === product?.subCategoryId);
                        setFilteredSubCategories(selectedSubCategory?.children || []);
                    } else {
                        console.error("Category data not found or response unsuccessful.");
                    }
                } catch (error) {
                    console.error("Error fetching category:", error);
                }
            };

            fetchProductData();
        }
    }, [context, context.isOpenFullScreenPanel, setProductIdNo]);


    const onChangeInput = (e) => {
        const { name, value } = e.target;
        const keys = name.split("."); // Splitting name like "seller.sellerName"

        setFormFields((prevFields) => {
            if (keys.length === 2) {
                return {
                    ...prevFields,
                    [keys[0]]: {
                        ...prevFields[keys[0]],
                        [keys[1]]: value,
                    },
                };
            }
            return {
                ...prevFields,
                [name]: value,
            };
        });
    };


    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        let newFields = { ...formFields, [name]: value };

        // Calculate discount percentage
        const price = parseFloat(newFields.price) || 0;
        const oldPrice = parseFloat(newFields.oldPrice) || 0;

        if (oldPrice > 0 && price > 0 && price < oldPrice) {
            newFields.discount = Math.round(((oldPrice - price) / oldPrice) * 100);
        } else {
            newFields.discount = 0;
        }

        setFormFields(newFields);
    };


    const selectedCatFun = (categoryId, categoryName) => {
        console.log(categoryId, " ", categoryName);
        setFormFields({
            ...formFields,
            categoryName: categoryName,
            categoryId: categoryId,
            category: categoryId,
        });
        setProductCategory(categoryId);
        setProductCategory2(""); // Reset second dropdown when first changes
        setProductCategory3(""); // Reset third dropdown when first changes

        // Find selected category's children (subcategories)
        const selectedCategory = context?.catData?.find(cat => cat._id === categoryId);
        setFilteredCategories(selectedCategory?.children || []);
        setFilteredSubCategories([]); // Reset third-level categories
    };

    const selectedCatFun2 = (categoryId2, categoryName2) => {
        console.log(categoryId2, " ", categoryName2);
        setFormFields({
            ...formFields,
            subCategoryName: categoryName2,
            subCategoryId: categoryId2,
        });
        setProductCategory2(categoryId2);
        setProductCategory3(""); // Reset third dropdown when second changes

        // Find selected subcategory's children (third-level categories)
        const selectedSubCategory = filteredCategories.find(cat => cat._id === categoryId2);
        setFilteredSubCategories(selectedSubCategory?.children || []);
    };

    const selectedCatFun3 = (categoryId3, categoryName3) => {
        console.log(categoryId3, " ", categoryName3);
        setFormFields({
            ...formFields,
            thirdSubCategoryName: categoryName3,
            thirdSubCategoryId: categoryId3,
        });
        setProductCategory3(categoryId3);
    };

    const handleChangeProductCategory = (event) => {
        const selectedCategoryId = event.target.value;
        setProductCategory(selectedCategoryId);
        setProductCategory2(""); // Reset second dropdown when first changes
        setProductCategory3(""); // Reset third dropdown when first changes

        // Find selected category's children (subcategories)
        const selectedCategory = context?.catData?.find(cat => cat._id === selectedCategoryId);
        setFilteredCategories(selectedCategory?.children || []);
        setFilteredSubCategories([]); // Reset third-level categories
    };

    const handleChangeProductCategory2 = (event) => {
        const selectedCategoryId2 = event.target.value;
        setProductCategory2(selectedCategoryId2);
        setProductCategory3(""); // Reset third dropdown when second changes

        // Find selected subcategory's children (third-level categories)
        const selectedSubCategory = filteredCategories.find(cat => cat._id === selectedCategoryId2);
        setFilteredSubCategories(selectedSubCategory?.children || []);
    };

    const handleChangeProductCategory3 = (event) => {
        setProductCategory3(event.target.value);
    };


    const handleIsFeaturedChange = (event) => {
        const value = event.target.value;
        setIsFeatured(value); // Update status in local state
        setFormFields((prevState) => ({
            ...prevState,
            isFeatured: value, // Update the form fields
        }));
    };


    useEffect(() => {
        fetchDataFromApi("/api/product/productRams/get-all-productRams").then((res) => {
            console.log("Fetched RAM Data: ", res?.data); // Verify the structure
            setProductRamData(res?.data);
        });
    }, [context?.isReducer]);



    useEffect(() => {
        fetchDataFromApi("/api/product/productWeight/get-all-productWeight").then((res) => {
            console.log("Fetched Weight Data: ", res?.data); // Verify the structure
            setProductWeightData(res?.data);
        });
    }, [context?.isReducer]);


    useEffect(() => {
        fetchDataFromApi("/api/product/productSize/get-all-productSize").then((res) => {
            console.log("Fetched Size Data: ", res?.data); // Verify the structure
            setProductSizeData(res?.data);
        });
    }, [context?.isReducer]);



    const convertToBytes = (size) => {
        const sizeMap = {
            KB: 1,       // 1 KB = 1 byte
            MB: 1024,    // 1 MB = 1024 KB
            GB: 1024 * 1024, // 1 GB = 1024 MB
            TB: 1024 * 1024 * 1024, // 1 TB = 1024 GB
        };

        const match = size.match(/^(\d+)(KB|MB|GB|TB)$/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];
            return value * sizeMap[unit];
        }
        return 0; // Default if no match is found
    };

    const sortRamData = (ramData) => {
        return ramData
            .map((ram) => ram.name) // Extract the RAM names (e.g., "1GB", "4GB", etc.)
            .sort((a, b) => convertToBytes(a) - convertToBytes(b)); // Sort based on the byte conversion
    };

    const sortedProductRamData = sortRamData(productRamData);


    const handleChangeProductRams = (event) => {
        const selectedValues = event.target.value;
        setProductRams(selectedValues);
        setFormFields((prevFormFields) => ({
            ...prevFormFields,
            productRam: selectedValues,
        }));
    };

    const handleSetProductRams = (setter, value) => {
        setter(value.length > 0 ? value : []);
    };


    const parseWeight = (weight) => {
        const value = parseFloat(weight);
        if (weight.includes('kg')) {
            return value * 1000; // Convert kg to grams
        }
        return value;
    };

    const sortedWeights = [...productWeightData].sort((a, b) => {
        return parseWeight(a.name) - parseWeight(b.name);
    });

    // Handle the weight selection change
    const handleChangeProductWeight = (event) => {
        const selectedValues = event.target.value;
        handleSetProductWeight(setProductWeight, selectedValues);  // Use helper function for setting the weight
        setFormFields((prevFormFields) => ({
            ...prevFormFields,
            productWeight: selectedValues,
        }));
    };

    // Set product weight (helper function)
    const handleSetProductWeight = (setter, value) => {
        setter(value.length > 0 ? value : []); // Ensure an array is set, or an empty array if nothing is selected
    };


    const handleChangeProductSize = (event) => {
        const selectedValues = event.target.value; // Get selected sizes as an array
        console.log("Selected Sizes:", selectedValues);

        setProductSize(selectedValues);
        setFormFields((prevFormFields) => ({
            ...prevFormFields,
            size: selectedValues,
        }));
    };


    const handleSetProductSize = (setter, value) => {
        setter(value.length > 0 ? value : []);
    };


    const onChangeRating = (event, newValue) => {
        setProductRating(newValue);
        setFormFields((prevFields) => ({
            ...prevFields,
            rating: newValue,
        }));
    };


    // Effect to reset removed files when panel closes
    useEffect(() => {
        if (context?.isOpenFullScreenPanel?.open === false) {
            setProductFiles((prev) => ({
                ...prev,
                removedFiles: []
            }));
            setBannerFiles((prev) => ({
                ...prev,
                removedFiles: []
            }));
        }
    }, [context?.isOpenFullScreenPanel?.open]);


    // Cleanup image previews when the component unmounts or images change
    useEffect(() => {
        return () => {
            productFiles.previews.forEach((url) => URL.revokeObjectURL(url));
            bannerFiles.previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [productFiles.previews, bannerFiles.previews]);


    // Handle file selection for product images
    const handleProductFileChange = (newFiles) => {
        // Ensure newFiles is an array
        const filesArray = Array.isArray(newFiles) ? newFiles : Array.from(newFiles);


        // Filter out duplicate files (check by name & size)
        const filteredFiles = filesArray.filter((newFile) => {
            return !productFiles.uploadedFiles.some(
                (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
            );
        });

        if (filteredFiles.length === 0) {
            toast.error("Oops! File already exists."); // Optional alert
            return;
        }

        setProductFiles((prev) => ({
            ...prev,
            uploadedFiles: [...prev.uploadedFiles, ...filteredFiles], // Append new images
        }));

        // Generate previews for new files
        filteredFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductFiles((prev) => ({
                    ...prev,
                    previews: [...prev.previews, reader.result], // Append preview
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    // Handle image removal dynamically
    const handleRemoveImage = (index) => {
        setProductFiles((prev) => {
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


    // Handle image rearrangement with smooth movement
    const handleRearrangeImages = (dragIndex, hoverIndex) => {
        setProductFiles((prev) => {
            const updatedFiles = [...prev.uploadedFiles];
            const updatedPreviews = [...prev.previews];

            // Reorder files
            const [draggedFile] = updatedFiles.splice(dragIndex, 1);
            const [draggedPreview] = updatedPreviews.splice(dragIndex, 1);

            updatedFiles.splice(hoverIndex, 0, draggedFile);
            updatedPreviews.splice(hoverIndex, 0, draggedPreview);

            return {
                ...prev,
                uploadedFiles: updatedFiles,
                previews: updatedPreviews,
            };
        });
    };


    // Toggle banner visibility
    const handleToggle = async (event) => {
        const newValue = event.target.checked; // Get the new toggle state
        setIsBannerVisible(newValue);
        setFormFields({ ...formFields, isBannerVisible: newValue }); // ✅ Correct way to update formFields
    };


    // Handle file selection for banner images
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

    // Handle banner image removal dynamically
    const handleRemoveBannerImage = (index) => {
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



    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Basic form validation
        if (!formFields.name.trim()) return toast.error("Please enter product name.");
        if (!formFields.description.trim()) return toast.error("Please enter description.");
        if (!formFields.brand.trim()) return toast.error("Please enter brand.");
        if (!formFields.price) return toast.error("Please enter price.");
        if (!formFields.oldPrice) return toast.error("Please enter old price.");
        if (!formFields.discount) return toast.error("Please enter discount.");
        if (!formFields.countInStock) return toast.error("Please enter count in stock.");
        if (!formFields.seller?.sellerId) return toast.error("Seller information is missing.");
        if (productFiles.uploadedFiles.length === 0) return toast.error("Please upload at least one product image.");

        // Banner validation if banner is visible
        if (formFields.isBannerVisible && bannerFiles.uploadedFiles.length === 0) {
            return toast.error("Please upload at least one banner image.");
        }

        setIsLoading(true);

        try {
            const formData = new FormData();

            // ✅ Append text fields
            Object.keys(formFields).forEach((key) => {
                if (key !== "images" && key !== "bannerImages" && key !== "seller") {
                    formData.append(key, formFields[key]);
                }
            });

            // ✅ Append sellerId separately as a string
            const sellerId = String(formFields.seller?.sellerId || context?.userData?._id);
            formData.append("seller", sellerId);

            // ✅ Append product images
            productFiles.uploadedFiles.forEach((file) => {
                formData.append("images", file);
            });

            // ✅ Append banner images only if banner is visible
            if (formFields.isBannerVisible) {
                bannerFiles.uploadedFiles.forEach((file) => {
                    formData.append("bannerImages", file);
                });
            }

            // ✅ Debugging: Log FormData before sending the request
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[1]);
            }


            // ✅ Submit the request
            await toast.promise(
                postData("/api/product/create-product", formData),
                {
                    loading: "Adding product...",
                    success: (res) => {
                        if (res?.success) {
                            // toast.success("Product added successfully!");
                            setTimeout(() => {
                                context.setIsOpenFullScreenPanel({ open: false, model: "Product Details" });
                            }, 500);
                            return res.message || "Product added successfully!";
                        } else {
                            throw new Error(res?.message || "Error occurred.");
                        }
                    },
                    error: (err) => {
                        toast.error(err?.message || "Failed to add product.");
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

        // Form validation
        const requiredFields = [
            { field: "name", message: "Please enter product name" },
            { field: "description", message: "Please enter description" },
            { field: "brand", message: "Please enter brand" },
            { field: "price", message: "Please enter price" },
            { field: "oldPrice", message: "Please enter old price" },
            { field: "discount", message: "Please enter discount" },
            { field: "countInStock", message: "Please enter count in stock" },
        ];

        for (const { field, message } of requiredFields) {
            if (!formFields[field] || (typeof formFields[field] === "string" && formFields[field].trim() === "")) {
                context.openAlertBox("error", message);
                return;
            }
        }

        if (!productRams) {
            context.openAlertBox("error", "Please enter product RAM");
            return;
        }
        if (!productWeight) {
            context.openAlertBox("error", "Please enter product weight");
            return;
        }
        if (!productSize) {
            context.openAlertBox("error", "Please enter product size");
            return;
        }
        if (formFields.images.length === 0 && productFiles.uploadedFiles.length === 0) {
            context.openAlertBox("error", "Please upload images");
            return;
        }

        try {
            setIsLoading(true);

            const formData = new FormData();

            // Convert category to string if it's an object
            if (formFields.category && typeof formFields.category === "object") {
                if (formFields.category._id) {
                    formFields.category = formFields.category._id.toString();
                } else {
                    context.openAlertBox("error", "Invalid category format");
                    return;
                }
            }

            // Append all form fields
            Object.keys(formFields).forEach((key) => {
                if (Array.isArray(formFields[key])) {
                    formFields[key].forEach((item) => formData.append(key, item));
                } else {
                    formData.append(key, formFields[key]);
                }
            });

            console.log("Form fields after appending:", formFields);

            // Validate and append seller details
            const sellerData = {
                sellerId: formFields.seller?.sellerId || context?.userData?._id,
                sellerName: formFields.seller?.sellerName || context?.userData?.sellerName,
            };

            // Validate seller data
            if (!sellerData.sellerId || !sellerData.sellerName) {
                context.openAlertBox("error", "Seller details are required.");
                return;
            }

            console.log("Seller Data Before Appending:", sellerData);

            // Append the seller object as a JSON string
            formData.append("seller", JSON.stringify(sellerData));

            // Append the seller object as a JSON string
            formData.append("seller", JSON.stringify(sellerData));

            // Append new product images
            productFiles.uploadedFiles.forEach((file) => {
                formData.append("newProductImages", file);
            });

            // Append new banner images
            bannerFiles.uploadedFiles.forEach((file) => {
                formData.append("newBannerImages", file);
            });

            console.log("Product and Banner images appended:", formData);

            // ✅ Filter removed files (only keep Cloudinary URLs)
            const cloudinaryFilesToRemove = productFiles.removedFiles.filter(
                (file) => typeof file === "string" && file.startsWith("https://res.cloudinary.com")
            );
            console.log("cloudinaryFilesToRemove:", cloudinaryFilesToRemove);

            if (cloudinaryFilesToRemove.length > 0) {
                formData.append("removedFiles", JSON.stringify(cloudinaryFilesToRemove));
            }

            const cloudinaryBannerFilesToRemove = bannerFiles.removedFiles.filter(
                (file) => typeof file === "string" && file.startsWith("https://res.cloudinary.com")
            );
            console.log("cloudinaryBannerFilesToRemove:", cloudinaryBannerFilesToRemove);

            if (cloudinaryBannerFilesToRemove.length > 0) {
                formData.append("removedBannerFiles", JSON.stringify(cloudinaryBannerFilesToRemove));
            }

            formData.append("userId", context?.userData?._id);
            formData.append("productId", productIdNo);

            console.log("Final FormData before sending:", formData);

            // Call API
            const result = await toast.promise(
                editData(`/api/product/updateProduct/${productIdNo}`, formData),
                {
                    loading: "Updating product... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            context?.forceUpdate();
                            setTimeout(() => {
                                context.setIsOpenFullScreenPanel({ open: false, model: "Product Details" });
                            }, 500);
                            return res.message || "Product updated successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err?.response?.data?.message || err.message || "Failed to update product. Please try again.";
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
        <section className='p-8 bg-white'>

            <form action="#" ref={formRef} onSubmit={handleFormSubmit} className='form py-3'>
                <h3 className='text-[20px] sm:text-[24px] font-bold mb-2'>{productIdNo === undefined ? ("Create ") : ("Update ")}Product</h3>
                <h3 className='text-[16px] sm:text-[18px] font-bold mb-1 text-gray-700'>Basic Information</h3>
                <div className='flex flex-col gap-4 border-2 border-dashed border-[rgba(0,0,0,0.1)] bg-white rounded-md p-5 mb-5'>

                    <div className="grid grid-cols-1">

                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Name</h3>
                            <input type="text" className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm' placeholder='Product title' name="name" value={formFields.name} onChange={onChangeInput} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1">
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Description</h3>
                            <textarea type="text" className='w-full h-[100px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm' placeholder='Product description' name="description" value={formFields.description} onChange={onChangeInput} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-3 gap-4">


                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Broad Category</h3>
                            {
                                <Select
                                    labelId="productCategoryDropDownLabel"
                                    id="productCategoryDropDown"
                                    size="small"
                                    value={productCategory}
                                    onChange={handleChangeProductCategory}
                                    className="w-full !text-[14px]"
                                    displayEmpty
                                    inputProps={{ 'aria-label': 'Without label' }}
                                >
                                    <MenuItem value="" disabled>
                                        Select broad category
                                    </MenuItem>
                                    {
                                        context?.catData?.map((item, index) => (
                                            <MenuItem key={index} value={item._id} onClick={() => selectedCatFun(item._id, item.name)}>
                                                {item.name}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            }
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Sub Category</h3>
                            <Select
                                labelId="productSubCategoryDropDownLabel"
                                id="productSubCategoryDropDown"
                                size="small"
                                value={productCategory2}
                                onChange={handleChangeProductCategory2}
                                className="w-full !text-[14px]"
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                            >
                                <MenuItem value="" disabled>
                                    Select sub category
                                </MenuItem>
                                {filteredCategories.length > 0 && filteredCategories.map((item2, index_) => (
                                    <MenuItem key={index_} value={item2._id} onClick={() => selectedCatFun2(item2._id, item2.name)}>
                                        {item2.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Specific Category</h3>
                            <Select
                                labelId="productSpecificCategoryDropDownLabel"
                                id="productSpecificCategoryDropDown"
                                size="small"
                                value={productCategory3}
                                onChange={handleChangeProductCategory3}
                                className="w-full !text-[14px]"
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                            >
                                <MenuItem value="" disabled>
                                    Select specific category
                                </MenuItem>
                                {/* Third-Level Child Category */}
                                {filteredSubCategories.length > 0 && filteredSubCategories.map((item3, index__) => (
                                    <MenuItem key={index__} value={item3._id} onClick={() => selectedCatFun3(item3._id, item3.name)}>
                                        {item3.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>




                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Is Featured?</h3>
                            <Select
                                labelId="productFeaturedDropDownLabel"
                                id="productFeaturedDropDown"
                                size="small"
                                value={isFeatured}
                                onChange={handleIsFeaturedChange}
                                className="w-full !text-[14px]"
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                            >
                                <MenuItem value="" disabled>
                                    Want to feature your product?
                                </MenuItem>
                                <MenuItem value="true">Yes</MenuItem>
                                <MenuItem value="false">No</MenuItem>
                            </Select>
                        </div>

                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Brand</h3>
                            <input type="text" className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm' placeholder='Product brand' name="brand" value={formFields.brand} onChange={onChangeInput} />
                        </div>
                        <div className='col'>
                            <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Seller Name</h3>
                            <input type="text" className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm' placeholder='Seller name' name="seller.sellerName" value={formFields.seller?.sellerName} onChange={onChangeInput} />
                        </div>
                    </div>
                </div>


                {/* <div className='flex flex-col gap-4  mb-2'></div> */}
                <h3 className='text-[16px] sm:text-[18px] font-bold mb-1 text-gray-700'>Pricing & Stock</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-3 gap-4 border-2 border-dashed border-[rgba(0,0,0,0.1)] bg-white rounded-md p-5">

                    <div className='col'>
                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Price</h3>
                        <input
                            type="number"
                            className="w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm"
                            placeholder="Product price"
                            min="0"
                            onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                    e.preventDefault();
                                }
                            }}
                            name="price" value={formFields.price} onChange={handlePriceChange}
                        />
                    </div>
                    <div className='col'>
                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Old Price</h3>
                        <input
                            type="number"
                            className="w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm"
                            placeholder="Product old price"
                            min="0"
                            onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                    e.preventDefault();
                                }
                            }}
                            name="oldPrice" value={formFields.oldPrice} onChange={handlePriceChange}
                        />
                    </div>

                    <div className='col'>
                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Discount</h3>
                        <input
                            type="number"
                            className="w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm"
                            placeholder="Product Discount"
                            // min="0"
                            name="discount"
                            value={formFields.discount}
                            readOnly
                            onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                    e.preventDefault();
                                }
                            }}
                        />

                    </div>

                    <div className='col'>
                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Stock</h3>
                        <input
                            type="number"
                            className="w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm"
                            placeholder="Product stock"
                            min="0"
                            onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                    e.preventDefault();
                                }
                            }}
                            name="countInStock" value={formFields.countInStock} onChange={onChangeInput}
                        />
                    </div>
                </div>

                <h3 className='text-[16px] sm:text-[18px] font-bold mb-1 text-gray-700'>Size & Rating</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-3 gap-4 border-2 border-dashed border-[rgba(0,0,0,0.1)] bg-white rounded-md p-5">
                    <div className='col position-relative overflow-hidden'>
                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product RAMS</h3>
                        <FormControl fullWidth size='small'>
                            <Select
                                multiple
                                labelId="productRAMSDropDownLabel"
                                id="productRAMSDropDown"
                                size="small"
                                value={productRams}
                                onChange={(event) => {
                                    handleChangeProductRams(event);
                                    handleSetProductRams(setProductRams, event.target.value);
                                }}
                                className="w-full !text-[14px] custom-dropdown"
                                displayEmpty
                                MenuProps={MenuProps}
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return <em>None</em>;
                                    } else {
                                        const sortedSelected = selected.slice().sort((a, b) => convertToBytes(a) - convertToBytes(b));
                                        return sortedSelected.join(", ");
                                    }
                                }}
                            >
                                {sortedProductRamData?.map((ram) => (
                                    <MenuItem key={ram} value={ram}>
                                        <Checkbox checked={productRams.includes(ram)} />
                                        <ListItemText primary={ram} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <div className='col'>
                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Weight</h3>

                        <FormControl fullWidth size='small'>
                            <Select
                                multiple
                                labelId="productWeightDropDownLabel"
                                id="productWeightDropDown"
                                size="small"
                                value={productWeight}
                                onChange={(event) => {
                                    handleChangeProductWeight(event);
                                    handleSetProductWeight(setProductWeight, event.target.value);
                                }}
                                className="w-full !text-[14px] custom-dropdown"
                                displayEmpty
                                MenuProps={MenuProps} // Assuming you have a valid MenuProps configuration
                                renderValue={(selected) => {
                                    if (selected.length === 0) return <em>None</em>;

                                    // Sort the selected values (considering weight units like 'gm', 'kg', etc.)
                                    const sortedSelected = selected
                                        .slice()  // Make a copy of the array to avoid modifying the original
                                        .sort((a, b) => {
                                            const parseWeight = (weight) => {
                                                const value = parseFloat(weight);
                                                if (weight.includes('kg')) {
                                                    return value * 1000; // Convert kg to grams
                                                }
                                                return value;
                                            };

                                            return parseWeight(a) - parseWeight(b); // Sort by numeric value in grams
                                        });

                                    return sortedSelected.join(", ");
                                }}

                            >
                                {sortedWeights?.map((weight) => (
                                    <MenuItem key={weight._id} value={weight.name}>
                                        <Checkbox checked={productWeight.includes(weight.name)} />
                                        <ListItemText primary={weight.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                    </div>

                    <div className='col'>
                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Size</h3>
                        <FormControl fullWidth size='small'>
                            <Select
                                multiple
                                labelId="productSizeDropDownLabel"
                                id="productSizeDropDown"
                                size="small"
                                value={productSize}
                                onChange={(event) => {
                                    handleChangeProductSize(event);
                                    handleSetProductSize(setProductSize, event.target.value);
                                }}
                                className="w-full !text-[14px] custom-dropdown"
                                displayEmpty
                                MenuProps={MenuProps}
                                renderValue={(selected) => (selected.length === 0 ? <em>None</em> : selected.slice().sort((a, b) => ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].indexOf(a) - ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].indexOf(b)).join(", "))}
                            >

                                {productSizeData
                                    ?.slice()
                                    .sort((a, b) => ["S", "M", "L", "XL", "XXL", "XXXL"].indexOf(a.name) - ["S", "M", "L", "XL", "XXL", "XXXL"].indexOf(b.name)) // Ensure options are sorted in the dropdown
                                    .map((size) => (
                                        <MenuItem key={size._id} value={size.name}>
                                            <Checkbox checked={productSize.includes(size.name)} />
                                            <ListItemText primary={size.name} />
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                    </div>


                    <div className='col'>
                        <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Product Rating</h3>
                        <Rating
                            name="rating"
                            value={productRating} // Controlled value
                            onChange={onChangeRating}
                            precision={1}
                        />
                    </div>

                </div>

                {/* Component rendering images with smooth drag and drop */}
                <div className="border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
                    <span className="opacity-50 col-span-full text-[14px]">
                        Choose a product photo or simply drag and drop
                    </span>

                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 items-center">
                        {/* Uploaded Images */}
                        {productFiles.uploadedFiles.length > 0 &&
                            productFiles.previews.map((preview, index) => (
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
                        {(multiple || productFiles.uploadedFiles.length === 0) && (
                            <div className={`h-[150px] w-full ${productFiles.uploadedFiles.length > 0 ? "" : "col-span-8"}`}>
                                <UploadBox multiple={multiple} onFileChange={handleProductFileChange} />
                            </div>
                        )}
                    </div>

                    <p className="text-sm mt-2 text-gray-600 col-span-full">
                        {productFiles.uploadedFiles.length > 0
                            ? `${productFiles.uploadedFiles.length} product photo${productFiles.uploadedFiles.length > 1 ? "s" : ""} ready for upload`
                            : "No product photo uploaded yet."}
                    </p>
                </div>



                {/* BANNER IMAGES */}
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4 mb-2">
                    <h3 className="text-[18px] font-bold">Product Banner</h3>
                    <FormControlLabel
                        control={<IOSSwitch checked={isBannerVisible} sx={{ m: 1 }} onChange={handleToggle} />}
                        label={`Banner Visibility: ${isBannerVisible ? "On" : "Off"}`}
                    />
                </div>

                {isBannerVisible && (
                    <>
                        {/* Banner Title Input */}
                        <div className="mt-2 border-2 border-dashed border-[rgba(0,0,0,0.1)] bg-white rounded-md p-5 mb-4">
                            <h3 className="text-[14px] font-medium mb-1 text-gray-700">Banner Name</h3>
                            <input
                                type="text"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm"
                                placeholder="Banner title"
                                name="bannerTitleName"
                                value={formFields.bannerTitleName}
                                onChange={onChangeInput}
                            />
                        </div>

                        {/* Banner File Upload */}
                        <div className="border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
                            <div className="flex flex-col">
                                <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-2 items-center">
                                    <span className="opacity-50 col-span-full text-[14px]">Choose a banner photo or simply drag and drop</span>

                                    {bannerFiles.uploadedFiles.length > 0 &&
                                        bannerFiles.uploadedFiles.map((image, index) => (
                                            <div key={index} className="relative border p-2 rounded-md bg-white h-[150px] w-full">
                                                {/* Remove Button */}
                                                <span
                                                    className="absolute -top-[5px] -right-[5px] bg-white w-[15px] h-[15px] rounded-full border border-red-600 flex items-center justify-center cursor-pointer hover:scale-125 transition-all"
                                                    onClick={() => handleRemoveBannerImage(index)}
                                                    aria-label="Remove Image"
                                                >
                                                    <IoClose className="text-[15px] text-red-600" />
                                                </span>

                                                {/* Image Preview */}
                                                <div className="h-full overflow-hidden">
                                                    {isLoading3 ? (
                                                        <CircularProgress color="inherit" />
                                                    ) : (
                                                        <img
                                                            src={bannerFiles.previews[index]}
                                                            alt="Banner Image"
                                                            className="w-full h-full object-cover rounded-md"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                    {/* Upload Box should be in the same row */}
                                    {(multiple2 || bannerFiles.uploadedFiles.length === 0) && (
                                        <div className={`h-[150px] w-full ${bannerFiles.uploadedFiles.length > 0 ? "" : "col-span-8"}`}>
                                            <UploadBox multiple={multiple2} onFileChange={handleBannerFileChange} />
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm mt-2 text-gray-600 col-span-full">
                                    {bannerFiles.uploadedFiles.length > 0
                                        ? `${bannerFiles.uploadedFiles.length} product banner photo${bannerFiles.uploadedFiles.length > 1 ? "s" : ""} ready for upload`
                                        : "No product banner photo uploaded yet."}
                                </p>
                            </div>
                        </div>
                    </>
                )}


                <div className='sticky bottom-0 left-0 z-10 mt-2.5 flex w-full items-center justify-end rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4'>
                    <Button
                        type="reset"
                        onClick={handleDiscard}
                        className='!bg-red-500 !capitalize !text-white !p-5 w-full sm:w-[150px] h-[40px] flex items-center justify-center gap-2 '
                    >
                        <RiResetLeftFill className='text-[18px] hidden sm:block' />Cancel
                    </Button>
                    {
                        productIdNo === undefined ? (
                            <Button type='submit' className={`${isLoading === true ? "custom-btn-disabled" : "custom-btn"} !capitalize !p-5 w-full sm:w-[150px] h-[40px] flex items-center justify-center gap-2`} disabled={isLoading}>
                                {
                                    isLoading ? <CircularProgress color="inherit" /> : <><IoIosSave className='text-[20px] hidden sm:block' />Create</>
                                }
                            </Button>
                        ) : (
                            <Button type='submit' className={`${isLoading === true ? "custom-btn-update-disabled" : "custom-btn-update"} !capitalize !p-5  w-full sm:w-[150px] h-[40px] flex items-center justify-center gap-2`} disabled={isLoading} onClick={handleUpdate}>
                                {
                                    isLoading ? <CircularProgress color="inherit" /> : <><FiEdit className='text-[20px] hidden sm:block' />Update</>
                                }
                            </Button>
                        )
                    }
                </div>

            </form>
        </section >
    )
}

export default AddProduct
