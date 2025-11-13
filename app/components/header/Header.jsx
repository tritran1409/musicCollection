import styles from "../../globals/styles/main.module.css";
import { Music2, Search } from "lucide-react";
import { Form } from "react-router";
import { useState, useEffect, useRef } from "react";

export default function Header({ user }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef(null);

  // Dữ liệu mock
  const mockData = [
    { id: 1, name: "Bài hát A" },
    { id: 2, name: "Bài hát B" },
    { id: 3, name: "Video C" },
    { id: 4, name: "Hình ảnh D" },
    { id: 5, name: "Âm thanh E" },
    { id: 6, name: "Tài liệu F" },
  ];

  // Tìm kiếm "tạm thời" từ mockData
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const filtered = mockData.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setShowDropdown(true);
    }, 200); // debounce 200ms

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  const handleSelect = (item) => {
    setQuery(item.name);
    setShowDropdown(false);
    console.log("Selected:", item);
  };

  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.logo}>
        <Music2 size={24} color="#facc15" />
        <span className={styles.logoText}>Music Collection</span>
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchForm}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
            onFocus={() => query && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && results.length > 0 && (
          <ul className={styles.searchDropdown}>
            {results.map((item) => (
              <li
                key={item.id}
                className={styles.searchDropdownItem}
                onMouseDown={() => handleSelect(item)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User info */}
      <div className={styles.userInfo}>
        <span className={styles.userName}>{user?.name}</span>
        <Form method="post" action="/logout">
          <button type="submit" className={styles.logoutBtn}>
            Đăng xuất
          </button>
        </Form>
      </div>
    </header>
  );
}
