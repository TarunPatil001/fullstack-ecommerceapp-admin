
const ProgressBar = (props) => {
    return (
        <div className="w-full h-auto bg-[#f4f4f4] rounded-full overflow-hidden shadow">
            <span
                className={`flex items-center h-[8px] rounded-full ${props.type === "success" && "bg-green-600"} ${props.type === "error" && "bg-pink-600"} ${props.type === "warning" && "bg-orange-400"}`}
                style={{ width: `${props.value}%` }} // Dynamically set the width
            ></span>
        </div>
    )
}

export default ProgressBar
