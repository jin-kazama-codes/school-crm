import PropTypes from "prop-types";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase, role, showPercentage, color }) => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-2 drop-shadow-md">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-2">
            {icon}
          </div>
          <h4 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            {title}
          </h4>
        </div>
        <div>
          {role !== 1 && showPercentage && <ProgressCircle progress={progress} />}
        </div>
      </div>
      <div className="flex justify-between items-end mt-4">
        <h5 className="text-lg md:text-xl font-bold text-emerald-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] capitalize">
          {subtitle}
        </h5>
        {role !== 1 && showPercentage && (
          <p className="text-sm md:text-base italic font-bold text-emerald-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {increase}
          </p>
        )}
      </div>
    </div>
  );
};

StatBox.propTypes = {
  title: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.string]),
  subtitle: PropTypes.string,
  icon: PropTypes.object,
  increase: PropTypes.string,
  progress: PropTypes.string,
  role: PropTypes.number,
  showPercentage: PropTypes.bool,
  color: PropTypes.string
};

export default StatBox;
