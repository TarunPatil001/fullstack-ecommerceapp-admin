import { Button, CircularProgress, MenuItem, Select } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { MdOutlineEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { MyContext } from '../../App';
import { deleteData, editData } from '../../utils/api';
import toast from 'react-hot-toast';

const EditSubCategoryBox = (props) => {
    const context = useContext(MyContext);
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectVal, setSelectVal] = useState('');

    const [formFields, setFormFields] = useState({
        name: '',
        parentCategoryName: null,
        parentCategoryId: null,
    });

    useEffect(() => {
        setFormFields({
            name: props?.name || '',
            parentCategoryName: props?.selectedCatName || null,
            parentCategoryId: props?.selectedCat || null,
        });
        setSelectVal(props?.selectedCat || '');
    }, [props?.name, props?.selectedCat, props?.selectedCatName, context?.isReducer]);

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChange = (event) => {
        const selectedId = event.target.value;
        const selectedCategory = props?.catData?.find(cat => cat._id === selectedId);

        setSelectVal(selectedId);
        setFormFields((prev) => ({
            ...prev,
            parentCategoryId: selectedId,
            parentCategoryName: selectedCategory?.name || null
        }));
    };

    const handleEditSubCategory = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        if (formFields.name.trim() === "") {
            setIsLoading(false);
            context.openAlertBox("error", "Please enter sub-category name.");
            return;
        }
    
        if (!props?.id) {
            setIsLoading(false);
            toast.error("Invalid category ID.");
            return;
        }
    
        try {
            const result = await toast.promise(
                editData(`/api/category/${props?.id}`, formFields),
                {
                    loading: "Updating sub-category... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            context?.forceUpdate();
                            setEditMode(false);
                            return res.message || "Sub-Category updated successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err?.response?.data?.message || err.message || "Failed to update sub-category.";
                    },
                }
            );
            console.log("Edit Result:", result);
        } catch (err) {
            console.error("Error in handleEditSubCategory:", err);
            toast.error(err?.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleDeleteSubCategory = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await toast.promise(
                deleteData(`/api/category/${props?.id}`),
                {
                    loading: "Deleting sub-category... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            context?.forceUpdate();
                            return res.message || "Sub-Category deleted successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err?.response?.data?.message || err.message || "Failed to delete sub-category. Please try again.";
                    },
                }
            );

            console.log("Delete Result:", result);
        } catch (err) {
            console.error("Error in handleDeleteSubCategory:", err);
            toast.error(err?.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    

    return (
        <form className='w-100 flex items-center gap-3 p-0 px-4' onSubmit={handleEditSubCategory}>
            {editMode ? (
                <div className='flex items-center justify-between py-2 gap-4'>
                    <div className='w-[150px]'>
                        <Select
                            style={{ zoom: '75%' }}
                            value={selectVal}
                            onChange={handleChange}
                            size="small"
                            className="w-full"
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without-label' }}
                        >
                            {props?.catData?.length > 0 && props?.catData?.map((item, index) => (
                                <MenuItem key={index} value={item._id}>
                                    {item?.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>

                    <input
                        type="text"
                        className='w-full h-[30px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm'
                        name="name"
                        value={formFields?.name}
                        onChange={onChangeInput}
                    />

                    <div className='flex items-center gap-2'>
                        <Button size='small' className='!capitalize' type='submit' variant="contained">
                            {isLoading ? <CircularProgress color='inherit' /> : "Edit"}
                        </Button>
                        <Button size='small' variant="outlined" onClick={() => setEditMode(false)} className='!capitalize'>
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <span className='font-[500] text-[14px]'>{props?.name}</span>
                    <div className='flex items-center ml-auto gap-2'>
                        <Button className='!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !text-blue-500 !text-[20px]' onClick={() => setEditMode(true)}>
                            <MdOutlineEdit />
                        </Button>
                        <Button className='!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !text-red-500 !text-[18px]' onClick={handleDeleteSubCategory}>
                            <RiDeleteBin6Line />
                        </Button>
                    </div>
                </>
            )}
        </form>
    );
};

export default EditSubCategoryBox;
