// file: treeHelpers.js
export function getParentChain(folders, file) {
  const chain = [];
  let currentId = file.folderId;

  while (currentId) {
    const folder = folders.find(f => f.id === currentId);
    if (!folder) break;
    chain.unshift(folder.id); // đưa lên đầu mảng để từ root → leaf
    currentId = folder.parentId;
  }

  return chain; // array of folderIds từ root → folder chứa file
}
