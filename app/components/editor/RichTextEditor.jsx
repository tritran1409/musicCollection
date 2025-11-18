import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { extensions } from "./extension";
import styles from "./RichTextEditor.module.css";

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return <div>Đang tải trình soạn thảo…</div>;

  const FONT_FAMILIES = [
    "Arial", "Tahoma", "Verdana", "Georgia", "Times New Roman", "Courier New", "Roboto"
  ];

  const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36];

  const COLORS = [
    { name: "Đen", value: "#000000" },
    { name: "Đỏ", value: "#FF0000" },
    { name: "Xanh lá", value: "#00AA00" },
    { name: "Xanh dương", value: "#0000FF" },
    { name: "Tím", value: "#FF00FF" },
    { name: "Cam", value: "#FFA500" },
    { name: "Vàng", value: "#FFFF00" },
  ];

  return (
    <div className={styles.wrapper}>
      {/* ============================
           TOOLBAR
         ============================ */}
      <div className={styles.toolbar}>
        {/* Font family */}
        <select
          className={styles.dropdown}
          onChange={(e) =>
            editor.chain().focus().setFontFamily(e.target.value).run()
          }
          value={editor.getAttributes("textStyle").fontFamily || ""}
        >
          <option value="">Font chữ</option>
          {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* Font size */}
        <select
          className={styles.dropdown}
          onChange={(e) =>
            editor.chain().focus().setFontSize(Number(e.target.value)).run()
          }
          value={editor.getAttributes("textStyle").fontSize || ""}
        >
          <option value="">Cỡ chữ</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
        </select>

        {/* Color picker with visual indicator */}
        <div className={styles.colorPickerWrapper}>
          <select
            className={styles.dropdown}
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            value={editor.getAttributes("textStyle").color || ""}
          >
            <option value="">Màu chữ</option>
            {COLORS.map(c => (
              <option key={c.value} value={c.value}>
                {c.name}
              </option>
            ))}
          </select>
          <div 
            className={styles.colorIndicator}
            style={{ 
              backgroundColor: editor.getAttributes("textStyle").color || "#000000" 
            }}
          />
        </div>

        {/* Highlight picker with visual indicator */}
        <div className={styles.colorPickerWrapper}>
          <select
            className={styles.dropdown}
            onChange={(e) =>
              editor.chain().focus().setHighlight({ color: e.target.value }).run()
            }
          >
            <option value="">Đánh dấu</option>
            {COLORS.map(c => (
              <option key={c.value} value={c.value}>
                {c.name}
              </option>
            ))}
          </select>
          <div 
            className={styles.colorIndicator}
            style={{ 
              backgroundColor: editor.getAttributes("highlight").color || "#FFFF00" 
            }}
          />
        </div>

        {/* Bold / Italic / Underline / Strike với style tương ứng */}
        <button
          className={editor.isActive("bold") ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{ fontWeight: "bold" }}
        >
          B
        </button>
        <button
          className={editor.isActive("italic") ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{ fontStyle: "italic" }}
        >
          I
        </button>
        <button
          className={editor.isActive("underline") ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={{ textDecoration: "underline" }}
        >
          U
        </button>
        <button
          className={editor.isActive("strike") ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={{ textDecoration: "line-through" }}
        >
          S
        </button>

        {/* Separator */}
        <div className={styles.separator} />

        {/* Headings */}
        {[1,2,3].map(h => (
          <button
            key={h}
            className={editor.isActive("heading",{level:h}) ? styles.buttonActive : styles.button}
            onClick={() => editor.chain().focus().toggleHeading({ level: h }).run()}
            title={`Tiêu đề ${h}`}
          >
            H{h}
          </button>
        ))}

        {/* Separator */}
        <div className={styles.separator} />

        {/* Align */}
        <button
          className={editor.isActive({ textAlign: "left" }) ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Căn trái"
        >
          ≡
        </button>
        <button
          className={editor.isActive({ textAlign: "center" }) ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Căn giữa"
        >
          ≣
        </button>
        <button
          className={editor.isActive({ textAlign: "right" }) ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Căn phải"
        >
          ≡
        </button>
        <button
          className={editor.isActive({ textAlign: "justify" }) ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          title="Căn đều"
        >
          ≣
        </button>

        {/* Separator */}
        <div className={styles.separator} />

        {/* Lists */}
        <button
          className={editor.isActive("bulletList") ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Danh sách dấu đầu dòng"
        >
          • List
        </button>
        <button
          className={editor.isActive("orderedList") ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Danh sách đánh số"
        >
          1. List
        </button>

        {/* Separator */}
        <div className={styles.separator} />

        {/* Links */}
        <button
          className={styles.button}
          onClick={() => {
            const url = window.prompt("Nhập URL link:");
            if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          title="Chèn liên kết"
        >
          🔗
        </button>

        {/* Image */}
        <button
          className={styles.button}
          onClick={() => {
            const url = window.prompt("Dán URL ảnh hoặc Base64:");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          title="Chèn ảnh"
        >
          🖼️
        </button>

        {/* Youtube */}
        <button
          className={styles.button}
          onClick={() => {
            const url = window.prompt("Nhập YouTube URL:");
            if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
          }}
          title="Chèn video YouTube"
        >
          📺
        </button>

        {/* Separator */}
        <div className={styles.separator} />

        {/* Code Block */}
        <button
          className={editor.isActive("codeBlock") ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Khối code"
        >
          {"</>"}
        </button>

        {/* Blockquote */}
        <button
          className={editor.isActive("blockquote") ? styles.buttonActive : styles.button}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Trích dẫn"
        >
          ❝❞
        </button>

        {/* Table Menu */}
        <div className={styles.tableMenu}>
          <button
            className={styles.button}
            onClick={() => {
              const rows = parseInt(prompt("Số hàng:", "3")) || 3;
              const cols = parseInt(prompt("Số cột:", "3")) || 3;
              editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
            }}
            title="Chèn bảng"
          >
            ⊞ Bảng
          </button>
          
          {editor.isActive("table") && (
            <div className={styles.tableControls}>
              <button
                className={styles.smallButton}
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                title="Thêm cột trước"
              >
                ← Cột
              </button>
              <button
                className={styles.smallButton}
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                title="Thêm cột sau"
              >
                Cột →
              </button>
              <button
                className={styles.smallButton}
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="Xóa cột"
              >
                ✕ Cột
              </button>
              
              <div className={styles.separator} />
              
              <button
                className={styles.smallButton}
                onClick={() => editor.chain().focus().addRowBefore().run()}
                title="Thêm hàng trước"
              >
                ↑ Hàng
              </button>
              <button
                className={styles.smallButton}
                onClick={() => editor.chain().focus().addRowAfter().run()}
                title="Thêm hàng sau"
              >
                Hàng ↓
              </button>
              <button
                className={styles.smallButton}
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="Xóa hàng"
              >
                ✕ Hàng
              </button>
              
              <div className={styles.separator} />
              
              <button
                className={styles.smallButton}
                onClick={() => editor.chain().focus().mergeCells().run()}
                title="Gộp ô"
              >
                ⊕ Gộp
              </button>
              <button
                className={styles.smallButton}
                onClick={() => editor.chain().focus().splitCell().run()}
                title="Tách ô"
              >
                ⊟ Tách
              </button>
              
              <div className={styles.separator} />
              
              <button
                className={styles.smallButton}
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Xóa bảng"
                style={{ color: "#dc3545" }}
              >
                🗑️ Xóa bảng
              </button>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className={styles.separator} />

        {/* Undo / Redo */}
        <button
          className={styles.button}
          onClick={() => editor.chain().focus().undo().run()}
          title="Hoàn tác"
        >
          ↶
        </button>
        <button
          className={styles.button}
          onClick={() => editor.chain().focus().redo().run()}
          title="Làm lại"
        >
          ↷
        </button>

      </div>

      {/* ============================
           EDITOR CONTENT
         ============================ */}
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
}