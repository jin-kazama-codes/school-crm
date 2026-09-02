/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { createContext, useState, useMemo } from "react";
import { Hidden, createTheme } from "@mui/material";

// color design tokens
export const tokens = (mode) => ({
    ...(mode === 'dark'
        ? {
            whiteAccent: {
                100: "#ffffff",
                200: "#fafafa",
                300: "#f5f5f5",
                400: "#f0f0f0",
                500: "#eaeaea",
                600: "#e0e0e0",
                700: "#d6d6d6",
                800: "#cccccc",
                900: "#000000"
            },            
            grey: {
                100: "#e0e0e0",
                200: "#c2c2c2",
                300: "#a3a3a3",
                400: "#858585",
                500: "#666666",
                600: "#525252",
                700: "#3d3d3d",
                800: "#292929",
                900: "#141414"
            },
            primary: {
                100: "#d0d1d5",
                200: "#a1a4ab",
                300: "#727681",
                400: "#1f2a40",
                500: "#141b2d",
                600: "#101624",
                700: "#0c101b",
                800: "#080b12",
                900: "#040509"
            },
            greenAccent: {
                100: "#dbf5ee",
                200: "#b7ebde",
                300: "#94e2cd",
                400: "#70d8bd",
                500: "#4cceac",
                600: "#3da58a",
                700: "#00e272",
                800: "#008000",
                900: "#0f2922",
                1000: "#44ff00"
            },
            redAccent: {
                100: "#880e4f",
                200: "#b71c1c",
                300: "#d32f2f",
                400: "#c62828",
                500: "#e57373",
                600: "#f44336",
                700: "#ff725e",
                800: "#ff9a8b",
                900: "#ffcdd2"
            },
            blueAccent: {
                100: "#e1e2fe",
                200: "#6b8ffa",
                300: "#a4a9fc",
                400: "#868dfb",
                500: "#6870fa",
                600: "#535ac8",
                700: "#3399fe",
                800: "#2a2d64",
                900: "#151632"
            },
            yellowAccent: {
                100: "#feefd0",
                200: "#fce0a1",
                300: "#fbd072",
                400: "#f9c143",
                500: "#f8b114",
                600: "#c68e10",
                700: "#956a0c",
                800: "#634708",
                900: "#322304"
            },
            orangeAccent: {
                100: "#ffebd2",
                200: "#ffd6a4",
                300: "#ffc277",
                400: "#ffad49",
                500: "#ff991c",
                600: "#cc7a16",
                700: "#995c11",
                800: "#663d0b",
                900: "#331f06"
            },

        } : {
            whiteAccent: {
                100: "#000000",
                200: "#cccccc",
                300: "#d6d6d6",
                400: "#e0e0e0",
                500: "#eaeaea",
                600: "#f0f0f0",
                700: "#f5f5f5",
                800: "#fafafa",
                900: "#ffffff"
            },
            grey: {
                100: "#141414",
                200: "#292929",
                300: "#3d3d3d",
                400: "#525252",
                500: "#666666",
                600: "#858585",
                700: "#a3a3a3",
                800: "#c2c2c2",
                900: "#e0e0e0"
            },
            primary: {
                100: "#040509",
                200: "#080b12",
                300: "#0c101b",
                400: "#f2f0f0",
                500: "#141b2d",
                600: "#434957",
                700: "#727681",
                800: "#a1a4ab",
                900: "#d0d1d5"
            },
            greenAccent: {
                100: "#0f2922",
                200: "#1e5245",
                300: "#008000",
                400: "#00e272",
                500: "#4cceac",
                600: "#70d8bd",
                700: "#00e272",
                800: "#b7ebde",
                900: "#dbf5ee",
                1000: "#133d04"
            },
            redAccent: {
                100: "#ffcdd2",
                200: "#ff9a8b",
                300: "#ff725e",
                400: "#f44336",
                500: "#e57373",
                600: "#c62828",
                700: "#d32f2f",
                800: "#b71c1c",
                900: "#880e4f"
            },
            blueAccent: {
                100: "#151632",
                200: "#2a2d64",
                300: "#3e4396",
                400: "#535ac8",
                500: "#6870fa",
                600: "#868dfb",
                700: "#3399fe",
                800: "#6b8ffa",
                900: "#e1e2fe"
            },
            yellowAccent: {
                100: "#322304",
                200: "#634708",
                300: "#956a0c",
                400: "#c68e10",
                500: "#f8b114",
                600: "#f9c143",
                700: "#fbd072",
                800: "#fce0a1",
                900: "#feefd0"
            },
            orangeAccent: {
                100: "#331f06",
                200: "#663d0b",
                300: "#995c11",
                400: "#cc7a16",
                500: "#ff991c",
                600: "#ffad49",
                700: "#ffc277",
                800: "#ffd6a4",
                900: "#ffebd2"
            },
        })
});


