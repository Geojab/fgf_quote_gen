// State management
let state = {
    weddingDetails: {
        brideName: '',
        groomName: '',
        weddingDate: '',
        contactEmail: '',
        contactPhone: '',
        weddingVenue: '',
        weddingTime: '',
        receptionVenue: '',
        receptionTime: '',
        tableCount: 0,
        tableShape: ''
    },
    flowers: [],
    items: [],
    assignments: {},
    pricing: {},
    additionalCosts: {
        headFloristDays: 2,
        headFloristCost: 200,
        headFloristBundle: true,
        assistantDays: 1,
        assistantCost: 150,
        assistantBundle: true,
        mileage: 0,
        mileageCost: 0.45,
        mileageBundle: true,
        overnightStays: 0,
        overnightCost: 0,
        overnightBundle: true
    },
    customCosts: []
};

// DOM elements
const stageButtons = document.querySelectorAll('.stage-btn');
const stages = document.querySelectorAll('.stage');
const flowersList = document.getElementById('flowers-list');
const itemsList = document.getElementById('items-list');
const assignmentGrid = document.getElementById('assignment-grid');
const totalStems = document.getElementById('total-stems');
const pricingGrid = document.getElementById('pricing-grid');
const orderTotals = document.getElementById('order-totals');
const quoteGrid = document.getElementById('quote-grid');
const quoteTotals = document.getElementById('quote-totals');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize state with proper defaults
    if (!state.weddingDetails) state.weddingDetails = {
        brideName: '',
        groomName: '',
        weddingDate: '',
        contactEmail: '',
        contactPhone: '',
        weddingVenue: '',
        weddingTime: '',
        receptionVenue: '',
        receptionTime: '',
        tableCount: 0,
        tableShape: ''
    };
    if (!state.flowers) state.flowers = [];
    if (!state.items) state.items = [];
    if (!state.assignments) state.assignments = {};
    if (!state.pricing) state.pricing = {};
    if (!state.additionalCosts) state.additionalCosts = {
        headFloristDays: 2,
        headFloristCost: 200,
        assistantDays: 1,
        assistantCost: 150,
        mileage: 0,
        mileageCost: 0.45,
        overnightStays: 0,
        overnightCost: 0
    };
    if (!state.customCosts) state.customCosts = [];
    
    loadState();
    initializeEventListeners();
    initializeQuoteManagement();
    renderAll();
    renderWeddingDetails();
});

// Event listeners
function initializeEventListeners() {
    // Stage navigation
    stageButtons.forEach(btn => {
        btn.addEventListener('click', () => switchStage(btn.dataset.stage));
    });

    // Add flower
    document.getElementById('add-flower').addEventListener('click', addFlower);
    document.getElementById('flower-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addFlower();
    });

    // Add item
    document.getElementById('add-item').addEventListener('click', addItem);
    document.getElementById('item-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });
    document.getElementById('item-quantity').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    // Add custom cost
    document.getElementById('add-custom-cost-btn').addEventListener('click', addCustomCost);
}

// Stage navigation
function switchStage(stageName) {
    // Update active stage button
    stageButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.stage === stageName);
    });

    // Update active stage content
    stages.forEach(stage => {
        stage.classList.toggle('active', stage.id === `${stageName}-stage`);
    });

    // Re-render stages if switching to them
    if (stageName === 'assignment') {
        renderAssignmentStage();
    } else if (stageName === 'pricing') {
        renderPricingStage();
    } else if (stageName === 'quote') {
        renderQuoteStage();
        updateAdditionalCostTotals();
        renderCustomCosts();
    }
}

// Wedding details management
function updateWeddingDetail(field, value) {
    state.weddingDetails[field] = value;
    saveState();
}

function renderWeddingDetails() {
    // Populate form fields with saved data
    document.getElementById('bride-name').value = state.weddingDetails.brideName || '';
    document.getElementById('groom-name').value = state.weddingDetails.groomName || '';
    document.getElementById('wedding-date').value = state.weddingDetails.weddingDate || '';
    document.getElementById('contact-email').value = state.weddingDetails.contactEmail || '';
    document.getElementById('contact-phone').value = state.weddingDetails.contactPhone || '';
    document.getElementById('wedding-venue').value = state.weddingDetails.weddingVenue || '';
    document.getElementById('wedding-time').value = state.weddingDetails.weddingTime || '';
    document.getElementById('reception-venue').value = state.weddingDetails.receptionVenue || '';
    document.getElementById('reception-time').value = state.weddingDetails.receptionTime || '';
    document.getElementById('table-count').value = state.weddingDetails.tableCount || 0;
    document.getElementById('table-shape').value = state.weddingDetails.tableShape || '';
}

// Flower management
function addFlower() {
    const input = document.getElementById('flower-name');
    const flowerName = input.value.trim();
    
    if (flowerName && !state.flowers.includes(flowerName)) {
        state.flowers.push(flowerName);
        input.value = '';
        renderFlowers();
        saveState();
    }
}

function removeFlower(flowerName) {
    state.flowers = state.flowers.filter(f => f !== flowerName);
    
    // Remove assignments for this flower
    Object.keys(state.assignments).forEach(itemId => {
        delete state.assignments[itemId][flowerName];
    });
    
    // Remove pricing for this flower
    delete state.pricing[flowerName];
    
    renderFlowers();
    renderAssignmentStage();
    renderPricingStage();
    renderQuoteStage();
    saveState();
}

function renderFlowers() {
    flowersList.innerHTML = '';
    
    if (state.flowers.length === 0) {
        flowersList.innerHTML = '<p style="color: #666; font-style: italic;">No flowers added yet. Add some flowers to get started!</p>';
        return;
    }
    
    state.flowers.forEach(flower => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-info">
                <div class="item-name">${flower}</div>
            </div>
            <button class="remove-btn" onclick="removeFlower('${flower}')" title="Remove flower">×</button>
        `;
        flowersList.appendChild(card);
    });
}

// Item management
function addItem() {
    const nameInput = document.getElementById('item-name');
    const quantityInput = document.getElementById('item-quantity');
    const itemName = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (itemName) {
        const itemId = `${itemName}_${Date.now()}`;
        const item = {
            id: itemId,
            name: itemName,
            quantity: quantity
        };
        
        state.items.push(item);
        state.assignments[itemId] = {};
        
        nameInput.value = '';
        quantityInput.value = '1';
        renderItems();
        saveState();
    }
}

function removeItem(itemId) {
    state.items = state.items.filter(item => item.id !== itemId);
    delete state.assignments[itemId];
    renderItems();
    renderAssignmentStage();
    renderPricingStage();
    renderQuoteStage();
    saveState();
}

function updateItemQuantity(itemId, newQuantity) {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
        item.quantity = Math.max(1, newQuantity);
        renderItems();
        renderAssignmentStage();
        renderPricingStage();
        renderQuoteStage();
        saveState();
    }
}

function renderItems() {
    itemsList.innerHTML = '';
    
    if (state.items.length === 0) {
        itemsList.innerHTML = '<p style="color: #666; font-style: italic;">No items added yet. Add some wedding items!</p>';
        return;
    }
    
    state.items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">Quantity: 
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="updateItemQuantity('${item.id}', parseInt(this.value))" 
                           style="width: 60px; margin-left: 5px;">
                </div>
            </div>
            <button class="remove-btn" onclick="removeItem('${item.id}')" title="Remove item">×</button>
        `;
        itemsList.appendChild(card);
    });
}

