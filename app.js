// 1. Initialize Supabase (Use your own Project URL and API Key)
const supabaseUrl = 'https://zebumqythveloetdysnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplYnVtcXl0aHZlbG9ldGR5c25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjEyNDksImV4cCI6MjA5MDAzNzI0OX0.O8WDEzerIJtbh-_lTw7FeUmvcYmDCE4OUwMYwS0HWLE';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. The Master Key (In a real app, this comes from a login password)
const MASTER_KEY = "user-defined-safe-key";

// --- SAVE FUNCTION ---
async function saveSecret() {
    const label = document.getElementById('labelInput').value;
    const rawSecret = document.getElementById('secretInput').value;

    if (!label || !rawSecret) return alert("Please fill both fields");

    // Encrypt the secret before it leaves the browser
    const encrypted = CryptoJS.AES.encrypt(rawSecret, MASTER_KEY).toString();

    const { data, error } = await _supabase
        .from('secrets')
        .insert([{ label: label, encrypted_secret: encrypted }]);

    if (error) {
        console.error("Error saving:", error);
    } else {
        alert("Saved to Vault!");
        fetchAndDisplaySecrets(); // Refresh the list
    }
}

// --- FETCH & RENDER FUNCTION ---
async function fetchAndDisplaySecrets() {
    const { data: secrets, error } = await _supabase
        .from('secrets')
        .select('*');

    const listContainer = document.getElementById('vaultList');
    listContainer.innerHTML = '<h3>Your Saved Secrets</h3>'; // Reset list

    secrets.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'secret-item';
        
        // We show the label, but keep the secret hidden initially
        itemDiv.innerHTML = `
            <span><strong>${item.label}:</strong> <span id="val-${item.id}">••••••••</span></span>
            <button onclick="revealSecret('${item.id}', '${item.encrypted_secret}')">View</button>
        `;
        listContainer.appendChild(itemDiv);
    });
}

// --- REVEAL (DECRYPT) FUNCTION ---
function revealSecret(id, encryptedValue) {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, MASTER_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    document.getElementById(`val-${id}`).innerText = originalText;
}

// Load secrets when the page opens
fetchAndDisplaySecrets();


// Import the library (if using a CDN or NPM)
const CryptoJS = require("crypto-js");

const MASTERKEY = "your-super-secret-key"; // Keep this safe!

// --- ENCRYPT (Before saving to Supabase) ---
const encryptSecret = (plainText) => {
  const ciphertext = CryptoJS.AES.encrypt(plainText, MASTERKEY).toString();
  return ciphertext; 
};

// --- DECRYPT (After fetching from Supabase) ---
const decryptSecret = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, MASTERKEY);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

// Example Usage:
const encrypted = encryptSecret("MyBankPassword123");
console.log("Saving to DB:", encrypted); // Output: U2FsdGVkX1...

const decrypted = decryptSecret(encrypted);
console.log("Showing to User:", decrypted); // Output: MyBankPassword123

const { data, error } = await supabase
  .from('secrets')
  .insert([
    { 
      label: 'Banking Pass', 
      encrypted_secret: encryptSecret("MyBankPassword123") 
    },
  ]);

  