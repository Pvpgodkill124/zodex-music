import { HfApi } from "https://cdn.jsdelivr.net/npm/@huggingface/hub@0.12.0/+esm";

let api, repo, token;

// Initialize and Check for saved config
window.onload = async () => {
    token = localStorage.getItem('hf_token');
    repo = localStorage.getItem('hf_repo');
    if (token && repo) {
        showDrive();
        await listFiles();
    }
};

window.saveConfig = () => {
    const t = document.getElementById('hfToken').value;
    const r = document.getElementById('hfRepo').value;
    if(t && r) {
        localStorage.setItem('hf_token', t);
        localStorage.setItem('hf_repo', r);
        location.reload();
    }
};

function showDrive() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('driveUI').classList.remove('hidden');
    document.getElementById('userBadge').innerText = repo;
    document.getElementById('userBadge').classList.remove('hidden');
}

// List Files from HF Dataset
async function listFiles(path = "") {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '<p class="text-zinc-500">Loading your 5TB drive...</p>';
    
    try {
        const response = await fetch(`https://huggingface.co/api/datasets/${repo}/tree/main/${path}`);
        const files = await response.json();
        
        fileList.innerHTML = "";
        files.forEach(file => {
            const isImg = /\.(jpg|jpeg|png|gif)$/i.test(file.path);
            const icon = isImg ? 'fa-image' : (file.type === 'directory' ? 'fa-folder' : 'fa-file-lines');
            
            const card = document.createElement('div');
            card.className = "glass-card p-4 rounded-lg flex flex-col items-center text-center hover:border-purple-500 transition cursor-pointer relative group";
            card.innerHTML = `
                <i class="fa-solid ${icon} text-3xl mb-2 ${file.type === 'directory' ? 'text-yellow-500' : 'accent-purple'}"></i>
                <span class="text-xs truncate w-full">${file.path.split('/').pop()}</span>
                <div class="absolute top-1 right-1 hidden group-hover:flex gap-1">
                    <button onclick="deleteFile('${file.path}')" class="text-red-500 p-1"><i class="fa-solid fa-trash"></i></button>
                    <button onclick="copyLink('${file.path}')" class="text-blue-400 p-1"><i class="fa-solid fa-share-nodes"></i></button>
                </div>
            `;
            fileList.appendChild(card);
        });
    } catch (err) {
        fileList.innerHTML = `<p class="text-red-400">Error: ${err.message}. Make sure your repo name is correct.</p>`;
    }
}

// Upload File Logic
window.uploadFile = async () => {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files[0]) return;
    
    const file = fileInput.files[0];
    const hf = new HfApi(token);
    
    try {
        alert("Uploading started... check console for progress.");
        await hf.uploadFile({
            repo: { type: "dataset", name: repo },
            path: file.name,
            file: file
        });
        alert("Upload Complete!");
        listFiles();
    } catch (err) {
        alert("Upload Failed: " + err.message);
    }
};

// Share Link Generation
window.copyLink = (path) => {
    const url = `https://huggingface.co/datasets/${repo}/resolve/main/${path}`;
    navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
};

// Placeholder for Delete (Needs specific API calls)
window.deleteFile = async (path) => {
    if(confirm(`Delete ${path}?`)) {
        // Logic for HF delete commit goes here
        alert("Delete feature coming in V1.1 - Requires Git commit logic.");
    }
};
  
