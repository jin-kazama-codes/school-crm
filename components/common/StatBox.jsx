/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";

import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase, role, showPercentage }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:480px)");

  const textShadowColor = theme.palette.mode == "light" ? "white" : "black";

  return (
    <Box sx={{ width: "100%", m: isMobile ? "0px" : "0 30px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          {icon}
          <Typography
            variant={isMobile ? "h6" : "h4"}
            fontWeight="900"
            sx={{
              textShadow: `-2px 0 ${textShadowColor}, 0 2px ${textShadowColor}, 2px 0 ${textShadowColor}, 0 -2px ${textShadowColor}`,
            }}
          >
            {title}
          </Typography>
        </Box>
        <Box>{role !== 1 && showPercentage && <ProgressCircle progress={progress} />}</Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: "2px" }}>
        <Typography
          fontWeight="900"
          variant={isMobile ? "h6" : "h4"}
          sx={{
            textShadow: `-2px 0 ${textShadowColor}, 0 2px ${textShadowColor}, 2px 0 ${textShadowColor}, 0 -2px ${textShadowColor}`,
          }}
        >
          {subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : ""}
        </Typography>
       {role !== 1 && showPercentage && <Typography
          variant={isMobile ? "h6" : "h5"}
          fontStyle="italic"
          fontWeight="900"
          sx={{
            textShadow: `-2px 0 ${textShadowColor}, 0 2px ${textShadowColor}, 2px 0 ${textShadowColor}, 0 -2px ${textShadowColor}`,
          }}
        >
          {increase}
        </Typography>}
      </Box>
    </Box>
  );
};

StatBox.propTypes = {
  title: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.string]),
  subtitle: PropTypes.string,
  icon: PropTypes.object,
  increase: PropTypes.string,
  progress: PropTypes.string,
  role: PropTypes.number,
  showPercentage: PropTypes.bool
};

export default StatBox;
