/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import PropTypes from 'prop-types';

export const multipleSkeletons = () => {
  return (
    <div className="h-max flex flex-col gap-6 p-4">
      {[...Array(6)].map((_, index) => {
        if (index % 2) {
          return <LoadingSkeleton key={index} width="max-w-[600px]" height="h-5" />;
        } else {
          return <LoadingSkeleton key={index} width="max-w-[500px]" height="h-5" />;
        }
      })}
    </div>
  );
};

export const LoadingSkeleton = ({ variant, animation, height, width }) => {
  // Translate possible MUI string widths/heights to style or classes
  const style = {};
  const className = [
    "bg-slate-200 dark:bg-slate-700/50 rounded",
    animation !== 'false' ? "animate-pulse" : "",
    variant === "circular" ? "rounded-full" : "rounded-md",
    typeof width === 'string' && width.includes('-') ? width : '',
    typeof height === 'string' && height.includes('h-') ? height : ''
  ].filter(Boolean).join(" ");

  if (typeof width === 'number') style.width = `${width}px`;
  if (typeof height === 'number') style.height = `${height}px`;

  return (
    <div className={`my-3 mx-2 ${className}`} style={style} />
  );
};

LoadingSkeleton.propTypes = {
  variant: PropTypes.string, 
  animation: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), 
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), 
};
