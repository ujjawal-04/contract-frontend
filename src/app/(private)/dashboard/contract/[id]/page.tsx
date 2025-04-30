"use client";

import { useParams } from "next/navigation";
import ContractResults from "./_components/contract-results";

export default function ContractPage() {
  // Use the useParams hook to get the id parameter from the URL
  const params = useParams();
  const id = params.id as string;
  
  return (
    <ContractResults contractId={id} />
  );
}