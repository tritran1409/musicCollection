import { AnimatePresence, motion } from "framer-motion";
import { Book, Check, FileText, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDocumentExport } from "../../hooks/useDownloadDoc";
import useDocumentFilter from "../../hooks/useFilterDoc";
import DocumentFilterAdvanced from "../documentFilter/DocumentFilter";
import pickerStyles from "./DocumentPicker.module.css";

/**
 * DocumentPicker - Component để chọn tài liệu văn học với detail panel
 * @param {Array} selectedDocuments - Danh sách documents đã chọn
 * @param {Function} onSelectDocuments - Callback khi chọn documents
 * @param {boolean} multiple - Cho phép chọn nhiều (mặc định: false)
 * @param {string} categoryId - Lọc theo category (optional)
 * @param {number} classMate - Lọc theo lớp (optional)
 */
export default function DocumentPicker({
    selectedDocuments = [],
    onSelectDocuments,
    multiple = false,
    categoryId = null,
    classMate = null
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingDocument, setViewingDocument] = useState(null); // Document đang xem chi tiết

    // Khởi tạo filter
    const initialFilters = useMemo(() => {
        const filters = {
            searchText: '',
            categoryId: categoryId || '',
            dateRange: 'all',
            dateFrom: '',
            dateTo: '',
            sortBy: 'createdAt-desc',
            owner: '',
            tags: [],
        };
        return filters;
    }, [categoryId, classMate]);
    const { downloadPDF, downloadWord, downloadingPdf, downloadingWord } = useDocumentExport();
    const handleViewContent = () => {
        if (viewingDocument) {
            window.open(
                `/bang-dieu-khien/thong-tin-suu-tam/xem/${viewingDocument.id}`,
                "_blank"
            );
        }
    };
    // Disabled filters
    const disabledFilters = useMemo(() => {
        const disabled = [];
        if (categoryId) disabled.push('category');
        return disabled;
    }, [categoryId]);

    // Sử dụng hook filter
    const {
        documents: filteredDocuments,
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
    } = useDocumentFilter(
        { documents: [], total: 0 },
        '/api/document/filter',
        1,
        20,
        initialFilters,
        `document-picker-${categoryId || 'all'}`
    );

    const handleDocumentClick = (document) => {
        // Hiển thị detail panel
        setViewingDocument(document);
    };

    const handleSelectDocument = (document) => {
        if (multiple) {
            const isSelected = selectedDocuments.some(d => d.id === document.id);
            if (isSelected) {
                onSelectDocuments(selectedDocuments.filter(d => d.id !== document.id));
            } else {
                onSelectDocuments([...selectedDocuments, document]);
            }
        } else {
            // Single select mode
            const isSelected = selectedDocuments.some(d => d.id === document.id);
            if (isSelected) {
                onSelectDocuments([]);
            } else {
                onSelectDocuments([document]);
            }
        }
    };

    const handleConfirm = () => {
        setIsModalOpen(false);
        setViewingDocument(null);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setViewingDocument(null);
    };

    const handleCloseDetail = () => {
        setViewingDocument(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getDocumentIcon = (type) => {
        const icons = {
            'author': '✍️',
            'work': '📖',
            'genre': '🎭',
            'period': '📅',
            'movement': '🌊',
            'theory': '💡'
        };
        return icons[type] || '📄';
    };

    const getDocumentTypeLabel = (type) => {
        const labels = {
            'author': 'Tác giả',
            'work': 'Tác phẩm',
            'genre': 'Thể loại',
            'period': 'Thời kỳ',
            'movement': 'Trào lưu',
            'theory': 'Lý thuyết'
        };
        return labels[type] || 'Tài liệu';
    };

    return (
        <>
            {/* BUTTON MỞ PICKER */}
            <div className={pickerStyles.pickerWrapper}>
                <button
                    type="button"
                    className={pickerStyles.openBtn}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Book size={16} />
                    Chọn tài liệu
                    {selectedDocuments.length > 0 && ` (${selectedDocuments.length})`}
                </button>

                {/* Hiển thị documents đã chọn */}
                {selectedDocuments.length > 0 && (
                    <div className={pickerStyles.selectedList}>
                        {selectedDocuments.map(doc => (
                            <div key={doc.id} className={pickerStyles.selectedItem}>
                                <span className={pickerStyles.selectedIcon}>
                                    {getDocumentIcon(doc.type)}
                                </span>
                                <span className={pickerStyles.selectedName}>{doc.title}</span>
                                <button
                                    type="button"
                                    className={pickerStyles.removeBtn}
                                    onClick={() => onSelectDocuments(selectedDocuments.filter(d => d.id !== doc.id))}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className={pickerStyles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                    >
                        <motion.div
                            className={pickerStyles.modal}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* HEADER FIXED */}
                            <div className={pickerStyles.headerActions}>
                                <h3 className={pickerStyles.modalTitle}>
                                    <Book size={20} />
                                    Chọn tài liệu văn học
                                    {selectedDocuments.length > 0 && ` (${selectedDocuments.length} đã chọn)`}
                                </h3>
                                <div className={pickerStyles.actionButtons}>
                                    <button
                                        type="button"
                                        className={pickerStyles.cancelBtn}
                                        onClick={handleCancel}
                                    >
                                        <X size={16} /> Hủy
                                    </button>
                                    <button
                                        type="button"
                                        className={pickerStyles.confirmBtn}
                                        onClick={handleConfirm}
                                    >
                                        <Check size={16} /> Chọn ({selectedDocuments.length})
                                    </button>
                                </div>
                            </div>

                            {/* CONTENT 2 PANELS */}
                            <div className={pickerStyles.mainContent}>
                                {/* LEFT PANEL - Document List */}
                                <div className={pickerStyles.leftPanel}>
                                    {/* FILTER */}
                                    <div className={pickerStyles.filterSection}>
                                        <DocumentFilterAdvanced
                                            activeFilters={activeFilters}
                                            onFilterChange={filter}
                                            onReset={resetFilters}
                                            hasActiveFilters={hasActiveFilters}
                                            activeFilterCount={activeFilterCount}
                                            isLoading={filtering}
                                            disabledFilters={disabledFilters}
                                        />
                                    </div>

                                    {/* Pagination info */}
                                    {filteredDocuments.length > 0 && (
                                        <div className={pickerStyles.paginationInfo}>
                                            Hiển thị {pagination.startIndex}-{pagination.endIndex} / {pagination.total} tài liệu
                                            {hasActiveFilters && ` (đã lọc)`}
                                        </div>
                                    )}

                                    {/* DOCUMENT LIST */}
                                    {filtering ? (
                                        <div className={pickerStyles.loading}>
                                            🔄 Đang tải dữ liệu...
                                        </div>
                                    ) : filteredDocuments.length === 0 ? (
                                        <div className={pickerStyles.empty}>
                                            <FileText size={48} />
                                            <p>Không tìm thấy tài liệu nào</p>
                                            {hasActiveFilters && (
                                                <button
                                                    type="button"
                                                    className={pickerStyles.resetBtn}
                                                    onClick={resetFilters}
                                                >
                                                    Xóa bộ lọc
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className={pickerStyles.tableContainer}>
                                                <table className={pickerStyles.table}>
                                                    <thead>
                                                        <tr>
                                                            <th className={pickerStyles.checkboxCell}>
                                                                {multiple && (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={filteredDocuments.length > 0 && filteredDocuments.every(doc =>
                                                                            selectedDocuments.some(d => d.id === doc.id)
                                                                        )}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                const newSelected = [...selectedDocuments];
                                                                                filteredDocuments.forEach(doc => {
                                                                                    if (!newSelected.some(d => d.id === doc.id)) {
                                                                                        newSelected.push(doc);
                                                                                    }
                                                                                });
                                                                                onSelectDocuments(newSelected);
                                                                            } else {
                                                                                const filteredIds = filteredDocuments.map(d => d.id);
                                                                                onSelectDocuments(selectedDocuments.filter(d => !filteredIds.includes(d.id)));
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            </th>
                                                            <th>Tiêu đề</th>
                                                            <th>Người tạo</th>
                                                            <th>Ngày tạo</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredDocuments.map((document) => {
                                                            const isSelected = selectedDocuments.some(d => d.id === document.id);
                                                            const isViewing = viewingDocument?.id === document.id;

                                                            return (
                                                                <tr
                                                                    key={document.id}
                                                                    className={`${pickerStyles.documentRow} ${isViewing ? pickerStyles.selectedRow : ''}`}
                                                                    onClick={() => handleDocumentClick(document)}
                                                                >
                                                                    <td
                                                                        className={pickerStyles.checkboxCell}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <input
                                                                            type={multiple ? "checkbox" : "radio"}
                                                                            checked={isSelected}
                                                                            onChange={() => handleSelectDocument(document)}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <div className={pickerStyles.documentTitle}>
                                                                            <span className={pickerStyles.docIcon}>
                                                                                {getDocumentIcon(document.type)}
                                                                            </span>
                                                                            {document.title}
                                                                        </div>
                                                                    </td>
                                                                    <td>{document.ownerName || '—'}</td>
                                                                    <td>{formatDate(document.createdAt)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* PAGINATION */}
                                            {pagination.totalPages > 1 && (
                                                <div className={pickerStyles.pagination}>
                                                    <button
                                                        type="button"
                                                        className={pickerStyles.pageBtn}
                                                        onClick={previousPage}
                                                        disabled={pagination.page === 1 || filtering}
                                                    >
                                                        ← Trước
                                                    </button>

                                                    <span className={pickerStyles.pageInfo}>
                                                        Trang {pagination.page} / {pagination.totalPages}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className={pickerStyles.pageBtn}
                                                        onClick={nextPage}
                                                        disabled={pagination.page === pagination.totalPages || filtering}
                                                    >
                                                        Sau →
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* RIGHT PANEL - Document Detail */}
                                    <AnimatePresence mode="wait">
                                    {viewingDocument ? (
                                        <motion.div
                                            key={viewingDocument.id}
                                            className={pickerStyles.rightPanel}
                                            initial={{ x: 80, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 80, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                        >
                                            <div className={pickerStyles.detailHeader}>
                                                <div>
                                                    <span className={pickerStyles.detailType}>
                                                        {getDocumentIcon(viewingDocument.type)} {getDocumentTypeLabel(viewingDocument.type)}
                                                    </span>
                                                    <h2 className={pickerStyles.detailTitle}>Chi tiết tài liệu</h2>
                                                </div>
                                                <button className={pickerStyles.closeBtn} onClick={handleCloseDetail}>
                                                    ×
                                                </button>
                                            </div>

                                            <div className={pickerStyles.detailContent}>
                                                <div className={pickerStyles.detailSection}>
                                                    <div className={pickerStyles.detailLabel}>Tiêu đề</div>
                                                    <div className={pickerStyles.detailValue}>{viewingDocument.title}</div>
                                                </div>

                                                {viewingDocument.description && (
                                                    <div className={pickerStyles.detailSection}>
                                                        <div className={pickerStyles.detailLabel}>Mô tả</div>
                                                        <div className={pickerStyles.detailValue}>{viewingDocument.description}</div>
                                                    </div>
                                                )}

                                                <div className={pickerStyles.detailSection}>
                                                    <div className={pickerStyles.detailLabel}>Loại tài liệu</div>
                                                    <div className={pickerStyles.detailValue}>
                                                        {getDocumentIcon(viewingDocument.type)} {getDocumentTypeLabel(viewingDocument.type)}
                                                    </div>
                                                </div>

                                                {viewingDocument.classes && viewingDocument.classes.length > 0 && (
                                                    <div className={pickerStyles.detailSection}>
                                                        <div className={pickerStyles.detailLabel}>Áp dụng cho lớp</div>
                                                        <div className={pickerStyles.tagContainer}>
                                                            {viewingDocument.classes.map((classNum, index) => (
                                                                <span key={index} className={pickerStyles.classTag}>
                                                                    Lớp {classNum}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {viewingDocument.tags && viewingDocument.tags.length > 0 && (
                                                    <div className={pickerStyles.detailSection}>
                                                        <div className={pickerStyles.detailLabel}>Tags</div>
                                                        <div className={pickerStyles.tagContainer}>
                                                            {viewingDocument.tags.map((tag, index) => (
                                                                <span key={index} className={pickerStyles.tag}>
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className={pickerStyles.metadataGrid}>
                                                    <div className={pickerStyles.metadataItem}>
                                                        <div className={pickerStyles.metadataLabel}>Người tạo</div>
                                                        <div className={pickerStyles.metadataValue}>
                                                            {viewingDocument.ownerName || '—'}
                                                        </div>
                                                    </div>

                                                    <div className={pickerStyles.metadataItem}>
                                                        <div className={pickerStyles.metadataLabel}>Ngày tạo</div>
                                                        <div className={pickerStyles.metadataValue}>
                                                            {formatDate(viewingDocument.createdAt)}
                                                        </div>
                                                    </div>

                                                    {viewingDocument.updatedAt && (
                                                        <div className={pickerStyles.metadataItem}>
                                                            <div className={pickerStyles.metadataLabel}>Cập nhật</div>
                                                            <div className={pickerStyles.metadataValue}>
                                                                {formatDate(viewingDocument.updatedAt)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {viewingDocument.content && (
                                                    <div className={pickerStyles.contentPreview}>
                                                        <div className={pickerStyles.detailLabel}>Nội dung xem trước</div>
                                                        <div
                                                            className={pickerStyles.contentPreviewBox}
                                                            dangerouslySetInnerHTML={{
                                                                __html: viewingDocument.content.substring(0, 300) + '...'
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Action button */}
                                                <div className={pickerStyles.detailActions}>
                                                    <button
                                                        className={`${pickerStyles.detailActionBtn} ${pickerStyles.editDetailButton}`}
                                                        onClick={() => downloadPDF(viewingDocument.id)}
                                                        disabled={downloadingPdf === viewingDocument.id}
                                                    >
                                                        {downloadingPdf === viewingDocument.id ? ' 🔄 Đang tải...' : ' 📕 Tải về PDF'}
                                                    </button>
                                                    <button
                                                        className={`${pickerStyles.detailActionBtn} ${pickerStyles.editDetailButton}`}
                                                        onClick={() => downloadWord(viewingDocument.id)}
                                                        disabled={downloadingWord === viewingDocument.id}
                                                    >
                                                        {downloadingWord === viewingDocument.id ? ' 🔄 Đang tải...' : ' 📄 Tải về Word'}
                                                    </button>
                                                    <button
                                                        className={`${pickerStyles.detailActionBtn} ${pickerStyles.editDetailButton}`}
                                                        onClick={handleViewContent}
                                                    >
                                                        👁️ Xem toàn bộ nội dung
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`${pickerStyles.detailActionBtn} ${selectedDocuments.some(d => d.id === viewingDocument.id)
                                                            ? pickerStyles.removeActionBtn
                                                            : pickerStyles.addActionBtn
                                                            }`}
                                                        onClick={() => handleSelectDocument(viewingDocument)}
                                                    >
                                                        {selectedDocuments.some(d => d.id === viewingDocument.id) ? (
                                                            <>
                                                                <X size={16} />
                                                                Bỏ chọn tài liệu
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check size={16} />
                                                                Chọn tài liệu này
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className={pickerStyles.emptyState}>
                                            <FileText size={48} />
                                            <p>Chọn một tài liệu để xem chi tiết</p>
                                        </div>
                                    )}
                                    </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}