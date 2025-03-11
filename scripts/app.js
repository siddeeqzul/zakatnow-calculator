let deductionCount = 0;

function addDeduction() {
    deductionCount++;
    const deductionList = document.getElementById('deductionList');
    const deductionItem = document.createElement('div');
    deductionItem.className = 'deduction-item';
    deductionItem.id = `deduction-${deductionCount}`;
    deductionItem.innerHTML = `
        <input type="number" name="deduction" placeholder="Jumlah Potongan (RM)" required>
        <button type="button" onclick="removeDeduction(${deductionCount})">Buang</button>
    `;
    deductionList.appendChild(deductionItem);
}

function removeDeduction(id) {
    const deductionItem = document.getElementById(`deduction-${id}`);
    deductionItem.remove();
}

// Initialize income items object
let incomeItems = {};

// Replace the existing additional income toggle event listener with improved mobile-friendly version
document.getElementById('showAdditionalIncome').addEventListener('change', function(e) {
    const additionalIncomeContainer = document.getElementById('additionalIncomeContainer');
    additionalIncomeContainer.style.display = e.target.checked ? 'block' : 'none';
    
    // Reset income items and clear selections when toggling off
    if (!e.target.checked) {
        incomeItems = {};
        const selectedIncomes = document.querySelector('.selected-incomes');
        selectedIncomes.innerHTML = '';
        calculateTotalIncome();
    } else {
        // First make sure the element is visible
        additionalIncomeContainer.style.display = 'block';
        
        // Get the toggle element (which is the income item above the container)
        const toggleElement = document.querySelector('.income-item');
        
        // Use a timeout to ensure the DOM has updated
        setTimeout(() => {
            // Calculate position with a nice offset from the top
            const yOffset = window.innerWidth <= 480 ? -80 : -120; // Smaller offset on mobile
            const y = toggleElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            // Use smooth scroll with fallback for older browsers
            try {
                window.scrollTo({
                    top: y,
                    behavior: 'smooth'
                });
            } catch (error) {
                // Fallback for browsers that don't support smooth scrolling
                window.scrollTo(0, y);
            }
        }, 100);
    }
});

// Add event listeners to income buttons with tooltips
document.querySelectorAll('.add-income-button').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.dataset.item;
        if (!incomeItems[item]) {
            incomeItems[item] = {
                type: item,
                amount: 0
            };
            renderIncomeItems();
        }
    });
    
    // Add tooltip explanation for each income type
    const tooltips = {
        'elaun': 'Elaun bulanan seperti elaun makan, elaun kereta, elaun telefon, dan lain-lain.',
        'bonus': 'Bonus tahunan yang diterima daripada majikan atau sumber lain.',
        'lainlain': 'Pendapatan lain seperti keuntungan perniagaan, sewaan harta, dividen saham, dll.'
    };
    
    addTooltip(button, tooltips[button.dataset.item]);
});

// Improve the renderIncomeItems function for mobile compatibility
function renderIncomeItems() {
    const selectedIncomes = document.querySelector('.selected-incomes');
    selectedIncomes.innerHTML = '';

    for (const [key, item] of Object.entries(incomeItems)) {
        const div = document.createElement('div');
        div.className = 'income-item';

        // Responsive layout that works better on mobile
        const isMobile = window.innerWidth <= 480;
        div.innerHTML = `
            <span class="income-label">${formatIncomeLabel(key)}</span>
            <div style="display: flex; align-items: center; gap: 10px; ${isMobile ? 'flex-wrap: wrap;' : ''}">
                <div class="modern-quantity" ${isMobile ? 'style="width: 100%;"' : ''}>
                    <input type="number" class="amount-input income-amount-input" value="${item.amount || 0}" 
                        data-item="${key}" min="0" step="100" placeholder="Jumlah (RM)"
                        inputmode="decimal"> <!-- Add inputmode for better numeric keyboard on mobile -->
                    <span class="quantity-label">RM${(parseFloat(item.amount) || 0).toFixed(2)}</span>
                </div>
                <button class="remove-btn remove-income-btn" data-item="${key}">×</button>
            </div>
        `;

        selectedIncomes.appendChild(div);
    }

    addIncomeControlListeners();
    calculateTotalIncome();
}

