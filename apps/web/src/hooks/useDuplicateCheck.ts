import { useState, useCallback } from "react";
import type { Volunteer } from "@/types";

interface DuplicateCheckResult {
	isDuplicate: boolean;
	duplicateField?: "phone" | "idNumber";
	existingVolunteer?: Volunteer;
}

export function useDuplicateCheck(volunteers: Volunteer[]) {
	const [checkResult, setCheckResult] = useState<DuplicateCheckResult | null>(
		null,
	);

	const checkDuplicate = useCallback(
		(phone: string, idNumber: string): DuplicateCheckResult => {
			// 检查手机号重复
			const phoneExists = volunteers.find((v) => v.phone === phone);
			if (phoneExists) {
				const result = {
					isDuplicate: true,
					duplicateField: "phone" as const,
					existingVolunteer: phoneExists,
				};
				setCheckResult(result);
				return result;
			}

			// 检查身份证号重复
			const idExists = volunteers.find((v) => v.idNumber === idNumber);
			if (idExists) {
				const result = {
					isDuplicate: true,
					duplicateField: "idNumber" as const,
					existingVolunteer: idExists,
				};
				setCheckResult(result);
				return result;
			}

			const result = { isDuplicate: false };
			setCheckResult(result);
			return result;
		},
		[volunteers],
	);

	const clearCheck = useCallback(() => {
		setCheckResult(null);
	}, []);

	return {
		checkDuplicate,
		checkResult,
		clearCheck,
	};
}
