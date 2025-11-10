export async function getTreeData() {
  return [
    {
      id: "root1",
      name: "Khối Tiểu học",
      children: [
        {
          id: 1,
          name: "Lớp 1",
          children: [
            { id: "lectures", name: "Bài giảng" },
            { id: "videos", name: "Video" },
            { id: "images", name: "Hình ảnh" },
            { id: "documents", name: "Tài liệu" },
          ],
        },
        {
          id: 2,
          name: "Lớp 2",
          children: [
            { id: "lectures", name: "Bài giảng" },
            { id: "videos", name: "Video" },
            { id: "images", name: "Hình ảnh" },
            { id: "documents", name: "Tài liệu" },
          ],
        },
      ],
    },
  ];
}
