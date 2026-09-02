"use client";

import dynamic from "next/dynamic";

const ResetPasswordComponent = dynamic(() => import("@/components/resetPassword/ResetPw"), { ssr: false });

export default function ResetPasswordPage() {
  return <ResetPasswordComponent />;
}
