
/**
 * Tooltip system for ZakatNOW
 * Shows information on hover for income and deduction items
 */

// Tooltip element that will be inserted into the DOM
let tooltip = null;

// Initialize tooltip system
function initTooltip() {
    // Create tooltip element if it doesn't exist
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);
    }

    // Listen for all mouseover events and check if the target has tooltip data
    document.addEventListener('mouseover', showTooltip);
    document.addEventListener('mouseout', hideTooltip);
    document.addEventListener('mousemove', moveTooltip);
}

// Show tooltip when hovering over elements with data-tooltip
function showTooltip(e) {
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;
    
    const tooltipText = target.getAttribute('data-tooltip');
    if (!tooltipText) return;
    
    tooltip.textContent = tooltipText;
    tooltip.style.display = 'block';
    
    moveTooltip(e);
}

// Hide tooltip when mouse leaves element
function hideTooltip(e) {
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;
    
    tooltip.style.display = 'none';
}

// Move tooltip to follow cursor
function moveTooltip(e) {
    if (tooltip.style.display === 'none') return;
    
    // Position the tooltip near the cursor
    const x = e.clientX + 15;
    const y = e.clientY + 15;
    
    // Ensure tooltip stays within viewport
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust position if tooltip would go out of viewport
    const adjustedX = x + tooltipWidth > viewportWidth ? viewportWidth - tooltipWidth - 10 : x;
    const adjustedY = y + tooltipHeight > viewportHeight ? viewportHeight - tooltipHeight - 10 : y;
    
    tooltip.style.left = `${adjustedX}px`;
    tooltip.style.top = `${adjustedY}px`;
}

// Attach tooltip to element with explanation text
function addTooltip(element, text) {
    if (!element) return;
    element.setAttribute('data-tooltip', text);
    element.classList.add('has-tooltip');
}

// Initialize the tooltip system when the page loads
window.addEventListener('DOMContentLoaded', initTooltip);
