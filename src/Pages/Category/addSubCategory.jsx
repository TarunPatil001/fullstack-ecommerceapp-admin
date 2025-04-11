
import { Button, CircularProgress, MenuItem, Select } from '@mui/material';
import React, { useContext, useRef, useState } from 'react';
import { MyContext } from '../../App';
import toast from 'react-hot-toast';
import { postData } from '../../utils/api';
import { IoIosSave } from 'react-icons/io';
import { RiResetLeftFill } from 'react-icons/ri';
import { GrPowerReset } from "react-icons/gr";

const AddSubCategory = () => {

  const context = useContext(MyContext);

  const nameInputRef = useRef(null);
  const categorySelectRef = useRef(null);
  const categorySelectRef2 = useRef(null);

  const [productCategory, setProductCategory] = useState('');
  const [productCategory2, setProductCategory2] = useState('');
  const [isLoadingReset1, setIsLoadingReset1] = useState(false);
  const [isLoadingSave1, setIsLoadingSave1] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);



  const [formFields, setFormFields] = useState({
    name: '',
    parentCategoryName: null,
    parentCategoryId: null,
  });



  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((formFields) => ({
      ...formFields,
      [name]: value,
    }));
  };



  const selectedCatFun = (categoryId, categoryName) => {
    setFormFields({
      ...formFields,
      parentCategoryName: categoryName,
      parentCategoryId: categoryId,
    });
    setProductCategory(categoryId);
    setProductCategory2(""); // Reset second dropdown when first changes
    const selectedCategory = context?.catData?.find(cat => cat._id === categoryId);
    setFilteredCategories(selectedCategory?.children || []);
  };

  const selectedCatFun2 = (categoryId2, categoryName2) => {
    setFormFields({
      ...formFields,
      parentCategoryName: categoryName2,
      parentCategoryId: categoryId2,
    });
    setProductCategory2(categoryId2);
  };


  const handleChangeProductCategory = (event) => {
    const selectedCategoryId = event.target.value;
    setProductCategory(selectedCategoryId);
    setProductCategory2(""); // Reset second dropdown when first changes

    // Find selected category's children
    const selectedCategory = context?.catData?.find(
      (cat) => cat._id === selectedCategoryId
    );
    setFilteredCategories(selectedCategory?.children || []);
  };

  const handleChangeProductCategory2 = (event) => {
    setProductCategory2(event.target.value);
  };



  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (formFields.name === "") {
      context.openAlertBox("error", "Please enter sub-category name.");
      nameInputRef.current?.focus();
      return;
    }

    if (!productCategory) {
      context.openAlertBox("error", "Please select a parent category.");
      categorySelectRef.current?.focus();
      return;
    }

    // If second-level category is selected, use it as parent, otherwise use first-level
    const parentCategoryId = productCategory2 || productCategory;
    const parentCategoryName = context?.catData
      ?.flatMap(cat => [cat, ...(cat.children || [])])
      .find(cat => cat._id === parentCategoryId)?.name || null;

    const submissionData = {
      name: formFields.name,
      parentCategoryId,
      parentCategoryName,
    };

    setIsLoadingSave1(true);

    try {
      const result = await toast.promise(
        postData(`/api/category/create-category`, submissionData),
        {
          loading: "Adding sub-category... Please wait.",
          success: (res) => {
            if (res?.success) {
              context?.forceUpdate();
              handleDiscard();
              return res.message || "Sub-Category added successfully!";
            } else {
              throw new Error(res?.message || "An unexpected error occurred.");
            }
          },
          error: (err) => {
            return err?.response?.data?.message || "Failed to add sub-category.";
          },
        }
      );
      console.log("Result:", result);
    } catch (err) {
      console.error("Error:", err);
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoadingSave1(false);
    }
  };



  const handleDiscard = () => {
    setProductCategory('');
    setProductCategory2('');
    setFilteredCategories([]);
    setFormFields({
      name: '',
      parentCategoryName: null,
      parentCategoryId: null,
    });
    context.setIsOpenFullScreenPanel({ open: false, model: 'Sub-Category Details' })
  };

  const handleResetCategory2 = () => {
    setProductCategory2(""); // Reset second dropdown
    setFilteredCategories([]); // Optionally reset the filtered categories
  };





  return (
    <div>
      <section className='p-8'>
        <form
          action="#"
          onSubmit={handleFormSubmit}
          className='form py-3'>
          <h3 className='text-[20px] sm:text-[24px] font-bold mb-2'>Create New Sub-Category</h3>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-2">
            <h3 className='text-[16px] sm:text-[18px] font-bold'>Basic Information(Sub-Category)</h3>
            <span className='text-gray-400 text-[16px] sm:text-[18px]'><b>Note: </b>Categories Levels (Parent Level / 2<sup>nd</sup> Level / 3<sup>rd</sup> Level)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-dashed border-[rgba(0,0,0,0.1)] rounded-md p-5 pt-1 mb-4">
            <div className='col col-span-full'>
              <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Sub-Category Name</h3>

              <input type="text" className='w-full h-[40px] border border-[rgba(0,0,0,0.1)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-md p-3 text-sm' placeholder='SubCategory title' name="name" value={formFields.name} onChange={onChangeInput} ref={nameInputRef} />

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
              <h3 className='text-[14px] font-medium mb-1 text-gray-700'>Parent Category(2<sup>nd</sup> Level Sub-Category)</h3>

              <div className='flex flex-wrap sm:flex-nowrap gap-2'>

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
                    Select parent category (2<sup>nd</sup>&nbsp;Level)
                  </MenuItem>

                  {filteredCategories.map((item2) => (
                    <MenuItem key={item2._id} value={item2._id} onClick={() => selectedCatFun2(item2._id, item2.name)}>
                      {item2.name}
                    </MenuItem>
                  ))}
                </Select>

                <Button
                  className='!bg-gray-400 !text-white !text-[18px] !w-[20px] !min-w-[40px]'
                  onClick={handleResetCategory2} // Reset button handler
                >
                  <GrPowerReset />
                </Button>
              </div>
            </div>

            <div className='!overflow-x-hidden w-full h-[70px] fixed bottom-0 right-0 bg-white flex items-center justify-end px-10 gap-4 z-[49] border-t border-[rgba(0,0,0,0.1)] custom-shadow'>
              <Button
                type="reset"
                onClick={handleDiscard}
                className={`${isLoadingReset1 === true ? "!bg-red-300" : "!bg-red-500"} !text-white !capitalize w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2`} disabled={isLoadingReset1}
              >
                {
                  isLoadingReset1 ? <CircularProgress color="inherit" /> : <><RiResetLeftFill className='text-[18px] hidden sm:block' />Cancel</>
                }
              </Button>

              <Button type='submit' className={`${isLoadingSave1 === true ? "custom-btn-disabled" : "custom-btn"}  !capitalize w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2`} disabled={isLoadingSave1}>
                {
                  isLoadingSave1 ? <CircularProgress color="inherit" /> : <><IoIosSave className='text-[20px] hidden sm:block' />Create</>
                }
              </Button>
            </div>
         
          </div>
        </form>

      </section>
    </div>
  );
};

export default AddSubCategory;