function formatIncomeLabel(key) {
    const labels = {
        elaun: 'Elaun (Bulanan)',
        bonus: 'Bonus (Tahunan)',
        lainlain: 'Pendapatan Lain (Tahunan)'
    };
    return labels[key];
}

function addIncomeControlListeners() {
    document.querySelectorAll('.remove-income-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            delete incomeItems[e.target.dataset.item];
            renderIncomeItems();
        });
    });

    // Handle income amount inputs
    document.querySelectorAll('.income-amount-input').forEach(input => {
        // Remove old listeners first
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Add a new listener that updates the value without re-rendering on each keystroke
        newInput.addEventListener('input', (e) => {
            const itemKey = e.target.dataset.item;
            const value = parseFloat(e.target.value) || 0;
            incomeItems[itemKey].amount = value;
            
            // Only update the label, not the entire list
            const label = e.target.parentNode.querySelector('.quantity-label');
            if (label) {
                label.textContent = `RM${value.toFixed(2)}`;
            }
            
            calculateTotalIncome();
        });
        
        // Update the full list only when focus is lost
        newInput.addEventListener('blur', () => {
            renderIncomeItems();
        });
    });
}

// Add toggle for additional income
document.getElementById('showAdditionalIncome').addEventListener('change', function(e) {
    const additionalIncomeContainer = document.getElementById('additionalIncomeContainer');
    additionalIncomeContainer.style.display = e.target.checked ? 'block' : 'none';
    
    // Update total income whenever the toggle changes
    calculateTotalIncome();
});

// Add event listeners for income fields
document.getElementById('pendapatanBulanan').addEventListener('input', calculateTotalIncome);

