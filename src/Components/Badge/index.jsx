import { PropTypes } from 'prop-types';

const Badge = (props) => {
    return (
        <span
            className={`flex items-center justify-center py-1 px-3 capitalize rounded-full text-sm shadow-md
            ${props.status === "pending" ? "bg-[var(--bg-primary)] text-white" : ""}
            ${props.status === "approved" ? "bg-green-500 text-white" : ""}
            ${props.status === "rejected" ? "bg-red-500 text-white" : ""}
            ${!["pending", "approved", "rejected"].includes(props.status) ? "bg-gray-300 text-gray-700" : ""}
        `}
        >
            {props.status}
        </span>

    )
}

Badge.propTypes = {
    status: PropTypes.string.isRequired,
};

export default Badge