// Assignment management
function renderAssignmentStage() {
    if (state.flowers.length === 0 || state.items.length === 0) {
        assignmentGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>Complete the previous stages first!</h3>
                <p>Add flowers and items before assigning stems.</p>
            </div>
        `;
        return;
    }
    
    // Create assignment table
    const table = document.createElement('table');
    table.className = 'assignment-table';
    
    // Header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Item</th>';
    state.flowers.forEach(flower => {
        headerRow.innerHTML += `<th>${flower}</th>`;
    });
    table.appendChild(headerRow);
    
    // Data rows
    state.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `<td><strong>${item.name} (×${item.quantity})</strong></td>`;
        
        state.flowers.forEach(flower => {
            const assignmentKey = `${item.id}_${flower}`;
            const currentValue = state.assignments[item.id]?.[flower] || 0;
            
            row.innerHTML += `
                <td>
                    <input type="number" 
                           value="${currentValue}" 
                           min="0" 
                           onchange="updateAssignment('${item.id}', '${flower}', parseInt(this.value) || 0)"
                           placeholder="0">
                </td>
            `;
        });
        
        table.appendChild(row);
    });
    
    assignmentGrid.innerHTML = '';
    assignmentGrid.appendChild(table);
    
    // Render totals
    renderTotals();
}

function updateAssignment(itemId, flower, stems) {
    if (!state.assignments[itemId]) {
        state.assignments[itemId] = {};
    }
    
    state.assignments[itemId][flower] = stems;
    renderTotals();
    renderPricingStage();
    renderQuoteStage();
    saveState();
}

function renderTotals() {
    const totals = {};
    
    // Calculate totals for each flower
    state.flowers.forEach(flower => {
        totals[flower] = 0;
        
        state.items.forEach(item => {
            const stemsPerItem = state.assignments[item.id]?.[flower] || 0;
            totals[flower] += stemsPerItem * item.quantity;
        });
    });
    
    // Render totals
    totalStems.innerHTML = '';
    
    if (Object.keys(totals).length === 0) {
        totalStems.innerHTML = '<p style="color: #666; font-style: italic;">No assignments made yet.</p>';
        return;
    }
    
    state.flowers.forEach(flower => {
        if (totals[flower] > 0) {
            const totalItem = document.createElement('div');
            totalItem.className = 'total-item';
            totalItem.innerHTML = `
                <div class="total-flower">${flower}</div>
                <div class="total-count">${totals[flower]} stems</div>
            `;
            totalStems.appendChild(totalItem);
        }
    });
}

// Pricing management
function renderPricingStage() {
    if (!state.flowers || state.flowers.length === 0) {
        pricingGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>Add flowers first!</h3>
                <p>You need to add flowers before setting up pricing.</p>
            </div>
        `;
        return;
    }
    
    // Calculate required stems for each flower
    const requiredStems = calculateRequiredStems();
    
    // Create pricing table
    const table = document.createElement('table');
    table.className = 'pricing-table';
    
    // Header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Flower</th>
        <th>Required Stems</th>
        <th>Stems per Bunch</th>
        <th>Price per Bunch (£)</th>
        <th>Safety Margin (%)</th>
        <th>Bunches Needed</th>
        <th>Total Cost (£)</th>
    `;
    table.appendChild(headerRow);
    
    // Data rows
    state.flowers.forEach(flower => {
        const pricing = state.pricing[flower] || {
            stemsPerBunch: 10,
            pricePerBunch: 0,
            safetyMargin: 10
        };
        
        const required = requiredStems[flower] || 0;
        const withMargin = Math.ceil(required * (1 + pricing.safetyMargin / 100));
        const bunchesNeeded = Math.ceil(withMargin / pricing.stemsPerBunch);
        const totalCost = bunchesNeeded * pricing.pricePerBunch;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="flower-name">${flower}</td>
            <td class="required-stems">${required}</td>
            <td>
                <input type="number" 
                       value="${pricing.stemsPerBunch}" 
                       min="1" 
                       onchange="updatePricing('${flower}', 'stemsPerBunch', parseInt(this.value) || 1)"
                       placeholder="10">
            </td>
            <td>
                <input type="number" 
                       value="${pricing.pricePerBunch}" 
                       min="0" 
                       step="0.01"
                       onchange="updatePricing('${flower}', 'pricePerBunch', parseFloat(this.value) || 0)"
                       placeholder="0.00">
            </td>
            <td>
                <input type="number" 
                       value="${pricing.safetyMargin}" 
                       min="0" 
                       max="100"
                       onchange="updatePricing('${flower}', 'safetyMargin', parseInt(this.value) || 0)"
                       placeholder="10">
            </td>
            <td class="bunches-needed">${bunchesNeeded}</td>
            <td class="total-cost">£${totalCost.toFixed(2)}</td>
        `;
        table.appendChild(row);
    });
    
    pricingGrid.innerHTML = '';
    pricingGrid.appendChild(table);
    
    // Render order summary
    renderOrderSummary(requiredStems);
}

function updatePricing(flower, field, value) {
    if (!state.pricing[flower]) {
        state.pricing[flower] = {
            stemsPerBunch: 10,
            pricePerBunch: 0,
            safetyMargin: 10
        };
    }
    
    state.pricing[flower][field] = value;
    renderPricingStage();
    saveState();
}

function calculateRequiredStems() {
    const totals = {};
    
    if (!state.flowers || !state.items) {
        return totals;
    }
    
    state.flowers.forEach(flower => {
        totals[flower] = 0;
        
        state.items.forEach(item => {
            const stemsPerItem = state.assignments[item.id]?.[flower] || 0;
            totals[flower] += stemsPerItem * item.quantity;
        });
    });
    
    return totals;
}

