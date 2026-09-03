import * as React from 'react';
import PropTypes from "prop-types";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

const Toast = ({
    alerting,
    message,
    severity
}) => {
    const [open, setOpen] = React.useState(alerting);

    React.useEffect(() => {
        setOpen(alerting);
        if (alerting) {
            const timer = setTimeout(() => {
                setOpen(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [alerting]);

    const handleClose = () => {
        setOpen(false);
    };

    if (!open) return null;

    const severityConfig = {
        success: {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-50" />,
            bg: "bg-emerald-600",
            border: "border-emerald-700"
        },
        error: {
            icon: <AlertCircle className="w-5 h-5 text-red-50" />,
            bg: "bg-red-600",
            border: "border-red-700"
        },
        info: {
            icon: <Info className="w-5 h-5 text-blue-50" />,
            bg: "bg-blue-600",
            border: "border-blue-700"
        },
        warning: {
            icon: <AlertTriangle className="w-5 h-5 text-yellow-50" />,
            bg: "bg-yellow-600",
            border: "border-yellow-700"
        },
    };

    const config = severityConfig[severity] || severityConfig.info;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-5 fade-in duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${config.bg} ${config.border} text-white min-w-[300px] max-w-[90vw]`}>
                {config.icon}
                <p className="flex-1 text-sm font-medium pr-4">{message}</p>
                <button 
                    onClick={handleClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="close"
                >
                    <X className="w-4 h-4 text-white/90" />
                </button>
            </div>
        </div>
    );
};

Toast.propTypes = {
    alerting: PropTypes.bool,
    message: PropTypes.string,
    severity: PropTypes.string
};

export default Toast;
