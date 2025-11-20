# 🍔 Hamburger Menu Implementation Guide

## Mục đích

Thêm nút hamburger menu để toggle sidebar trên mobile devices.

## Bước 1: Thêm Hamburger Button vào Header

### File: `app/components/header/Header.jsx`

Thêm state và button:

```jsx
import { Music2, Search, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header({ user, onToggleSidebar, sidebarOpen }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className={styles.header}>
      {/* Hamburger Menu Button - Chỉ hiện trên mobile */}
      <button
        className={styles.hamburgerBtn}
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={styles.logo}>
        <Music2 size={24} color="#facc15" />
        <span className={styles.logoText}>Music Collection</span>
      </div>

      {/* Rest of header... */}
    </header>
  );
}
```

## Bước 2: Thêm CSS cho Hamburger Button

### File: `app/globals/styles/main.module.css`

```css
/* Hamburger Menu Button */
.hamburgerBtn {
  display: none; /* Ẩn trên desktop */
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.hamburgerBtn:hover {
  background: #374151;
}

/* Hiện hamburger trên mobile */
@media (max-width: 768px) {
  .hamburgerBtn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
  }
}
```

## Bước 3: Thêm State Management cho Sidebar

### File: `app/routes/Dashboard.jsx` (hoặc layout chính)

```jsx
import { useState } from "react";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.dashboard}>
      <Header 
        user={user} 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
          <Sidebar treeData={treeData} onItemClick={closeSidebar} />
        </aside>
        
        <main className={styles.main}>
          {/* Main content */}
        </main>
      </div>

      {/* Overlay để đóng sidebar khi click bên ngoài */}
      {sidebarOpen && (
        <div 
          className={styles.sidebarOverlay}
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}
```

## Bước 4: Thêm Overlay CSS

### File: `app/globals/styles/main.module.css`

```css
/* Sidebar Overlay - chỉ trên mobile */
.sidebarOverlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebarOverlay {
    display: block;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 199;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

## Bước 5: Update Sidebar Component

### File: `app/components/sidebar/Sidebar.jsx`

```jsx
export default function Sidebar({ treeData, onItemClick }) {
  const handleItemClick = (item) => {
    // Xử lý click item
    // ...
    
    // Đóng sidebar trên mobile
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.sidebarTitle}>Thư mục</h3>
      <FolderTree data={treeData} onItemClick={handleItemClick} />
    </aside>
  );
}
```

## Bước 6: Prevent Body Scroll khi Sidebar Open

### Optional: Thêm vào Dashboard component

```jsx
useEffect(() => {
  if (sidebarOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  return () => {
    document.body.style.overflow = 'unset';
  };
}, [sidebarOpen]);
```

## 🎨 Styling Tips

### Icon Animation
```css
.hamburgerBtn svg {
  transition: transform 0.3s ease;
}

.hamburgerBtn:active svg {
  transform: scale(0.9);
}
```

### Sidebar Slide Animation
```css
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
```

## 🧪 Testing

1. **Desktop**: Hamburger button không hiển thị
2. **Mobile**: 
   - Click hamburger → sidebar slide in
   - Click overlay → sidebar slide out
   - Click item → sidebar auto close
   - Click X icon → sidebar close

## 📱 Touch Gestures (Advanced)

Nếu muốn thêm swipe gesture:

```jsx
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => setSidebarOpen(false),
  onSwipedRight: () => setSidebarOpen(true),
  trackMouse: true
});

return <div {...handlers}>...</div>;
```

## ✅ Checklist

- [ ] Thêm hamburger button vào Header
- [ ] Thêm CSS cho hamburger button
- [ ] Thêm state management
- [ ] Thêm overlay
- [ ] Update Sidebar component
- [ ] Test trên mobile
- [ ] Test animations
- [ ] Test accessibility (keyboard, screen reader)

## 🎯 Kết quả mong đợi

- ✅ Hamburger menu chỉ hiện trên mobile (≤ 768px)
- ✅ Sidebar slide mượt mà từ trái sang
- ✅ Click overlay hoặc item để đóng sidebar
- ✅ Icon chuyển đổi giữa Menu và X
- ✅ Body scroll bị lock khi sidebar mở
- ✅ Responsive và touch-friendly

Chúc may mắn! 🚀