function renderOrderSummary(requiredStems) {
    orderTotals.innerHTML = '';
    
    let grandTotal = 0;
    
    if (!state.flowers) {
        orderTotals.innerHTML = '<p style="color: #666; font-style: italic; text-align: center;">No flowers available for pricing.</p>';
        return;
    }
    
    state.flowers.forEach(flower => {
        const pricing = state.pricing[flower] || {
            stemsPerBunch: 10,
            pricePerBunch: 0,
            safetyMargin: 10
        };
        
        const required = requiredStems[flower] || 0;
        const withMargin = Math.ceil(required * (1 + pricing.safetyMargin / 100));
        const bunchesNeeded = Math.ceil(withMargin / pricing.stemsPerBunch);
        const totalCost = bunchesNeeded * pricing.pricePerBunch;
        
        if (required > 0) {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="order-flower">${flower}</div>
                <div class="order-details">${bunchesNeeded} bunches × £${pricing.pricePerBunch.toFixed(2)}</div>
                <div class="order-details">${withMargin} stems needed (${pricing.safetyMargin}% margin)</div>
                <div class="order-cost">£${totalCost.toFixed(2)}</div>
            `;
            orderTotals.appendChild(orderItem);
            
            grandTotal += totalCost;
        }
    });
    
    if (grandTotal > 0) {
        const grandTotalDiv = document.createElement('div');
        grandTotalDiv.className = 'grand-total';
        grandTotalDiv.innerHTML = `Total Order Cost: £${grandTotal.toFixed(2)}`;
        orderTotals.appendChild(grandTotalDiv);
    } else {
        orderTotals.innerHTML = '<p style="color: #666; font-style: italic; text-align: center;">Complete the assignment stage to see pricing calculations.</p>';
    }
}

// Quote management
function renderQuoteStage() {
    if (!state.items || state.items.length === 0) {
        quoteGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>Add items first!</h3>
                <p>You need to add wedding items before generating quotes.</p>
            </div>
        `;
        return;
    }
    
    // Create quote table
    const table = document.createElement('table');
    table.className = 'quote-table';
    
    // Header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Item</th>
        <th>Quantity</th>
        <th>Flower Breakdown</th>
        <th>Total Flower Cost</th>
        <th>Selling Price (£)</th>
        <th>Item Total (£)</th>
    `;
    table.appendChild(headerRow);
    
    // Data rows
    state.items.forEach(item => {
        const flowerBreakdown = calculateItemFlowerCosts(item);
        const totalFlowerCost = flowerBreakdown.totalCost;
        const sellingPrice = item.sellingPrice || 0;
        const itemTotal = sellingPrice * item.quantity;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="item-name">${item.name}</td>
            <td>${item.quantity}</td>
            <td class="flower-breakdown">
                ${flowerBreakdown.breakdown.map(flower => `
                    <div class="flower-item">
                        <span class="flower-name">${flower.name}</span>
                        <span class="flower-cost">£${flower.cost.toFixed(2)}</span>
                    </div>
                `).join('')}
            </td>
            <td class="total-cost">£${totalFlowerCost.toFixed(2)}</td>
            <td>
                <input type="number" 
                       value="${sellingPrice}" 
                       min="0" 
                       step="0.01"
                       onchange="updateSellingPrice('${item.id}', parseFloat(this.value) || 0)"
                       placeholder="0.00">
            </td>
            <td class="item-total">£${itemTotal.toFixed(2)}</td>
        `;
        table.appendChild(row);
    });
    
    quoteGrid.innerHTML = '';
    quoteGrid.appendChild(table);
    
    // Render quote summary
    renderQuoteSummary();
}

function calculateItemFlowerCosts(item) {
    const breakdown = [];
    let totalCost = 0;
    
    state.flowers.forEach(flower => {
        const stemsPerItem = state.assignments[item.id]?.[flower] || 0;
        if (stemsPerItem > 0) {
            const pricing = state.pricing[flower] || {
                stemsPerBunch: 10,
                pricePerBunch: 0,
                safetyMargin: 10
            };
            
            // Calculate cost per stem (exact, not rounded per bunch)
            const costPerStem = pricing.pricePerBunch / pricing.stemsPerBunch;
            const flowerCost = stemsPerItem * costPerStem;
            
            breakdown.push({
                name: flower,
                stems: stemsPerItem,
                cost: flowerCost
            });
            
            totalCost += flowerCost;
        }
    });
    
    return {
        breakdown: breakdown,
        totalCost: totalCost
    };
}

function updateSellingPrice(itemId, price) {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
        item.sellingPrice = price;
        renderQuoteStage();
        saveState();
    }
}

// Additional costs management
function updateAdditionalCost(field, value) {
    state.additionalCosts[field] = value;
    updateAdditionalCostTotals();
    renderQuoteSummary();
    saveState();
}

function updateAdditionalCostTotals() {
    const costs = state.additionalCosts;
    
    // Update individual totals
    document.getElementById('head-florist-total').textContent = (costs.headFloristDays * costs.headFloristCost).toFixed(2);
    document.getElementById('assistant-total').textContent = (costs.assistantDays * costs.assistantCost).toFixed(2);
    document.getElementById('mileage-total').textContent = (costs.mileage * costs.mileageCost * 4).toFixed(2);
    document.getElementById('overnight-total').textContent = (costs.overnightStays * costs.overnightCost).toFixed(2);
}

function getTotalAdditionalCosts() {
    const costs = state.additionalCosts;
    let total = (costs.headFloristDays * costs.headFloristCost) +
                (costs.assistantDays * costs.assistantCost) +
                (costs.mileage * costs.mileageCost * 4) +
                (costs.overnightStays * costs.overnightCost);
    
    // Add custom costs
    state.customCosts.forEach(customCost => {
        total += customCost.quantity * customCost.unitCost;
    });
    
    return total;
}

// Custom costs management
function addCustomCost() {
    const customCost = {
        id: Date.now().toString(),
        name: 'Custom Item',
        quantity: 1,
        unitCost: 0,
        bundle: true
    };
    
    state.customCosts.push(customCost);
    renderCustomCosts();
    updateAdditionalCostTotals();
    renderQuoteSummary();
    saveState();
}

function removeCustomCost(costId) {
    state.customCosts = state.customCosts.filter(cost => cost.id !== costId);
    renderCustomCosts();
    updateAdditionalCostTotals();
    renderQuoteSummary();
    saveState();
}

function updateCustomCost(costId, field, value) {
    const customCost = state.customCosts.find(cost => cost.id === costId);
    if (customCost) {
        customCost[field] = value;
        renderCustomCosts();
        updateAdditionalCostTotals();
        renderQuoteSummary();
        saveState();
    }
}

