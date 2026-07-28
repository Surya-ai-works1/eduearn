"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { Finance } from "../../../components/tutor/Finance";
import { motion } from "framer-motion";

export default function TutorWalletPage() {
  const {
    earningsBalanceState,
    withdrawalsState,
    withdrawForm,
    setWithdrawForm,
    handleWithdrawalRequest,
  } = useTutor();

  return (
    <motion.div
      key="finance"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Finance
        earningsBalance={earningsBalanceState}
        withdrawalsState={withdrawalsState}
        withdrawForm={withdrawForm}
        setWithdrawForm={setWithdrawForm}
        handleWithdrawalRequest={handleWithdrawalRequest}
      />
    </motion.div>
  );
}
