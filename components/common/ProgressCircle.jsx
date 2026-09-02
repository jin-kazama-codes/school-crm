/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import PropTypes from "prop-types";
import Box from '@mui/material/Box';
import CircularProgress, {
    circularProgressClasses,
} from '@mui/material/CircularProgress';

function FacebookCircularProgress({ progress }) {
    return (
        <Box sx={{ position: 'relative' }}>
            <CircularProgress
                variant="determinate"
                sx={{
                    color: (theme) =>
                        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
                }}
                size={40}
                thickness={4}
                value={100}
            />
            <CircularProgress
                variant="determinate"
                sx={{
                    color: (theme) => (theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8'),
                    position: 'absolute',
                    left: 0,
                    [`& .${circularProgressClasses.circle}`]: {
                        strokeLinecap: 'round',
                    },
                }}
                size={40}
                thickness={4}
                value={parseFloat(progress)}
            />
        </Box>
    );
}

FacebookCircularProgress.propTypes = {
    progress: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ])
};

ProgressCircle.propTypes = {
    progress: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ])
};

export default function ProgressCircle({ progress }) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <FacebookCircularProgress progress={progress} />
        </Box>
    );
}


