import PropTypes from "prop-types";

export default function ProgressCircle({ progress = "0" }) {
    const value = parseFloat(progress) * 100; // converting 0.5 to 50%
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90">
                <circle
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="20"
                    cy="20"
                />
                <circle
                    className="text-emerald-500 transition-all duration-1000 ease-in-out"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="20"
                    cy="20"
                />
            </svg>
        </div>
    );
}

ProgressCircle.propTypes = {
    progress: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ])
};
