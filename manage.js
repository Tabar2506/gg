let currentUser = null;
let root = null;          // thư mục gốc của user
let currentFolder = null; // thư mục đang mở

/* ====== HỖ TRỢ LOCALSTORAGE ====== */

function getCurrentUser() {
  const u = localStorage.getItem('currentUser');
  return u || null;
}

function fsKey() {
  return 'fs_' + currentUser;
}
function historyKey() {
  return 'history_' + currentUser;
}

function loadFileSystem() {
  const data = localStorage.getItem(fsKey());
  if (!data) {
    root = {
      id: 'root',
      name: 'My Drive',
      type: 'folder',
      children: []
    };
    saveFileSystem();
  } else {
    root = JSON.parse(data);
  }
  currentFolder = root;
}

function saveFileSystem() {
  localStorage.setItem(fsKey(), JSON.stringify(root));
}

function getHistory() {
  return JSON.parse(localStorage.getItem(historyKey()) || '[]');
}
function saveHistory(arr) {
  localStorage.setItem(historyKey(), JSON.stringify(arr));
}

function addHistory(action, targetType, name, path) {
  const history = getHistory();
  history.unshift({
    time: new Date().toLocaleString(),
    action,
    targetType,
    name,
    path
  });
  saveHistory(history);
}

/* ====== CÂY THƯ MỤC ====== */

function renderTree() {
  const container = document.getElementById('treeView');
  container.innerHTML = '';
  const ul = document.createElement('ul');
  buildTreeNode(root, ul);
  container.appendChild(ul);
}

function buildTreeNode(node, parentElement) {
  const li = document.createElement('li');
  li.textContent = node.name;
  li.classList.add(node.type);

  li.addEventListener('click', function(e) {
    e.stopPropagation();
    if (node.type === 'folder') {
      currentFolder = node;
      renderCurrentFolder();
    }
  });

  li.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showContextMenu(e.pageX, e.pageY, node);
  });

  parentElement.appendChild(li);

  if (node.type === 'folder' && node.children && node.children.length > 0) {
    const ul = document.createElement('ul');
    node.children
      .filter(ch => ch.type === 'folder')
      .forEach(child => buildTreeNode(child, ul));
    parentElement.appendChild(ul);
  }
}

/* ====== HIỂN THỊ FILE TRONG THƯ MỤC ====== */

function getPath(node) {
  const path = [];
  function dfs(current, target, stack) {
    stack.push(current);
    if (current === target) {
      path.push(...stack);
      return true;
    }
    if (current.children) {
      for (let child of current.children) {
        if (dfs(child, target, stack)) return true;
      }
    }
    stack.pop();
    return false;
  }
  dfs(root, node, []);
  return path.map(n => n.name).join('/') + '/';
}

function renderCurrentFolder(filterFunc) {
  const container = document.getElementById('fileList');
  container.innerHTML = '';

  document.getElementById('currentPath').textContent = getPath(currentFolder);

  let items = currentFolder.children || [];
  if (filterFunc) {
    items = filterFunc(items);
  }

  if (items.length === 0) {
    container.textContent = 'Thư mục trống';
    return;
  }

  items.forEach(node => {
    const div = document.createElement('div');
    div.classList.add('item');
    div.textContent = node.name + (node.type === 'folder' ? ' /' : '');

    div.addEventListener('dblclick', function() {
      if (node.type === 'folder') {
        currentFolder = node;
        renderCurrentFolder();
      } else {
        alert('Mở file: ' + node.name);
      }
    });

    div.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      showContextMenu(e.pageX, e.pageY, node);
    });

    container.appendChild(div);
  });
}

/* ====== CRUD FILE / FOLDER ====== */

function createNode(type) {
  const name = prompt('Nhập tên ' + (type === 'folder' ? 'thư mục' : 'file') + ':');
  if (!name) return;

  const node = {
    id: 'id_' + Date.now(),
    name,
    type,
    children: type === 'folder' ? [] : undefined,
    fileType: type === 'file' ? 'text' : undefined
  };

  currentFolder.children.push(node);
  saveFileSystem();
  addHistory('create', type, name, getPath(currentFolder));

  renderTree();
  renderCurrentFolder();
}

function renameNode(node) {
  const newName = prompt('Tên mới:', node.name);
  if (!newName || newName === node.name) return;

  node.name = newName;
  saveFileSystem();
  addHistory('rename', node.type, node.name, getPath(currentFolder));

  renderTree();
  renderCurrentFolder();
}

function deleteNode(node) {
  function dfsDelete(parent, target) {
    if (!parent.children) return false;
    const idx = parent.children.indexOf(target);
    if (idx !== -1) {
      parent.children.splice(idx, 1);
      return true;
    }
    for (let c of parent.children) {
      if (dfsDelete(c, target)) return true;
    }
    return false;
  }

  if (!confirm('Xóa "' + node.name + '" ?')) return;

  dfsDelete(root, node);
  saveFileSystem();
  addHistory('delete', node.type, node.name, getPath(currentFolder));

  renderTree();
  renderCurrentFolder();
}

/* ====== SHARE GIẢ LẬP ====== */

function shareNode(node) {
  if (node.type !== 'file') {
    alert('Chỉ chia sẻ được file!');
    return;
  }
  const perm = prompt('Quyền (view/edit):', 'view');
  if (!perm) return;

  const token = 'share_' + Date.now();
  node.sharedLink = { token, permission: perm };
  saveFileSystem();

  const link = location.origin + location.pathname +
    '?owner=' + encodeURIComponent(currentUser) +
    '&shareToken=' + encodeURIComponent(token);

  alert('Link chia sẻ:\n' + link);
}

/* ====== CONTEXT MENU ====== */

let contextTarget = null;

function showContextMenu(x, y, node) {
  contextTarget = node;
  const menu = document.getElementById('contextMenu');
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.classList.remove('hidden');
}

document.addEventListener('click', function() {
  document.getElementById('contextMenu').classList.add('hidden');
});

document.getElementById('contextMenu').addEventListener('click', function(e) {
  const action = e.target.dataset.action;
  if (!action || !contextTarget) return;
  if (action === 'rename') renameNode(contextTarget);
  if (action === 'delete') deleteNode(contextTarget);
  if (action === 'share')  shareNode(contextTarget);
});

/* ====== TÌM KIẾM & LỌC ====== */

const searchInput = document.getElementById('searchInput');
const filterType  = document.getElementById('filterType');

function applyFilter() {
  const kw   = searchInput.value.trim().toLowerCase();
  const type = filterType.value;

  renderCurrentFolder(items => {
    return items.filter(n => {
      const matchName = n.name.toLowerCase().includes(kw);
      if (!matchName) return false;

      if (type === 'all') return true;
      if (type === 'file' || type === 'folder') return n.type === type;
      if (n.type === 'file') return n.fileType === type;
      return false;
    });
  });
}

searchInput.addEventListener('input', applyFilter);
filterType.addEventListener('change', applyFilter);

/* ====== INIT ====== */

window.addEventListener('DOMContentLoaded', function() {
  currentUser = getCurrentUser();
  if (!currentUser) {
    // chưa đăng nhập, quay về login
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('userInfo').textContent = currentUser;

  loadFileSystem();
  renderTree();
  renderCurrentFolder();

  document.getElementById('btnNewFolder').onclick = function() {
    createNode('folder');
  };
  document.getElementById('btnNewFile').onclick = function() {
    createNode('file');
  };

  document.getElementById('goStats').onclick = function() {
    window.location.href = 'stats.html';
  };

  document.getElementById('logoutBtn').onclick = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  };
});
