let currentUser = null;
let root = null;

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
  } else {
    root = JSON.parse(data);
  }
}

function getHistory() {
  return JSON.parse(localStorage.getItem(historyKey()) || '[]');
}

function calcStats() {
  let fileCount = 0;
  let folderCount = 0;

  function dfs(node) {
    if (node.type === 'folder') folderCount++;
    if (node.type === 'file')   fileCount++;
    if (node.children) node.children.forEach(dfs);
  }

  dfs(root);
  return { fileCount, folderCount };
}

function renderStats() {
  const st = calcStats();
  document.getElementById('fileCount').textContent   = st.fileCount;
  document.getElementById('folderCount').textContent = st.folderCount;
}

function renderHistory() {
  const history = getHistory();
  const ul = document.getElementById('historyList');
  ul.innerHTML = '';

  if (history.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Chưa có thao tác nào.';
    ul.appendChild(li);
    return;
  }

  history.slice(0, 50).forEach(h => {
    const li = document.createElement('li');
    li.textContent =
      `[${h.time}] ${h.action} ${h.targetType} "${h.name}" tại ${h.path}`;
    ul.appendChild(li);
  });
}

window.addEventListener('DOMContentLoaded', function() {
  currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('userInfo').textContent = currentUser;

  loadFileSystem();
  renderStats();
  renderHistory();

  document.getElementById('goManage').onclick = function() {
    window.location.href = 'manage.html';
  };

  document.getElementById('logoutBtn').onclick = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  };
});
