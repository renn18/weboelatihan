"use client";

import { FC, useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiUserCheck, FiLoader } from "react-icons/fi";

type InstructorToggleProps = {
    /** Apakah user saat ini sedang di halaman instructor */
    isInstructorPage: boolean;
    /** Optional: path halaman instructor */
    instructorPath?: string;
    /** Optional: path halaman normal/user */
    studentPath?: string;
};

export const InstructorToggle: FC<InstructorToggleProps> = ({
    isInstructorPage,
    instructorPath = "/instructor",
    studentPath = "/dashboard",
}) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleToggle = useCallback(async () => {
        const targetPath = isInstructorPage ? studentPath : instructorPath;
        const action = isInstructorPage ? "student" : "instructor";

        setIsModalOpen(true);
    }, [isInstructorPage, instructorPath, studentPath]);

    const confirmToggle = useCallback(async () => {
        const targetPath = isInstructorPage ? studentPath : instructorPath;

        startTransition(async () => {
            // Simulasi loading async operation
            await new Promise((resolve) => setTimeout(resolve, 800));

            router.push(targetPath);
            setIsModalOpen(false);
        });
    }, [isInstructorPage, instructorPath, studentPath, router, startTransition]);

    return (
        <>
            <button
                type="button"
                onClick={handleToggle}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                {isPending ? (
                    <>
                        <FiLoader className="h-4 w-4 animate-spin" />
                        Memproses...
                    </>
                ) : isInstructorPage ? (
                    <>
                        <FiUser className="h-4 w-4" />
                        Halaman Siswa
                    </>
                ) : (
                    <>
                        <FiUserCheck className="h-4 w-4" />
                        Halaman Instructor
                    </>
                )}
            </button>

            {/* Modal Confirmation */}
            {isModalOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
                        aria-hidden="true"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl transition-all">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Konfirmasi Perpindahan
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Apakah Anda yakin ingin beralih ke{" "}
                                    <span className="font-medium">
                                        {isInstructorPage ? "halaman siswa" : "halaman instructor"}
                                    </span>
                                    ?
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmToggle}
                                    disabled={isPending}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {isPending ? (
                                        <>
                                            <FiLoader className="h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        "Ya, Lanjutkan"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
