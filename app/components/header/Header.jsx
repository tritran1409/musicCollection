import { Music2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Form, Link, useNavigate } from "react-router";
import styles from "../../globals/styles/main.module.css";
import useFilter from "../../hooks/useFileFilter";
const initFilterGenerator = {
  search: "",
  types: [],
  classes: [],
  dateFrom: "",
  dateTo: "",
  owner: "",
  category: "",
  minSize: "",
  maxSize: "",
};

export default function Header({ user, }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
    const { 
      filterResult, 
      filtering, 
      filter,
      pagination,
      nextPage,
      previousPage,
      goToPage,
      changeLimit,
      resetFilters,
      activeFilters,
    } = useFilter(null, '/api/filterFile', 1, 20, initFilterGenerator, `search`);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const delay = setTimeout(async () => {
      filter({
        ...initFilterGenerator,
        search: query,
      });
    }, 300);

    return () => clearTimeout(delay);
  }, [query, open]);

  const renderThumb = (item) => {
    if (item.type === "image")
      return <img className={styles.searchItemThumb} src={item.url} />;

    if (item.type === "video")
      return <video className={styles.searchItemThumb} src={item.url} muted />;

    const icon = {
      audio: "🎵",
      pdf: "📄",
      file: "📁",
      zip: "🗂️",
    };

    return <div className={styles.searchItemIcon}>{icon[item.type] || "📦"}</div>;
  };

  const onDownload = (file) => {
    
  }

  const onCopy = (file) => {
    
  }

  const onSearch = () => {
    setOpen(false);
    navigate(`/bang-dieu-khien/tim-kiem`);
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Music2 size={24} color="#facc15" />
          <span className={styles.logoText}>Music Collection</span>
        </div>

        <div className={styles.userInfo}>
          {/* 🔍 Icon search */}
          <button
            className={styles.searchButton}
            onClick={() => setOpen(true)}
          >
            <Search size={20} color="#fff" />
          </button>

          <span className={styles.userName}>{user?.name}</span>
          <Form method="post" action="/logout">
            <button type="submit" className={styles.logoutBtn}>
              Đăng xuất
            </button>
          </Form>
        </div>
      </header>

      {/* Modal search */}
      {open && (
        <div className={styles.searchModalOverlay} onClick={() => setOpen(false)}>
          <div
            className={styles.searchModal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input trong modal */}
            <div className={styles.searchInputContainer}>
              <Search className={styles.searchInputIcon} size={18} />
              <input
                autoFocus
                className={styles.searchInputInner}
                placeholder="Tìm kiếm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* List kết quả */}
            <div className={styles.searchResults}>
              {filterResult.length === 0 ? (
                <div style={{ padding: "12px 20px", color: "#6b7280" }}>
                  Nhập để tìm kiếm...
                </div>
              ) : (
                filterResult.map((item) => (
                  <div key={item.id} className={styles.searchItem}>
                    {renderThumb(item)}

                    <div className={styles.searchItemInfo}>
                      <span className={styles.searchItemName}>{item.name}</span>
                      <span className={styles.searchItemFilename}>{item.filename}</span>
                      <div className={styles.searchUser}>
                        Người đăng: <span>{item.uploadedBy}</span>
                      </div>
                    </div>

                    <div className={styles.searchActions}>
                      {/* Download */}
                      <button
                        className={styles.searchActionBtn}
                        onClick={() => onDownload(item)}
                      >
                        ⬇️
                      </button>

                      {/* Copy link */}
                      <button
                        className={styles.searchActionBtn}
                        onClick={() => onCopy(item)}
                      >
                        📋
                      </button>
                    </div>
                  </div>

                ))
              )}
            </div>  
              <div className={styles.searchFooter}>
                <button
                  onClick={onSearch}
                  className={styles.advancedSearchBtn}
                >
                  🔍 Tìm kiếm nâng cao
                </button>
              </div>
          </div>
        </div>
      )}
    </>
  );
}
