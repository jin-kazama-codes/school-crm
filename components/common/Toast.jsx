import * as React from 'react';
import PropTypes from "prop-types";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

const Toast = ({
    alerting,
    message,
    severity = "info"
}) => {
    const [open, setOpen] = React.useState(alerting);
    const lastSeverityRef = React.useRef(severity);

    React.useEffect(() => {
        if (severity) {
            lastSeverityRef.current = severity;
        }
        setOpen(alerting);
        if (alerting) {
            const timer = setTimeout(() => {
                setOpen(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [alerting, severity]);

    const handleClose = () => {
        setOpen(false);
    };

    if (!open || !alerting || !message || typeof message !== "string" || !message.trim()) {
        return null;
    }

    const currentSeverity = severity || lastSeverityRef.current || "info";

    const severityConfig = {
        success: {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-50 shrink-0" />,
            bg: "bg-emerald-600",
            border: "border-emerald-700"
        },
        error: {
            icon: <AlertCircle className="w-5 h-5 text-red-50 shrink-0" />,
            bg: "bg-red-600",
            border: "border-red-700"
        },
        info: {
            icon: <Info className="w-5 h-5 text-blue-50 shrink-0" />,
            bg: "bg-blue-600",
            border: "border-blue-700"
        },
        warning: {
            icon: <AlertTriangle className="w-5 h-5 text-yellow-50 shrink-0" />,
            bg: "bg-yellow-600",
            border: "border-yellow-700"
        },
    };

    const config = severityConfig[currentSeverity] || severityConfig.info;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-5 fade-in duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${config.bg} ${config.border} text-white min-w-[300px] max-w-[90vw]`}>
                {config.icon}
                <p className="flex-1 text-sm font-medium pr-4">{message}</p>
                <button 
                    onClick={handleClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
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
