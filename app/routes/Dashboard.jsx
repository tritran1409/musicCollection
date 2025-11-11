import { Outlet, redirect } from "react-router";
import { TreeSidebar } from "../components/folderTree/FolderTree";
import Header from "../components/header/Header";
import styles from "../globals/styles/main.module.css";
import { getUser } from "../service/auth.server";
import { menuData } from "../utils/menuData";
import { CategoryModel } from "../.server/category.repo";

export async function loader({ request }) {
  const user = await getUser(request);
  const categoryModel = new CategoryModel();
  const customCategories = await categoryModel.findAll();
  if (!user) throw redirect("/login");
  const menuList = [
    ...menuData,
    {
      label: 'Sưu tập',
      path: '/suu-tap',
      icon: '🗂️',
      custom: true,
      edit: false,
      children: [
        { icon: '🎬', label: 'Video', path: `/bang-dieu-khien/suu-tap/video`, edit: false },
        { icon: '🖼️', label: 'Hình ảnh', path: `/bang-dieu-khien/suu-tap/hinh-anh`, edit: false },
        { icon: '🎧', label: 'Âm thanh', path: `/bang-dieu-khien/suu-tap/am-thanh`, edit: false },
        { icon: '📄', label: 'Tài liệu', path: `/bang-dieu-khien/suu-tap/tai-lieu`, edit: false },
        ...customCategories.map((category) => ({
          id: category.id,
          slug: category.slug,
          ownerId: category.ownerId,
          icon: '🗃️',
          label: category.name,
          path: `/bang-dieu-khien/tuy-chinh/${category.slug}`,
          edit: true,
        }))
      ]
    }
  ];
  return { user, menuList };
}


export default function Dashboard({ loaderData }) {
  const { user, menuList } = loaderData;

  return (
    <div className={styles.dashboard}>
      <Header user={user} />

      <div className={styles.layout}>
        <TreeSidebar menuData={menuList} user={user} />

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