function renderCustomCosts() {
    const customCostsList = document.getElementById('custom-costs-list');
    customCostsList.innerHTML = '';
    
    state.customCosts.forEach(customCost => {
        const costItem = document.createElement('div');
        costItem.className = 'custom-cost-item';
        costItem.innerHTML = `
            <div class="custom-cost-header">
                <input type="text" 
                       class="custom-cost-name" 
                       value="${customCost.name}" 
                       placeholder="Enter cost name"
                       onchange="updateCustomCost('${customCost.id}', 'name', this.value)">
                <button class="custom-cost-remove" onclick="removeCustomCost('${customCost.id}')" title="Remove cost">×</button>
            </div>
            <div class="cost-calculation">
                <div class="cost-calculation-left">
                    <input type="number" 
                           value="${customCost.quantity}" 
                           min="0" 
                           placeholder="Qty"
                           onchange="updateCustomCost('${customCost.id}', 'quantity', parseInt(this.value) || 0)">
                    <span>×</span>
                    <span>£</span>
                    <input type="number" 
                           value="${customCost.unitCost}" 
                           min="0" 
                           step="0.01"
                           placeholder="0.00"
                           onchange="updateCustomCost('${customCost.id}', 'unitCost', parseFloat(this.value) || 0)">
                    <span>=</span>
                    <span class="custom-cost-total">£${(customCost.quantity * customCost.unitCost).toFixed(2)}</span>
                </div>
                <div class="cost-calculation-right">
                    <label class="checkbox-label">
                        <input type="checkbox" ${customCost.bundle ? 'checked' : ''} onchange="updateCustomCost('${customCost.id}', 'bundle', this.checked)">
                        <span class="checkmark"></span>
                        Bundle in "Additional Services"
                    </label>
                </div>
            </div>
        `;
        customCostsList.appendChild(costItem);
    });
}

function renderQuoteSummary() {
    quoteTotals.innerHTML = '';
    
    let grandTotal = 0;
    let totalFlowerCosts = 0;
    let totalProfit = 0;
    
    state.items.forEach(item => {
        const flowerBreakdown = calculateItemFlowerCosts(item);
        const itemFlowerCost = flowerBreakdown.totalCost * item.quantity;
        const itemSellingPrice = (item.sellingPrice || 0) * item.quantity;
        const itemProfit = itemSellingPrice - itemFlowerCost;
        
        totalFlowerCosts += itemFlowerCost;
        grandTotal += itemSellingPrice;
        totalProfit += itemProfit;
        
        const quoteItem = document.createElement('div');
        quoteItem.className = 'quote-item';
        quoteItem.innerHTML = `
            <div class="quote-item-name">${item.name} (×${item.quantity})</div>
            <div class="quote-item-details">
                <span class="quote-item-label">Flower Cost:</span>
                <span class="quote-item-value quote-item-cost">£${itemFlowerCost.toFixed(2)}</span>
            </div>
            <div class="quote-item-details">
                <span class="quote-item-label">Selling Price:</span>
                <span class="quote-item-value quote-item-price">£${itemSellingPrice.toFixed(2)}</span>
            </div>
            <div class="quote-item-details">
                <span class="quote-item-label">Profit:</span>
                <span class="quote-item-value quote-item-profit">£${itemProfit.toFixed(2)}</span>
            </div>
        `;
        quoteTotals.appendChild(quoteItem);
    });
    
    if (grandTotal > 0) {
        const additionalCosts = getTotalAdditionalCosts();
        const totalQuoteValue = totalSellingPrice + additionalCosts;
        const netProfit = totalProfit; // Only floral profit, additional costs are at cost
        const profitMargin = totalFlowerCosts > 0 ? ((netProfit / totalFlowerCosts) * 100) : 0;
        
        const grandTotalDiv = document.createElement('div');
        grandTotalDiv.className = 'quote-grand-total';
        grandTotalDiv.innerHTML = `
            <div>Total Quote Value</div>
            <div class="total-amount">£${totalQuoteValue.toFixed(2)}</div>
            <div class="profit-margin">
                Net Profit: £${netProfit.toFixed(2)} (${profitMargin.toFixed(1)}% margin on flowers)
            </div>
            <div style="font-size: 0.9rem; margin-top: 10px; opacity: 0.8;">
                Breakdown: Floral Items £${totalSellingPrice.toFixed(2)} + Additional Services £${additionalCosts.toFixed(2)}
            </div>
        `;
        quoteTotals.appendChild(grandTotalDiv);
    } else {
        quoteTotals.innerHTML = '<p style="color: #666; font-style: italic; text-align: center;">Set selling prices to see quote totals.</p>';
    }
}

// Render all stages
function renderAll() {
    renderFlowers();
    renderItems();
    renderAssignmentStage();
    renderPricingStage();
    renderQuoteStage();
    renderCustomCosts();
}

// Quote management
function initializeQuoteManagement() {
    // Save quote button
    document.getElementById('save-quote-btn').addEventListener('click', showSaveModal);
    
    // Load quote button
    document.getElementById('load-quote-btn').addEventListener('click', showLoadModal);
    
    // New quote button
    document.getElementById('new-quote-btn').addEventListener('click', createNewQuote);
    
    // Generate PDF button
    document.getElementById('generate-pdf-btn').addEventListener('click', generatePDFQuote);
    
    // Modal event listeners
    initializeModalListeners();
}

function initializeModalListeners() {
    // Save modal
    const saveModal = document.getElementById('save-quote-modal');
    const saveClose = saveModal.querySelector('.close');
    const confirmSaveBtn = document.getElementById('confirm-save-btn');
    const cancelSaveBtn = document.getElementById('cancel-save-btn');
    
    saveClose.addEventListener('click', () => hideModal('save-quote-modal'));
    cancelSaveBtn.addEventListener('click', () => hideModal('save-quote-modal'));
    confirmSaveBtn.addEventListener('click', saveQuote);
    
    // Load modal
    const loadModal = document.getElementById('load-quote-modal');
    const loadClose = loadModal.querySelector('.close');
    const confirmLoadBtn = document.getElementById('confirm-load-btn');
    const cancelLoadBtn = document.getElementById('cancel-load-btn');
    const deleteQuoteBtn = document.getElementById('delete-quote-btn');
    
    loadClose.addEventListener('click', () => hideModal('load-quote-modal'));
    cancelLoadBtn.addEventListener('click', () => hideModal('load-quote-modal'));
    confirmLoadBtn.addEventListener('click', loadSelectedQuote);
    deleteQuoteBtn.addEventListener('click', deleteSelectedQuote);
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // File upload
    const fileInput = document.getElementById('file-input');
    const fileUploadBox = document.querySelector('.file-upload-box');
    const loadFileBtn = document.getElementById('load-file-btn');
    const cancelFileBtn = document.getElementById('cancel-file-btn');
    
    fileInput.addEventListener('change', handleFileSelect);
    loadFileBtn.addEventListener('click', loadQuoteFromFile);
    cancelFileBtn.addEventListener('click', () => hideModal('load-quote-modal'));
    
    // Drag and drop
    fileUploadBox.addEventListener('dragover', handleDragOver);
    fileUploadBox.addEventListener('dragleave', handleDragLeave);
    fileUploadBox.addEventListener('drop', handleFileDrop);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            hideModal(event.target.id);
        }
    });
}