//mui Theme Settings
export const themeSettings = (mode) => {
    const colors = tokens(mode);

    return {
        palette: {
            mode: mode,
            ...(mode === "dark"
                ? {
                    primary: {
                        main: colors.primary[500]
                    },
                    secondary: {
                        main: colors.greenAccent[500]
                    },
                    neutral: {
                        dark: colors.grey[700],
                        main: colors.grey[500],
                        light: colors.grey[100]
                    },
                    background: {
                        default: colors.primary[500]
                    }
                } : {
                    primary: {
                        main: colors.primary[100]
                    },
                    secondary: {
                        main: colors.greenAccent[500]
                    },
                    neutral: {
                        dark: colors.grey[700],
                        main: colors.grey[500],
                        light: colors.grey[100]
                    },
                    background: {
                        default: "#fcfcfc"
                    }
                }
            )
        },
        components: {
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '--TextField-brandBorderColor': mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        '--TextField-brandBorderHoverColor': mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        '--TextField-brandBorderFocusedColor': mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        '& label.Mui-focused': {
                            color: mode === 'light' ? 'var(--TextField-brandBorderFocusedColor)' : 'white',
                        },
                        '& label.MuiFormLabel-root': {
                            color: mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        },
                        '& label.MuiInputLabel-root': {
                            color: mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        },
                        '& .MuiFilledInput-root':{
                            backdropFilter:"blur(5px)",
                            boxShadow: "1px 1px 10px rgba(0, 0, 0,0.2)",
                            borderRadius:'10px'
                        }
                    },
                },
            },
            MuiFormControl: {
                styleOverrides: {
                    root: {
                        '--InputLabel-brandBorderColor': mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        '--InputLabel-brandBorderHoverColor': mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        '--InputLabel-brandBorderFocusedColor': mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        '& label.Mui-focused': {
                          color: mode === 'light' ? 'var(--InputLabel-brandBorderFocusedColor)' : 'white',
                        },
                        '& .MuiFormLabel-root': {
                          color: mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        },
                        '& .MuiInputLabel-root': {
                          color: mode === 'light' ? 'rgb(134, 14, 14)' : 'white',
                        },
                       
                        '& .MuiFilledInput-root':{
                            backdropFilter:"blur(5px)",
                            boxShadow: "1px 1px 10px rgba(0, 0, 0, 0.2)",
                            borderRadius:'10px'
                        }
                    },
                },
            }
        },
        typography: {
            fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
            fontSize: 12,
            h1: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 40,
            },
            h2: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 32,
            },
            h3: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 18,
            },
            h4: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 20,
            },
            h5: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 16,
            },
            h6: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 14,
            },
        }
    };
};

//Context for Color Mode
export const ColorModeContext = createContext({
    toggleColorMode: () => { }
});

export const useMode = () => {
    const [mode, setMode] = useState("light");

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode(prev => (prev === "light" ? "dark" : "light"));
            }
        }), []);

    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

    return [theme, colorMode];
};
