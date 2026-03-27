// Setup Supabase (Replace with your actual credentials)
const { createClient } = window.supabase;
const supabaseUrl = 'https://zebumqythveloetdysnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplYnVtcXl0aHZlbG9ldGR5c25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjEyNDksImV4cCI6MjA5MDAzNzI0OX0.O8WDEzerIJtbh-_lTw7FeUmvcYmDCE4OUwMYwS0HWLE';
const _supabase = createClient(supabaseUrl, supabaseKey);

// Your encryption key (In a real app, don't hardcode this!)
const MASTER_KEY = "my-super-safe-key";

// --- SAVE FUNCTION ---
async function saveSecret() {
    const label = document.getElementById('labelInput').value;
    const rawSecret = document.getElementById('secretInput').value;

    if (!label || !rawSecret) return alert("Fill in both fields!");

    // Encrypt before sending to DB
    const encrypted = CryptoJS.AES.encrypt(rawSecret, MASTER_KEY).toString();

    const { error } = await _supabase
        .from('secrets')
        .insert([{ label: label, encrypted_secret: encrypted }]);

    if (error) {
        console.error("Save error:", error);
    } else {
        document.getElementById('labelInput').value = '';
        document.getElementById('secretInput').value = '';
        fetchAndDisplaySecrets();
    }
}

// --- FETCH & RENDER FUNCTION ---
async function fetchAndDisplaySecrets() {
    const { data: secrets, error } = await _supabase
        .from('secrets')
        .select('*');

    if (error) return console.error("Fetch error:", error);

    const listContainer = document.getElementById('vaultList');
    listContainer.innerHTML = '<h3>Your Saved Secrets</h3>';

    secrets.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'secret-item';
        // Inside your secrets.forEach loop in app.js
itemDiv.innerHTML = `
    <span><strong>${item.label}:</strong> <span id="val-${item.id}">••••••••</span></span>
    <div class="action-group">
        <button class="view-btn" onclick="revealSecret('${item.id}', '${item.encrypted_secret}', event)">View</button>
        <button class="delete-btn" onclick="deleteSecret('${item.id}')">Delete</button>
    </div>
`;
        listContainer.appendChild(itemDiv);
    });
}

// --- REVEAL FUNCTION ---
function revealSecret(id, encryptedValue) {
    const target = document.getElementById(`val-${id}`);
    
    // 1. Check if the text is currently hidden (showing the bullets)
    if (target.innerText === "••••••••") {
        try {
            // 2. Decrypt it using your Master Key
            const bytes = CryptoJS.AES.decrypt(encryptedValue, MASTER_KEY);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            
            // 3. Show the real text
            target.innerText = originalText;
            
            // Optional: Change the button text to 'Hide'
            event.target.innerText = "Hide"; 
        } catch (e) {
            alert("Decryption failed. Is your Master Key correct?");
        }
    } else {
        // 4. If it was already visible, hide it again
        target.innerText = "••••••••";
        event.target.innerText = "View";
    }
}

// --- DELETE FUNCTION ---
async function deleteSecret(id) {
    if (confirm("Are you sure you want to remove this secret forever?")) {
        const { error } = await _supabase
            .from('secrets')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Delete error:", error);
        } else {
            // Refresh the list automatically
            fetchAndDisplaySecrets();
        }
    }
}

// Add this to your window exposure list at the bottom
window.deleteSecret = deleteSecret;

// EXPOSE TO HTML (Necessary because this is a module)
window.saveSecret = saveSecret;
window.revealSecret = revealSecret;

// Run on page load
fetchAndDisplaySecrets();