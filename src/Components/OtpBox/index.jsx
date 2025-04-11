// import  { useState } from 'react'

// const OtpBox = ({ length, onChange }) => {

//     const [otp, setOtp] = useState(new Array(length).fill(""));

//     const handleChange = (element, index) => {
//         const value = element.value;
//         if (isNaN(value)) return; // only numbers allowed

//         const newOtp = [...otp];
//         newOtp[index] = value;
//         setOtp(newOtp);
//         onChange(newOtp.join(""));

//         if (value && index < length - 1) {
//             document.getElementById(`otp-input-${index + 1}`).focus();
//         }
//     };

//     return (
//         <>
//             <div className="otpBox flex justify-center gap-2">
//                 {
//                     otp.map((item, index) => (
//                         <input key={index} id={`otp-input-${index}`} type="text" maxLength="1" value={otp[index]} onChange={(e) => handleChange(e.target, index)} onKeyDown={(e) => handleChange(e, index)} className="w-[45px] h-[45px] text-center text-[17px]" />
//                     ))
//                 }
//             </div>
//         </>
//     )
// }

// export default OtpBox


import { useState } from 'react';
import PropTypes from 'prop-types';

const OtpBox = (props) => {
    const [otp, setOtp] = useState(new Array(props?.length).fill(""));

    const handleChange = (element, index) => {
        const value = element.value;
        if (isNaN(value)) return; // only numbers allowed

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        props?.onChange?.(newOtp.join(""));

        if (value && index < props.length - 1) {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    };

    return (
        <>
            <div className="otpBox flex justify-center gap-2">
                {
                    otp.map((item, index) => (
                        <input
                            key={index}
                            id={`otp-input-${index}`}
                            type="text"
                            maxLength="1"
                            value={otp[index]}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleChange(e, index)}
                            className="w-[45px] h-[45px] text-center text-[17px]"
                        />
                    ))
                }
            </div>
        </>
    );
};

OtpBox.propTypes = {
    length: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default OtpBox;
