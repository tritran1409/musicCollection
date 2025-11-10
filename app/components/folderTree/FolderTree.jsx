// app/components/TreeSidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import styles from './FolderTree.module.css';

const TreeItem = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  console.log(item);
  
  // Kiểm tra active state
  const isActive = location.pathname === item.path || 
    (hasChildren && item.children.some(child => 
      location.pathname.startsWith(child.path)
    ));

  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const ItemContent = () => (
    <div
      className={`${styles.itemContent} ${isActive && !hasChildren ? styles.active : ''}`}
      style={{ paddingLeft: `${level * 16 + 12}px` }}
    >
      {hasChildren && (
        <span onClick={toggleOpen} className={styles.chevron}>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
      {!hasChildren && <span className={styles.spacer} />}
      
      <span className={styles.icon}>
        {item.icon || (hasChildren ? <Folder size={18} /> : <File size={18} />)}
      </span>
      
      <span className={styles.label}>{item.label}</span>
    </div>
  );

  return (
    <div>
      {hasChildren ? (
        <div onClick={toggleOpen} className={styles.clickable}>
          <ItemContent />
        </div>
      ) : (
        <Link to={item.path} prefetch="intent" className={styles.link}>
          <ItemContent />
        </Link>
      )}
      
      {hasChildren && isOpen && (
        <div className={styles.children}>
          {item.children.map((child, index) => (
            <TreeItem key={child.path || index} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeSidebar = ({ menuData, title = 'Navigation' }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <nav className={styles.nav}>
          {menuData.map((item, index) => (
            <TreeItem key={item.path || index} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
};

// Example: app/data/menuData.js


/* ==========================================
   app/components/TreeSidebar.module.css
   ========================================== */

/*
.sidebar {
  width: 256px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.container {
  padding: 1rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.itemContent {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  color: #374151;
  cursor: pointer;
}

.itemContent:hover {
  background-color: #f3f4f6;
}

.itemContent.active {
  background-color: #3b82f6;
  color: #ffffff;
}

.chevron {
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.spacer {
  width: 16px;
  flex-shrink: 0;
}

.icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clickable {
  cursor: pointer;
}

.link {
  text-decoration: none;
  color: inherit;
}

.children {
  margin-top: 0.25rem;
}
*/

/* ==========================================
   Example: app/routes/_layout.jsx
   ========================================== */

/*
import { Outlet } from '@remix-run/react';
import { TreeSidebar } from '~/components/TreeSidebar';
import { menuData } from '~/data/menuData';

export default function Layout() {
  return (
    <div style={{ display: 'flex' }}>
      <TreeSidebar menuData={menuData} />
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f9fafb' }}>
        <Outlet />
      </main>
    </div>
  );
}
*/