// Function to calculate total income from all sources
function calculateTotalIncome() {
    // Get base monthly income
    const pendapatanBulanan = parseFloat(document.getElementById('pendapatanBulanan').value) || 0;
    
    let monthlyExtra = 0;
    let annualExtra = 0;
    
    if (document.getElementById('showAdditionalIncome').checked) {
        for (const [key, item] of Object.entries(incomeItems)) {
            const amount = parseFloat(item.amount) || 0;
            
            // Process different income types differently
            if (key === 'elaun') {
                // Elaun is monthly
                monthlyExtra += amount;
            } else if (key === 'bonus') {
                // Bonus is annual
                annualExtra += amount;
            } else if (key === 'lainlain') {
                // This could be either monthly or annual, defaulting to annual
                annualExtra += amount;
            }
        }
    }
    
    // Calculate monthly and annual totals
    const totalMonthly = pendapatanBulanan + monthlyExtra;
    const totalAnnual = (totalMonthly * 12) + annualExtra;
    
    // Update the display
    document.getElementById('totalMonthlyIncome').textContent = 
        `RM ${totalMonthly.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('totalAnnualIncome').textContent = 
        `RM ${totalAnnual.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    return {
        monthly: totalMonthly,
        annual: totalAnnual
    };
}

// Update form submission for better mobile experience
document.getElementById('zakatForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Hide virtual keyboard on mobile
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    
    const incomeData = calculateTotalIncome();
    const pendapatan = incomeData.annual; // Use calculated annual income

    if (isNaN(pendapatan) || pendapatan <= 0) {
        alert('Sila masukkan jumlah pendapatan yang sah.');
        return;
    }

    // Always use Negeri Sembilan's nisab value regardless of dropdown selection
    const nisab = 26844.82;

    let totalDeductions = 0;
    
    // Only calculate deductions if the toggle is checked
    if (document.getElementById('showDeductions').checked) {
        for (const [key, item] of Object.entries(items)) {
            const itemType = item.type || key;
            
            if (itemType === 'kwsp') {
                totalDeductions += pendapatan * 0.11;
            } else if (itemType === 'diri') {
                totalDeductions += 9000;
            } else if (itemType === 'isteri') {
                totalDeductions += Math.min(4, item.quantity) * 4000;
            } else if (itemType === 'anak') {
                // Handle different child categories
                const anakAmounts = {
                    'tidak-ipt': 2000,
                    'ipt': 8000,
                    'oku': 6000
                };
                const amount = anakAmounts[item.category] || 2000;
                totalDeductions += item.quantity * amount;
            } else if (item.amount) {
                totalDeductions += item.quantity * parseFloat(item.amount);
            }
        }
        
        const manualDeductions = document.getElementsByName('deduction');
        manualDeductions.forEach(deduction => {
            const value = parseFloat(deduction.value);
            if (!isNaN(value) && value > 0) {
                totalDeductions += value;
            }
        });
    }

    const netPendapatan = pendapatan - totalDeductions;
    let zakat = netPendapatan >= nisab ? netPendapatan * 0.025 : 0;

    document.getElementById('pendapatanResult').innerHTML = `
        Jumlah Pendapatan Bulanan: RM ${incomeData.monthly.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<br>
        Jumlah Pendapatan Tahunan: RM ${pendapatan.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<br>
        Jumlah Potongan: RM ${totalDeductions.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<br>
        Pendapatan Bersih: RM ${netPendapatan.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
    `;
    document.getElementById('zakatResult').innerText = `Jumlah Zakat Yang Perlu Dibayar: RM ${zakat.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Show payment option if zakat is due
    const payZakatButton = document.getElementById('payZakatButton');
    if (zakat > 0) {
        payZakatButton.style.display = 'block';
    } else {
        payZakatButton.style.display = 'none';
    }
    
    document.getElementById('result').style.display = 'block';
    
    // Ensure the result is visible by scrolling to it after calculation
    setTimeout(() => {
        const resultElement = document.getElementById('result');
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
});

document.getElementById('zakatForm').addEventListener('reset', function() {
    document.getElementById('result').style.display = 'none';
    items = {};
    renderItems();
    document.getElementById('showDeductions').checked = false;
    document.getElementById('deductionsContainer').style.display = 'none';
    document.getElementById('showAdditionalIncome').checked = false;
    document.getElementById('additionalIncomeContainer').style.display = 'none';
    document.getElementById('elaun').value = 0;
    document.getElementById('bonus').value = 0;
    document.getElementById('lainlain').value = 0;
    document.getElementById('totalMonthlyIncome').textContent = 'RM 0.00';
    document.getElementById('totalAnnualIncome').textContent = 'RM 0.00';
    incomeItems = {};
    document.querySelector('.selected-incomes').innerHTML = '';
});
let items = {};

// Replace showDeductions event listener with mobile-compatible version
document.getElementById('showDeductions').addEventListener('change', function(e) {
    const deductionsContainer = document.getElementById('deductionsContainer');
    deductionsContainer.style.display = e.target.checked ? 'block' : 'none';
    
    // Reset items and clear selections when toggling off
    if (!e.target.checked) {
        items = {};
        const selectedDeductions = document.querySelector('.selected-deductions');
        selectedDeductions.innerHTML = '';
    } else {
        // First make sure the element is visible
        deductionsContainer.style.display = 'block';
        
        // Scroll to the toggle switch (which is right above the section)
        const toggleElement = document.querySelector('.deduction-item.toggle-container');
        
        // Use a timeout to ensure the DOM has updated
        setTimeout(() => {
            // Calculate position with a nice offset from the top
            const yOffset = window.innerWidth <= 480 ? -80 : -120; // Smaller offset on mobile
            const y = toggleElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            // Use smooth scroll with fallback for older browsers
            try {
                window.scrollTo({
                    top: y,
                    behavior: 'smooth'
                });
            } catch (error) {
                // Fallback for browsers that don't support smooth scrolling
                window.scrollTo(0, y);
            }
        }, 100);
    }
});

// Update the add-button event listener to allow multiple anak entries
document.querySelectorAll('.add-button').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.dataset.item;
        
        // Special handling for 'anak' to allow multiple entries with different categories
        if (item === 'anak') {
            // Create a unique key for each anak entry
            const anakId = `anak-${Date.now()}`;
            items[anakId] = {
                type: 'anak',
                amount: 2000, // Default amount
                quantity: 1,
                category: 'tidak-ipt' // Default category
            };
            renderItems();
            return;
        }
        
        // Standard handling for other item types (no duplicates)
        if (!items[item]) {
            items[item] = {
                type: item,
                amount: button.dataset.amount || 0,
                quantity: 1
            };
            
            // Initialize special properties for different types
            if (item === 'sumbangan' || item === 'tabunghaji' || item === 'takaful') {
                items[item].amount = 0; // Initialize custom amount to 0
            }
            
            renderItems();
        }
    });
    
    // Add tooltip explanation for each deduction type
    const tooltips = {
        'diri': 'Potongan asas yang diberikan kepada setiap individu sebanyak RM9,000 setahun.',
        'isteri': 'Potongan sebanyak RM4,000 untuk setiap isteri (maksimum 4 orang).',
        'anak': 'Potongan untuk anak bergantung kepada kategori: RM2,000 (tidak di IPT), RM8,000 (di IPT), atau RM6,000 (OKU).',
        'kwsp': 'Potongan caruman KWSP sebanyak 11% daripada pendapatan tahunan.',
        'sumbangan': 'Potongan untuk sumbangan yang diberikan kepada ibu bapa.',
        'tabunghaji': 'Potongan untuk simpanan di Tabung Haji.',
        'takaful': 'Potongan untuk premium takaful yang dibayar.'
    };
    
    addTooltip(button, tooltips[button.dataset.item]);
});

function renderItems() {
    const selectedDeductions = document.querySelector('.selected-deductions');
    selectedDeductions.innerHTML = '';

    for (const [key, item] of Object.entries(items)) {
        const div = document.createElement('div');
        
        // Determine the item type (for anak with custom keys)
        const itemType = item.type || key;
        
        // Calculate the amount to display
        let amountValue = '';
        if (itemType === 'kwsp') {
            const pendapatanTahunan = calculateTotalIncome().annual;
            const amount = pendapatanTahunan * 0.11;
            amountValue = `RM${amount.toFixed(2)}`;
        } else if (itemType === 'diri') {
            amountValue = 'RM9,000.00';
        } else if (itemType === 'isteri') {
            const amount = 4000;
            amountValue = `RM${(item.quantity * amount).toFixed(2)}`;
        } else if (itemType === 'anak') {
            const anakAmounts = {
                'tidak-ipt': 2000,
                'ipt': 8000,
                'oku': 6000
            };
            const amount = anakAmounts[item.category] || 2000;
            amountValue = `RM${(item.quantity * amount).toFixed(2)}`;
        } else if (itemType === 'sumbangan' || itemType === 'tabunghaji' || itemType === 'takaful') {
            const monthlyAmount = parseFloat(item.amount) || 0;
            const annualAmount = monthlyAmount * 12;
            amountValue = `RM${monthlyAmount.toFixed(2)}/bulan`;
        }
        
        // Special handling for anak items - completely different structure
        if (itemType === 'anak') {
            div.className = 'deduction-item anak-item';
            div.innerHTML = `
                <select class="anak-category" data-item="${key}">
                    <option value="tidak-ipt" ${item.category === 'tidak-ipt' ? 'selected' : ''}>Anak tidak di IPT</option>
                    <option value="ipt" ${item.category === 'ipt' ? 'selected' : ''}>Anak di IPT</option>
                    <option value="oku" ${item.category === 'oku' ? 'selected' : ''}>Anak OKU</option>
                </select>
                <div class="modern-quantity">
                    <button class="quantity-btn minus" data-item="${key}">−</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                        data-item="${key}" min="1" max="99">
                    <button class="quantity-btn plus" data-item="${key}">+</button>
                </div>
                <div class="amount-display">${amountValue}</div>
                <button class="remove-btn" data-item="${key}">×</button>
            `;
        } else {
            // Standard HTML structure for non-anak items
            div.className = 'deduction-item';
            
            // Generate the appropriate controls for each item type
            let controlsHTML = '';
            if (itemType === 'isteri') {
                controlsHTML = `
                    <div class="modern-quantity">
                        <button class="quantity-btn minus" data-item="${key}">−</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" 
                            data-item="${key}" min="1" max="4">
                        <button class="quantity-btn plus" data-item="${key}">+</button>
                    </div>
                `;
            } else if (itemType === 'sumbangan' || itemType === 'tabunghaji' || itemType === 'takaful') {
                controlsHTML = `
                    <div class="modern-quantity">
                        <input type="number" class="amount-input" value="${item.amount || 0}" 
                            data-item="${key}" min="0" step="100" placeholder="Masukkan jumlah (RM)">
                        <span class="quantity-label">RM${(parseFloat(item.amount) || 0).toFixed(2)}</span>
                    </div>
                `;
            } else {
                // For items that don't need quantity or custom amount controls
                controlsHTML = '';
            }
            
            div.innerHTML = `
                <span class="deduction-label">${formatLabel(itemType)}</span>
                <div class="deduction-controls">
                    ${controlsHTML}
                </div>
                <div class="amount-display">${amountValue}</div>
                <button class="remove-btn" data-item="${key}">×</button>
            `;
        }

        selectedDeductions.appendChild(div);
    }

    addDeductionControlListeners();
}

// Update formatLabel to handle anak entries with custom keys
function formatLabel(key) {
    // Extract the base type for anak entries with custom keys
    const baseType = key.startsWith('anak-') ? 'anak' : key;
    
    const labels = {
        diri: 'Diri',
        isteri: 'Isteri',
        anak: 'Anak',
        kwsp: 'KWSP',
        sumbangan: 'Sumbangan Ibu Bapa',
        tabunghaji: 'Tabung Haji',
        takaful: 'Takaful'
    };
    return labels[baseType] || key;
}

function addDeductionControlListeners() {
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemKey = e.target.dataset.item;
            if (btn.classList.contains('plus')) {
                items[itemKey].quantity++;
            } else {
                items[itemKey].quantity = Math.max(1, items[itemKey].quantity - 1);
            }
            renderItems();
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const itemKey = e.target.dataset.item;
            items[itemKey].quantity = Math.max(1, parseInt(e.target.value) || 1);
            renderItems();
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            delete items[e.target.dataset.item];
            renderItems();
        });
    });

    // Remove duplicate event listener and modify the input handling
    document.querySelectorAll('.amount-input').forEach(input => {
        // Remove old listeners first
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Add a new listener that updates the value without re-rendering on each keystroke
        newInput.addEventListener('input', (e) => {
            const itemKey = e.target.dataset.item;
            const value = parseFloat(e.target.value) || 0;
            items[itemKey].amount = value;
            
            // Only update the label, not the entire list
            const label = e.target.parentNode.querySelector('.quantity-label');
            if (label) {
                label.textContent = `RM${value.toFixed(2)}`;
            }
        });
        
        // Update the full list only when focus is lost
        newInput.addEventListener('blur', () => {
            renderItems();
        });
    });

    // Add event listener for anak category dropdown
    document.querySelectorAll('.anak-category').forEach(select => {
        select.addEventListener('change', (e) => {
            const itemKey = e.target.dataset.item;
            items[itemKey].category = e.target.value;
            renderItems();
        });
    });
}

document.getElementById('pendapatanBulanan').addEventListener('input', function() {
    calculateTotalIncome();
    // Only re-render items if deductions are shown and KWSP is selected
    if (document.getElementById('showDeductions').checked && items['kwsp']) {
        renderItems();
    }
});

// Add a window resize listener to adapt UI for different screen sizes
window.addEventListener('resize', function() {
    // Re-render items if they exist to adjust for new screen size
    if (Object.keys(incomeItems).length > 0) {
        renderIncomeItems();
    }
    
    if (Object.keys(items).length > 0) {
        renderItems();
    }
});

// Add this utility function for better mobile detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Set current year when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const currentYearElement = document.getElementById('current-year');
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;
});