function showSaveModal() {
    const modal = document.getElementById('save-quote-modal');
    const input = document.getElementById('quote-name-input');
    
    // Generate default name from wedding details
    const brideName = state.weddingDetails.brideName || 'Bride';
    const groomName = state.weddingDetails.groomName || 'Groom';
    const weddingDate = state.weddingDetails.weddingDate || new Date().toISOString().split('T')[0];
    const defaultName = `${brideName} & ${groomName} - ${new Date(weddingDate).toLocaleDateString()}`;
    
    input.value = defaultName;
    modal.style.display = 'block';
    input.focus();
    input.select();
}

function showLoadModal() {
    const modal = document.getElementById('load-quote-modal');
    renderSavedQuotesList();
    modal.style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function saveQuote() {
    const quoteName = document.getElementById('quote-name-input').value.trim();
    const saveToBrowser = document.getElementById('save-to-browser').checked;
    const downloadFile = document.getElementById('download-file').checked;
    
    if (!quoteName) {
        alert('Please enter a name for the quote.');
        return;
    }
    
    if (!saveToBrowser && !downloadFile) {
        alert('Please select at least one save option.');
        return;
    }
    
    const quoteData = {
        id: Date.now().toString(),
        name: quoteName,
        date: new Date().toISOString(),
        data: JSON.parse(JSON.stringify(state)) // Deep copy
    };
    
    // Save to browser storage
    if (saveToBrowser) {
        const savedQuotes = getSavedQuotes();
        savedQuotes[quoteData.id] = quoteData;
        localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
    }
    
    // Download file
    if (downloadFile) {
        downloadQuoteFile(quoteData);
    }
    
    hideModal('save-quote-modal');
    
    let message = `Quote "${quoteName}" saved successfully!`;
    if (saveToBrowser && downloadFile) {
        message += ' Saved to browser storage and downloaded as file.';
    } else if (saveToBrowser) {
        message += ' Saved to browser storage.';
    } else {
        message += ' Downloaded as file.';
    }
    
    alert(message);
}

function getSavedQuotes() {
    const saved = localStorage.getItem('savedQuotes');
    return saved ? JSON.parse(saved) : {};
}

function renderSavedQuotesList() {
    const quotesList = document.getElementById('saved-quotes-list');
    const savedQuotes = getSavedQuotes();
    
    quotesList.innerHTML = '';
    
    if (Object.keys(savedQuotes).length === 0) {
        quotesList.innerHTML = '<div class="quote-item" style="text-align: center; color: #666; padding: 20px;">No saved quotes found.</div>';
        return;
    }
    
    Object.values(savedQuotes).forEach(quote => {
        const quoteItem = document.createElement('div');
        quoteItem.className = 'quote-item';
        quoteItem.dataset.quoteId = quote.id;
        
        const weddingDate = quote.data.weddingDetails.weddingDate ? 
            new Date(quote.data.weddingDetails.weddingDate).toLocaleDateString() : 'No date';
        
        quoteItem.innerHTML = `
            <div class="quote-name">${quote.name}</div>
            <div class="quote-details">
                ${quote.data.weddingDetails.brideName || 'Bride'} & ${quote.data.weddingDetails.groomName || 'Groom'}
                ${quote.data.weddingDetails.weddingVenue ? ` - ${quote.data.weddingDetails.weddingVenue}` : ''}
            </div>
            <div class="quote-date">Saved: ${new Date(quote.date).toLocaleString()}</div>
        `;
        
        quoteItem.addEventListener('click', () => selectQuote(quote.id));
        quotesList.appendChild(quoteItem);
    });
}

function selectQuote(quoteId) {
    // Remove previous selection
    document.querySelectorAll('.quote-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    document.querySelector(`[data-quote-id="${quoteId}"]`).classList.add('selected');
    
    // Enable buttons
    document.getElementById('confirm-load-btn').disabled = false;
    document.getElementById('delete-quote-btn').disabled = false;
    
    // Store selected quote ID
    document.getElementById('confirm-load-btn').dataset.quoteId = quoteId;
    document.getElementById('delete-quote-btn').dataset.quoteId = quoteId;
}

function loadSelectedQuote() {
    const quoteId = document.getElementById('confirm-load-btn').dataset.quoteId;
    const savedQuotes = getSavedQuotes();
    const quote = savedQuotes[quoteId];
    
    if (quote) {
        state = JSON.parse(JSON.stringify(quote.data)); // Deep copy
        renderAll();
        renderWeddingDetails();
        updateAdditionalCostTotals();
        hideModal('load-quote-modal');
        alert(`Quote "${quote.name}" loaded successfully!`);
    }
}

function deleteSelectedQuote() {
    const quoteId = document.getElementById('delete-quote-btn').dataset.quoteId;
    const savedQuotes = getSavedQuotes();
    const quote = savedQuotes[quoteId];
    
    if (quote && confirm(`Are you sure you want to delete "${quote.name}"? This cannot be undone.`)) {
        delete savedQuotes[quoteId];
        localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
        renderSavedQuotesList();
        
        // Disable buttons
        document.getElementById('confirm-load-btn').disabled = true;
        document.getElementById('delete-quote-btn').disabled = true;
    }
}

function createNewQuote() {
    if (confirm('Create a new quote? This will clear all current data.')) {
        state = {
            weddingDetails: {
                brideName: '',
                groomName: '',
                weddingDate: '',
                contactEmail: '',
                contactPhone: '',
                weddingVenue: '',
                weddingTime: '',
                receptionVenue: '',
                receptionTime: '',
                tableCount: 0,
                tableShape: ''
            },
            flowers: [],
            items: [],
            assignments: {},
            pricing: {},
            additionalCosts: {
                headFloristDays: 2,
                headFloristCost: 200,
                assistantDays: 1,
                assistantCost: 150,
                mileage: 0,
                mileageCost: 0.45,
                overnightStays: 0,
                overnightCost: 0
            }
        };
        
        renderAll();
        renderWeddingDetails();
        updateAdditionalCostTotals();
        alert('New quote created!');
    }
}

// File handling functions
function downloadQuoteFile(quoteData) {
    const dataStr = JSON.stringify(quoteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create filename from quote name
    const filename = quoteData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_quote.json';
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        updateFileUploadDisplay(file.name);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
}

function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
            document.getElementById('file-input').files = files;
            updateFileUploadDisplay(file.name);
        } else {
            alert('Please select a valid JSON file.');
        }
    }
}

function updateFileUploadDisplay(fileName) {
    const uploadBox = document.querySelector('.file-upload-box');
    const uploadText = uploadBox.querySelector('.upload-text');
    const uploadHint = uploadBox.querySelector('.upload-hint');
    
    uploadBox.classList.add('file-selected');
    uploadText.textContent = `Selected: ${fileName}`;
    uploadHint.textContent = 'Click to change file';
    
    document.getElementById('load-file-btn').disabled = false;
}

function loadQuoteFromFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file first.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const quoteData = JSON.parse(e.target.result);
            
            // Validate quote data structure
            if (!quoteData.data || !quoteData.data.weddingDetails) {
                throw new Error('Invalid quote file format');
            }
            
            // Load the quote data
            state = JSON.parse(JSON.stringify(quoteData.data)); // Deep copy
            renderAll();
            renderWeddingDetails();
            updateAdditionalCostTotals();
            hideModal('load-quote-modal');
            
            alert(`Quote "${quoteData.name}" loaded successfully from file!`);
            
        } catch (error) {
            alert('Error loading quote file. Please make sure it\'s a valid quote file.');
            console.error('File load error:', error);
        }
    };
    
    reader.readAsText(file);
}

// PDF Generation
function generatePDFQuote() {
    if (!state.weddingDetails.brideName || !state.weddingDetails.groomName) {
        alert('Please complete the wedding details before generating a PDF quote.');
        return;
    }
    
    if (!state.items || state.items.length === 0) {
        alert('Please add wedding items before generating a PDF quote.');
        return;
    }
    
    // Create quote HTML
    const quoteHTML = createQuoteHTML();
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(quoteHTML);
    printWindow.document.close();
    
    // Wait for fonts to load, then print
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
        }, 1000);
    };
}

