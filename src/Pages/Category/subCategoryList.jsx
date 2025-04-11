import { Button } from '@mui/material'
import React, { useContext, useState } from 'react'
import { MyContext } from '../../App';
import { GoPlus } from 'react-icons/go';
import EditSubCategoryBox from './editSubCategoryBox';
import { IoChevronDownOutline } from 'react-icons/io5';
import { Collapse } from 'react-collapse';


const SubCategoryList = () => {

    const context = useContext(MyContext);
    const [isOpen, setIsOpen] = useState(0);

    const expend = (index) => {
        setIsOpen((prev) => (prev === index ? null : index));
    };



    return (
        <>
            <div className='flex flex-col items-start sm:flex-row justify-between gap-2 pt-3 mt-14'>
                <h2 className='text-[20px] font-bold'>Sub Category List <span className="font-normal text-[12px]">MUI</span></h2>
                <div className='col w-full sm:w-[200px] ml-auto flex items-center justify-end gap-3'>
                    <Button className='!bg-[var(--bg-primary)] !px-5 !text-white flex items-center gap-1 !capitalize w-full' onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Sub-Category Details' })}><GoPlus className='text-[20px] hidden sm:block' />Add Sub-Category</Button>
                </div>
            </div>

            <div className='card my-4 pt-5 pb-5 px-5 shadow-md sm:rounded-lg bg-white'>
                {
                    context?.catData?.length !== 0 &&
                    <ul className='w-full'>
                        {
                            context?.catData?.map((firstLevelCat, index) => {
                                return (

                                    <li className='w-full mb-1' key={index}>
                                        <div className={`flex items-center w-full p-2 rounded-sm px-4 cursor-pointer ${isOpen === index ? "bg-blue-50" : "bg-[#f1f1f1]"}`} onClick={(e) => { e.stopPropagation(); expend(index); }}>
                                            <span className='font-semibold flex items-center gap-4 text-[14px]'>
                                                {firstLevelCat?.name}
                                            </span>
                                            <Button className='!w-[35px] !min-w-[35px] !h-[35px] !rounded-full !bg-gray-50 !text-black !ml-auto' onClick={(e) => { e.stopPropagation(); expend(index); }}>
                                                {
                                                    <IoChevronDownOutline className={`text-[20px] transform transition-transform duration-300 ${isOpen === index ? "-rotate-180" : "rotate-0"}`}
                                                    />
                                                }
                                            </Button>
                                        </div>


                                        {
                                            firstLevelCat?.children?.length !== 0 &&
                                            <Collapse isOpened={isOpen === index}>
                                                <ul className='w-full'>
                                                    {
                                                        firstLevelCat?.children?.map((subCat, index_) => {
                                                            console.log('Sub Category Object:', subCat);  // Log the entire object
                                                            console.log('Sub Category ID:', subCat?._id);   // Log the id
                                                            return (
                                                                <li className='w-full py-1' key={index_}>
                                                                    <EditSubCategoryBox
                                                                        name={subCat?.name}
                                                                        id={subCat?._id}
                                                                        catData={context?.catData}
                                                                        index={index_}
                                                                        selectedCat={subCat?.parentCategoryId}
                                                                        selectedCatName={subCat?.parentCategoryName}
                                                                    />
                                                                    {subCat?.children?.length !== 0 &&
                                                                        <ul className='pl-4'>
                                                                            {
                                                                                subCat?.children?.map((thirdLevel, index__) => {
                                                                                    console.log('Third Level Category Object:', thirdLevel);  // Log the entire thirdLevel object
                                                                                    console.log('Third Level Category ID:', thirdLevel?._id);   // Log the id
                                                                                    return (
                                                                                        <li className='w-full py-1' key={index__}>
                                                                                            <EditSubCategoryBox
                                                                                                name={thirdLevel?.name}
                                                                                                id={thirdLevel?._id}
                                                                                                catData={firstLevelCat?.children}
                                                                                                index={index__}
                                                                                                selectedCat={thirdLevel?.parentCategoryId}
                                                                                                selectedCatName={thirdLevel?.parentCategoryName}
                                                                                            />
                                                                                        </li>
                                                                                    );
                                                                                })
                                                                            }
                                                                        </ul>
                                                                    }
                                                                </li>
                                                            );
                                                        })
                                                    }
                                                </ul>
                                            </Collapse>
                                        }
                                    </li>
                                )
                            })
                        }
                    </ul>
                }
            </div>
        </>
    )
}

export default SubCategoryList
