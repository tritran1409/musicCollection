import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import LessonFilter from "../lessonFilter/LessonFilter";
import styles from "../../globals/styles/lessonList.module.css";
import { useFetcherWithReset } from "../../hooks/useFetcherWithReset";
import useLessonFilter from "../../hooks/useLessonFilter";
import Pagination from "../pagination/Pagination";
import { usePermissions } from "../../hooks/usePermissions";
import { useFileDownload } from "../../hooks/useDownloadFile";
import { useDocumentExport } from "../../hooks/useDownloadDoc";
import JSZip from "jszip";

export default function LessonSearchView({
    lessons,
    extraData,
    classId = null,
    disabledFilters = [],
    pageName = "🔍 Tìm kiếm bài giảng",
    showAddButton = false,
    filterKey = "lesson-search"
}) {
    const navigate = useNavigate();
    const fetcher = useFetcherWithReset();
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [expandedLessons, setExpandedLessons] = useState(new Set());
    const [expandedSections, setExpandedSections] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);
    const [downloadingLesson, setDownloadingLesson] = useState(null);
    const permissions = usePermissions();
    const { downloadFile, downloading } = useFileDownload();
    const { downloadPDF, downloadWord, downloadingPdf, downloadingWord } = useDocumentExport();

    const initialFilters = {
        searchText: '',
        dateRange: 'all',
        dateFrom: '',
        dateTo: '',
        sortBy: 'createdAt-desc',
        owner: extraData?.owner || '',
    };

    const {
        documents: filteredLessons,
        filtering,
        filter,
        resetFilters,
        activeFilters,
        hasActiveFilters,
        activeFilterCount,
        pagination,
        goToPage,
        nextPage,
        previousPage,
        changeLimit,
    } = useLessonFilter(
        { documents: lessons, total: lessons.length },
        '/api/lesson/filter',
        1,
        20,
        initialFilters,
        `${filterKey}-${classId || 'all'}-${extraData?.owner || ''}`
    );

    const handleLessonClick = (lesson) => {
        setSelectedItem(lesson);
        setSelectedType("lesson");
    };

    const handleItemClick = (e, item, lesson) => {
        e.stopPropagation();
        const _item = { ...item, parentLesson: lesson, classId: lesson.classId };
        setSelectedItem(_item);
        setSelectedType(item._type || (item.content ? "document" : "file"));
    };

    const handleCloseDetail = () => {
        setSelectedItem(null);
        setSelectedType(null);
    };

    const toggleExpand = (e, lessonId) => {
        e.stopPropagation();
        setExpandedLessons((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(lessonId)) newSet.delete(lessonId);
            else newSet.add(lessonId);
            return newSet;
        });
    };

    const isExpanded = (lessonId) => expandedLessons.has(lessonId);

    const toggleSection = (e, lessonId, section) => {
        e.stopPropagation();
        setExpandedSections(prev => ({
            ...prev,
            [`${lessonId}-${section}`]: !prev[`${lessonId}-${section}`]
        }));
    };

    const isSectionExpanded = (lessonId, section) => {
        return expandedSections[`${lessonId}-${section}`] !== false;
    };

    const formatFileSize = (bytes) => {
        if (!bytes && bytes !== 0) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const getFileExtension = (filename) => {
        if (!filename) return "";
        const parts = filename.split(".");
        return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
    };

    const isMediaFile = (type) => {
        return type === "video" || type === "audio" || type === "image";
    };

    const getFileTypeLabel = (type) => {
        const labels = {
            video: "Video",
            audio: "Audio",
            image: "Hình ảnh",
            raw: "Tài liệu",
        };
        return labels[type] || "Không xác định";
    };

    const getFileIcon = (type) => {
        const icons = {
            video: "🎥",
            audio: "🎵",
            image: "🖼️",
            raw: "📄",
        };
        return icons[type] || "📄";
    };

    const handleDownloadFile = () => {
        if (selectedItem && (selectedItem.url || selectedItem.downloadUrl)) {
            downloadFile(selectedItem);
        } else {
            toast.error("Không có file để tải");
        }
    };

    const handleViewFile = () => {
        if (selectedItem && selectedItem.url) {
            window.open(selectedItem.url, "_blank");
        } else {
            toast.error("Không có file để xem");
        }
    };

    const handleEditLesson = (e, lessonId) => {
        e.stopPropagation();
        navigate(`/bang-dieu-khien/chuong-trinh-hoc/bai-giang/edit/${lessonId}`);
    };

    const handleDeleteClick = (e, lesson) => {
        e.stopPropagation();
        setLessonToDelete(lesson);
        setShowDeleteModal(true);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setLessonToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!lessonToDelete) return;
        const formData = new FormData();
        formData.append("lessonId", lessonToDelete.id);
        formData.append("intent", "delete");
        fetcher.submit(formData, {
            action: "/api/lesson",
            method: "post",
        });
    };

    const handleDownloadLessonFiles = async (e, lesson) => {
        e.stopPropagation();
        const files = lesson.files || [];
        const documents = lesson.documents || [];

        if (files.length === 0 && documents.length === 0) {
            toast.error("Bài giảng này không có file hoặc tài liệu nào để tải");
            return;
        }

        setDownloadingLesson(lesson.id);
        const toastId = toast.loading("Đang chuẩn bị tải xuống...");

        try {
            const zip = new JSZip();
            let successCount = 0;
            let failCount = 0;

            const filePromises = files.map(async (file, index) => {
                try {
                    const url = file.downloadUrl || file.url;
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`Failed to fetch ${file.name || file.filename}`);
                    const blob = await response.blob();

                    let finalFilename = file.filename || file.name;
                    if (!finalFilename) {
                        const extension = blob.type ? blob.type.split("/")[1] : "bin";
                        finalFilename = `file_${index + 1}.${extension}`;
                    }

                    let uniqueFilename = finalFilename;
                    let counter = 1;
                    while (zip.file(uniqueFilename)) {
                        const parts = finalFilename.split(".");
                        if (parts.length > 1) {
                            const ext = parts.pop();
                            const nameWithoutExt = parts.join(".");
                            uniqueFilename = `${nameWithoutExt}_${counter}.${ext}`;
                        } else {
                            uniqueFilename = `${finalFilename}_${counter}`;
                        }
                        counter++;
                    }

                    zip.file(uniqueFilename, blob);
                    successCount++;
                    return true;
                } catch (error) {
                    console.error(`Error downloading file ${file.name || file.filename}:`, error);
                    failCount++;
                    return false;
                }
            });

            const documentPromises = documents.map(async (doc, index) => {
                try {
                    const response = await fetch(`/api/document/word/${doc.id}`);
                    if (!response.ok) throw new Error(`Failed to export document ${doc.title}`);
                    const blob = await response.blob();

                    let filename = doc.title || `document_${index + 1}`;
                    filename = filename.replace(/[^a-z0-9_\-\s]/gi, "_");
                    filename = `${filename}.docx`;

                    let uniqueFilename = filename;
                    let counter = 1;
                    while (zip.file(uniqueFilename)) {
                        const nameWithoutExt = filename.replace('.docx', '');
                        uniqueFilename = `${nameWithoutExt}_${counter}.docx`;
                        counter++;
                    }

                    zip.file(uniqueFilename, blob);
                    successCount++;
                    return true;
                } catch (error) {
                    console.error(`Error exporting document ${doc.title}:`, error);
                    failCount++;
                    return false;
                }
            });

            await Promise.all([...filePromises, ...documentPromises]);

            if (successCount === 0) {
                throw new Error("Không thể tải xuống bất kỳ file hoặc tài liệu nào");
            }

            toast.loading(`Đang nén ${successCount} files...`, { id: toastId });

            const zipBlob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 },
            });

            const blobUrl = window.URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = blobUrl;
            a.download = `${lesson.title.replace(/[^a-z0-9]/gi, "_")}_files.zip`;

            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
            }, 100);

            const totalItems = files.length + documents.length;
            const message = failCount > 0
                ? `Đã tải xuống ${successCount}/${totalItems} items (${files.length} files + ${documents.length} tài liệu)`
                : `Đã tải xuống ${successCount} items thành công`;

            toast.success(message, { id: toastId });

        } catch (error) {
            console.error("Error creating ZIP:", error);
            toast.error("Có lỗi xảy ra khi tải xuống", { id: toastId });
        } finally {
            setDownloadingLesson(null);
        }
    };

    const handleViewContent = () => {
        if (!selectedItem) return;
        if (selectedType === "document") {
            navigate(`/bang-dieu-khien/thong-tin-suu-tam/xem/${selectedItem.id}`);
        } else {
            toast.error("Chỉ dành cho tài liệu");
        }
    };

    const handleReset = () => {
        filter(initialFilters);
    };

    useEffect(() => {
        if (fetcher.data) {
            setShowDeleteModal(false);
            setLessonToDelete(null);
            toast.success("Đã xoá bài giảng");
            fetcher.reset();
        }
    }, [fetcher.data]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.leftPanel}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{pageName}</h1>
                </div>

                <LessonFilter
                    activeFilters={activeFilters}
                    onFilterChange={filter}
                    onReset={handleReset}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    isLoading={filtering}
                    disabledFilters={disabledFilters}
                />

                {filteredLessons.length > 0 && (
                    <div className={styles.paginationInfo}>
                        Hiển thị {pagination.startIndex}-{pagination.endIndex} / {pagination.total} bài giảng
                        {hasActiveFilters && ` (đã lọc)`}
                    </div>
                )}

                {filtering ? (
                    <div className={styles.loadingState}>
                        🔄 Đang tải dữ liệu...
                    </div>
                ) : (
                    filteredLessons.length > 0 ? (
                        <>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Tên bài giảng</th>
                                            <th>Lớp</th>
                                            <th>Người tạo</th>
                                            <th className={styles.actionCell}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLessons.map((lesson) => {
                                            const files = Array.isArray(lesson.files) ? lesson.files : [];
                                            const documents = Array.isArray(lesson.documents) ? lesson.documents : [];

                                            return (
                                                <React.Fragment key={lesson.id}>
                                                    <tr
                                                        className={`${styles.lessonRow} ${selectedType === "lesson" && selectedItem?.id === lesson.id ? styles.selected : ""}`}
                                                        onClick={(e) => {
                                                            if (e.target.closest(`.${styles.lessonActions}`)) return;
                                                            toggleExpand(e, lesson.id);
                                                            handleLessonClick(lesson);
                                                        }}
                                                    >
                                                        <td>
                                                            <div className={styles.lessonTitleCell}>
                                                                <span
                                                                    className={`${styles.expandIcon} ${isExpanded(lesson.id) ? styles.expanded : ""}`}
                                                                    onClick={(e) => toggleExpand(e, lesson.id)}
                                                                >
                                                                    ▶
                                                                </span>
                                                                {lesson.title}
                                                            </div>
                                                        </td>
                                                        <td>Lớp {lesson.classId}</td>
                                                        <td>{lesson.owner?.name || "—"}</td>
                                                        <td className={styles.actionCell}>
                                                            <div className={styles.lessonActions}>
                                                                <button
                                                                    className={`${styles.actionIcon} ${styles.downloadIcon}`}
                                                                    onClick={(e) => handleDownloadLessonFiles(e, lesson)}
                                                                    title="Tải xuống tất cả files"
                                                                    disabled={downloadingLesson === lesson.id || !files || files.length === 0}
                                                                >
                                                                    {downloadingLesson === lesson.id ? "⏳" : "📦"}
                                                                </button>
                                                                {(permissions.isAdmin || permissions.isManager || (permissions.isTeacher && lesson.ownerId === permissions.userId)) && (
                                                                    <>
                                                                        <button
                                                                            className={`${styles.actionIcon} ${styles.editIcon}`}
                                                                            onClick={(e) => handleEditLesson(e, lesson.id)}
                                                                            title="Chỉnh sửa"
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                        <button
                                                                            className={`${styles.actionIcon} ${styles.deleteIcon}`}
                                                                            onClick={(e) => handleDeleteClick(e, lesson)}
                                                                            title="Xóa"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {isExpanded(lesson.id) && (
                                                        <>
                                                            <tr className={styles.sectionLabelRow}>
                                                                <td
                                                                    colSpan="4"
                                                                    className={styles.sectionLabel}
                                                                    onClick={(e) => toggleSection(e, lesson.id, 'documents')}
                                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                                >
                                                                    <span className={`${styles.expandIcon} ${isSectionExpanded(lesson.id, 'documents') ? styles.expanded : ""}`}>
                                                                        ▶
                                                                    </span>
                                                                    📄 Tài liệu ({documents.length})
                                                                </td>
                                                            </tr>

                                                            {isSectionExpanded(lesson.id, 'documents') && (documents && documents.length > 0 ? (
                                                                documents.map((doc, idx) => (
                                                                    <tr
                                                                        key={`${lesson.id}-doc-${doc.id || idx}`}
                                                                        className={`${styles.fileRow} ${selectedType === "document" && selectedItem?.id === doc.id ? styles.selected : ""}`}
                                                                        onClick={(e) => handleItemClick(e, { ...doc, _type: "document" }, lesson)}
                                                                    >
                                                                        <td>📄 {doc.title}</td>
                                                                        <td colSpan="2">{doc.ownerName || doc.owner?.name || "—"}</td>
                                                                        <td></td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr className={styles.fileRow}>
                                                                    <td colSpan="4" className={styles.noFiles}>
                                                                        Không có tài liệu
                                                                    </td>
                                                                </tr>
                                                            ))}

                                                            <tr className={styles.sectionLabelRow}>
                                                                <td
                                                                    colSpan="4"
                                                                    className={styles.sectionLabel}
                                                                    onClick={(e) => toggleSection(e, lesson.id, 'files')}
                                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                                >
                                                                    <span className={`${styles.expandIcon} ${isSectionExpanded(lesson.id, 'files') ? styles.expanded : ""}`}>
                                                                        ▶
                                                                    </span>
                                                                    📂 Files đính kèm ({files.length})
                                                                </td>
                                                            </tr>

                                                            {isSectionExpanded(lesson.id, 'files') && (files && files.length > 0 ? (
                                                                files.map((file, idx) => (
                                                                    <tr
                                                                        key={`${lesson.id}-file-${file.id || idx}`}
                                                                        className={`${styles.fileRow} ${selectedType === "file" && selectedItem?.id === file.id ? styles.selected : ""}`}
                                                                        onClick={(e) => handleItemClick(e, { ...file, _type: "file" }, lesson)}
                                                                    >
                                                                        <td>
                                                                            {getFileIcon(file.type)} {file.name || file.title || file.filename}
                                                                        </td>
                                                                        <td colSpan="2">{formatFileSize(file.size)}</td>
                                                                        <td></td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr className={styles.fileRow}>
                                                                    <td colSpan="4" className={styles.noFiles}>
                                                                        Không có file nào
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {pagination.totalPages > 1 && (
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    totalItems={pagination.total}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={goToPage}
                                    onLimitChange={changeLimit}
                                    isLoading={filtering}
                                    showLimitSelector={true}
                                    showPageInfo={true}
                                    showItemInfo={true}
                                    limitOptions={[10, 20, 50, 100]}
                                    maxPageButtons={5}
                                />
                            )}
                        </>
                    ) : (
                        <div className={styles.emptyList}>
                            <p>🔍 Không tìm thấy bài giảng phù hợp với bộ lọc</p>
                        </div>
                    )
                )}
            </div>

            {/* Right panel - Details (similar to lessons.jsx) */}
            <div className={`${styles.rightPanel} ${!selectedItem ? styles.hidden : ""}`}>
                {selectedItem ? (
                    <div className={styles.emptyState}>Chi tiết bài giảng (TODO: implement detail view)</div>
                ) : (
                    <div className={styles.emptyState}>Chọn một bài giảng để xem chi tiết</div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && lessonToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={styles.deleteModal}>
                        <div className={styles.deleteModalHeader}>
                            <span className={styles.deleteModalIcon}>⚠️</span>
                            <h3 className={styles.deleteModalTitle}>Xác nhận xóa bài giảng</h3>
                        </div>
                        <p className={styles.deleteModalMessage}>Bạn có chắc chắn muốn xóa bài giảng này không?</p>
                        <div className={styles.deleteModalLessonName}>{lessonToDelete.title}</div>
                        <div className={styles.deleteModalWarning}>
                            ⚠️ Hành động này không thể hoàn tác. Tất cả các file và dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                        </div>
                        <div className={styles.deleteModalActions}>
                            <button className={styles.cancelButton} onClick={handleCancelDelete} disabled={fetcher.state === "submitting"}>
                                Hủy
                            </button>
                            <button className={styles.confirmDeleteButton} onClick={handleConfirmDelete} disabled={fetcher.state === "submitting"}>
                                {fetcher.state === "submitting" ? "Đang xóa..." : "Xác nhận xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