function createQuoteHTML() {
    const wedding = state.weddingDetails;
    const items = state.items;
    const additionalCosts = state.additionalCosts;
    
    // Calculate totals
    let totalFlowerCosts = 0;
    let totalSellingPrice = 0;
    let totalAdditionalCosts = 0;
    
    items.forEach(item => {
        const flowerBreakdown = calculateItemFlowerCosts(item);
        const itemFlowerCost = flowerBreakdown.totalCost * item.quantity;
        const itemSellingPrice = (item.sellingPrice || 0) * item.quantity;
        
        totalFlowerCosts += itemFlowerCost;
        totalSellingPrice += itemSellingPrice;
    });
    
    totalAdditionalCosts = getTotalAdditionalCosts();
    
    const grandTotal = totalSellingPrice + totalAdditionalCosts;
    const netProfit = totalSellingPrice - totalFlowerCosts;
    
    function generateAdditionalServicesHTML(costs) {
        let html = '';
        let bundledTotal = 0;
        
        // Individual line items (if bundle is NOT checked)
        if (!costs.headFloristBundle && costs.headFloristDays > 0) {
            const total = costs.headFloristDays * costs.headFloristCost;
            html += `<div class="total-row"><span>Head Florist (${costs.headFloristDays} days):</span><span>£${total.toFixed(2)}</span></div>`;
        } else if (costs.headFloristBundle && costs.headFloristDays > 0) {
            bundledTotal += costs.headFloristDays * costs.headFloristCost;
        }
        
        if (!costs.assistantBundle && costs.assistantDays > 0) {
            const total = costs.assistantDays * costs.assistantCost;
            html += `<div class="total-row"><span>Assistant Florist (${costs.assistantDays} days):</span><span>£${total.toFixed(2)}</span></div>`;
        } else if (costs.assistantBundle && costs.assistantDays > 0) {
            bundledTotal += costs.assistantDays * costs.assistantCost;
        }
        
        if (!costs.mileageBundle && costs.mileage > 0) {
            const total = costs.mileage * costs.mileageCost * 4;
            html += `<div class="total-row"><span>Travel (${costs.mileage} miles):</span><span>£${total.toFixed(2)}</span></div>`;
        } else if (costs.mileageBundle && costs.mileage > 0) {
            bundledTotal += costs.mileage * costs.mileageCost * 4;
        }
        
        if (!costs.overnightBundle && costs.overnightStays > 0) {
            const total = costs.overnightStays * costs.overnightCost;
            html += `<div class="total-row"><span>Overnight Stays (${costs.overnightStays}):</span><span>£${total.toFixed(2)}</span></div>`;
        } else if (costs.overnightBundle && costs.overnightStays > 0) {
            bundledTotal += costs.overnightStays * costs.overnightCost;
        }
        
        // Custom costs
        state.customCosts.forEach(customCost => {
            if (!customCost.bundle && customCost.quantity > 0) {
                const total = customCost.quantity * customCost.unitCost;
                html += `<div class="total-row"><span>${customCost.name} (${customCost.quantity}):</span><span>£${total.toFixed(2)}</span></div>`;
            } else if (customCost.bundle && customCost.quantity > 0) {
                bundledTotal += customCost.quantity * customCost.unitCost;
            }
        });
        
        // Bundled services line
        if (bundledTotal > 0) {
            html += `<div class="total-row"><span>Additional Services:</span><span>£${bundledTotal.toFixed(2)}</span></div>`;
        }
        
        return html;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quote - ${wedding.brideName} & ${wedding.groomName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @font-face {
            font-family: 'Black Mango';
            src: url('black-mango-regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
        body { margin: 0; padding: 0; }
        .quote-template {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #faf6f2;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.6;
        }
        .quote-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
            border-bottom: 3px solid #ed9696;
            padding-bottom: 15px;
        }
        .quote-header-left {
            flex: 1;
        }
        .quote-header-right {
            flex-shrink: 0;
            margin-left: 20px;
        }
        .quote-logo {
            max-width: 120px;
            height: auto;
        }
        .quote-title {
            font-family: 'Black Mango', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 2rem;
            color: #85837a;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
        }
        .quote-subtitle {
            font-family: 'Black Mango', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 1.2rem;
            color: #ed9696;
            margin: 10px 0;
            font-style: italic;
        }
        .quote-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .quote-section h3 {
            font-family: 'Black Mango', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 1.4rem;
            color: #85837a;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #ed9696;
            padding-bottom: 5px;
        }
        .quote-section p {
            margin: 8px 0;
            font-size: 1rem;
            color: #333;
        }
        .quote-section strong {
            color: #85837a;
            font-weight: 600;
        }
        .quote-items {
            margin: 40px 0;
        }
        .quote-items h3 {
            font-family: 'Black Mango', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 1.6rem;
            color: #85837a;
            margin-bottom: 20px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .quote-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .quote-table th {
            background: #85837a;
            color: white;
            padding: 15px;
            text-align: left;
            font-family: 'Black Mango', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 1.1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .quote-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 11px;
        }
        .quote-table th {
            font-size: 11px;
            padding: 10px 12px;
        }
        .quote-table tr:nth-child(even) {
            background: #faf6f2;
        }
        .quote-table .item-name {
            font-weight: 600;
            color: #85837a;
        }
        .quote-table .item-cost {
            text-align: right;
            font-weight: 600;
            color: #ed9696;
        }
        .quote-totals {
            background: #faf6f2;
            padding: 30px;
            border-radius: 8px;
            border: 2px solid #ed9696;
            margin: 30px 0;
        }
        .quote-totals h3 {
            font-family: 'Black Mango', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 1.4rem;
            color: #85837a;
            margin-bottom: 20px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .total-row.final {
            font-size: 1.3rem;
            font-weight: bold;
            color: #85837a;
            border-top: 2px solid #ed9696;
            margin-top: 10px;
            padding-top: 15px;
        }
        .total-row.deposit {
            font-size: 1.1rem;
            font-weight: bold;
            color: #ed9696;
            background: rgba(237, 150, 150, 0.1);
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .total-row.balance {
            font-size: 1rem;
            color: #85837a;
            font-weight: 600;
            margin-top: 5px;
        }
        .quote-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ed9696;
            text-align: center;
        }
        .quote-footer h4 {
            font-family: 'Black Mango', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 1.2rem;
            color: #85837a;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .quote-footer p {
            margin: 5px 0;
            font-size: 0.9rem;
            color: #666;
        }
        
        /* Terms and Conditions */
        .terms-conditions {
            margin-top: 30px;
            page-break-before: always;
        }
        .terms-conditions h3 {
            font-family: 'Black Mango', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 1.4rem;
            color: #85837a;
            margin-bottom: 15px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #ed9696;
            padding-bottom: 10px;
        }
        .terms-content {
            font-size: 10px;
            line-height: 1.4;
        }
        .terms-section {
            margin-bottom: 12px;
        }
        .terms-section h4 {
            font-family: 'Black Mango', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
            color: #85837a;
            font-size: 11px;
            margin-bottom: 5px;
            font-weight: 600;
        }
        .terms-section p {
            margin-bottom: 5px;
            color: #333;
            text-align: justify;
        }
        .terms-acceptance {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ed9696;
        }
        .terms-acceptance p {
            font-weight: 600;
            color: #85837a;
        }
        
        /* Signature Section */
        .signature-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ed9696;
        }
        .signature-row {
            display: flex;
            justify-content: space-between;
            gap: 30px;
        }
        .signature-field {
            flex: 1;
            text-align: center;
        }
        .signature-line {
            border-bottom: 2px solid #85837a;
            height: 40px;
            margin-bottom: 10px;
        }
        .signature-field p {
            font-size: 10px;
            color: #85837a;
            font-weight: 600;
            margin: 0;
        }
        @media print {
            .quote-template {
                background: white;
                padding: 20px;
                margin: 0;
                max-width: none;
            }
            .quote-header {
                border-bottom: 2px solid #ed9696;
            }
            .quote-table {
                box-shadow: none;
                border: 1px solid #ddd;
            }
            .quote-totals {
                border: 1px solid #ed9696;
            }
        }
    </style>
</head>
<body>
    <div class="quote-template">
        <div class="quote-header">
            <div class="quote-header-left">
                <h1 class="quote-title">Field Good Flowers</h1>
                <p class="quote-subtitle">Wedding Floral Quote</p>
            </div>
            <div class="quote-header-right">
                <img src="Field Good Flowers (1).svg" alt="Field Good Flowers" class="quote-logo">
            </div>
        </div>
        
        <div class="quote-details">
            <div class="quote-section">
                <h3>Wedding Details</h3>
                <p><strong>Couple:</strong> ${wedding.brideName} & ${wedding.groomName}</p>
                <p><strong>Wedding Date:</strong> ${wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString() : 'TBD'}</p>
                <p><strong>Ceremony:</strong> ${wedding.weddingVenue || 'TBD'}</p>
                <p><strong>Time:</strong> ${wedding.weddingTime || 'TBD'}</p>
                <p><strong>Reception:</strong> ${wedding.receptionVenue || 'TBD'}</p>
                <p><strong>Time:</strong> ${wedding.receptionTime || 'TBD'}</p>
                <p><strong>Tables:</strong> ${wedding.tableCount} ${wedding.tableShape || 'tables'}</p>
            </div>
            
            <div class="quote-section">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> ${wedding.contactEmail || 'Not provided'}</p>
                <p><strong>Phone:</strong> ${wedding.contactPhone || 'Not provided'}</p>
                <p><strong>Quote Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Valid Until:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
        </div>
        
        <div class="quote-items">
            <h3>Floral Items</h3>
            <table class="quote-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => {
                        const flowerBreakdown = calculateItemFlowerCosts(item);
                        const itemFlowerCost = flowerBreakdown.totalCost;
                        const sellingPrice = item.sellingPrice || 0;
                        const itemTotal = sellingPrice * item.quantity;
                        
                        return `
                            <tr>
                                <td class="item-name">${item.name}</td>
                                <td>${item.quantity}</td>
                                <td class="item-cost">£${sellingPrice.toFixed(2)}</td>
                                <td class="item-cost">£${itemTotal.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="quote-totals">
            <h3>Quote Summary</h3>
            <div class="total-row">
                <span>Floral Items Subtotal:</span>
                <span>£${totalSellingPrice.toFixed(2)}</span>
            </div>
            ${generateAdditionalServicesHTML(additionalCosts)}
            <div class="total-row final">
                <span>Total Quote:</span>
                <span>£${grandTotal.toFixed(2)}</span>
            </div>
            <div class="total-row deposit">
                <span>Required Deposit (30%):</span>
                <span>£${(grandTotal * 0.3).toFixed(2)}</span>
            </div>
            <div class="total-row balance">
                <span>Remaining Balance:</span>
                <span>£${(grandTotal * 0.7).toFixed(2)}</span>
            </div>
        </div>
        
        <div class="terms-conditions">
            <h3>Terms & Conditions</h3>
            <div class="terms-content">
                <div class="terms-section">
                    <h4>Bookings & Payments:</h4>
                    <p>In order to secure Field Good Flowers Ltd services and reserve your wedding date, a non-refundable deposit of 30% of your total quoted amount is required along with this signed contract. The remaining balance is due no later than 30 days before the wedding. If the balance is not paid by this date, Field Good Flowers Ltd reserves the right to cancel services, with no refund of the deposit. Payment may be made via bank transfer.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Design Revisions:</h4>
                    <p>Additions, subtractions, and small changes can be made up to 30 days prior to your wedding. Changes requested less than 30 days before the event may not be possible, as floral orders and preparation may already be underway; however, Field Good Flowers Ltd will make every effort to accommodate your needs.</p>
                    <p>Please note that any changes may affect the total cost. Increases will be invoiced separately and must be paid in advance. Reductions in scope or quantity may not result in a price decrease of more than 20% below the originally agreed quotation. This reflects time, planning, and product commitments already made in preparation for your event.</p>
                    <p>If you need to change the date of your event, Field Good Flowers Ltd attempt to accommodate you, however, this will be based on the availability of the date and materials.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Flower Costs:</h4>
                    <p>In the event of a significant increase in the wholesale cost of specific flowers around your event date, Field Good Flowers Ltd may contact you in order to either adjust the cost accordingly or to make appropriate substitutions.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Substitutions:</h4>
                    <p>Field Good Flowers Ltd reserves the right to make substitutions if the quality of flowers or decor is deemed unsuitable for the event. Flowers are subject to seasonal availability, and substitutions of equivalent value will be made to maintain the proposed look and colour scheme.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Rentals:</h4>
                    <p>All items hired from Field Good Flowers Ltd remain its property. You will be charged for any damaged, broken, or missing hire items. Payment for replacement costs must be made within 7 days of receiving a quote. Rental items will be collected by Field Good Flowers Ltd unless otherwise arranged.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Items Supplied by You:</h4>
                    <p>Any props, styling items, or vases supplied by you must be clean, undamaged, and free of unwanted stickers or labels. Field Good Flowers reserves the right not to use provided items that do not meet its standards.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Candles:</h4>
                    <p>Field Good Flowers Ltd is not responsible for lighting candles unless specifically arranged. Ensure the venue agrees to light the candles, and Field Good Flowers Ltd will not be liable for any damage or injury resulting from their use.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Delivery & Setup:</h4>
                    <p>Your quotation includes the cost of setting up only the items outlined in your quotation. On the day, Field Good Flowers Ltd cannot help with any other additional styling serviced, assisting with the cake construction or any other assistance your guests may require.</p>
                    <p>If any elements are being transported from one venue to another by anybody other than Field Good Flowers Ltd, you do so at your own risk. Field Good Flowers Ltd cannot be held responsible for any damage caused to flower arrangements after they have been delivered.</p>
                    <p>Pinning of buttonholes/corsages on dresses and suits is done at the wearers own risk. Field Good Flowers Ltd cannot be responsible for any snagging, staining or tearing to delicate materials with the pins we supply.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Unforeseen Circumstances:</h4>
                    <p>Field Good Flowers Ltd reserves the right to cancel this contract if at any time Field Good Flowers Ltd feels that the obligations cannot be met. Money will not be refunded and all remaining balance must still be paid if the event gets cancelled within 30 days of event date due to any circumstances including but not limited to fire, natural disaster, severe weather, tragedy or other emergency, Field Good Flowers Ltd will credit the amount toward another date minus any actual costs incurred up to the point you are informed. In the event of exceptionally hot weather, Field Good Flowers Ltd will use their best judgment on how to keep the flowers looking fresh. Field Good Flowers Ltd is not responsible for flowers that are wilting as a result of being in hot weather for an extended period of time. In the event that Field Good Flowers Ltd is unable to provide the services for your event due to illness or tragedy a suitable replacement florist will be found and recommended to take over your event or a refund on all money paid will be issued.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Display Rights:</h4>
                    <p>Field Good Flowers Ltd reserves the right to take photographs and videos of the floral arrangements and event setup for marketing and portfolio purposes, including use on our website, social media, and printed materials. These images will focus on the flowers and styling.</p>
                    <p>If any individuals do not wish to be photographed, the client must inform Field Good Flowers Ltd in writing prior to the event date. Field Good Flowers Ltd will make every effort to ensure those individuals are not included in any images taken.</p>
                    <p>All images captured remain the property of Field Good Flowers Ltd, and Field Good Flowers Ltd retains full copyright.</p>
                </div>
                
                <div class="terms-section">
                    <h4>Professional Images:</h4>
                    <p>Client agrees to provide Field Good Flowers Ltd with access to all professional images featuring its designs. Images will be obtained via a link provided by the client's photographer or directly from the client.</p>
                </div>
                
                <div class="terms-acceptance">
                    <p><strong>By signing below I declare I have read, accept and comply with the terms and conditions of Field Good Flowers Ltd:</strong></p>
                </div>
            </div>
        </div>
        
        <div class="signature-section">
            <div class="signature-row">
                <div class="signature-field">
                    <div class="signature-line"></div>
                    <p>Client Name</p>
                </div>
                <div class="signature-field">
                    <div class="signature-line"></div>
                    <p>Date</p>
                </div>
                <div class="signature-field">
                    <div class="signature-line"></div>
                    <p>Signature</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Local storage
function saveState() {
    localStorage.setItem('floristryQuoteState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('floristryQuoteState');
    if (saved) {
        try {
            const loadedState = JSON.parse(saved);
            // Merge with defaults to ensure all properties exist
            state = {
                weddingDetails: loadedState.weddingDetails || {
                    brideName: '',
                    groomName: '',
                    weddingDate: '',
                    contactEmail: '',
                    contactPhone: '',
                    weddingVenue: '',
                    weddingTime: '',
                    receptionVenue: '',
                    receptionTime: '',
                    tableCount: 0,
                    tableShape: ''
                },
                flowers: loadedState.flowers || [],
                items: loadedState.items || [],
                assignments: loadedState.assignments || {},
                pricing: loadedState.pricing || {},
                additionalCosts: loadedState.additionalCosts || {
                    headFloristDays: 2,
                    headFloristCost: 200,
                    assistantDays: 1,
                    assistantCost: 150,
                    mileage: 0,
                    mileageCost: 0.45,
                    overnightStays: 0,
                    overnightCost: 0
                },
                customCosts: loadedState.customCosts || []
            };
        } catch (e) {
            console.error('Error loading saved state:', e);
            // Reset to defaults on error
            state = {
                weddingDetails: {
                    brideName: '',
                    groomName: '',
                    weddingDate: '',
                    contactEmail: '',
                    contactPhone: '',
                    weddingVenue: '',
                    weddingTime: '',
                    receptionVenue: '',
                    receptionTime: '',
                    tableCount: 0,
                    tableShape: ''
                },
                flowers: [],
                items: [],
                assignments: {},
                pricing: {},
                additionalCosts: {
                    headFloristDays: 2,
                    headFloristCost: 200,
                    assistantDays: 1,
                    assistantCost: 150,
                    mileage: 0,
                    mileageCost: 0.45,
                    overnightStays: 0,
                    overnightCost: 0
                },
                customCosts: []
            };
        }
    }
}

// Clear all data (for testing)
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        state = { 
            weddingDetails: {
                brideName: '',
                groomName: '',
                weddingDate: '',
                contactEmail: '',
                contactPhone: '',
                weddingVenue: '',
                weddingTime: '',
                receptionVenue: '',
                receptionTime: '',
                tableCount: 0,
                tableShape: ''
            },
            flowers: [], 
            items: [], 
            assignments: {}, 
            pricing: {},
            additionalCosts: {
                headFloristDays: 2,
                headFloristCost: 200,
                assistantDays: 1,
                assistantCost: 150,
                mileage: 0,
                mileageCost: 0.45,
                overnightStays: 0,
                overnightCost: 0
            }
        };
        localStorage.removeItem('floristryQuoteState');
        renderAll();
        renderWeddingDetails();
    }
}

// Add clear button for development (remove in production)
document.addEventListener('DOMContentLoaded', function() {
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear All Data';
    clearBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #dc3545; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; z-index: 1000;';
    clearBtn.onclick = clearAllData;
    document.body.appendChild(clearBtn);
});
